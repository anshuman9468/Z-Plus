# Z+ Integrated Application

This application now runs from a **single localhost URL** - everything is served through Django!

## Quick Start

### Option 1: Using the Start Script (Recommended)

**Linux/Mac:**
```bash
./start.sh
```

**Windows:**
```bash
start.bat
```

This script will:
1. Set up the virtual environment (if needed)
2. Install dependencies (if needed)
3. Build the React app
4. Start the Django server

### Option 2: Manual Setup

1. **Build the React app:**
```bash
cd "Z+ Website UI Design (1)"
npm install
npm run build
```

2. **Start Django server:**
```bash
cd "../Z plus"
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py runserver
```

3. **Access the application:**
Open your browser and go to: **http://localhost:8000**

That's it! Everything runs from a single URL.

## How It Works

- Django serves the built React app for all routes except `/api/*`
- API requests go to `/api/*` and are handled by Django
- Static assets (JS, CSS, images) are served from the React build directory
- Media files (uploaded datasets) are served from `/media/*`

## Development vs Production

### Development Mode (Separate Servers)
If you want to run them separately for development:
- Frontend: `cd "Z+ Website UI Design (1)" && npm run dev` (port 3000)
- Backend: `cd "Z plus" && python manage.py runserver` (port 8000)
- The frontend will proxy API requests to the backend

### Production Mode (Integrated)
- Build the React app: `npm run build`
- Run Django: `python manage.py runserver`
- Everything accessible at `http://localhost:8000`

## File Structure

```
Z-Plus Zsnark/
├── Z plus/                    # Django backend
│   ├── django_project/        # Django settings
│   ├── ml_app/                # ML and ZK app
│   └── manage.py
├── Z+ Website UI Design (1)/  # React frontend
│   ├── src/                   # React source code
│   └── build/                 # Built React app (generated)
├── start.sh                   # Start script (Linux/Mac)
└── start.bat                  # Start script (Windows)
```

## Troubleshooting

**"React app not built" error:**
- Make sure you've run `npm run build` in the frontend directory
- Or use the start script which builds it automatically

**Static files not loading:**
- Check that the React app was built successfully
- Verify the build directory exists: `Z+ Website UI Design (1)/build/`

**API requests failing:**
- Make sure Django is running
- Check that the API URL is `/api/` (relative path)

## Notes

- The React app is built and served as static files by Django
- Hot reload is not available in integrated mode (use separate dev servers for that)
- For production deployment, use a proper WSGI server like Gunicorn

