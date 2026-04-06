# Quick Start Guide

## To Start the Server:

### Option 1: Use the start script (Easiest)
```bash
cd "/home/anshumandutta/Z-Plus Zsnark"
./start_server.sh
```

### Option 2: Manual start
```bash
cd "/home/anshumandutta/Z-Plus Zsnark/Z plus"
python3 manage.py runserver 0.0.0.0:8000
```

## Then Open Your Browser:
Go to: **http://localhost:8000** or **http://127.0.0.1:8000**

## If You Get "Connection Refused" Error:

1. **Make sure the server is running:**
   - Check the terminal where you ran the start command
   - You should see: "Starting development server at http://0.0.0.0:8000/"

2. **Check if React app is built:**
   ```bash
   ls "Z+ Website UI Design (1)/build"
   ```
   If the build directory doesn't exist, build it:
   ```bash
   cd "Z+ Website UI Design (1)"
   npm install
   npm run build
   ```

3. **Check if Django is installed:**
   ```bash
   python3 -m pip list | grep Django
   ```
   If not installed:
   ```bash
   cd "Z plus"
   python3 -m pip install -r requirements.txt
   ```

4. **Check if port 8000 is already in use:**
   ```bash
   lsof -i :8000
   ```
   If something is using it, kill it or use a different port:
   ```bash
   python3 manage.py runserver 0.0.0.0:8001
   ```

## Troubleshooting:

- **"Module not found" errors:** Install dependencies: `python3 -m pip install -r requirements.txt`
- **"React app not built" error:** Build the React app: `cd "Z+ Website UI Design (1)" && npm run build`
- **Port already in use:** Use a different port or kill the process using port 8000

