# Platform Architecture Overview

## Phase 0 System Architecture

The **AI-Enabled Livestock Health, Disease Surveillance & Management Platform** is designed as a multi-tier enterprise architecture. In **Phase 0**, only the core API foundational layer and system overview frontend connectivity are active.

### High-Level Architectural Flow Diagram

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Interface Layer (Phase 0: Base System Overview Active)"]
        FW["Farmer / Field Worker (Future)"]
        UI["React Frontend Application (Active Phase 0 UI)"]
        Gov["Veterinary / Government Dashboard (Future)"]
    end

    subgraph APILayer ["API & Business Logic Layer (Active)"]
        API["FastAPI Gateway (/health, /api/v1/system/info)"]
        Config["Core Config & Middleware"]
    end

    subgraph DataLayer ["Data & Storage Layer (Phase 0 Prepared)"]
        DB["Supabase PostgreSQL (Future Schema - Phase 1)"]
        Storage["Supabase Media Storage (Future - Phase 1)"]
    end

    subgraph FutureAILayer ["Future AI / ML Intelligence Layer (NOT IMPLEMENTED IN PHASE 0)"]
        ML_Img["Image Disease Classification (ResNet/EfficientNet - Future)"]
        ML_Symp["Symptom NLP Classifier (Future)"]
        ML_Guard["Guardian Camera Thermal Monitor (Future)"]
        ML_Risk["Outbreak & Spatiotemporal Risk Model (Future)"]
    end

    subgraph FutureGISLayer ["Future GIS & Spatial Layer (NOT IMPLEMENTED IN PHASE 0)"]
        GIS["PostGIS & Map Server (Leaflet/MapLibre - Future)"]
    end

    %% Flow connections
    FW -.->|Future Mobile/Web| UI
    Gov -.->|Future Dashboard| UI
    UI -->|HTTP / REST (Active API Connectivity)| API
    API --> Config
    API -.->|Future Database Client| DB
    API -.->|Future Media Storage| Storage
    
    API -.->|Future Async Inference| FutureAILayer
    API -.->|Future Geospatial Queries| FutureGISLayer

    %% Styling for implemented vs future
    classDef active fill:#10B981,stroke:#047857,color:#fff,stroke-width:2px;
    classDef future fill:#6B7280,stroke:#374151,color:#fff,stroke-dasharray: 5 5;

    class UI,API,Config active;
    class FW,Gov,DB,Storage,ML_Img,ML_Symp,ML_Guard,ML_Risk,GIS future;
```

---

## Component Status Summary

| Component | Technology | Phase 0 Status | Target Phase |
|---|---|---|---|
| Frontend Web UI | React, TypeScript, Vite, Tailwind CSS | **ACTIVE** (Landing, System Status, Architecture) | Phase 0 |
| REST API Gateway | FastAPI, Uvicorn, Pydantic | **ACTIVE** (`/health`, `/api/v1/system/info`) | Phase 0 |
| Database Layer | Supabase PostgreSQL | Prepared Client Placeholder | Phase 1 |
| Image Analysis Engine | PyTorch, OpenCV, YOLO, EfficientNet | **NOT IMPLEMENTED** | Phase 2 |
| Symptom / Risk Engine | scikit-learn, XGBoost | **NOT IMPLEMENTED** | Phase 2 |
| Guardian Thermal Camera | OpenCV, PyTorch | **NOT IMPLEMENTED** | Phase 3 |
| GIS & Heatmap Layer | PostGIS, Leaflet / MapLibre | **NOT IMPLEMENTED** | Phase 3 |
| Notifications / IVR | Telephony API | **NOT IMPLEMENTED** | Phase 4 |
