from typing import Optional
from pydantic import BaseModel

class CaseAttachmentResponse(BaseModel):
    id: str
    case_id: str
    file_path: str
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    uploaded_at: str
    created_at: str

    class Config:
        from_attributes = True
