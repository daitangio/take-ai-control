#!/usr/bin/env sh
set -eu

BASE_URL="${BASE_URL:-http://127.0.0.1:6502}"
PATH_TO_HIT="${PATH_TO_HIT:-/api/health}"
TOTAL="${TOTAL:-500}"
CONCURRENCY="${CONCURRENCY:-25}"

i=0
while [ "$i" -lt "$TOTAL" ]; do
  (
    code="$(curl -s -o /dev/null -w '%{http_code}' "${BASE_URL}${PATH_TO_HIT}")"
    printf '%s\n' "$code"
  ) &
  i=$((i + 1))

  if [ $((i % CONCURRENCY)) -eq 0 ]; then
    wait
  fi
done

wait
