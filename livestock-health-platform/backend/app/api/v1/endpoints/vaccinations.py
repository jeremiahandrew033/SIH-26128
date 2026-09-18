import uuid
import datetime
from typing import List
from fastapi import APIRouter, HTTPException
from app.db.database import db_repo
from app.schemas.medical import VaccinationCreate, VaccinationResponse

router = APIRouter()

@router.post("/vaccinations", response_model=VaccinationResponse, status_code=201, tags=["Vaccinations"])
def create_vaccination(payload: VaccinationCreate):
    conn = db_repo.get_connection()
    cursor = conn.cursor()

    farmer = cursor.execute("SELECT id FROM farmers WHERE id = ?", (payload.farmer_id,)).fetchone()
    if not farmer:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Farmer with ID {payload.farmer_id} not found")

    vacc_id = str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()
    vacc_date = payload.vaccination_date or datetime.date.today().isoformat()

    cursor.execute("""
        INSERT INTO vaccinations (id, animal_id, herd_id, farmer_id, vaccine_name, vaccination_date, next_due_date, provider, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (vacc_id, payload.animal_id, payload.herd_id, payload.farmer_id, payload.vaccine_name, vacc_date, payload.next_due_date, payload.provider, payload.notes, now, now))

    conn.commit()
    conn.close()

    return VaccinationResponse(
        id=vacc_id,
        farmer_id=payload.farmer_id,
        animal_id=payload.animal_id,
        herd_id=payload.herd_id,
        vaccine_name=payload.vaccine_name,
        vaccination_date=vacc_date,
        next_due_date=payload.next_due_date,
        provider=payload.provider,
        notes=payload.notes,
        created_at=now,
        updated_at=now
    )

@router.get("/animals/{animal_id}/vaccinations", response_model=List[VaccinationResponse], tags=["Vaccinations"])
def get_animal_vaccinations(animal_id: str):
    conn = db_repo.get_connection()
    cursor = conn.cursor()
    rows = cursor.execute("SELECT * FROM vaccinations WHERE animal_id = ? ORDER BY vaccination_date DESC", (animal_id,)).fetchall()
    conn.close()
    return [VaccinationResponse(**dict(r)) for r in rows]

@router.get("/vaccinations", response_model=List[VaccinationResponse], tags=["Vaccinations"])
def list_all_vaccinations():
    conn = db_repo.get_connection()
    cursor = conn.cursor()
    rows = cursor.execute("SELECT * FROM vaccinations ORDER BY vaccination_date DESC").fetchall()
    conn.close()
    return [VaccinationResponse(**dict(r)) for r in rows]
