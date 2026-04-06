#!/bin/bash
# Script to stop the Django server

echo "Stopping Django server on port 8000..."

# Find and kill processes using port 8000
pids=$(pgrep -f "manage.py runserver")
if [ -n "$pids" ]; then
    echo "Found Django server processes: $pids"
    kill -9 $pids 2>/dev/null
    echo "Server stopped."
else
    echo "No Django server found running."
fi

# Also check for any process on port 8000
port_pid=$(lsof -ti :8000 2>/dev/null)
if [ -n "$port_pid" ]; then
    echo "Found process on port 8000: $port_pid"
    kill -9 $port_pid 2>/dev/null
    echo "Port 8000 is now free."
fi

