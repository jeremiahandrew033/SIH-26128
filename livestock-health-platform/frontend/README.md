# Livestock Health Platform Frontend

React + TypeScript + Vite web client for the **AI-Enabled Livestock Health, Disease Surveillance & Management Platform**.

## Tech Stack
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM

## Setup & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default value:
`VITE_API_BASE_URL=http://localhost:8000`

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

## Available Routes (Phase 0)
- `/`: Landing page & platform health status summary.
- `/health`: System health monitor and detailed backend connectivity metrics.
- `/architecture`: High-level system architecture overview.
