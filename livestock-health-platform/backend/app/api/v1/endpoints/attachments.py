import uuid
import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.db.database import db_repo
from app.services.storage import storage_service
from app.services.image_screening import image_screening_service
from app.schemas.attachment import CaseAttachmentResponse

router = APIRouter()

@router.post("/health-reports/{case_id}/attachments", response_model=CaseAttachmentResponse, status_code=201, tags=["Attachments"])
async def upload_case_attachment(case_id: str, file: UploadFile = File(...)):
    # Read file bytes for storage and AI screening
    content = await file.read()
    file_path, file_type, file_size = await storage_service.upload_case_attachment(case_id, file, content=content)

    att_id = str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()

    conn = db_repo.get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO case_attachments (id, case_id, file_path, file_type, file_size, uploaded_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (att_id, case_id, file_path, file_type, file_size, now, now))

    # Trigger AI Image Screening Subsystem
    try:
        report_row = cursor.execute("SELECT symptoms FROM health_reports WHERE case_id = ? OR id = ?", (case_id, case_id)).fetchone()
        symptoms_list = []
        if report_row and report_row["symptoms"]:
            import json
            symptoms_list = json.loads(report_row["symptoms"] or "[]")

        ai_result = image_screening_service.run_inference(content, filename=file.filename or "attachment.jpg", symptoms=symptoms_list)
        
        cursor.execute("""
            UPDATE health_reports 
            SET ai_prediction = ?, ai_confidence = ?, ai_risk_level = ?, ai_model_version = ?, ai_processed_at = ?, updated_at = ?
            WHERE case_id = ? OR id = ?
        """, (ai_result.prediction, ai_result.confidence, ai_result.risk_level, ai_result.model_version, ai_result.processed_at, now, case_id, case_id))
    except Exception as ai_err:
        import logging
        logging.getLogger("livestock-platform.ai").warning(f"AI Image Screening skipped or failed: {ai_err}")

    conn.commit()
    conn.close()

    return CaseAttachmentResponse(
        id=att_id,
        case_id=case_id,
        file_path=file_path,
        file_type=file_type,
        file_size=file_size,
        uploaded_at=now,
        created_at=now
    )
