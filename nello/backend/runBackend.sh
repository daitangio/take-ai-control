#!/bin/sh
set -ex
echo Dev mode
.venv/bin/uvicorn src.main:app --port 6502 --reload 2>&1 | tee be.log