#!/bin/sh
set -e
PROJECT="$(basename "$PWD")"
DEV_UID="$(id -u)"
DEV_GID="$(id -g)"
docker build -t "${PROJECT}:latest" \
    --build-arg "TAKE_PROJECT_NAME=${PROJECT}" \
    --build-arg "DEV_UID=${DEV_UID}" \
    --build-arg "DEV_GID=${DEV_GID}" \
    .
WORKSPACE="/workspaces/${PROJECT}"
set -v
# mount .claude/   +  .claude.json 
if [ ! -d "$HOME/.claude" ]; then
    # Ensure exists yo avoid messing up 
    mkdir -p "$HOME/.claude"
    touch "$HOME/.claude.json"
fi
docker run -ti --rm -v "$PWD":"${WORKSPACE}" \
    -v "$HOME/.copilot:/home/devcontainer/.copilot" \
    -v "$HOME/.copilot-metrics:/home/devcontainer/.copilot-metrics" \
    -v "$HOME/.claude:/home/devcontainer/.claude" \
    -v "$HOME/.claude.json:/home/devcontainer/.claude.json" \
    --workdir "${WORKSPACE}" \
    --env-file .devcontainer/devcontainer.env \
    "${PROJECT}:latest" bash