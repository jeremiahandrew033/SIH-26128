from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    farmers,
    herds,
    animals,
    health as health_ep,
    health_reports,
    mortality_reports,
    vaccinations,
    treatments,
    attachments,
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(health_ep.router)
api_router.include_router(farmers.router)
api_router.include_router(herds.router)
api_router.include_router(animals.router)
api_router.include_router(health_reports.router)
api_router.include_router(mortality_reports.router)
api_router.include_router(vaccinations.router)
api_router.include_router(treatments.router)
api_router.include_router(attachments.router)
