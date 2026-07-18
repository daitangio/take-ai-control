ARG NODE_BASE_IMAGE="node:24-slim@sha256:53c0a90ba2b3b390c30ebc07cdf29d460efafb0edc685c6e7c0f25a5b9ba3a5f"
ARG PYTHON_BASE_IMAGE="python:3.14-trixie"


FROM ${NODE_BASE_IMAGE} AS node-donor

FROM ${PYTHON_BASE_IMAGE}
# ARGS MUST BE DELCARED AFTER FROM!
ARG TAKE_PROJECT_NAME
ARG DEV_UID=501
ARG DEV_GID=20
ARG PI_CODING_AGENT_VERSION=0.80.7
ARG CLAUDE_CODE_VERSION=2.1.210
ARG COPILOT_VERSION=1.0.70
ARG OPEN_SPEC_VERSION=1.6.0
RUN pip install --upgrade pip

# Ensure basic pi.dev is installed
RUN apt update && apt install -y git curl xz-utils sudo

ENV DEV_UID=${DEV_UID}
ENV DEV_GID=${DEV_GID}

# Create non-root user
RUN if ! getent group "${DEV_GID}" >/dev/null; then groupadd --gid "${DEV_GID}" devcontainer; fi \
    && useradd --shell /bin/bash --uid "${DEV_UID}" --gid "${DEV_GID}" -m devcontainer \
    && echo "devcontainer ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/devcontainer \
    && chmod 0440 /etc/sudoers.d/devcontainer

# Install Node.js from official image (multi-stage, arch-independent)
COPY --from=node-donor /usr/local/bin/node /usr/local/bin/node
COPY --from=node-donor /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -sf /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx
RUN npm install -g --ignore-scripts "@earendil-works/pi-coding-agent@${PI_CODING_AGENT_VERSION}"

# Install the RTK command to reduce token usage (install system-wide)
COPY ./etc/rtk-installer.sh /tmp/
ENV RTK_INSTALL_DIR="/usr/local/bin"
ENV RTK_VERSION="v0.43.0"
RUN /tmp/rtk-installer.sh

# NOTE: claude-code and copilot require postinstall scripts to download
# platform-specific native binaries. --ignore-scripts would break them.
RUN npm install -g "@anthropic-ai/claude-code@${CLAUDE_CODE_VERSION}"
RUN npm install -g "@github/copilot@${COPILOT_VERSION}"

# Addons for skills
COPY ./.agents/skills/convert-with-markitdown/requirements.txt /tmp/markitdown-requirements.txt
RUN pip install -r /tmp/markitdown-requirements.txt

# Open spec 
ENV OPENSPEC_TELEMETRY=0
RUN npm install -g @fission-ai/openspec@${OPEN_SPEC_VERSION}

# Switch to non-root user
USER devcontainer

# Important to avoid malfunction: define the DEEPSEEK_API_KEY
# API Key is provided by https://platform.deepseek.com/
ENV PI_TELEMETRY=no
# PI_CODING_AGENT_DIR	Override config directory; default is ~/.pi/agent
ENV PI_CODING_AGENT_DIR=/workspaces/${TAKE_PROJECT_NAME}/var/pi-agent
# Ensure Sessions are not lost and keep them in a separate directory instead of under pi-agent
ENV PI_CODING_AGENT_SESSION_DIR=/workspaces/${TAKE_PROJECT_NAME}/var/pi-sessions/



