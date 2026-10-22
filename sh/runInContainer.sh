#!/bin/sh
set -e
SCRIPT_DIR=$(CDPATH= cd "$(dirname "$0")" && pwd)
cd $SCRIPT_DIR/..

PROJECT="$(basename "$PWD")"
DEV_UID="$(id -u)"
DEV_GID="$(id -g)"



buildImage(){
    pwd
    set -x
    docker build -t "${PROJECT}:latest" \
        --build-arg "TAKE_PROJECT_NAME=${PROJECT}" \
        --build-arg "DEV_UID=${DEV_UID}" \
        --build-arg "DEV_GID=${DEV_GID}" \
        .
    set +x
}


if [ -f taic/Dockerfile ]; then
    echo Building using taic submodule mode
    ( cd taic; buildImage)
else
    buildImage
fi

if [ "$1" == "--build-only" ]; then
    echo Built and stopped
    exit 0
fi




WORKSPACE="/workspaces/${PROJECT}"
set -v
# mount .claude/   +  .claude.json 
if [ ! -d "$HOME/.claude" ]; then
    # Ensure exists yo avoid messing up 
    mkdir -p "$HOME/.claude"
    touch "$HOME/.claude.json"
fi

set -x
docker run -ti --rm -v "$PWD":"${WORKSPACE}" \
    -v "$HOME/.copilot:/home/devcontainer/.copilot" \
    -v "$HOME/.copilot-metrics:/home/devcontainer/.copilot-metrics" \
    -v "$HOME/.claude:/home/devcontainer/.claude" \
    -v "$HOME/.claude.json:/home/devcontainer/.claude.json" \
    -v "$HOME/.codex:/home/devcontainer/.codex" \
    -v "$HOME/.vibe:/home/devcontainer/.vibe" \
    --workdir "${WORKSPACE}" \
    --env-file .devcontainer/devcontainer.env \
    "${PROJECT}:latest" bash