# Take AI Control Back ⇐
This repository is a template to govern your AI chats with more grip than usual.
We propose a tailored AGENTS.md and an optional ready-to-use container for proper isolation.
A set of demo/* branches show real application developed with AI.

Project leverages [PI.dev] coding agent and an aggressive isolation done with Docker + VS Code

Tested on Linux and MacOS

Folder Structure:

    .
    |-- .devcontainer            <- Visual studio code dev container
    |-- bin/runInContainer.sh    <- Zero-lock-in launcher for running outside vscode
    ├── .agents/skill            <- Basic Skills with compatibility between codex, claude and copilot
    ├── README.md    
    ├── etc                      <- scripts used by Docker to setup your environment
    └── var                      <- Contains configuration not meant to be versioned
        ├── pi-agent             <- Contains pi.dev configuration
        │   └── models.json      <- Models to be configured
        └── pi-sessions          <- Contains pi.dev session


Basic principles:

- Liquid Models: ability to switch between models and model providers. 
  Easier to do with pi.dev. See also [liquid-models.md](./doc/liquid-models.md)
- [A set of basic skills](#provided-skills) 
- Isolated Dev container for stronger security
- Experimental SDLC feature/* branches (see below) 

## Liquid Models
- Agents skills can be used on every major harnesses (codex, claude, copilot, [pi.dev])
- [pi.dev] installation retain sessions and config inside the var directory
- Tested on copilot, codex and cloude.
  Currently Claude code is only tested with DeepSeek integration (see deep seek manual, use env variable in your devcontainer.env)

## SDLC

AI development increase so much the speed you need to change the way you develop.
In particular you need some directive to
- avoid the human to be the bottleneck
- something to track modification and work in teams.
There are a lot of tools, and we are testing them.

- demo/nello-openspec

    A trello clone based on [OpenSpec]
    OpenSpec 
    Pro: collect specification, light and fast and create a Soure-of-truth spedification.
    Contra: (none found yet)

- feature/ai-sdlc-{copilot,pi,claude}

    Based on https://github.com/awslabs/aidlc-workflows#github-copilot
    These variants provide true simple AI-SDLC workflow without the need of Kiro
    Pro: very clear in proposition and pros/cons
    Contra: very slow, do not seems very effective if you do not have deep pocket (token cost is a high).
    


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

## Provided Skills

A compact and curated list of skills are provided.
Main goal is to readuce tokens:

- AGENTS.md provide usage of rtk tool. 
  CLAUDE.md is symlinked to it as good practice to share it
- Under .agents (symlinked to .claude for ClaudeCode) a mark-it-down converter is provided, to convert documents in a more compact and mangeable form.



[PI.dev]: https://pi.dev
[SUBAGENTS]: doc/SUBAGENTS.md
[OpenSpec]: https://github.com/Fission-AI/OpenSpec
[Spec-Kit]: https://github.com/github/spec-kit
[About sdlc article1]: https://ranthebuilder.cloud/blog/i-tested-three-spec-driven-ai-tools-here-s-my-honest-take/