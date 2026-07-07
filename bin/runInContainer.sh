#!/bin/sh
docker build -t $(basename $PWD):latest --build-arg TAKE_PROJECT_NAME=$(basename $PWD) .
WORKSPACE=/workspaces/$(basename $PWD)
set -v
# /home/devocontainer
docker run -ti --rm -v $PWD:${WORKSPACE}  \
    -v $HOME/.copilot:/home/devcontainer/.copilot \
    -v $HOME/.copilot-metrics:/home/devcontainer/.copilot-metrics \
    --workdir $WORKSPACE \
    --env-file .devcontainer/devcontainer.env \
    $(basename $PWD):latest bash