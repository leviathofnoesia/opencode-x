# AGENTS KNOWLEDGE BASE - OpenCode-X

## OVERVIEW

Sea-themed AI agent system for multi-model orchestration. 9 specialized agents named after sea creatures.

## STRUCTURE

```
agents/
├── sea-themed/           # Sea-themed agent implementations
│   ├── kraken.ts         # Primary orchestrator (main coding agent)
│   ├── maelstrom.ts      # Read-only consultation (high-IQ reasoning)
│   ├── abyssal.ts        # External docs & library research
│   ├── nautilus.ts       # Codebase search & exploration
│   ├── coral.ts          # Frontend UI/UX specialist
│   ├── siren.ts          # Documentation writer
│   ├── leviathan.ts      # System architect
│   ├── poseidon.ts       # Pre-planning consultant
│   ├── scylla.ts         # Plan reviewer
│   └── index.ts          # Barrel export
├── sisyphus.ts           # Legacy Sisyphus prompt (still available)
├── sisyphus-prompt-builder.ts  # Dynamic prompt sections
├── types.ts              # BuiltinAgentName, AgentPromptMetadata
├── utils.ts              # createBuiltinAgents() factory
└── index.ts              # builtinAgents export
```

## SEA-THEMED AGENTS

| Agent | Default Model | Purpose |
|-------|---------------|---------|
| **Kraken** | anthropic/claude-opus-4-5 | Primary orchestrator, writes production code |
| **Maelstrom** | openai/gpt-5.2 | Read-only consultation, high-IQ debugging, architecture |
| **Abyssal** | opencode/glm-4-7-free | External docs, OSS research, GitHub examples |
| **Nautilus** | opencode/grok-code | Fast contextual grep, codebase exploration |
| **Coral** | google/gemini-3-pro | UI/UX code generation |
| **Siren** | google/gemini-3-flash | Technical documentation writer |
| **Leviathan** | anthropic/claude-opus-4-5 | System architect, structural analysis |
| **Poseidon** | anthropic/claude-opus-4-5 | Pre-planning consultant, scope analysis |
| **Scylla** | openai/gpt-5.2 | Plan reviewer, quality assurance |

## DELEGATION STRATEGY

```
Kraken (Primary)
├── Visual/UI/UX → Coral
├── External Research → Abyssal
├── Codebase Search → Nautilus
├── Documentation → Siren
├── Complex Architecture → Maelstrom or Leviathan
└── Planning → Poseidon → Planner → Scylla (review)
```

## HOW TO ADD AN AGENT

1. Create `src/agents/sea-themed/my-agent.ts`:
```typescript
import type { AgentConfig } from "@opencode-ai/sdk"

export function createMyAgentConfig(model: string = "provider/model"): AgentConfig {
  return {
    description: "Brief description",
    mode: "subagent" as const,
    model,
    temperature: 0.1,
    tools: { write: false, edit: false },
    prompt: "System prompt...",
  }
}

export const myAgent = createMyAgentConfig()
```

2. Export from `src/agents/sea-themed/index.ts`
3. Add to `agentSources` in `src/agents/utils.ts`
4. Update `BuiltinAgentName` type in `src/agents/types.ts`
5. Add metadata to `agentMetadata` for prompt builder sections

## AGENT METADATA

Agents can define metadata for dynamic prompt sections:

```typescript
export const MY_AGENT_PROMPT_METADATA: AgentPromptMetadata = {
  category: "advisor",
  cost: "EXPENSIVE",
  promptAlias: "MyAgent",
  triggers: [
    { domain: "Domain", trigger: "When to delegate" }
  ],
  useWhen: [
    "When this applies",
  ],
  avoidWhen: [
    "When not to use",
  ],
  keyTrigger: "Quick reference phrase",
}
```

## CATEGORIES

| Category | Cost | Description |
|----------|------|-------------|
| advisor | EXPENSIVE | Consultation agents (Maelstrom, Leviathan) |
| specialist | CHEAP | Focused task agents (Coral, Siren) |
| exploration | FREE | Search/research agents (Nautilus, Abyssal) |

## LEGACY AGENTS (Still Available)

The original Greek-themed agents are still available for backward compatibility:
- Sisyphus, Oracle, Librarian, Explore, Frontend-UI-UX-Engineer, Document-Writer
- Metis (Plan Consultant), Momus (Plan Reviewer)
