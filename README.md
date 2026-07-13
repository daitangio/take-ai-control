# Take AI Control Back ⇐
This repository is a template to govern your AI chats with more grip than usual.
It leverages [PI.dev] coding agent and an aggressive isolation done with Docker + VS Code (Works on Linux and MacOS)

Folder Structure:

    .
    |-- .devcontainer            <- Visual studio code dev container
    |-- bin/runInContainer.sh    <- Zero lockin launcher for running outside vscode
    ├── LICENSE
    ├── README.md    
    ├── etc                      <- scripts used to setup your environment
    └── var                      <- Contains configuration not meant to be versioned
        ├── pi-agent             <- Contains pi.dev configuration
        │   └── models.json      <- Models to be configured
        └── pi-sessions          <- Contains pi.dev session


Basic principles:

- Isolated Dev container for stronger security
- pi.dev installation retain sessions and config inside the var directory
- Minimalistic setup + non root user
- As bonus, claude code and copilot installation sharing the home (and potentially the auth of both)
  Claude code is only tested with deepseek integration (see deep seek manual, use env variable in your devcontainer.env)

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

## Demo project

This repository already contains version 1.0.1 of AWS AI-SDLC

Start any software development project by stating your intent starting with the phrase "Using AI-DLC, ..." in the chat

1) AI-DLC workflow automatically activates and guides you from there
2) Answer structured questions that AI-DLC asks you
3) Carefully review every plan that AI generates. Provide your oversight and validation
4) Review the execution plan to see which stages will run
5) Carefully review the artifacts and approve each stage to maintain control
6) All the artifacts will be generated in the aidlc-docs/ directory

A section called "demo" is used to proof this setup.

- Some demo/*

[PI.dev]: https://pi.dev
[SUBAGENTS]: doc/SUBAGENTS.md