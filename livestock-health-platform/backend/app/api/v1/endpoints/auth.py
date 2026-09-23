from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Optional
from app.db.database import db_repo
from app.core.security import verify_password, create_access_token

router = APIRouter(tags=["Authentication"])


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    farmer_id: Optional[str] = None
    username: str


@router.post("/auth/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Authenticate with username + password.
    Returns a signed JWT Bearer token.
    """
    conn = db_repo.get_connection()
    cursor = conn.cursor()
    row = cursor.execute(
        "SELECT id, username, password_hash, role, farmer_id FROM users WHERE username = ?",
        (form_data.username,)
    ).fetchone()
    conn.close()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(form_data.password, row["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = {
        "sub": row["id"],
        "username": row["username"],
        "role": row["role"],
        "farmer_id": row["farmer_id"],
    }
    token = create_access_token(payload)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=row["role"],
        farmer_id=row["farmer_id"],
        username=row["username"],
    )
