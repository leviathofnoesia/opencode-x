---
description: Switch agent models with intelligent presets
---

<command-instruction>
Use the model_switcher tool to manage agent configurations.

Parse user input:
- No arguments: Show interactive menu
- One argument (agent name): Show model selection for that agent
- Two arguments (agent name, model): Direct model assignment
  Example: /models Kraken claude-opus-4-5
- "preset <name>": Apply preset
  Example: /models preset performance
- "create-preset <name>": Save current config as preset
  Example: /models create-preset my-workflow
- "history": Show configuration history
- "status": Show all agent models

Supported agents: Kraken, Maelstrom, Nautilus, Abyssal, Coral, Siren, Leviathan, Poseidon, Scylla, Pearl
</command-instruction>
