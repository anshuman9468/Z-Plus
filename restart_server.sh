#!/bin/bash
# Script to restart the Django server

echo "🔄 Restarting Z+ Application Server..."
echo ""

# Navigate to script directory
cd "$(dirname "$0")"

# Stop the server first
echo "1️⃣  Stopping server..."
./stop_server.sh

# Wait a moment for port to be released
sleep 2

# Start the server
echo ""
echo "2️⃣  Starting server..."
./start_server.sh

