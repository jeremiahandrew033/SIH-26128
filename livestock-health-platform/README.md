# AI-Enabled Livestock Health, Disease Surveillance & Management Platform

> **Early Detection | Prediction | Prevention | Community Containment | Management**

An enterprise-ready, multi-tier platform built for early livestock health surveillance, real-time disease detection, vector risk mapping, and government/veterinary outbreak management.

---

## Current Status: Phase 0.5 (Authentication & Role Foundation)

Phase 0.5 introduces a secure authentication subsystem, Supabase Auth integration, Demo Auth adapter (`[ Farmer Demo ]`, `[ Veterinary Demo ]`, `[ Government Demo ]`), role-based routing (`ProtectedRoute`, `RoleGuard`), split-screen login page, user profiles (`user_profiles` database table), i18n locales (`en.json`, `te.json`, `hi.json`), authenticated navigation bar, role portal placeholders (`/farmer`, `/vet`, `/government`), full 12-step system workflow view (`/workflow`), and profile management (`/profile`).

---

## Technology Stack

### Frontend
- **Framework:** React 18 + Vite
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **Auth:** AuthContext + AuthService (Supabase Auth / Demo Adapter)
- **i18n:** Custom hook + locales (`en.json`, `te.json`, `hi.json`)
- **Icons:** Lucide React

### Backend
- **Framework:** FastAPI
- **Server:** Uvicorn
- **Validation:** Pydantic v2
- **Database:** Supabase PostgreSQL DDL + SQLite local fallback engine
- **Storage:** Supabase Storage (`livestock-case-attachments` bucket) / Local Uploads
- **Testing:** pytest & httpx

---

## Database Schemas

- `001_phase1_schema.sql`: `farmers`, `herds`, `animals`, `locations`, `health_reports`, `mortality_reports`, `vaccinations`, `treatments`, `case_attachments`.
- `002_phase0_5_user_profiles.sql`: `user_profiles` (`auth_user_id`, `full_name`, `role`, `preferred_language`, `phone`, indexes, and RLS policies).

---

## Supported Roles & Portal Routes

- **Farmer** (`farmer`) -> `/farmer` (Placeholder cards marked *"Coming in Phase 1"*)
- **Veterinary Officer** (`veterinary_officer`) -> `/vet` (Placeholder cards marked *"Coming in later phase"*)
- **Government Official** (`government_official`) -> `/government` (Placeholder cards marked *"Coming in later phase"*)
- **Public Entry Point**: `/login` (Split-screen desktop / centered mobile card)
- **Platform Vision**: `/workflow` (12-stage workflow with Phase 0.5 active badge)
- **User Profile**: `/profile` (User metadata & language switcher)

---

## Quickstart

### 1. Backend Setup
```bash
cd backend
venv\Scripts\activate
pip install -r requirements.txt

# Run server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Run Backend Automated Tests
```bash
cd backend
pytest
```

---

## Multi-Phase Roadmap

- **Phase 0:** Project Foundation & Gateway Architecture (COMPLETED)
- **Phase 0.5:** Authentication & Role Foundation (COMPLETED)
- **Phase 1:** Farmer + Animal + Herd + Health Reporting Foundation (PLANNED)
- **Phase 2:** Offline-first PWA, Service Worker & IndexedDB sync (PLANNED)
- **Phase 3:** Image ML Disease Classifier (PyTorch, EfficientNet, ResNet) (PLANNED)
- **Phase 4:** Symptom NLP Rules & Diagnostic Triage (PLANNED)
- **Phase 5:** Guardian Camera Real-Time Thermal Monitoring (PLANNED)
- **Phase 6:** Multimodal Outbreak Risk Forecasting Engine (PLANNED)
- **Phase 7:** GIS Mapping, Spatial Heatmaps & PostGIS (PLANNED)
- **Phase 8:** Veterinary Review & Laboratory Referral Workflows (PLANNED)
- **Phase 9:** Government Outbreak Analytics, IVR Voice & SMS Alerts (PLANNED)
- **Phase 10:** End-to-End SIH National Live Demonstration (PLANNED)
