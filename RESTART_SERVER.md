# 🔄 How to Restart the Server

## Quick Restart (Recommended)

### Option 1: Using Stop Script (If Available)
```bash
cd "/home/anshumandutta/Z-Plus Zsnark"
./stop_server.sh
sleep 2
./start.sh
```

### Option 2: Manual Restart

**Step 1: Stop the Server**
```bash
pkill -f "manage.py runserver"
```

Or if you're running it in a terminal:
- Press `Ctrl+C` to stop the server

**Step 2: Start the Server**
```bash
cd "/home/anshumandutta/Z-Plus Zsnark/Z plus"
python3 manage.py runserver 0.0.0.0:8000
```

**Step 3: (Optional) Run in Background**
```bash
cd "/home/anshumandutta/Z-Plus Zsnark/Z plus"
python3 manage.py runserver 0.0.0.0:8000 > /tmp/django_server.log 2>&1 &
```

## Full Restart (With Frontend Rebuild)

If you made changes to the frontend code:

**Step 1: Rebuild Frontend**
```bash
cd "/home/anshumandutta/Z-Plus Zsnark/Z+ Website UI Design (1)"
npm run build
```

**Step 2: Stop Server**
```bash
pkill -f "manage.py runserver"
```

**Step 3: Start Server**
```bash
cd "/home/anshumandutta/Z-Plus Zsnark/Z plus"
python3 manage.py runserver 0.0.0.0:8000
```

## Restart After Environment Variable Changes

If you changed `.env` file or Supabase configuration:

**Step 1: Rebuild Frontend** (to pick up new env variables)
```bash
cd "/home/anshumandutta/Z-Plus Zsnark/Z+ Website UI Design (1)"
npm run build
```

**Step 2: Restart Server**
```bash
pkill -f "manage.py runserver"
cd "/home/anshumandutta/Z-Plus Zsnark/Z plus"
python3 manage.py runserver 0.0.0.0:8000
```

## Check Server Status

**Check if server is running:**
```bash
ps aux | grep "[m]anage.py runserver"
```

**Check server logs:**
```bash
tail -f /tmp/django_server.log
```

**Test if server is accessible:**
```bash
curl http://localhost:8000
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process using port 8000
pkill -f "manage.py runserver"
# Or
lsof -ti:8000 | xargs kill -9
```

### Server Not Starting
```bash
# Check for errors
cd "/home/anshumandutta/Z-Plus Zsnark/Z plus"
python3 manage.py runserver 0.0.0.0:8000
# Look for error messages in the terminal
```

### Frontend Not Updating
```bash
# Rebuild frontend
cd "/home/anshumandutta/Z-Plus Zsnark/Z+ Website UI Design (1)"
npm run build
# Then restart server
```

## Quick Commands Summary

```bash
# Stop server
pkill -f "manage.py runserver"

# Start server
cd "/home/anshumandutta/Z-Plus Zsnark/Z plus"
python3 manage.py runserver 0.0.0.0:8000

# Rebuild frontend
cd "/home/anshumandutta/Z-Plus Zsnark/Z+ Website UI Design (1)"
npm run build

# Check server status
ps aux | grep "[m]anage.py runserver"

# View server logs
tail -f /tmp/django_server.log
```

## After Restart

1. Open your browser
2. Go to: http://localhost:8000
3. Test your application

## ✅ Server Restarted!

Your server should now be running with the latest changes!

