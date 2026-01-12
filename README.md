# OpenCode-X

> Sea-Themed AI Agent Harness with TASK_PATH Workflow Engine

<div align="center">

[![GitHub Release](https://img.shields.io/github/v/release/leviathofnoesia/opencode-x?color=0066cc&labelColor=black&logo=github&style=flat-square)](https://github.com/leviathofnoesia/opencode-x/releases)
[![License](https://img.shields.io/badge/license-MIT-white?labelColor=black&style=flat-square)](https://github.com/leviathofnoesia/opencode-x/blob/master/LICENSE)

A fork of oh-my-opencode with sea-themed agents and workflow automation.

</div>

## Sea-Themed Agents

OpenCode-X features a team of specialized sea creatures:

| Agent | Role | Model |
|-------|------|-------|
| **Kraken** | Primary coding orchestrator | Claude Opus 4.5 |
| **Maelstrom** | High-IQ reasoning consultant | GPT 5.2 |
| **Abyssal** | External docs & research | GLM 4.7 Free |
| **Nautilus** | Codebase exploration | Grok Code |
| **Coral** | Frontend UI/UX specialist | Gemini 3 Pro |
| **Siren** | Documentation writer | Gemini 3 Flash |
| **Leviathan** | System architect | Claude Opus 4.5 |
| **Poseidon** | Pre-planning consultant | Claude Opus 4.5 |
| **Scylla** | Plan reviewer | GPT 5.2 |

## Features

- **Multi-Model Orchestration**: Mix and match models by purpose
- **TASK_PATH Workflow Engine**: Markdown-based workflow definitions
- **Git Integration**: Built-in git tool for version control
- **State Persistence**: Resume workflows from `.opencode-x/state.json`
- **Background Agents**: Parallel execution for maximum throughput
- **Full LSP/AST Support**: Refactor with precision using ast-grep
- **Claude Code Compatibility**: Commands, Agents, Skills, MCP, Hooks

## Installation

```bash
# Clone the repository
git clone https://github.com/leviathofnoesia/opencode-x.git
cd opencode-x

# Install dependencies
bun install

# Build
bun run build
```

## Quick Start

1. Configure your models in `opencode.json`
2. Install OpenCode CLI
3. Run the installer: `bun run install`
4. Configure authentication (Anthropic, OpenAI, or Google Gemini)

## TASK_PATH Workflow Engine

Define workflows in markdown:

```markdown
# Workflow: Feature Development

## Tasks
- [ ] Research existing patterns
- [ ] Implement core functionality
- [ ] Add tests
- [ ] Update documentation

## Metadata
agent: Kraken
priority: high
```

Execute with the TASK_PATH tool:

```typescript
{
  operation: "execute",
  workflowPath: ".task-path/workflow.md"
}
```

## Git Tool Usage

```typescript
// Check status
{ operation: "status" }

// Stage and commit
{ 
  operation: "commit",
  message: "feat: Add new feature",
  all: true
}

// Create branch
{
  operation: "branch",
  create: "feature/new-feature"
}
```

## State Persistence

OpenCode-X maintains state in `.opencode-x/state.json`:

```json
{
  "version": "1.0.0",
  "activeWorkflow": {
    "workflowId": "wf-123",
    "currentTaskId": "task-456"
  },
  "workflows": {},
  "sessions": {}
}
```

## Project Structure

```
opencode-x/
├── src/
│   ├── agents/
│   │   └── sea-themed/     # 9 sea-themed agent factories
│   ├── tools/
│   │   ├── git/            # Git version control tool
│   │   └── task-path/      # TASK_PATH workflow engine
│   ├── features/
│   │   └── opencode-x-state/  # State persistence
│   └── config/
│       └── schema.ts       # Configuration schema
└── opencode.json           # Plugin configuration
```

## Configuration

Create `opencode.json` to customize:

```json
{
  "model": "anthropic/claude-opus-4-5",
  "agents": {
    "Kraken": {
      "model": "anthropic/claude-opus-4-5"
    },
    "Maelstrom": {
      "model": "openai/gpt-5.2"
    }
  },
  "categories": {
    "visual": {
      "model": "google/gemini-3-pro-preview"
    }
  }
}
```

## License

MIT License - See [LICENSE](LICENSE) for details.

## Repository

[https://github.com/leviathofnoesia/opencode-x](https://github.com/leviathofnoesia/opencode-x)
