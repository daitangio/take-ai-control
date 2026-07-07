## Work In Progress Log

- 2026-07-05: First setup of the Take-AI-Control-Back repository (GG)
- 2026-07-07: Security fix — container no longer runs as root. Added `devcontainer` user (uid 1000), moved installs to system paths, enabled `remoteUser` in devcontainer.json. User has passwordless sudo for when root is needed. (Copilot CLI / Opus 4.6)
- 2026-07-07: Node.js install simplified via multi-stage build (`COPY --from=node:22-slim`). Removes manual curl/tar/arch logic entirely. (Copilot CLI / Opus 4.6)
- 2026-07-07: Added runInContainer.sh (GG)
- 2026-07-07: Upgraded Node.js donor stage from node:22-slim to node:24-slim in Dockerfile. Single line change, no other modifications. (claude-sonnet-4-5)