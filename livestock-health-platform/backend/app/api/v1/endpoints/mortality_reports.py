import uuid
import datetime
from typing import List
from fastapi import APIRouter, HTTPException
from app.db.database import db_repo
from app.schemas.report import MortalityReportCreate, MortalityReportResponse, LocationPayload
from app.utils.case_id import generate_case_id

router = APIRouter()

@router.post("/mortality-reports", response_model=MortalityReportResponse, status_code=201, tags=["Mortality Reports"])
def create_mortality_report(payload: MortalityReportCreate):
    if payload.number_of_deaths <= 0:
        raise HTTPException(status_code=400, detail="Number of deaths must be greater than 0.")

    if not payload.animal_id and not payload.herd_id:
        if str(payload.source).strip().upper() != 'PHONE_IVR':
            raise HTTPException(status_code=400, detail="Mortality report requires at least one of 'animal_id' or 'herd_id'.")

    conn = db_repo.get_connection()
    cursor = conn.cursor()

    # Idempotency / Duplicate Check
    if payload.client_tx_id:
        existing = cursor.execute("SELECT case_id FROM mortality_reports WHERE client_tx_id = ?", (payload.client_tx_id,)).fetchone()
        if existing:
            conn.close()
            return get_mortality_report(existing["case_id"])

    farmer = cursor.execute("SELECT id FROM farmers WHERE id = ?", (payload.farmer_id,)).fetchone()
    if not farmer:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Farmer with ID {payload.farmer_id} not found")

    location_id = None
    if payload.location:
        location_id = str(uuid.uuid4())
        loc_now = datetime.datetime.utcnow().isoformat()
        cursor.execute("""
            INSERT INTO locations (id, latitude, longitude, accuracy_meters, village, block, district, captured_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (location_id, payload.location.latitude, payload.location.longitude, payload.location.accuracy_meters, payload.location.village, payload.location.block, payload.location.district, loc_now, loc_now))

    report_id = str(uuid.uuid4())
    case_id = generate_case_id()
    now = datetime.datetime.utcnow().isoformat()

    priority = payload.priority or "NORMAL"
    if payload.number_of_deaths > 1:
        priority = "HIGH"

    cursor.execute("""
        INSERT INTO mortality_reports (id, case_id, farmer_id, animal_id, herd_id, number_of_deaths, suspected_cause, description, location_id, status, client_tx_id, source, priority, caller_phone, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (report_id, case_id, payload.farmer_id, payload.animal_id, payload.herd_id, payload.number_of_deaths, payload.suspected_cause, payload.description, location_id, 'reported', payload.client_tx_id, payload.source, priority, payload.caller_phone, now, now))

    conn.commit()
    conn.close()

    return MortalityReportResponse(
        id=report_id,
        case_id=case_id,
        farmer_id=payload.farmer_id,
        animal_id=payload.animal_id,
        herd_id=payload.herd_id,
        number_of_deaths=payload.number_of_deaths,
        suspected_cause=payload.suspected_cause,
        description=payload.description,
        location_id=location_id,
        location=payload.location,
        status="reported",
        attachments=[],
        created_at=now,
        updated_at=now
    )

@router.get("/mortality-reports/{case_id}", response_model=MortalityReportResponse, tags=["Mortality Reports"])
def get_mortality_report(case_id: str):
    conn = db_repo.get_connection()
    cursor = conn.cursor()

    row = cursor.execute("SELECT * FROM mortality_reports WHERE case_id = ? OR id = ?", (case_id, case_id)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Mortality report with Case ID/ID {case_id} not found")

    report_dict = dict(row)

    location_data = None
    if report_dict.get("location_id"):
        loc_row = cursor.execute("SELECT * FROM locations WHERE id = ?", (report_dict["location_id"],)).fetchone()
        if loc_row:
            loc_dict = dict(loc_row)
            location_data = LocationPayload(
                latitude=loc_dict.get("latitude"),
                longitude=loc_dict.get("longitude"),
                accuracy_meters=loc_dict.get("accuracy_meters"),
                village=loc_dict.get("village"),
                block=loc_dict.get("block"),
                district=loc_dict.get("district")
            )
    report_dict["location"] = location_data

    attachment_rows = cursor.execute("SELECT file_path FROM case_attachments WHERE case_id = ?", (report_dict["case_id"],)).fetchall()
    report_dict["attachments"] = [r["file_path"] for r in attachment_rows]

    conn.close()
    return MortalityReportResponse(**report_dict)

@router.get("/mortality-reports", response_model=List[MortalityReportResponse], tags=["Mortality Reports"])
def list_all_mortality_reports():
    conn = db_repo.get_connection()
    cursor = conn.cursor()
    rows = cursor.execute("SELECT * FROM mortality_reports ORDER BY created_at DESC").fetchall()
    
    results = []
    for r in rows:
        r_dict = dict(r)
        
        loc_data = None
        if r_dict.get("location_id"):
            loc_row = cursor.execute("SELECT * FROM locations WHERE id = ?", (r_dict["location_id"],)).fetchone()
            if loc_row:
                loc_dict = dict(loc_row)
                loc_data = LocationPayload(
                    latitude=loc_dict.get("latitude"),
                    longitude=loc_dict.get("longitude"),
                    accuracy_meters=loc_dict.get("accuracy_meters"),
                    village=loc_dict.get("village"),
                    block=loc_dict.get("block"),
                    district=loc_dict.get("district")
                )
        r_dict["location"] = loc_data

        att_rows = cursor.execute("SELECT file_path FROM case_attachments WHERE case_id = ?", (r_dict["case_id"],)).fetchall()
        r_dict["attachments"] = [att["file_path"] for att in att_rows]
        results.append(MortalityReportResponse(**r_dict))

    conn.close()
    return results
