## Work In Progress Log

- 2026-07-05: First setup of the Take-AI-Control-Back repository (GG)
- 2026-07-07: Security fix — container no longer runs as root. Added `devcontainer` user (uid 1000), moved installs to system paths, enabled `remoteUser` in devcontainer.json. User has passwordless sudo for when root is needed. (Copilot CLI / Opus 4.6)
- 2026-07-07: Node.js install simplified via multi-stage build (`COPY --from=node:22-slim`). Removes manual curl/tar/arch logic entirely. (Copilot CLI / Opus 4.6)
- 2026-07-07: Added runInContainer.sh (GG)
- 2026-07-07: Upgraded Node.js donor stage from node:22-slim to node:24-slim in Dockerfile. Single line change, no other modifications. (claude-sonnet-4-5)
- 2026-07-08: Security review identified 7 issues: passwordless sudo, unquoted shell vars, host credential mounts, env file tracking, inconsistent --ignore-scripts, unpinned RTK version, auth.json in workspace. No critical vulnerabilities. (Kiro/Auto/Claude)
- 2026-07-08: Pinned RTK version to v0.43.0 in Dockerfile for reproducible builds. (Kiro/Auto/Claude)
- 2026-07-08: Investigated --ignore-scripts for claude-code and copilot: both require postinstall scripts to download platform-specific native binaries. Added comment documenting why the flag cannot be used. (Kiro/Auto/Claude)
- 2026-07-08: Fixed issue #3 (host credentials mounted read-write) — .copilot volumes now mounted :ro. Fixed issue #4 (env file tracking) — added explicit .devcontainer/devcontainer.env to .gitignore and .dockerignore. Also quoted all shell variables in runInContainer.sh. (Kiro/Auto/Claude)

- 2026-07-09: Added README sections documenting how to configure AWS Bedrock and DeepSeek as model providers in pi.dev, including API key generation steps and models.json examples. (Kiro/Auto)
