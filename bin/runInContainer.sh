#!/bin/sh
set -e
PROJECT="$(basename "$PWD")"
docker build -t "${PROJECT}:latest" --build-arg "TAKE_PROJECT_NAME=${PROJECT}" .
WORKSPACE="/workspaces/${PROJECT}"
set -v
# mount .claude/   +  .claude.json 
if [ ! -d $HOME/.claude ]; then
    # Ensure exists yo avoid messing up 
    mkdir $HOME/.claude
    touch $HOME/.claude.json
fi
docker run -ti --rm -v "$PWD":"${WORKSPACE}" \
    -v "$HOME/.copilot:/home/devcontainer/.copilot" \
    -v "$HOME/.copilot-metrics:/home/devcontainer/.copilot-metrics" \
    -v "$HOME/.claude:/home/devcontainer/.claude" \
    -v "$HOME/.claude.json:/home/devcontainer/.claude.json" \
    --workdir "${WORKSPACE}" \
    --env-file .devcontainer/devcontainer.env \
    "${PROJECT}:latest" bash