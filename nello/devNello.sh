#!/bin/bash
set -e
(cd frontend ; npm run dev ) &
(cd backend ; ./runBackend.sh ) &

wait