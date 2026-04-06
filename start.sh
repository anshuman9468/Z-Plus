#!/bin/bash
# Script to start both frontend and backend together

echo "Starting Z+ Application..."

# Navigate to backend directory
cd "Z plus"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies if needed
if [ ! -f "venv/.installed" ]; then
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
    touch venv/.installed
fi

# Build React app
echo "Building React app..."
cd "../Z+ Website UI Design (1)"

# Install npm dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi

# Build the React app
npm run build

# Return to backend directory
cd "../Z plus"

# Run Django server
echo ""
echo "=========================================="
echo "Starting Django server..."
echo "Access the application at: http://localhost:8000"
echo "=========================================="
echo ""

python manage.py runserver

