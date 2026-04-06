#!/bin/bash
# Simple script to start the Django server

echo "Starting Z+ Application Server..."
echo ""

cd "$(dirname "$0")/Z plus"

# Check if React app is built
if [ ! -d "../Z+ Website UI Design (1)/build" ]; then
    echo "Building React app first..."
    cd "../Z+ Website UI Design (1)"
    npm install
    npm run build
    cd "../Z plus"
fi

# Start Django server
echo ""
echo "=========================================="
echo "Starting Django server..."
echo "Access the application at: http://localhost:8000"
echo "Press Ctrl+C to stop the server"
echo "=========================================="
echo ""

python3 manage.py runserver 0.0.0.0:8000

