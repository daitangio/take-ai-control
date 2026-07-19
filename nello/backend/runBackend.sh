#!/bin/sh
set -ex
echo Dev mode
# We archive old logs to be sure we do not have strange mixes
if [ -f be.log ]; then
    archived_log=be-$(date +%Y-%m-%d).log
    echo "==== Restart at $(date)" >>$archived_log
    cat be.log >>$archived_log
fi
.venv/bin/uvicorn src.main:app --port 6502 --reload 2>&1 | tee be.log