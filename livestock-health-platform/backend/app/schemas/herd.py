from typing import Optional
from pydantic import BaseModel, Field

class HerdCreate(BaseModel):
    farmer_id: str
    name: Optional[str] = None
    species: str
    animal_count: int = Field(0, ge=0)
    village: Optional[str] = None
    block: Optional[str] = None
    district: Optional[str] = None

class HerdResponse(BaseModel):
    id: str
    farmer_id: str
    name: Optional[str] = None
    species: str
    animal_count: int = 0
    village: Optional[str] = None
    block: Optional[str] = None
    district: Optional[str] = None
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
