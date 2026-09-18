import os
import uuid
import logging
from typing import Tuple, Optional
from fastapi import UploadFile, HTTPException

logger = logging.getLogger("livestock-platform.storage")

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
STORAGE_BUCKET = "livestock-case-attachments"
LOCAL_UPLOADS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads"))

os.makedirs(LOCAL_UPLOADS_DIR, exist_ok=True)

class StorageService:
    @staticmethod
    async def upload_case_attachment(case_id: str, file: UploadFile, content: Optional[bytes] = None) -> Tuple[str, str, int]:
        """
        Validates and saves a case attachment photo.
        Accepts optional pre-read content bytes to avoid double-reading when AI screening runs first.
        Returns: (file_path, content_type, file_size)
        """
        if file.content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type '{file.content_type}'. Allowed types: image/jpeg, image/png, image/webp"
            )

        if content is None:
            content = await file.read()

        file_size = len(content)

        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds maximum limit of 10 MB. Received: {file_size / (1024 * 1024):.2f} MB"
            )

        ext = file.filename.split(".")[-1] if file.filename and "." in file.filename else "jpg"
        filename = f"{case_id}_{uuid.uuid4().hex[:8]}.{ext}"
        
        # Save to local uploads directory (also accessible via FastAPI static files)
        local_path = os.path.join(LOCAL_UPLOADS_DIR, filename)
        with open(local_path, "wb") as f:
            f.write(content)

        public_file_path = f"/uploads/{filename}"
        logger.info(f"Successfully stored attachment for case {case_id} at {public_file_path}")
        return public_file_path, file.content_type or "image/jpeg", file_size

storage_service = StorageService()
