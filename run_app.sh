#!/bin/bash
# Script to run the Z+ application

echo "Starting Z+ Application..."
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/Z plus"

# Check if server is already running
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 8000 is already in use. Stopping existing server..."
    pkill -f "manage.py runserver"
    sleep 2
fi

# Start Django server
echo "🚀 Starting Django server on http://localhost:8000"
echo "   Press Ctrl+C to stop the server"
echo ""

python3 manage.py runserver 0.0.0.0:8000

