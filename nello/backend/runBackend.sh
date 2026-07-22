#!/bin/sh
set -e
echo Dev mode
if [ ! -f nello.db ]; then
    echo Creating demo data
    sqlite3 -batch -init demo-data.sql nello.db '.quit'
fi
# We archive old logs to be sure we do not have strange mixes
if [ -f be.log ]; then
    archived_log=be-$(date +%Y-%m-%d).log
    echo "==== Restart at $(date)" >>$archived_log
    cat be.log >>$archived_log
fi
set -x
# Go to nello root
../../.venv/bin/uvicorn src.main:app --port 6502 --reload 2>&1 | tee be.log