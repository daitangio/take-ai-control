#!/bin/sh
set -e
PROJECT="$(basename "$PWD")"
docker build -t "${PROJECT}:latest" --build-arg "TAKE_PROJECT_NAME=${PROJECT}" .
WORKSPACE="/workspaces/${PROJECT}"
set -v
docker run -ti --rm -v "$PWD":"${WORKSPACE}" \
    -v "$HOME/.copilot:/home/devcontainer/.copilot" \
    -v "$HOME/.copilot-metrics:/home/devcontainer/.copilot-metrics" \
    --workdir "${WORKSPACE}" \
    --env-file .devcontainer/devcontainer.env \
    "${PROJECT}:latest" bash