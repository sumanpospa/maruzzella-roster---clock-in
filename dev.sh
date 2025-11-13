#!/bin/bash
# Quick start script for local development (macOS/Linux)

echo "🚀 Starting Maruzzella Roster & Clock-In..."

# Start backend in background
echo "📦 Starting backend on port 4000..."
cd server
node index.js &
BACKEND_PID=$!

# Give backend time to start
sleep 2

# Start frontend
echo "🎨 Starting frontend on port 3000..."
cd ..
node ./node_modules/vite/bin/vite.js --port 3000

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT
