import uuid
import datetime
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from app.db.database import db_repo
from app.schemas.farmer import FarmerCreate, FarmerResponse
from app.core.security import get_current_user, require_role, TokenData
from app.db.database import ROLE_FARMER, ROLE_VETERINARIAN, ROLE_GOVERNMENT

router = APIRouter()


@router.post("/farmers", response_model=FarmerResponse, status_code=201, tags=["Farmers"])
def create_farmer(payload: FarmerCreate):
    """Open — used by registration flows (no auth required yet)."""
    farmer_id = str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()

    conn = db_repo.get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO farmers (id, name, phone, preferred_language, village, block, district, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (farmer_id, payload.name, payload.phone, payload.preferred_language, payload.village, payload.block, payload.district, now))
    conn.commit()
    conn.close()

    return FarmerResponse(
        id=farmer_id,
        name=payload.name,
        phone=payload.phone,
        preferred_language=payload.preferred_language,
        village=payload.village,
        block=payload.block,
        district=payload.district,
        created_at=now
    )


@router.get("/farmers/{farmer_id}", response_model=FarmerResponse, tags=["Farmers"])
def get_farmer(
    farmer_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """
    FARMER: own profile only.
    VETERINARIAN / GOVERNMENT: any farmer profile.
    """
    if current_user.role == ROLE_FARMER:
        if current_user.farmer_id != farmer_id:
            raise HTTPException(
                status_code=403,
                detail="Farmers may only access their own profile."
            )

    conn = db_repo.get_connection()
    cursor = conn.cursor()
    row = cursor.execute("SELECT * FROM farmers WHERE id = ?", (farmer_id,)).fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail=f"Farmer with ID {farmer_id} not found")

    return FarmerResponse(**dict(row))


@router.get("/farmers", response_model=List[FarmerResponse], tags=["Farmers"])
def list_farmers(
    current_user: TokenData = Depends(require_role(ROLE_VETERINARIAN, ROLE_GOVERNMENT))
):
    """VETERINARIAN and GOVERNMENT only."""
    conn = db_repo.get_connection()
    cursor = conn.cursor()
    rows = cursor.execute("SELECT * FROM farmers ORDER BY created_at DESC").fetchall()
    conn.close()
    return [FarmerResponse(**dict(r)) for r in rows]
