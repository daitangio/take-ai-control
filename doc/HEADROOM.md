
# Headroom install

Create a virtualenv and install headroom proxy:
    pip install "headroom-ai[proxy]"

Run headroom with the wrap:

    export HEADROOM_TELEMETRY=off
    set -x
    headroom wrap codex
