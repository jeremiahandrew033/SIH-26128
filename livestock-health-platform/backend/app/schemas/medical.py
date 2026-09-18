from typing import Optional
from pydantic import BaseModel, Field

class VaccinationCreate(BaseModel):
    farmer_id: str
    animal_id: Optional[str] = None
    herd_id: Optional[str] = None
    vaccine_name: str = Field(..., min_length=2)
    vaccination_date: Optional[str] = None
    next_due_date: Optional[str] = None
    provider: Optional[str] = None
    notes: Optional[str] = None

class VaccinationResponse(BaseModel):
    id: str
    farmer_id: str
    animal_id: Optional[str] = None
    herd_id: Optional[str] = None
    vaccine_name: str
    vaccination_date: Optional[str] = None
    next_due_date: Optional[str] = None
    provider: Optional[str] = None
    notes: Optional[str] = None
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

class TreatmentCreate(BaseModel):
    farmer_id: str
    animal_id: Optional[str] = None
    herd_id: Optional[str] = None
    treatment_name: str = Field(..., min_length=2)
    treatment_date: Optional[str] = None
    provider: Optional[str] = None
    notes: Optional[str] = None

class TreatmentResponse(BaseModel):
    id: str
    farmer_id: str
    animal_id: Optional[str] = None
    herd_id: Optional[str] = None
    treatment_name: str
    treatment_date: Optional[str] = None
    provider: Optional[str] = None
    notes: Optional[str] = None
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
