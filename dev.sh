#!/bin/bash
echo "Starting Meshtastic Web Dev Environment..."

# Запуск backend в фоне
cd backend
source .venv/bin/activate
python main.py &
BACKEND_PID=$!
cd ..

# Небольшая пауза
sleep 2

# Запуск frontend в фоне
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "Backend: http://localhost:8000 (PID: $BACKEND_PID)"
echo "Frontend: http://localhost:5173 (PID: $FRONTEND_PID)"
echo ""
echo "Press Ctrl+C to stop both servers"

# Ловим Ctrl+C и убиваем оба процесса
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

# Ждём
wait
