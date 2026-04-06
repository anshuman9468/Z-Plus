# Z+ Full Stack Setup Guide

This guide will help you set up and run both the backend (Django) and frontend (React) together.

## Prerequisites

- Python 3.8+ (for backend)
- Node.js 16+ and npm (for frontend)
- pip (Python package manager)

## Backend Setup (Django)

1. Navigate to the backend directory:
```bash
cd "Z plus"
```

2. Create and activate a virtual environment (if not already created):
```bash
# On Linux/Mac:
python3 -m venv venv
source venv/bin/activate

# On Windows:
python -m venv venv
venv\Scripts\activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Run the Django development server:
```bash
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

## Frontend Setup (React)

1. Open a new terminal and navigate to the frontend directory:
```bash
cd "Z+ Website UI Design (1)"
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## How It Works

- The frontend (React) runs on port 3000
- The backend (Django) runs on port 8000
- The frontend is configured to proxy API requests to the backend via Vite's proxy configuration
- CORS is enabled on the backend to allow requests from the frontend

## API Endpoints

- `POST /api/upload/` - Upload a dataset and start training
  - Parameters: `dataset` (file), `targetColumn`, `model`, `task`, `trainSplit`
  - Returns: Training job response with job_id, accuracy, proof, etc.

- `GET /api/status/<job_id>/` - Get training job status
  - Returns: Current status of the training job

## Usage

1. Start both servers (backend and frontend)
2. Open `http://localhost:3000` in your browser
3. Upload a CSV file with columns 'x' (features) and a target column (y, target, label, etc.)
4. Select your model type, task, and parameters
5. Click "Train Privately" to start training
6. View results on the results page

## Troubleshooting

- **CORS errors**: Make sure the backend is running and CORS is properly configured
- **API connection errors**: Verify both servers are running and check the proxy configuration in `vite.config.ts`
- **File upload errors**: Ensure your CSV has the required columns ('x' and a target column)

