# SIIP — Societal Innovation Intelligence Platform Architecture

## Overview
SIIP is a national-scale **Societal Innovation Intelligence Platform** that transforms real-world citizen challenges into validated, fundable, and measurable higher education institution (HEI) innovation projects.

```
┌───────────────────────────────────────────────────────────────────┐
│                        FRONTEND PORTALS                           │
│  Citizen (:3000) │ Institution (:3001) │ Govt (:3002) │ Funder (:3003) │
└─────────────────────────────────┬─────────────────────────────────┘
                                  │ HTTPS / REST / WebSockets
┌─────────────────────────────────▼─────────────────────────────────┐
│                      NODE.JS API BACKEND                          │
│                        (Port 4000)                                │
└─────────────────┬───────────────────────────────┬─────────────────┘
                  │ SQLite / PostGIS              │ HTTP API
┌─────────────────▼─────────┐          ┌──────────▼─────────────────┐
│     DATABASE ENGINE       │          │   FASTAPI AI ML SERVICE    │
│       (apps/siip.db)      │          │        (Port 8000)         │
└───────────────────────────┘          └────────────────────────────┘
```

---

## 1. System Components & Service Ports

| Service Component | Directory Path | Environment Port | Startup Command (Windows / PowerShell) |
| :--- | :--- | :--- | :--- |
| **Citizen Portal** | `apps/web` | `3000` | `npm run dev:citizen` |
| **Institution Portal** | `apps/web` | `3001` | `npm run dev:institution` |
| **Government Portal** | `apps/web` | `3002` | `npm run dev:government` |
| **Funder Portal** | `apps/web` | `3003` | `npm run dev:funder` |
| **Node.js API Gateway** | `apps/api` | `4000` | `npm run dev:api` |
| **Python AI ML Engine**| `services/ai-service` | `8000` | `.\.venv\Scripts\python.exe -m uvicorn app.main:app --port 8000` |

---

## 2. End-to-End Problem-to-Impact Lifecycle

```
[1. Citizen Report] ──> [2. AI Analysis & Gap Detection] ──> [3. HEI Match & Proposal]
                                                                      │
[6. Transparent Impact] <── [5. Industry/CSR Funding] <── [4. Government Validation]
```

1. **Citizen Submission**: Problem description, geolocated coordinates, and evidence images uploaded.
2. **AI Enrichment**: SentenceTransformer (`all-MiniLM-L6-v2`) classifies domain, severity, duplicate probability, and required expertise.
3. **Institution Matching**: Multi-criteria matching algorithm matches regional universities based on research capability tags.
4. **Government Validation**: Policy admins validate strategic priority, societal impact score, and target SDGs.
5. **Industry / CSR Funding**: Corporate funders sponsor validated innovation projects.
6. **Execution & Impact**: HEIs submit milestone evidence; citizens track transparent progress.

---

## 3. Environment Variables Specification

### API Backend (`apps/api/.env`)
```env
PORT=4000
DATABASE_URL=apps/siip.db
AI_SERVICE_URL=http://localhost:8000
JWT_SECRET=siip_secret_key_2026
```

### Frontend Applications (`apps/web/.env`)
```env
VITE_API_URL=http://localhost:4000
```
