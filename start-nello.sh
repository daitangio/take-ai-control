#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="$ROOT/nello-backend.log"

echo "Starting nello backend (logs → $LOG_FILE) ..."
cd "$ROOT/apps/tbe"
./mvnw -q spring-boot:run 2>&1 | tee "$LOG_FILE" &
BACKEND_PID=$!

echo "Backend PID: $BACKEND_PID  "
echo "Starting nello frontend ..."
cd "$ROOT/apps/nello-frontend"
npm run dev &

trap "echo 'Stopping...' $BACKEND_PID ; kill -9 $BACKEND_PID 2>/dev/null; exit 0" INT TERM

wait $BACKEND_PID
