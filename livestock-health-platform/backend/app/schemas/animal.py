from typing import Optional
from pydantic import BaseModel, Field

class AnimalCreate(BaseModel):
    farmer_id: str
    herd_id: Optional[str] = None
    species: str = Field(..., description="Cattle, Buffalo, Goat, Sheep, Poultry")
    breed: Optional[str] = None
    sex: Optional[str] = None
    date_of_birth: Optional[str] = None
    approximate_age_years: Optional[float] = Field(None, ge=0)
    color: Optional[str] = None
    identification_notes: Optional[str] = None
    animal_code: Optional[str] = None

class AnimalResponse(BaseModel):
    id: str
    farmer_id: str
    herd_id: Optional[str] = None
    animal_code: str
    species: str
    breed: Optional[str] = None
    sex: Optional[str] = None
    date_of_birth: Optional[str] = None
    approximate_age_years: Optional[float] = None
    color: Optional[str] = None
    identification_notes: Optional[str] = None
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
