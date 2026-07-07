# Take AI Control Back

This repository is a template to govern your AI chats with more grip than usual.
It leverage on [PI.dev] coding agent and on an aggressive isolation done with Docker + VS Code

Folder Structure:

    .
    |-- .devcontainer            <- Visual studio code dev contaienr python+node setup
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
- As bonus, claude code and copilot installation

## Getting started

- Clone or fork this project. 
- Review .devcontaier/devcontainer.json
- Define a devcontainer.env with all your API keys (i.e. DeepSeek, Claude etc)
- Two options: 
    - run Visual Studio Code DevContainer mode.
    - run ./bin/runInContainer.shn to get a throwaway container
- Once you have your terminal, install your Pi.dev's preferred extensions (you need to do this just once):

    ```bash 
       pi install npm:mitsupi
       pi install git:github.com/jonjonrankin/pi-caveman
    ```

The extensions will be stored in the var/pi-agent subdirectory (see above)

- After that, you can use [pi.dev] as you wish.



[PI.dev]: https://pi.dev