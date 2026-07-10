# How to use subagents and be in the LOOP (WIP)

## Installation and tuning

Install the relevant extension with

    pi install npm:pi-subagents 

Configure inside [settings.json](../var/pi-agent/settings.json) your model overrides, for instance:

```json
{
  "lastChangelogVersion": "0.80.3",  
  ...
  "subagents": {
    "agentOverrides": {
      "scout": {
        "model": "github-copilot/haiku-4.5",
        "thinking": "low",
        "fallbackModels": ["github-copilot/gpt-5-mini"]
      }
    }
  }
  ...
}
```

Run /subagents-model to take a look at subagents model.
Built-in models are enough for basic workflows, and we suggest to avoid defining too many agents.
Take a look at the default agents of this plugin at https://github.com/nicobailon/pi-subagents/tree/main/agents

Agents are activated by natural language, below two basic examples

    When you finish implementing, run a reviewer subagent before summarizing.

    Run a review loop on this change until reviewers stop finding fixes worth doing, with a max of 3 rounds.


Recommended orchestration pattern by the author of the plugin is

    clarify → planner → worker → fresh reviewers → worker


For more information see https://github.com/nicobailon/pi-subagents


## AI-SLDC

https://aws.amazon.com/blogs/devops/ai-driven-development-life-cycle/