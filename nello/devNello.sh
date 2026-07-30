#!/bin/bash
set -e
cd $(dirname $0)
(cd backend ; ./runBackend.sh ) &
sleep 3
(cd frontend ; npm run dev ) &

wait