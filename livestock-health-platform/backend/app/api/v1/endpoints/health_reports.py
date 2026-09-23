import uuid
import json
import datetime
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from app.db.database import db_repo
from app.schemas.report import HealthReportCreate, HealthReportResponse, LocationPayload
from app.utils.case_id import generate_case_id
from app.core.security import get_current_user, require_role, TokenData
from app.db.database import ROLE_FARMER, ROLE_VETERINARIAN, ROLE_GOVERNMENT

router = APIRouter()


def _build_health_report_response(r_dict: dict, cursor) -> HealthReportResponse:
    """Helper: enrich a raw health_reports row with location and attachments."""
    r_dict["symptoms"] = json.loads(r_dict.get("symptoms") or "[]")

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

    return HealthReportResponse(**r_dict)


@router.post("/health-reports", response_model=HealthReportResponse, status_code=201, tags=["Health Reports"])
def create_health_report(
    payload: HealthReportCreate,
    current_user: TokenData = Depends(get_current_user)
):
    # FARMER: enforce their own farmer_id — never trust the payload's farmer_id
    if current_user.role == ROLE_FARMER:
        if current_user.farmer_id != payload.farmer_id:
            raise HTTPException(status_code=403, detail="Farmers may only submit reports for their own account.")

    if not payload.animal_id and not payload.herd_id:
        if str(payload.source).strip().upper() != 'PHONE_IVR':
            raise HTTPException(
                status_code=400,
                detail="Health report requires at least one of 'animal_id' or 'herd_id'."
            )

    conn = db_repo.get_connection()
    cursor = conn.cursor()

    # Idempotency / Duplicate Check
    if payload.client_tx_id:
        existing = cursor.execute("SELECT case_id FROM health_reports WHERE client_tx_id = ?", (payload.client_tx_id,)).fetchone()
        if existing:
            conn.close()
            return get_health_report(existing["case_id"], current_user)

    # Validate farmer
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
    symptoms_json = json.dumps(payload.symptoms)

    priority = payload.priority or "NORMAL"
    if payload.severity == "severe":
        priority = "HIGH"

    cursor.execute("""
        INSERT INTO health_reports (id, case_id, farmer_id, animal_id, herd_id, report_type, description, symptoms, duration_text, severity, location_id, status, client_tx_id, source, priority, caller_phone, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (report_id, case_id, payload.farmer_id, payload.animal_id, payload.herd_id, payload.report_type, payload.description, symptoms_json, payload.duration_text, payload.severity, location_id, 'reported', payload.client_tx_id, payload.source, priority, payload.caller_phone, now, now))

    conn.commit()
    conn.close()

    return HealthReportResponse(
        id=report_id,
        case_id=case_id,
        farmer_id=payload.farmer_id,
        animal_id=payload.animal_id,
        herd_id=payload.herd_id,
        report_type=payload.report_type,
        description=payload.description,
        symptoms=payload.symptoms,
        duration_text=payload.duration_text,
        severity=payload.severity,
        location_id=location_id,
        location=payload.location,
        status="reported",
        attachments=[],
        created_at=now,
        updated_at=now
    )


@router.get("/health-reports/{case_id}", response_model=HealthReportResponse, tags=["Health Reports"])
def get_health_report(
    case_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    conn = db_repo.get_connection()
    cursor = conn.cursor()

    row = cursor.execute("SELECT * FROM health_reports WHERE case_id = ? OR id = ?", (case_id, case_id)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Health report with Case ID/ID {case_id} not found")

    report_dict = dict(row)

    # FARMER: own cases only — return 404 to avoid leaking existence
    if current_user.role == ROLE_FARMER and current_user.farmer_id != report_dict["farmer_id"]:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Health report with Case ID/ID {case_id} not found")

    result = _build_health_report_response(report_dict, cursor)
    conn.close()
    return result


@router.get("/farmers/{farmer_id}/health-reports", response_model=List[HealthReportResponse], tags=["Health Reports"])
def get_farmer_health_reports(
    farmer_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    # FARMER: own reports only
    if current_user.role == ROLE_FARMER and current_user.farmer_id != farmer_id:
        raise HTTPException(status_code=403, detail="Farmers may only access their own health reports.")

    conn = db_repo.get_connection()
    cursor = conn.cursor()
    rows = cursor.execute("SELECT * FROM health_reports WHERE farmer_id = ? ORDER BY created_at DESC", (farmer_id,)).fetchall()

    results = [_build_health_report_response(dict(r), cursor) for r in rows]
    conn.close()
    return results


@router.get("/health-reports", response_model=List[HealthReportResponse], tags=["Health Reports"])
def list_all_health_reports(
    current_user: TokenData = Depends(require_role(ROLE_VETERINARIAN, ROLE_GOVERNMENT))
):
    """Aggregated report list — VETERINARIAN and GOVERNMENT only."""
    conn = db_repo.get_connection()
    cursor = conn.cursor()
    rows = cursor.execute("SELECT * FROM health_reports ORDER BY created_at DESC").fetchall()
    results = [_build_health_report_response(dict(r), cursor) for r in rows]
    conn.close()
    return results


@router.patch("/health-reports/{case_id}/status", response_model=HealthReportResponse, tags=["Health Reports"])
def update_health_report_status(
    case_id: str,
    status: str,
    current_user: TokenData = Depends(require_role(ROLE_VETERINARIAN, ROLE_GOVERNMENT))
):
    """Status updates — VETERINARIAN and GOVERNMENT only."""
    valid_statuses = ["reported", "under_review", "closed"]
    if status.lower() not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status '{status}'. Must be one of {valid_statuses}")

    conn = db_repo.get_connection()
    cursor = conn.cursor()

    row = cursor.execute("SELECT * FROM health_reports WHERE case_id = ? OR id = ?", (case_id, case_id)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Health report '{case_id}' not found")

    now = datetime.datetime.utcnow().isoformat()
    cursor.execute("UPDATE health_reports SET status = ?, updated_at = ? WHERE case_id = ? OR id = ?", (status.lower(), now, case_id, case_id))
    conn.commit()
    conn.close()

    return get_health_report(case_id, current_user)
