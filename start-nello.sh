#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="$ROOT/nello-backend.log"

echo "Starting nello backend (logs → $LOG_FILE) ..."
cd "$ROOT/apps/tbe"
./mvnw -q spring-boot:run 2>&1 | tee "$LOG_FILE" &
BACKEND_PID=$!

echo "Starting nello frontend ..."
cd "$ROOT/apps/nello-frontend"
npm run dev &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID  |  Frontend PID: $FRONTEND_PID"
echo "Press Ctrl+C to stop both."

trap "echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM

wait $BACKEND_PID $FRONTEND_PID
