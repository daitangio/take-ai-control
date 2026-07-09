# Take AI Control Back

This repository is a template to govern your AI chats with more grip than usual.
It leverages on [PI.dev] coding agent and on an aggressive isolation done with Docker + VS Code

Folder Structure:

    .
    |-- .devcontainer            <- Visual studio code dev container python+node setup
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
- Review .devcontainer/devcontainer.json
- Define a devcontainer.env with all your API keys (i.e. DeepSeek, Claude etc)
- Two options: 
    - run Visual Studio Code DevContainer mode.
    - run ./bin/runInContainer.sh to get a throwaway container
- Once you have your terminal, install your Pi.dev's preferred extensions (you need to do this just once):

    ```bash 
       pi install npm:mitsupi
       pi install git:github.com/jonjonrankin/pi-caveman
       pi install npm:pi-codex-goal
    ```

The extensions will be stored in the var/pi-agent subdirectory (see above)

- After that, you can use [pi.dev] as you wish.



## Using AWS Bedrock as a Model Provider

Pi.dev supports AWS Bedrock via the `bedrock-converse-stream` API. This lets you use Claude, Llama, Mistral, and other models hosted on Bedrock directly from your terminal agent.

### Generate a Bedrock API Key

AWS Bedrock now offers simplified API key generation (available since July 2025):

1. Sign in to the [AWS Management Console](https://console.aws.amazon.com/bedrock)
2. Open the **Amazon Bedrock** console
3. Navigate to **API keys** in the left sidebar
4. Choose your key type:
   - **Short-term key** — expires when your console session expires (max 12 hours). Best for quick testing.
   - **Long-term key** — configurable expiration (or never-expire). Best for development environments.
5. Select the IAM policies to attach (at minimum, allow `bedrock:InvokeModel` and `bedrock:InvokeModelWithResponseStream`)
6. Copy the generated key

For reference see the [official docs](https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html).

> **Alternative (classic IAM):** Create an IAM user with Bedrock permissions, generate Access Key + Secret Key, and export them as `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_REGION`.

### Configure Bedrock in Pi.dev

Create or edit `~/.pi/agent/models.json` (or the project-local `.pi/agent/models.json`):

```json
{
  "providers": {
    "amazon-bedrock": {
      "api": "bedrock-converse-stream",
      "models": [
        { "id": "us.anthropic.claude-sonnet-4-20250514-v1:0" },
        { "id": "us.meta.llama4-maverick-17b-instruct-v1:0" }
      ]
    }
  }
}
```

Bedrock authenticates through the **AWS SDK default credential chain** (environment variables, `~/.aws/credentials`, or instance role). No `apiKey` field is needed in models.json — just make sure your environment has valid AWS credentials:

```bash
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_REGION="us-east-1"
```

Then switch model inside a pi session with `/model` or `Ctrl+L`.

---

## Using DeepSeek on Pi.dev

DeepSeek is a built-in provider in pi.dev. You only need an API key from [platform.deepseek.com](https://platform.deepseek.com/).

### Get your DeepSeek API Key

1. Create an account at https://platform.deepseek.com
2. Go to **API Keys** section
3. Generate a new key and copy it

### Configure DeepSeek in Pi.dev

Add it to your environment (e.g. in `devcontainer.env` or shell profile):

```bash
export DEEPSEEK_API_KEY="sk-..."
```

DeepSeek models are already registered in pi's built-in provider list. You can switch to DeepSeek mid-session with `/model` and select one of the available DeepSeek models (e.g. `deepseek-chat`, `deepseek-reasoner`).

If you want to explicitly declare models in your `models.json`:

```json
{
  "providers": {
    "deepseek": {
      "baseUrl": "https://api.deepseek.com",
      "apiKey": "env:DEEPSEEK_API_KEY",
      "api": "openai-completions",
      "models": [
        { "id": "deepseek-chat" },
        { "id": "deepseek-reasoner" }
      ]
    }
  }
}
```

> **Tip:** You can combine multiple providers in the same `models.json` and switch between them at will during a session.

[PI.dev]: https://pi.dev