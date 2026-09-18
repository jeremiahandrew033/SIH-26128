import json
from fastapi import APIRouter, UploadFile, File, Form
from typing import List, Optional
from app.core.config import settings
from app.schemas.health import HealthResponse
from app.schemas.system import SystemInfoResponse
from app.services.image_screening import image_screening_service

router = APIRouter()

@router.get("/health", response_model=HealthResponse, tags=["Health"])
def get_health():
    """
    Base health check endpoint required by system monitors and frontend connectivity check.
    """
    return HealthResponse(
        status="ok",
        service=settings.APP_NAME,
        phase=settings.PHASE
    )

@router.get("/api/v1/system/info", response_model=SystemInfoResponse, tags=["System Info"])
def get_system_info():
    """
    Provides platform metadata, environment state, and phase versioning info.
    """
    return SystemInfoResponse(
        name=settings.PLATFORM_NAME,
        version=settings.APP_VERSION,
        phase=settings.PHASE,
        environment=settings.APP_ENV
    )

@router.post("/health/ai-screen", tags=["AI Screening"])
async def ai_screen_image(
    file: UploadFile = File(...),
    symptoms: Optional[List[str]] = Form(None)
):
    """
    Phase 3: Standalone AI Image Screening endpoint.
    Accepts an image file + optional symptoms list and returns a non-diagnostic screening result.
    Used for client-side pre-screening preview during health report form submission.
    """
    content = await file.read()
    result = image_screening_service.run_inference(
        content,
        filename=file.filename or "image.jpg",
        symptoms=symptoms or []
    )
    return {
        "prediction": result.prediction,
        "confidence": result.confidence,
        "risk_level": result.risk_level,
        "model_version": result.model_version,
        "processed_at": result.processed_at,
        "disclaimer": result.disclaimer
    }
