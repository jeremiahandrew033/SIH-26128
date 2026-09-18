# Livestock Health Platform API (Backend)

FastAPI backend service powering the **AI-Enabled Livestock Health, Disease Surveillance & Management Platform**.

## Tech Stack
- **Python**: 3.10+
- **Framework**: FastAPI
- **Server**: Uvicorn
- **Validation**: Pydantic v2
- **Testing**: pytest & httpx

## Quickstart

### 1. Set up Virtual Environment
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 4. Run Development Server
```bash
uvicorn app.main:app --reload --port 8000
```

### 5. Run Automated Tests
```bash
pytest
```

## API Endpoints (Phase 0)
- `GET /health`: Health check endpoint.
- `GET /api/v1/system/info`: Metadata & platform phase description.
