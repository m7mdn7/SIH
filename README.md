# SIIP (Societal Innovation Intelligence Platform)

A platform that takes raw citizen-submitted societal problems, runs them through an AI pipeline to classify them, detects the underlying "innovation gap," and matches them to the best-fit university, then tracks the resulting project through to completion.

## Project Structure

- `apps/web`: React + TypeScript + Vite + Tailwind CSS frontend
- `apps/api`: Node + TypeScript + Express backend API
- `services/ai-service`: Python + FastAPI AI analysis service (stubs)
- `packages/types`: Shared TypeScript interfaces
- `database/`: Database schema, migrations, and seeds
- `docker/`: Docker Compose configuration (Postgres with pgvector)

## Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- Python (v3.10+ recommended)
- Docker Desktop (for Postgres/pgvector, optional if using SQLite fallback)

### Quick Start (Local Run with SQLite Fallback)

If Docker or local Postgres is not configured, the API will automatically fall back to using an in-memory or file-based SQLite database (`siip.db`) powered by the native `node:sqlite` module.

1. **Install dependencies at the root**:
   ```bash
   npm install
   ```

2. **Run the AI Service**:
   ```bash
   cd services/ai-service
   python -m venv .venv
   .venv/Scripts/activate # Windows
   pip install -r requirements.txt
   uvicorn app.main:app --port 8000 --reload
   ```

3. **Run the Backend API**:
   ```bash
   cd apps/api
   # It will automatically initialize the SQLite DB and apply seed data if needed
   npm run dev
   ```

4. **Run the Web Frontend**:
   ```bash
   cd apps/web
   npm run dev
   ```

5. Access the app at http://localhost:5173.
