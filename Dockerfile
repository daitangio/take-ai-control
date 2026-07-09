FROM node:24-slim AS node-donor

FROM python:3.14-slim-trixie
ARG TAKE_PROJECT_NAME

RUN pip install --upgrade pip

# Ensure basic pi.dev is installed
RUN apt update && apt install -y git curl xz-utils sudo jq

# Create non-root user
RUN groupadd --gid 1000 devcontainer \
    && useradd --shell /bin/bash --uid 501 --gid 1000 -m devcontainer \
    && echo "devcontainer ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/devcontainer \
    && chmod 0440 /etc/sudoers.d/devcontainer

# Install Node.js from official image (multi-stage, arch-independent)
COPY --from=node-donor /usr/local/bin/node /usr/local/bin/node
COPY --from=node-donor /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -sf /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx
RUN npm install -g --ignore-scripts @earendil-works/pi-coding-agent

# Install the RTK command to reduce token usage (install system-wide)
COPY ./etc/rtk-installer.sh /tmp/
ENV RTK_INSTALL_DIR="/usr/local/bin"
ENV RTK_VERSION="v0.43.0"
RUN /tmp/rtk-installer.sh

# NOTE: claude-code and copilot require postinstall scripts to download
# platform-specific native binaries. --ignore-scripts would break them.
RUN npm install -g @anthropic-ai/claude-code
RUN npm install -g @github/copilot

# Switch to non-root user
USER devcontainer

# Important to avoid malfunction: define the DEEPSEEK_API_KEY
# API Key is provided by https://platform.deepseek.com/
ENV PI_TELEMETRY=no
# PI_CODING_AGENT_DIR	Override config directory; default is ~/.pi/agent
ENV PI_CODING_AGENT_DIR=/workspaces/${TAKE_PROJECT_NAME}/var/pi-agent
# Ensure Sessions are not lost and keep them in a separate directory instead of under pi-agent
ENV PI_CODING_AGENT_SESSION_DIR=/workspaces/${TAKE_PROJECT_NAME}/var/pi-sessions/



