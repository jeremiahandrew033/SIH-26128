from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime

class FarmerCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    phone: Optional[str] = None
    preferred_language: str = Field("en", pattern="^(en|te|hi)$")
    village: Optional[str] = None
    block: Optional[str] = None
    district: Optional[str] = None

class FarmerResponse(BaseModel):
    id: str
    name: str
    phone: Optional[str] = None
    preferred_language: str = "en"
    village: Optional[str] = None
    block: Optional[str] = None
    district: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True
