from pydantic import BaseModel, Field
from typing import Optional, List

class LocationPayload(BaseModel):
    village: Optional[str] = None

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
    source: Optional[str] = "APP"
    caller_phone: Optional[str] = None

payload = {
    "farmer_id": "123",
    "report_type": "illness",
    "symptoms": ["fever"],
    "severity": "mild",
    "source": "PHONE_IVR",
    "caller_phone": "+91",
    "location": {"village": "Unknown"}
}

obj = HealthReportCreate(**payload)
print(repr(obj.source))
print(obj.source != 'PHONE_IVR')
