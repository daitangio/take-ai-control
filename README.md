# Take AI Control Back ⇐
This repository is a template to govern your AI chats with more grip than usual.
It leverages [PI.dev] coding agent and an aggressive isolation done with Docker + VS Code (Works on Linux and MacOS)

Folder Structure:

    .
    |-- .devcontainer            <- Visual studio code dev container
    |-- bin/runInContainer.sh    <- Zero-lock-in launcher for running outside vscode
    ├── .agents/skill            <- Basic Skills with compatibility between codex, claude and copilot
    ├── README.md    
    ├── etc                      <- scripts used to setup your environment
    └── var                      <- Contains configuration not meant to be versioned
        ├── pi-agent             <- Contains pi.dev configuration
        │   └── models.json      <- Models to be configured
        └── pi-sessions          <- Contains pi.dev session


Basic principles:

- Isolated Dev container for stronger security
- Minimalistic setup + non root user
- Agents skills can be used on every major harnesses (codex, claude, copilot, [pi.dev])
- [pi.dev] installation retain sessions and config inside the var directory
- As bonus, claude code and copilot installation sharing the home (and potentially the auth of both)
  - Claude code is only tested with deepseek integration (see deep seek manual, use env variable in your devcontainer.env)
- 

## Getting started

- Clone or fork this project and use as template
- Define a .devcontainer/devcontainer.env with all your API keys (i.e. DeepSeek, Claude etc) if you have already
  This file is common to all the containerized approaches
- Three options:     
    - run Visual Studio Code DevContainer mode. If so:
        - Review .devcontainer/devcontainer.json
    - run ./bin/runInContainer.sh to get a throwaway container on the command line
      If you do not have claude code installed, use this method to ensure some empty folder are created
    - Use without container (but please avoid [pi.dev] in this scenario)

### Using pi.dev
Pi.dev is fantastic because it never will ask for command confirmation: but it is also a risk.

Once you have your terminal, install your Pi.dev's preferred extensions (you need to do this just once):
For instance try
```bash
    pi install git:github.com/jonjonrankin/pi-caveman
    pi install npm:pi-subagents
```
The extensions will be stored in the var/pi-agent subdirectory (see above).
After that, you can use [pi.dev] as you wish.
Our suggestion is to get accustomed to pi.dev with a short session, then you can look forward on the chapter included in the doc directory  like [SUBAGENTS] (this part is a Work in progress WIP).

## Provided Skills [WIP]

A compact and curated list of skills is provided.
Main goal is to readuce tokens:
- AGENTS.md provide usage of rtk tool
- Under .agents (symlinked to .claude for ClaudeCode) a mark-it-down converter is provided, to convert documents in a more compact and mangeable form.



## Template projects [WIP]

Also, this project has some ad hoc variants under the feature/ branches including:

- feature/ai-sdlc-{copilot,pi,claude}
    Based on https://github.com/awslabs/aidlc-workflows#github-copilot
    These variants provide true simple AI-SDLC workflow without the need of Kiro
- feature/java for JAVA setup

## Demo project: nello

A trello-based replacement using [OpenSpec] with claude code and pi

Basic workflow:

    proposal ──► specs ──► design ──► tasks ──► implement
    ▲           ▲          ▲                    │
    └───────────┴──────────┴────────────────────┘
                update as you learn

### Dev commands (nello/frontend)

```bash
cd nello/frontend
npm install        # install dependencies
npm run dev        # start Vite dev server
npm run build      # typecheck + production build
npm test           # run Vitest test suite
```



[PI.dev]: https://pi.dev
[SUBAGENTS]: doc/SUBAGENTS.md
[OpenSpec]: https://github.com/Fission-AI/OpenSpec