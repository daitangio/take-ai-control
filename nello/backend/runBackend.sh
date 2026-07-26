#!/bin/sh
set -e
echo "Dev mode (Node.js/Fastify)"
if [ ! -f nello.db ]; then
    echo "Creating demo data"
    sqlite3 -batch -init db-init/00-demo-data.sql nello.db '.quit'
    # sqlite3 -batch -init db-init/90-demo-board.sql nello.db '.quit'
fi
# Archive old logs
if [ -f be.log ]; then
    archived_log="be-$(date +%Y-%m-%d).log"
    echo "==== Restart at $(date)" >>"$archived_log"
    cat be.log >>"$archived_log"
fi
set -x
npx tsx --watch src/index.ts 2>&1 | tee be.log
