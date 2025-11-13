
# Z+ Platform (Frontend + FastAPI Backend)

This repository contains the Z+ Vite frontend and the PrivAI FastAPI backend that powers CSV uploads, model training, and simulated proof generation.

## Backend Quickstart

```bash
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
```

The backend serves both API routes (`/api/*`) and, after `npm run build`, the production frontend (copied into `backend/frontend_dist/`).

### Running Tests

```bash
source .venv/bin/activate
pytest
```

The suite in `tests/` validates metric accuracy, error handling, and warning propagation. Sample data lives in `data/sample_binary.csv`.

### Example API Workflow

```bash
curl -X POST http://127.0.0.1:8000/api/run-job \
  -F "dataset=@data/sample_binary.csv" \
  -F "task=train" \
  -F "model_type=logistic_regression" \
  -F "target_column=target"
```

Response shape:

```json
{
  "run_id": "...",
  "metrics": {
    "accuracy": 0.84,
    "precision": 0.83,
    "recall": 0.82,
    "f1": 0.82
  },
  "warnings": [],
  "sample_predictions": [0, 1, ...],
  "proof": {...},
  "proof_download_url": "/api/proof/{run_id}/download"
}
```

### Diagnostic Logging

When training completes you should see DEBUG logs similar to:

```
DEBUG:zplus.ml:Loaded CSV with shape: 200 x 7
DEBUG:zplus.ml:Columns: ['age', 'income', ...]
DEBUG:zplus.ml:After dropna: shape: 190 x 7
DEBUG:zplus.ml:Target column: 'target' unique counts: {0: 91, 1: 99}
DEBUG:zplus.ml:Feature matrix X shape: (190, 12)
DEBUG:zplus.ml:Train/test split: X_train=(142, 12), X_test=(48, 12)
DEBUG:zplus.ml:Model type: logistic_regression, model fitted: True
DEBUG:zplus.ml:Sample true vs pred on test: [(1, 1), (0, 0), ...]
DEBUG:zplus.ml:Computed metrics: accuracy=0.83, precision=0.82, recall=0.81, f1=0.81
```

Warnings returned to the frontend (and stored in `store.json`) may include:

- `Dataset too small after cleaning; metrics may be unreliable.`
- `Only one class present in test set; metrics may be unreliable.`
- `Categorical columns encoded; some dropped due to rarity.`

## Frontend Development

```bash
npm install
npm run dev        # localhost:5173
```

For production mode, run `npm run build` and copy `build/*` into `backend/frontend_dist/` so the FastAPI server hosts the static bundle alongside the APIs.
  