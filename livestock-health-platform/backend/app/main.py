import os
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.api.v1.endpoints.health import get_health, get_system_info
from app.api.v1.router import api_router
from app.services.supabase import supabase_service
from app.services.storage import LOCAL_UPLOADS_DIR

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("livestock-platform")

app = FastAPI(
    title=settings.PLATFORM_NAME,
    version=settings.APP_VERSION,
    description="AI-Enabled Livestock Health, Disease Surveillance & Management Platform - API Gateway"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for photo attachments
app.mount("/uploads", StaticFiles(directory=LOCAL_UPLOADS_DIR), name="uploads")

# Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global unhandled exception on {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred.", "type": type(exc).__name__}
    )

# Base health endpoints
app.add_api_route("/health", get_health, methods=["GET"], tags=["Health"])
app.add_api_route("/api/v1/health", get_health, methods=["GET"], tags=["Health"])
app.add_api_route("/api/v1/system/info", get_system_info, methods=["GET"], tags=["System Info"])

# Include Phase 1 API v1 router
app.include_router(api_router, prefix="/api/v1")

@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting {settings.PLATFORM_NAME} API (Phase 1 Active)...")
    supabase_service.initialize()
