Z+ Platform
A full-stack machine learning platform combining a Vite frontend with a FastAPI backend for CSV uploads, model training, and simulated proof generation.
Architecture

Frontend: Vite-based React application
Backend: FastAPI server with ML capabilities
Database: JSON-based storage (store.json)
ML Models: Logistic regression and other classifiers

Prerequisites

Python 3.12+
Node.js 16+
npm or yarn

Backend Setup
Installation
bash# Create and activate virtual environment
python3.12 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
Running the Server
bashuvicorn backend.main:app --reload --port 8000
The backend serves:

API routes at /api/*
Production frontend (after build) from backend/frontend_dist/

Running Tests
bashsource .venv/bin/activate
pytest
Test suite validates:

Metric accuracy
Error handling
Warning propagation
Sample data processing (data/sample_binary.csv)

Frontend Setup
Development Mode
bash# Install dependencies
npm install

# Start development server
npm run dev
Development server runs at http://localhost:5173
Production Build
bash# Build for production
npm run build

# Copy to backend
cp -r build/* backend/frontend_dist/
API Usage
Training Endpoint
Request:
bashcurl -X POST http://127.0.0.1:8000/api/run-job \
  -F "dataset=@data/sample_binary.csv" \
  -F "task=train" \
  -F "model_type=logistic_regression" \
  -F "target_column=target"
Response:
json{
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
Available Parameters

dataset: CSV file (multipart/form-data)
task: train or predict
model_type: logistic_regression, random_forest, etc.
target_column: Name of target column in CSV

Diagnostic Logging
Training jobs produce detailed DEBUG logs:
DEBUG:zplus.ml:Loaded CSV with shape: 200 x 7
DEBUG:zplus.ml:Columns: ['age', 'income', 'education', 'target']
DEBUG:zplus.ml:After dropna: shape: 190 x 7
DEBUG:zplus.ml:Target column: 'target' unique counts: {0: 91, 1: 99}
DEBUG:zplus.ml:Feature matrix X shape: (190, 12)
DEBUG:zplus.ml:Train/test split: X_train=(142, 12), X_test=(48, 12)
DEBUG:zplus.ml:Model type: logistic_regression, model fitted: True
DEBUG:zplus.ml:Sample true vs pred on test: [(1, 1), (0, 0), (1, 1)]
DEBUG:zplus.ml:Computed metrics: accuracy=0.83, precision=0.82, recall=0.81, f1=0.81
Data Quality Warnings
The platform automatically detects and warns about data quality issues:
WarningTrigger ConditionDataset too smallFewer than 50 rows after cleaningSingle class in test setOnly one target class present in test dataCategorical encoding issuesRare categories dropped during encoding
Warnings are returned in the API response and stored in store.json.
Project Structure
.
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   ├── zplus/
│   │   └── ml.py           # ML training logic
│   └── frontend_dist/       # Production frontend build
├── data/
│   └── sample_binary.csv    # Sample training data
├── tests/
│   └── test_*.py           # Test suite
├── src/                     # Frontend source code
├── package.json            # Node dependencies
└── vite.config.js          # Vite configuration
Development Workflow

Start backend in development mode:

bash   source .venv/bin/activate
   uvicorn backend.main:app --reload --port 8000

Start frontend in development mode:

bash   npm run dev

Make changes and test
Build for production:

bash   npm run build
   cp -r build/* backend/frontend_dist/
Troubleshooting
Backend won't start:

Verify Python 3.12+ is installed
Ensure virtual environment is activated
Check all dependencies installed: pip list

Frontend won't build:

Clear node_modules: rm -rf node_modules && npm install
Check Node.js version: node --version

API returns errors:

Check CSV format matches expected structure
Verify target column name exists in dataset
Review backend logs for detailed error messages

Contributing

Write tests for new features
Ensure all tests pass: pytest
Follow existing code style
Update documentation as needed

License
[Add your license here]
