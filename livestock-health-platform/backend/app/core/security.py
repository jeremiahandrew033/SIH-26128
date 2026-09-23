import hmac
import hashlib
import json
import base64
import time
from dataclasses import dataclass
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings


# ---------------------------------------------------------------------------
# Password hashing (existing, unchanged)
# ---------------------------------------------------------------------------

def hash_password(password: str, salt: Optional[bytes] = None) -> str:
    if salt is None:
        salt = hashlib.sha256(f"salt_{settings.JWT_SECRET}".encode()).digest()[:16]
    hashed = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return f"{salt.hex()}${hashed.hex()}"

def verify_password(password: str, stored_hash: str) -> bool:
    try:
        if ":" not in stored_hash and "$" not in stored_hash:
            # fallback plain text or simple hash check for dev/demo initial seed
            return password == stored_hash
        sep = "$" if "$" in stored_hash else ":"
        salt_hex, hash_hex = stored_hash.split(sep, 1)
        salt = bytes.fromhex(salt_hex)
        expected_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000).hex()
        return hmac.compare_digest(expected_hash, hash_hex)
    except Exception:
        return False


# ---------------------------------------------------------------------------
# JWT helpers (existing, unchanged)
# ---------------------------------------------------------------------------

def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

def _b64url_decode(data: str) -> bytes:
    padding = '=' * (4 - (len(data) % 4))
    return base64.urlsafe_b64decode(data + padding)

def create_access_token(payload: Dict[str, Any], expires_delta: Optional[int] = None) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = _b64url_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))

    now = int(time.time())
    expire = now + (expires_delta if expires_delta is not None else settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)

    to_encode = payload.copy()
    to_encode.update({"iat": now, "exp": expire})

    payload_b64 = _b64url_encode(json.dumps(to_encode, separators=(',', ':')).encode('utf-8'))

    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    signature = hmac.new(settings.JWT_SECRET.encode('utf-8'), signing_input, hashlib.sha256).digest()
    sig_b64 = _b64url_encode(signature)

    return f"{header_b64}.{payload_b64}.{sig_b64}"

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts

        signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
        expected_sig = hmac.new(settings.JWT_SECRET.encode('utf-8'), signing_input, hashlib.sha256).digest()

        actual_sig = _b64url_decode(sig_b64)
        if not hmac.compare_digest(expected_sig, actual_sig):
            return None

        payload = json.loads(_b64url_decode(payload_b64).decode('utf-8'))

        if "exp" in payload and int(time.time()) > payload["exp"]:
            return None

        return payload
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Auth dependency models
# ---------------------------------------------------------------------------

@dataclass
class TokenData:
    """Verified token payload available to protected endpoints."""
    user_id: str
    username: str
    role: str
    farmer_id: Optional[str] = None


# OAuth2 scheme — tokenUrl tells Swagger UI where to POST credentials
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme)) -> TokenData:
    """
    FastAPI dependency: decode and validate the Bearer JWT.
    Raises 401 for missing, malformed, or expired tokens.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id: Optional[str] = payload.get("sub")
    username: Optional[str] = payload.get("username")
    role: Optional[str] = payload.get("role")
    if not user_id or not role:
        raise credentials_exception

    return TokenData(
        user_id=user_id,
        username=username or "",
        role=role,
        farmer_id=payload.get("farmer_id"),
    )


def require_role(*roles: str):
    """
    FastAPI dependency factory.
    Usage:  Depends(require_role("VETERINARIAN", "GOVERNMENT"))
    Raises 403 if the authenticated user's role is not in `roles`.
    """
    def _check(current_user: TokenData = Depends(get_current_user)) -> TokenData:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role(s): {list(roles)}",
            )
        return current_user
    return _check
