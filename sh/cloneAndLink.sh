set -eu

usage() {
    cat <<'EOF'
Usage: $0 DIRECTORY

Create a submodule of the take-ai-control-back on DIRECTORY and ensure it works

EOF
}

if [ "$#" -eq 0 ] || [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
    usage
    exit 0
fi

SCRIPT_DIR=$(CDPATH= cd "$(dirname "$0")" && pwd)
TARGET_DIR=$(CDPATH= cd "$1" && pwd)
mkdir -p $TARGET_DIR/sh
cd $TARGET_DIR
if [ ! -d .git ]; then
    git init
fi
echo ==== 
[ ! -d taic ] && git submodule add https://github.com/daitangio/take-ai-control.git taic
git submodule init
# See https://stackoverflow.com/a/21195182
git submodule update --remote --merge
git submodule foreach git log -1 --decorate

cp $SCRIPT_DIR/runInContainer.sh $TARGET_DIR/sh/
cd $TARGET_DIR 
echo Running  $TARGET_DIR/sh/runInContainer.sh to build the image
./sh/runInContainer.sh --build-only | tail -10
[ ! -d .devcontainer ] && mkdir .devcontainer
[ ! -f .devcontainer/devcontainer.env ] && touch .devcontainer/devcontainer.env
echo Remember to customize/review .devcontainer/devcontainer.env
