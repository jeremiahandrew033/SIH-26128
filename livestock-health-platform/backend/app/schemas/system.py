from pydantic import BaseModel

class SystemInfoResponse(BaseModel):
    name: str
    version: str
    phase: str
    environment: str
