#!/bin/bash
cd "$(dirname "$0")"

echo "Starting Meshtastic Web Dev Environment..."

# Запуск backend
cd backend
source .venv/bin/activate
python main.py &
BACKEND_PID=$!
cd ..

sleep 2

# Запуск frontend
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
