# Platform Development Roadmap (Phases 0 - 10)

This document outlines the multi-phase implementation roadmap for the **AI-Enabled Livestock Health, Disease Surveillance & Management Platform**.

---

## Phase Breakdown

### Phase 0: Project Foundation & Architecture
- **Goal:** Gateway API setup, React + TypeScript + Vite + Tailwind repository layout, CORS configuration, base status monitor.
- **Status:** **COMPLETED**

### Phase 0.5: Authentication & Role Foundation
- **Goal:** Supabase Auth integration, Demo Auth adapter (`[ Farmer Demo ]`, `[ Veterinary Demo ]`, `[ Government Demo ]`), role-based routing (`ProtectedRoute`, `RoleGuard`), split-screen login page, user profiles (`user_profiles` database table), i18n locales (`en.json`, `te.json`, `hi.json`), authenticated navigation bar, role portal placeholders (`/farmer`, `/vet`, `/government`), full 12-step system workflow view (`/workflow`), and profile management (`/profile`).
- **Status:** **COMPLETED**

### Phase 1: Farmer + Animal + Herd + Health Reporting Foundation
- **Goal:** Farmer prototype identity, animal registration (`COW-0001`, `BUF-0001`), herd records, 8-step mobile health report form, mortality report form with warning disclaimer, Supabase Storage bucket (`livestock-case-attachments`), photo uploads, GPS location capture, unique human-readable Case ID generation (`LIV-2026-XXXXXX`), seed script, and automated tests.
- **Status:** PLANNED

### Phase 2: Offline-First PWA, Service Worker & IndexedDB Sync
- **Goal:** PWA manifest, service worker caching, and IndexedDB local queue for offline field worker report submissions.
- **Status:** PLANNED

### Phase 3: Image Machine Learning Disease Classifier
- **Goal:** Computer vision pipeline (PyTorch, EfficientNet, ResNet, YOLO) for skin lesion, lumpy skin, and FMD visual classification.
- **Status:** PLANNED

### Phase 4: Symptom NLP Engine & Diagnostic Triage
- **Goal:** Symptom NLP scoring, tabular disease assessment (scikit-learn, XGBoost), and clinical urgency triage.
- **Status:** PLANNED

### Phase 5: Guardian Thermal Camera Surveillance
- **Goal:** Guardian Camera video stream ingestion, thermal anomaly detection, and automated fever alerts.
- **Status:** PLANNED

### Phase 6: Multimodal Risk Forecasting Engine
- **Goal:** Spatiotemporal epidemic risk scoring combining weather, vector density, and livestock movement data.
- **Status:** PLANNED

### Phase 7: GIS Outbreak Intelligence & Spatial Heatmaps
- **Goal:** PostGIS spatial queries, Leaflet/MapLibre vector maps, quarantine zone boundaries, and outbreak heatmaps.
- **Status:** PLANNED

### Phase 8: Veterinary Review & Laboratory Workflows
- **Goal:** Vet dashboard, case assignment, treatment prescription logs, and lab diagnostic sample tracking.
- **Status:** PLANNED

### Phase 9: Government Analytics, Telephony & IVR Alerts
- **Goal:** State/National government dashboard, IVR voice reporting for rural farmers, and SMS outbreak broadcasting.
- **Status:** PLANNED

### Phase 10: System Integration & Live SIH Prototype
- **Goal:** Full end-to-end integration, load testing, performance tuning, and hackathon presentation.
- **Status:** PLANNED
