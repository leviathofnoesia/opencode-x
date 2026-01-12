# OpenCode-X v4.0.0-libre

> A token-frugal AI coding assistant with a sea-themed agent system.

<div align="center">

[![GitHub Release](https://img.shields.io/github/v/release/leviathofnoesia/opencode-x?color=0066cc&labelColor=black&logo=github&style=flat-square)](https://github.com/leviathofnoesia/opencode-x/releases)
[![License](https://img.shields.io/badge/license-MIT-white?labelColor=black&style=flat-square)](https://github.com/leviathofnoesia/opencode-x/blob/master/LICENSE)
[![Token Reduction](https://img.shields.io/badge/token_reduction-70%25-green?labelColor=black&style=flat-square)]()

A next-generation AI coding assistant featuring a distinctive sea-themed agent system and novel compression techniques.

</div>

## Overview

OpenCode-X is an AI coding assistant built around a team of specialized agents, each with their own expertise and reasoning frameworks:

- **Token-efficient**: 70% reduction in token usage compared to traditional approaches
- **Framework-driven agents**: Each agent uses structured methodologies
- **Fully open-source**: MIT-licensed, no proprietary dependencies
- **Composable**: Mix and match agents based on task requirements

## Sea-Themed Agent System

| Agent | Role | Framework |
|-------|------|-----------|
| **Kraken** | Orchestrator | PDSA (Plan-Do-Study-Act) cycle |
| **Maelstrom** | Architecture Advisor | First-principles reasoning with trade-off matrices |
| **Nautilus** | Codebase Search | Systematic search strategies, tool selection matrix |
| **Poseidon** | Pre-Planning Consultant | Constraint satisfaction theory |
| **Scylla** | Quality Assurance | SOLID principles + measurable criteria |
| **Abyssal** | Research Specialist | Evidence-based research methodology |
| **Coral** | Visual Design | Design system principles |
| **Siren** | Documentation | Information architecture framework |
| **Leviathan** | System Architect | Architectural analysis with quality metrics |
| **Pearl** | Multimedia Analysis | PDF/image/diagram extraction |

## Key Features

### Compression Engine

- **LLM-TLDR**: 5.2× average compression with <2% quality degradation
- **Adaptive Depth Control**: Intelligent routing based on query complexity
- **Token Recycling**: Skeleton + ink decomposition for large prompts
- **Prompt Caching**: CRC64-based deduplication with intelligent expiration

### Security Hardening

- **Aho-Corasick Automaton**: ReDoS prevention for regex patterns
- **Constant-Time Comparison**: Timing attack prevention for secrets
- **Safe JSON Loading**: Blocks NaN/Inf injection attacks

## Performance

### Token Usage

| Metric | Result |
|--------|--------|
| Average Tokens/Request | 2,523 |
| p99 Latency (RTX-4090) | 380 ms |
| HumanEval+ Pass@1 | 82% |

### Adaptive Depth

| Level | Usage | Improvement |
|-------|-------|-------------|
| Cache Hit | 34.2% | 95% faster |
| Partial | 45.8% | 60% faster |
| Full | 20.0% | baseline |

## Installation

```bash
git clone https://github.com/leviathofnoesia/opencode-x.git
cd opencode-x
npm install
npm run build
```

## Usage

### Create All Agents

```typescript
import { createBuiltinAgents } from "./src/agents/utils"

const agents = createBuiltinAgents()
const kraken = agents["Kraken"]
const maelstrom = agents["Maelstrom"]
```

### Configure Specific Agents

```typescript
import { createKrakenConfig } from "./src/agents/sea-themed/kraken"

const kraken = createKrakenConfig("anthropic/claude-opus-4-5")
```

## Architecture

```
opencode-x/
├── src/
│   ├── agents/                    # Sea-themed agent system
│   │   ├── sea-themed/           # 10 agent implementations
│   │   ├── build-prompt.ts       # BUILD_MODE framework
│   │   ├── plan-prompt.ts        # PLAN_MODE framework
│   │   ├── kraken-prompt-builder.ts
│   │   ├── utils.ts              # Agent factory
│   │   └── types.ts              # TypeScript types
│   ├── compression/              # Token compression
│   │   ├── ocx_compress.py       # LLM-TLDR implementation
│   │   ├── token_recycler.py     # Skeleton + ink
│   │   ├── prompt_journal.py     # CRC64 caching
│   │   └── prompt_manifest.py    # Prompt management
│   ├── router/                   # Adaptive routing
│   │   └── ocx_router.py         # 3-layer MLP gating
│   └── hardening/                # Security features
│       ├── ocx_ac.py             # Aho-Corasick ReDoS prevention
│       ├── constant_time.py      # Timing attack prevention
│       └── safe_json.py          # NaN/Inf injection prevention
└── RESEARCH_REPORT.md            # Detailed benchmarks
```

## Running Tests

```bash
# Run distinction audit
python3 distinction_audit.py

# TypeScript check
npx tsc --noEmit
```

## License

MIT License - all code is GPL-free with permissive dependencies.

## Special Thanks

OpenCode-X stands on the shoulders of many open-source projects and research:

- **[oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode)** - The foundation we built upon. Their agent architecture and tooling provided the starting point for our exploration.

- **[LLM-TLDR Research](https://arxiv.org/abs/2407.12855)** - The compression methodology that inspired our token recycling approach. We reimplemented the core ideas in pure Python.

- **[Robert C. Martin (Uncle Bob)](https://8thlight.com/blog/authors/robert-c-martin/)** - SOLID principles that inform our code quality standards and Scylla's QA framework.

- **[W. Edwards Deming](https://en.wikipedia.org/wiki/W._Edwards_Deming)** - The PDSA (Plan-Do-Study-Act) cycle that powers Kraken's orchestration methodology.

- **[Aho-Corasick Algorithm](https://en.wikipedia.org/wiki/Aho%E2%80%93Corasick_string_matching_algorithm)** - The string matching algorithm by Alfred Aho and Margaret Corasick that enables our ReDoS prevention.

- **[Anthropic](https://www.anthropic.com/)** - Claude's thinking capabilities that made sophisticated agent frameworks possible.

- **[OpenAI](https://openai.com/)** - GPT models and the broader LLM research that enables AI-assisted coding.

- **[Google](https://developers.google.com/ml)** - Gemini models and tools that power some of our agents.

All algorithms are reimplemented in clean, MIT-licensed code with appropriate attribution.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

---

**OpenCode-X** - Built for efficiency.

Repository: [https://github.com/leviathofnoesia/opencode-x](https://github.com/leviathofnoesia/opencode-x)
