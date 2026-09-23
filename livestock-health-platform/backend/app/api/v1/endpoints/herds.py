import uuid
import datetime
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from app.db.database import db_repo
from app.schemas.herd import HerdCreate, HerdResponse
from app.core.security import get_current_user, TokenData
from app.db.database import ROLE_FARMER

router = APIRouter()


@router.post("/herds", response_model=HerdResponse, status_code=201, tags=["Herds"])
def create_herd(
    payload: HerdCreate,
    current_user: TokenData = Depends(get_current_user)
):
    conn = db_repo.get_connection()
    cursor = conn.cursor()

    # FARMER: may only create herds under their own farmer_id
    if current_user.role == ROLE_FARMER and current_user.farmer_id != payload.farmer_id:
        conn.close()
        raise HTTPException(status_code=403, detail="Farmers may only create herds for their own account.")

    # Validate farmer exists
    farmer = cursor.execute("SELECT id FROM farmers WHERE id = ?", (payload.farmer_id,)).fetchone()
    if not farmer:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Farmer with ID {payload.farmer_id} not found")

    herd_id = str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()

    cursor.execute("""
        INSERT INTO herds (id, farmer_id, name, species, animal_count, village, block, district, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (herd_id, payload.farmer_id, payload.name, payload.species, payload.animal_count, payload.village, payload.block, payload.district, now, now))
    conn.commit()
    conn.close()

    return HerdResponse(
        id=herd_id,
        farmer_id=payload.farmer_id,
        name=payload.name,
        species=payload.species,
        animal_count=payload.animal_count,
        village=payload.village,
        block=payload.block,
        district=payload.district,
        created_at=now,
        updated_at=now
    )


@router.get("/herds/{herd_id}", response_model=HerdResponse, tags=["Herds"])
def get_herd(
    herd_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    conn = db_repo.get_connection()
    cursor = conn.cursor()
    row = cursor.execute("SELECT * FROM herds WHERE id = ?", (herd_id,)).fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail=f"Herd with ID {herd_id} not found")

    herd = dict(row)
    # FARMER: own herds only
    if current_user.role == ROLE_FARMER and current_user.farmer_id != herd["farmer_id"]:
        raise HTTPException(status_code=403, detail="Farmers may only access their own herds.")

    return HerdResponse(**herd)


@router.get("/farmers/{farmer_id}/herds", response_model=List[HerdResponse], tags=["Herds"])
def get_farmer_herds(
    farmer_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    # FARMER: own herds only
    if current_user.role == ROLE_FARMER and current_user.farmer_id != farmer_id:
        raise HTTPException(status_code=403, detail="Farmers may only access their own herds.")

    conn = db_repo.get_connection()
    cursor = conn.cursor()
    rows = cursor.execute("SELECT * FROM herds WHERE farmer_id = ? ORDER BY created_at DESC", (farmer_id,)).fetchall()
    conn.close()
    return [HerdResponse(**dict(r)) for r in rows]
