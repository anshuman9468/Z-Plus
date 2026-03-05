# Z+ Platform

> A full-stack machine learning platform for CSV uploads, model training, and simulated zero-knowledge proof generation.

![Python](https://img.shields.io/badge/Python-3.12+-blue?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Frontend-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-See%20Below-lightgrey)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Development Workflow](#development-workflow)
- [API Reference](#api-reference)
- [Data Quality & Diagnostics](#data-quality--diagnostics)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Z+ is a full-stack ML platform that lets users upload CSV datasets, train classification models, and receive performance metrics along with simulated zero-knowledge proof artifacts — all through a clean REST API and React-based UI.

---

## Architecture

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Vite + React                        |
| Backend    | FastAPI (Python 3.12+)              |
| Storage    | JSON-based flat file (`store.json`) |
| ML Models  | Logistic Regression, Random Forest, and other scikit-learn classifiers |

---

## Prerequisites

- Python **3.12+**
- Node.js **16+**
- `npm` or `yarn`

---

## Getting Started

### Backend Setup

**1. Create and activate a virtual environment**

```bash
python3.12 -m venv .venv
source .venv/bin/activate
```

**2. Install Python dependencies**

```bash
pip install -r backend/requirements.txt
```

**3. Start the backend server**

```bash
uvicorn backend.main:app --reload --port 8000
```

The backend serves:
- API routes at `/api/*`
- Production frontend (after build) from `backend/frontend_dist/`

**4. Run tests**

```bash
source .venv/bin/activate
pytest
```

The test suite validates:
- Metric accuracy
- Error handling
- Warning propagation
- Sample data processing (`data/sample_binary.csv`)

---

### Frontend Setup

**Development mode**

```bash
npm install
npm run dev
```

Development server runs at `http://localhost:5173`

**Production build**

```bash
npm run build
cp -r build/* backend/frontend_dist/
```

---

## Development Workflow

1. Start the backend:
   ```bash
   source .venv/bin/activate
   uvicorn backend.main:app --reload --port 8000
   ```

2. Start the frontend in development mode:
   ```bash
   npm run dev
   ```

3. Make your changes and run tests:
   ```bash
   pytest
   ```

4. Build for production:
   ```bash
   npm run build
   cp -r build/* backend/frontend_dist/
   ```

---

## API Reference

### Train a Model

**Endpoint:** `POST /api/run-job`

**Request (multipart/form-data):**

```bash
curl -X POST http://127.0.0.1:8000/api/run-job \
  -F "dataset=@data/sample_binary.csv" \
  -F "task=train" \
  -F "model_type=logistic_regression" \
  -F "target_column=target"
```

**Parameters:**

| Parameter       | Type               | Description                              |
|-----------------|--------------------|------------------------------------------|
| `dataset`       | File (CSV)         | Training data as multipart/form-data     |
| `task`          | `train` \| `predict` | Job type                               |
| `model_type`    | string             | e.g. `logistic_regression`, `random_forest` |
| `target_column` | string             | Name of the target column in the CSV     |

**Response:**

```json
{
  "run_id": "uuid-string",
  "metrics": {
    "accuracy": 0.84,
    "precision": 0.83,
    "recall": 0.82,
    "f1": 0.82
  },
  "warnings": [],
  "sample_predictions": [0, 1, 0, 1],
  "proof": {
    "circuit_hash": "...",
    "verification_key": "..."
  },
  "proof_download_url": "/api/proof/{run_id}/download"
}
```

---

## Data Quality & Diagnostics

### Diagnostic Logging

Training jobs emit detailed `DEBUG` logs to help inspect pipeline behavior:

```
DEBUG:zplus.ml:Loaded CSV with shape: 200 x 7
DEBUG:zplus.ml:Columns: ['age', 'income', 'education', 'target']
DEBUG:zplus.ml:After dropna: shape: 190 x 7
DEBUG:zplus.ml:Target column: 'target' unique counts: {0: 91, 1: 99}
DEBUG:zplus.ml:Feature matrix X shape: (190, 12)
DEBUG:zplus.ml:Train/test split: X_train=(142, 12), X_test=(48, 12)
DEBUG:zplus.ml:Model type: logistic_regression, model fitted: True
DEBUG:zplus.ml:Sample true vs pred on test: [(1, 1), (0, 0), (1, 1)]
DEBUG:zplus.ml:Computed metrics: accuracy=0.83, precision=0.82, recall=0.81, f1=0.81
```

### Automatic Data Quality Warnings

| Warning                       | Trigger Condition                                     |
|-------------------------------|-------------------------------------------------------|
| Dataset too small             | Fewer than 50 rows after cleaning                     |
| Single class in test set      | Only one target class present in test data            |
| Categorical encoding issues   | Rare categories dropped during encoding               |

Warnings are returned in the API response and persisted to `store.json`.

---

## Project Structure

```
.
├── backend/
│   ├── main.py                # FastAPI application
│   ├── requirements.txt       # Python dependencies
│   ├── zplus/
│   │   └── ml.py              # ML training logic
│   └── frontend_dist/         # Production frontend build
├── data/
│   └── sample_binary.csv      # Sample training dataset
├── tests/
│   └── test_*.py              # Test suite
├── src/                       # Frontend source code
├── package.json               # Node.js dependencies
└── vite.config.js             # Vite configuration
```

---

## Troubleshooting

**Backend won't start**
- Verify Python 3.12+ is installed: `python --version`
- Ensure the virtual environment is activated: `source .venv/bin/activate`
- Confirm all dependencies are installed: `pip list`

**Frontend won't build**
- Clear and reinstall node modules: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (requires 16+)

**API returns errors**
- Ensure the CSV format matches the expected structure
- Verify the `target_column` name exists in the uploaded dataset
- Review backend logs for detailed error messages

---

## Contributing

1. Write tests for any new features
2. Ensure all tests pass: `pytest`
3. Follow the existing code style
4. Update this documentation as needed

---

## License

[Add your license here]
