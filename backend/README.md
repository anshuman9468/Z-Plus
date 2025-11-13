# PrivAI Backend

FastAPI backend for the PrivAI MVP. Handles CSV ingestion, ML model training, simulated zero-knowledge proof generation, and proof verification.

## Features

- Upload CSV datasets and train either logistic regression or decision tree classifiers.
- Automatic data cleaning and metric computation (accuracy, precision, recall).
- Deterministic model summaries and SHA-256 proof generation.
- Proof verification endpoint with recomputed hash output.
- Persistent proof metadata stored in `store.json` (no raw data stored).
- Proof download endpoint plus proof history listing.
- Health check and production-ready static file serving for the Vite frontend.

## Requirements

- Python 3.11+
- Pip (or a compatible package manager)

Install dependencies:

```bash
pip install -r backend/requirements.txt
```

## Running the Backend (Development)

```bash
uvicorn backend.main:app --reload --port 8000
```

The backend enables CORS for `http://localhost:5173` and `http://127.0.0.1:5173` to work seamlessly with the Vite frontend.

### Expected Frontend Calls

- `POST /api/run-job` (multipart form data with `dataset`, `task`, `model_type`, `target_column`, optional `run_name`)
- `POST /api/verify-proof`
- `GET /api/proof/{run_id}`
- `GET /api/proof/{run_id}/download`
- `GET /api/proofs`
- `GET /api/health`

## Production Mode

1. Build the frontend:

   ```bash
   npm run build
   ```

2. Place the generated `dist/` contents into `backend/frontend_dist/`.
3. Restart the backend. Static assets are then served at `/`, while API routes remain under `/api`.

## Data Handling

- Raw CSV data is never persisted or logged.
- Each training run generates a proof and metrics stored in `backend/store.json`.
- The store is reloaded automatically when the service starts.

## File Overview

- `backend/main.py` — FastAPI application with all REST endpoints and static serving.
- `backend/ml_pipeline.py` — Dataset validation, preprocessing, model training, and metrics.
- `backend/proof.py` — Proof generation and verification helpers.
- `backend/store.py` — Thread-safe persistence layer for proof metadata.
- `backend/store.json` — JSON file storing run metadata (created automatically).
- `backend/requirements.txt` — Python dependencies.

## Environment Variables

No environment variables are required for basic operation. Add an `.env` file if future configuration is needed.

---

Return ONLY the backend code and files. Do NOT generate frontend. Make everything clean, modular, and 100% ready to run.

