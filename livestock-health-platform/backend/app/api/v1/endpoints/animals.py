import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from app.db.database import db_repo
from app.schemas.animal import AnimalCreate, AnimalResponse
from app.core.security import get_current_user, require_role, TokenData
from app.db.database import ROLE_FARMER, ROLE_VETERINARIAN, ROLE_GOVERNMENT

router = APIRouter()

SPECIES_PREFIX_MAP = {
    "cattle": "COW",
    "cow": "COW",
    "buffalo": "BUF",
    "goat": "GOAT",
    "sheep": "SHEEP",
    "poultry": "POUL"
}

def generate_unique_animal_code(cursor, species: str) -> str:
    species_lower = species.strip().lower()
    prefix = SPECIES_PREFIX_MAP.get(species_lower, "ANI")

    count_row = cursor.execute(
        "SELECT COUNT(*) as cnt FROM animals WHERE UPPER(species) = ?",
        (species.upper(),)
    ).fetchone()
    seq = (count_row["cnt"] if count_row else 0) + 1

    while True:
        code = f"{prefix}-{seq:04d}"
        existing = cursor.execute("SELECT id FROM animals WHERE animal_code = ?", (code,)).fetchone()
        if not existing:
            return code
        seq += 1


@router.post("/animals", response_model=AnimalResponse, status_code=201, tags=["Animals"])
def create_animal(
    payload: AnimalCreate,
    current_user: TokenData = Depends(get_current_user)
):
    # FARMER: may only register animals under their own farmer_id
    if current_user.role == ROLE_FARMER and current_user.farmer_id != payload.farmer_id:
        raise HTTPException(status_code=403, detail="Farmers may only register animals for their own account.")

    conn = db_repo.get_connection()
    cursor = conn.cursor()

    # Validate farmer
    farmer = cursor.execute("SELECT id FROM farmers WHERE id = ?", (payload.farmer_id,)).fetchone()
    if not farmer:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Farmer with ID {payload.farmer_id} not found")

    # Validate herd if provided
    if payload.herd_id:
        herd = cursor.execute("SELECT id FROM herds WHERE id = ?", (payload.herd_id,)).fetchone()
        if not herd:
            conn.close()
            raise HTTPException(status_code=404, detail=f"Herd with ID {payload.herd_id} not found")

    animal_id = str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()

    if payload.animal_code:
        animal_code = payload.animal_code.strip().upper()
        existing = cursor.execute("SELECT id FROM animals WHERE animal_code = ?", (animal_code,)).fetchone()
        if existing:
            conn.close()
            raise HTTPException(status_code=400, detail=f"Animal code '{animal_code}' already exists.")
    else:
        animal_code = generate_unique_animal_code(cursor, payload.species)

    cursor.execute("""
        INSERT INTO animals (id, farmer_id, herd_id, animal_code, species, breed, sex, date_of_birth, approximate_age_years, color, identification_notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (animal_id, payload.farmer_id, payload.herd_id, animal_code, payload.species, payload.breed, payload.sex, payload.date_of_birth, payload.approximate_age_years, payload.color, payload.identification_notes, now, now))
    conn.commit()
    conn.close()

    return AnimalResponse(
        id=animal_id,
        farmer_id=payload.farmer_id,
        herd_id=payload.herd_id,
        animal_code=animal_code,
        species=payload.species,
        breed=payload.breed,
        sex=payload.sex,
        date_of_birth=payload.date_of_birth,
        approximate_age_years=payload.approximate_age_years,
        color=payload.color,
        identification_notes=payload.identification_notes,
        created_at=now,
        updated_at=now
    )


@router.get("/animals/{animal_id}", response_model=AnimalResponse, tags=["Animals"])
def get_animal(
    animal_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    conn = db_repo.get_connection()
    cursor = conn.cursor()
    row = cursor.execute("SELECT * FROM animals WHERE id = ? OR animal_code = ?", (animal_id, animal_id.upper())).fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail=f"Animal '{animal_id}' not found")

    animal = dict(row)
    # FARMER: own animals only
    if current_user.role == ROLE_FARMER and current_user.farmer_id != animal["farmer_id"]:
        raise HTTPException(status_code=403, detail="Farmers may only access their own animals.")

    return AnimalResponse(**animal)


@router.get("/farmers/{farmer_id}/animals", response_model=List[AnimalResponse], tags=["Animals"])
def get_farmer_animals(
    farmer_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    # FARMER: own animals only
    if current_user.role == ROLE_FARMER and current_user.farmer_id != farmer_id:
        raise HTTPException(status_code=403, detail="Farmers may only access their own animals.")

    conn = db_repo.get_connection()
    cursor = conn.cursor()
    rows = cursor.execute("SELECT * FROM animals WHERE farmer_id = ? ORDER BY created_at DESC", (farmer_id,)).fetchall()
    conn.close()
    return [AnimalResponse(**dict(r)) for r in rows]


@router.get("/animals", response_model=List[AnimalResponse], tags=["Animals"])
def list_all_animals(
    query: Optional[str] = None,
    current_user: TokenData = Depends(require_role(ROLE_VETERINARIAN, ROLE_GOVERNMENT))
):
    """Aggregated animal list — VETERINARIAN and GOVERNMENT only."""
    conn = db_repo.get_connection()
    cursor = conn.cursor()
    if query:
        q = f"%{query.strip()}%"
        rows = cursor.execute("""
            SELECT * FROM animals
            WHERE animal_code LIKE ? OR species LIKE ? OR breed LIKE ? OR farmer_id LIKE ?
            ORDER BY created_at DESC
        """, (q, q, q, q)).fetchall()
    else:
        rows = cursor.execute("SELECT * FROM animals ORDER BY created_at DESC").fetchall()
    conn.close()
    return [AnimalResponse(**dict(r)) for r in rows]
