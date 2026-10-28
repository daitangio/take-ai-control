#!/bin/sh
set -eu

usage() {
    cat <<'EOF'
Usage: cloneMe.sh DIRECTORY

Copy the Take AI Control container bootstrap files into an existing DIRECTORY.
The destination must not already contain bootstrap files; an existing
.devcontainer/devcontainer.env is kept so API keys are never replaced.
EOF
}

if [ "$#" -eq 0 ] || [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
    usage
    exit 0
fi

if [ "$#" -ne 1 ] || [ ! -d "$1" ]; then
    usage >&2
    exit 1
fi

SCRIPT_DIR=$(CDPATH= cd "$(dirname "$0")" && pwd)
SOURCE_DIR=$(CDPATH= cd "$SCRIPT_DIR/.." && pwd)
TARGET_DIR=$(CDPATH= cd "$1" && pwd)

if [ "$SOURCE_DIR" = "$TARGET_DIR" ]; then
    echo "Refusing to copy the bootstrap files onto themselves." >&2
    exit 1
fi

for path in Dockerfile AGENTS.md .dockerignore etc .agents sh/runInContainer.sh \
    .devcontainer/devcontainer.json .devcontainer/devcontainer-lock.json; do
    if [ -e "$TARGET_DIR/$path" ]; then
        echo "Destination already contains $path; nothing was copied." >&2
        exit 1
    fi
done

cp "$SOURCE_DIR/Dockerfile" "$SOURCE_DIR/AGENTS.md" "$SOURCE_DIR/.dockerignore" "$TARGET_DIR/"
cp -R "$SOURCE_DIR/etc" "$SOURCE_DIR/.agents" "$TARGET_DIR/"
mkdir -p "$TARGET_DIR/sh" "$TARGET_DIR/.devcontainer"
cp "$SOURCE_DIR/sh/runInContainer.sh" "$TARGET_DIR/sh/"
cp "$SOURCE_DIR/.devcontainer/devcontainer.json" \
    "$SOURCE_DIR/.devcontainer/devcontainer-lock.json" "$TARGET_DIR/.devcontainer/"

if [ ! -e "$TARGET_DIR/.devcontainer/devcontainer.env" ]; then
    : > "$TARGET_DIR/.devcontainer/devcontainer.env"
    echo "Created .devcontainer/devcontainer.env; fill it with the required API keys."
else
    echo "Kept existing .devcontainer/devcontainer.env."
fi

echo "Container bootstrap copied to $TARGET_DIR"
