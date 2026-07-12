#!/bin/sh
set -e
PROJECT="$(basename "$PWD")"
docker build -t "${PROJECT}:latest" --build-arg "TAKE_PROJECT_NAME=${PROJECT}" .
WORKSPACE="/workspaces/${PROJECT}"
set -v
# TODO: mount .claude/   +  .claude.json 
# from var/claude
docker run -ti --rm -v "$PWD":"${WORKSPACE}" \
    -v "$HOME/.copilot:/home/devcontainer/.copilot" \
    -v "$HOME/.copilot-metrics:/home/devcontainer/.copilot-metrics" \
    -v "$HOME/.claude:/home/devcontainer/.claude" \
    -v "$HOME/.claude.json:/home/devcontainer/.claude.json" \
    --workdir "${WORKSPACE}" \
    --env-file .devcontainer/devcontainer.env \
    "${PROJECT}:latest" bash