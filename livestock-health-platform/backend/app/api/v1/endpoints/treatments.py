import uuid
import datetime
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from app.db.database import db_repo
from app.schemas.medical import TreatmentCreate, TreatmentResponse
from app.core.security import get_current_user, require_role, TokenData
from app.db.database import ROLE_FARMER, ROLE_VETERINARIAN, ROLE_GOVERNMENT

router = APIRouter()


@router.post("/treatments", response_model=TreatmentResponse, status_code=201, tags=["Treatments"])
def create_treatment(
    payload: TreatmentCreate,
    current_user: TokenData = Depends(get_current_user)
):
    # FARMER: own records only
    if current_user.role == ROLE_FARMER and current_user.farmer_id != payload.farmer_id:
        raise HTTPException(status_code=403, detail="Farmers may only create treatment records for their own account.")

    conn = db_repo.get_connection()
    cursor = conn.cursor()

    farmer = cursor.execute("SELECT id FROM farmers WHERE id = ?", (payload.farmer_id,)).fetchone()
    if not farmer:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Farmer with ID {payload.farmer_id} not found")

    treat_id = str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()
    treat_date = payload.treatment_date or datetime.date.today().isoformat()

    cursor.execute("""
        INSERT INTO treatments (id, animal_id, herd_id, farmer_id, treatment_name, treatment_date, provider, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (treat_id, payload.animal_id, payload.herd_id, payload.farmer_id, payload.treatment_name, treat_date, payload.provider, payload.notes, now, now))

    conn.commit()
    conn.close()

    return TreatmentResponse(
        id=treat_id,
        farmer_id=payload.farmer_id,
        animal_id=payload.animal_id,
        herd_id=payload.herd_id,
        treatment_name=payload.treatment_name,
        treatment_date=treat_date,
        provider=payload.provider,
        notes=payload.notes,
        created_at=now,
        updated_at=now
    )


@router.get("/animals/{animal_id}/treatments", response_model=List[TreatmentResponse], tags=["Treatments"])
def get_animal_treatments(
    animal_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    conn = db_repo.get_connection()
    cursor = conn.cursor()

    # FARMER: verify this animal belongs to them
    if current_user.role == ROLE_FARMER:
        animal = cursor.execute("SELECT farmer_id FROM animals WHERE id = ? OR animal_code = ?", (animal_id, animal_id.upper())).fetchone()
        if not animal or animal["farmer_id"] != current_user.farmer_id:
            conn.close()
            raise HTTPException(status_code=403, detail="Farmers may only access treatments for their own animals.")

    rows = cursor.execute("SELECT * FROM treatments WHERE animal_id = ? ORDER BY treatment_date DESC", (animal_id,)).fetchall()
    conn.close()
    return [TreatmentResponse(**dict(r)) for r in rows]


@router.get("/treatments", response_model=List[TreatmentResponse], tags=["Treatments"])
def list_all_treatments(
    current_user: TokenData = Depends(require_role(ROLE_VETERINARIAN, ROLE_GOVERNMENT))
):
    """Aggregated treatment list — VETERINARIAN and GOVERNMENT only."""
    conn = db_repo.get_connection()
    cursor = conn.cursor()
    rows = cursor.execute("SELECT * FROM treatments ORDER BY treatment_date DESC").fetchall()
    conn.close()
    return [TreatmentResponse(**dict(r)) for r in rows]
