# Take AI Control Back

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
- As bonus, claude code and copilot installation. 
  Currently copilot auth is shared
  Claude code is only tested with deepseek integration

## Getting started

- Clone or fork this project and use as template
- Review .devcontainer/devcontainer.json
- Define a devcontainer.env with all your API keys (i.e. DeepSeek, Claude etc) if you have already
- Two options: 
    - run Visual Studio Code DevContainer mode.
    - run ./bin/runInContainer.sh to get a throwaway container on the command line
- Once you have your terminal, install your Pi.dev's preferred extensions (you need to do this just once):
  For instance try
    ```bash
       pi install git:github.com/jonjonrankin/pi-caveman
       pi install npm:pi-subagents
    ```

The extensions will be stored in the var/pi-agent subdirectory (see above)

After that, you can use [pi.dev] as you wish.
Our suggestion is to get accustomed to pi.dev with a short session, then you can look forward on the chapter included in the doc directory  like [SUBAGENTS] (this part is a Work in progress WIP).



## Template projects [WIP]

Also, this project has some ad hoc variants under the feature/ branches including:

- feature/java for JAVA setup
- feature/ai-sdlc-copilot
    Based on https://github.com/awslabs/aidlc-workflows#github-copilot





[PI.dev]: https://pi.dev
[SUBAGENTS]: doc/SUBAGENTS.md