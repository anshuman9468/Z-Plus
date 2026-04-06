# 🚀 How to Run Z+ Application

## Quick Start (Easiest Method)

### Option 1: Using the Start Script (Recommended)

```bash
cd "/home/anshumandutta/Z-Plus Zsnark"
chmod +x start.sh
./start.sh
```

This script will:
1. ✅ Set up Python virtual environment (if needed)
2. ✅ Install Python dependencies
3. ✅ Install npm dependencies (if needed)
4. ✅ Build the React frontend
5. ✅ Start the Django server

**Then open your browser and go to:** `http://localhost:8000`

---

### Option 2: Manual Steps

#### Step 1: Build the React Frontend

```bash
cd "Z+ Website UI Design (1)"
npm install  # Only needed first time
npm run build
```

#### Step 2: Start the Django Backend

```bash
cd "../Z plus"

# Create and activate virtual environment (first time only)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Start the server
python3 manage.py runserver 0.0.0.0:8000
```

**Then open your browser and go to:** `http://localhost:8000`

---

## 🛑 Stopping the Server

Press `Ctrl+C` in the terminal where the server is running.

Or use the stop script:
```bash
./stop_server.sh
```

---

## 🔄 Restarting the Server

### Option 1: Using the Restart Script (Easiest)

```bash
cd "/home/anshumandutta/Z-Plus Zsnark"
./restart_server.sh
```

This will:
1. ✅ Stop the running server
2. ✅ Wait for port to be released
3. ✅ Start the server again

### Option 2: Manual Restart

**Step 1: Stop the server**
```bash
cd "/home/anshumandutta/Z-Plus Zsnark"
./stop_server.sh
# Or press Ctrl+C if server is running in terminal
```

**Step 2: Start the server**
```bash
./start_server.sh
```

### Option 3: Quick Restart (if server is in foreground)

If the server is running in your terminal:
1. Press `Ctrl+C` to stop it
2. Run `./start_server.sh` to start it again

---

## 📋 Prerequisites

Make sure you have installed:
- **Python 3.8+** (check with `python3 --version`)
- **Node.js 16+** (check with `node --version`)
- **npm** (comes with Node.js)

---

## 🔧 Troubleshooting

### Port 8000 already in use
```bash
# Kill any process using port 8000
pkill -f "manage.py runserver"
# Or use the stop script
./stop_server.sh
```

### React app not built
```bash
cd "Z+ Website UI Design (1)"
npm run build
```

### Python dependencies missing
```bash
cd "Z plus"
source venv/bin/activate
pip install -r requirements.txt
```

### Module not found errors
Make sure you're in the virtual environment:
```bash
cd "Z plus"
source venv/bin/activate
```

---

## 📁 Project Structure

```
Z-Plus Zsnark/
├── Z plus/                    # Django backend
│   ├── django_project/        # Django settings
│   ├── ml_app/                # ML and ZK app
│   └── manage.py
├── Z+ Website UI Design (1)/  # React frontend
│   ├── src/                   # React source code
│   └── build/                 # Built React app (generated)
├── start.sh                   # Start script
└── stop_server.sh             # Stop script
```

---

## ✨ Features Available

Once running, you can:
- 📤 Upload datasets and train ML models
- 🔐 Generate ZK-SNARK proofs for model training
- 📥 Download proof files (JSON format)
- 🏆 Generate verification certificates (HTML)
- ✅ Verify proofs using the ZK Verifier

---

## 🌐 Access Points

- **Main Application:** http://localhost:8000
- **API Endpoints:** http://localhost:8000/api/
- **Admin Panel:** http://localhost:8000/admin/ (if configured)

---

**Note:** The React app is already built, so you can skip the build step if you just want to start the server quickly using `run_app.sh` or directly with `python3 manage.py runserver`.
