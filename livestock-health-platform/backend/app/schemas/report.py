from typing import Optional, List
from pydantic import BaseModel, Field

class LocationPayload(BaseModel):
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    accuracy_meters: Optional[float] = Field(None, ge=0)
    village: Optional[str] = None
    block: Optional[str] = None
    district: Optional[str] = None

class HealthReportCreate(BaseModel):
    farmer_id: str
    animal_id: Optional[str] = None
    herd_id: Optional[str] = None
    report_type: str = Field(..., pattern="^(illness|injury|abnormal_behavior|routine_check)$")
    description: Optional[str] = None
    symptoms: List[str] = []
    duration_text: Optional[str] = None
    severity: Optional[str] = Field("unknown", pattern="^(mild|moderate|severe|unknown)$")
    location: Optional[LocationPayload] = None
    client_tx_id: Optional[str] = None
    ai_prediction: Optional[str] = None
    ai_confidence: Optional[float] = None
    ai_risk_level: Optional[str] = None
    source: Optional[str] = "APP"
    priority: Optional[str] = "NORMAL"
    caller_phone: Optional[str] = None

class HealthReportResponse(BaseModel):
    id: str
    case_id: str
    farmer_id: str
    animal_id: Optional[str] = None
    herd_id: Optional[str] = None
    report_type: str
    description: Optional[str] = None
    symptoms: List[str] = []
    duration_text: Optional[str] = None
    severity: Optional[str] = "unknown"
    location_id: Optional[str] = None
    location: Optional[LocationPayload] = None
    status: str = "reported"
    attachments: List[str] = []
    ai_prediction: Optional[str] = None
    ai_confidence: Optional[float] = None
    ai_risk_level: Optional[str] = None
    ai_model_version: Optional[str] = None
    ai_processed_at: Optional[str] = None
    source: Optional[str] = "APP"
    priority: Optional[str] = "NORMAL"
    caller_phone: Optional[str] = None
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

class MortalityReportCreate(BaseModel):
    farmer_id: str
    animal_id: Optional[str] = None
    herd_id: Optional[str] = None
    number_of_deaths: int = Field(..., gt=0)
    suspected_cause: Optional[str] = None
    description: Optional[str] = None
    location: Optional[LocationPayload] = None
    client_tx_id: Optional[str] = None
    source: Optional[str] = "APP"
    priority: Optional[str] = "NORMAL"
    caller_phone: Optional[str] = None

class MortalityReportResponse(BaseModel):
    id: str
    case_id: str
    farmer_id: str
    animal_id: Optional[str] = None
    herd_id: Optional[str] = None
    number_of_deaths: int
    suspected_cause: Optional[str] = None
    description: Optional[str] = None
    location_id: Optional[str] = None
    location: Optional[LocationPayload] = None
    status: str = "reported"
    disclaimer: str = "This report records suspected mortality information. It does not determine the cause of death."
    attachments: List[str] = []
    source: Optional[str] = "APP"
    priority: Optional[str] = "NORMAL"
    caller_phone: Optional[str] = None
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
