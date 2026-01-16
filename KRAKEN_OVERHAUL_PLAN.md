# OpenCode-X: Kraken Enhancement & Complete Separation Plan

**Status:** Research Complete | Ready for Implementation
**Priority:** HIGH
**Estimated Effort:** 4 Sprints
**Created:** 2026-01-16

---

## Executive Summary

This document outlines a comprehensive plan to:

1. **Achieve complete separation from oh-my-opencode** - Remove 100+ references across codebase, docs, workflows, and configs
2. **Implement full subagent calling capabilities** - Give Kraken the same orchestration power Sisyphus had
3. **Ensure feature parity** - Verify all functionality is preserved and enhanced
4. **Modernize the agent system** - Remove legacy code, unify patterns, enhance capabilities

### Key Findings

**Current State:**
- ✅ Kraken exists as primary orchestrator with PDSA framework
- ✅ 9 specialized sea-themed subagents operational
- ✅ Background task manager exists but no tool interface
- ✅ Sophisticated prompt builder exists but not integrated
- ❌ No `call_agent` tool - Kraken can't actually invoke subagents programmatically
- ❌ 100+ oh-my-opencode references throughout codebase
- ❌ Legacy sisyphus/oracle/librarian references in tools and docs
- ❌ Dependency on @code-yeongyu/comment-checker
- ❌ Publishing scripts hardcoded to code-yeongyu repository

**What Sisyphus Had That Kraken Lacks:**
1. Actual subagent calling tool (`sisyphus_task` mentioned in restrictions but never implemented)
2. Agent-to-agent communication API
3. Task delegation with wait/async patterns
4. Background task status checking
5. Integrated prompt building with agent awareness

---

## Phase 1: Brand Identity & Separation (CRITICAL PATH)

**Priority:** 🔴 HIGH | **Risk:** 🟢 LOW | **Dependencies:** None

### 1.1 Package Configuration
- [ ] Remove `@code-yeongyu/comment-checker` dependency from package.json
  - Find all usages in `/src/hooks/comment-checker/`
  - Either vendor the code (if MIT licensed) or replace
- [ ] Regenerate bun.lock to remove "oh-my-opencode" package name reference

### 1.2 Schema Files
- [ ] Delete or rename `assets/oh-my-opencode.schema.json`
- [ ] Update `assets/opencode-x.schema.json` $id URL:
  - FROM: `https://raw.githubusercontent.com/code-yeongyu/oh-my-opencode/master/`
  - TO: `https://raw.githubusercontent.com/leviathofnoesia/opencode-x/master/`
- [ ] Remove old agent names: "Sisyphus", "oracle", "librarian", "prometheus", "metis", "momus"
- [ ] Remove old hook names: "sisyphus-orchestrator", "start-work", "prometheus-md-only"

### 1.3 Documentation (MAJOR EFFORT)
**Files requiring complete rewrite:**
- [ ] `README.zh-cn.md` - 50+ references to oh-my-opencode
- [ ] `README.ja.md` - Similar to Chinese README
- [ ] `AGENTS.md` - References oh-my-opencode structure throughout
- [ ] `CONTRIBUTING.md` - Update clone URLs and paths
- [ ] `docs/orchestration-guide.md` - Rewrite Sisyphus/Prometheus sections
- [ ] `docs/cli-guide.md` - Update all `bunx oh-my-opencode` commands
- [ ] `LICENSE.md` - Reflect OpenCode-X ownership
- [ ] `CLA.md` - Update owner from YeonGyu Kim to OpenCode-X Team

**Search/Replace Operations:**
```bash
oh-my-opencode → opencode-x
code-yeongyu → leviathofnoesia
~/.config/opencode/oh-my-opencode.json → ~/.config/opencode/opencode-x.json
bunx oh-my-opencode install → bunx opencode-x install
```

### 1.4 GitHub Workflows
- [ ] **publish.yml** - Line 64: Update repository check
  - FROM: `code-yeongyu/oh-my-opencode`
  - TO: `leviathofnoesia/opencode-x`
- [ ] **RENAME:** `.github/workflows/sisyphus-agent.yml` → `kraken-agent.yml`
  - Replace all `@sisyphus-dev-ai` → `@kraken-dev-ai`
  - Update agent configuration to reference Kraken
  - Update workflow triggers
  - Update build/install commands
- [ ] **ci.yml** - Update schema file references
- [ ] **cla.yml** - Update CLA document URLs

### 1.5 Assets & Images
- [ ] Delete sisyphus-branded images:
  - `.github/assets/orchestrator-sisyphus.png`
  - `.github/assets/sisyphus.png`
  - `.github/assets/sisyphuslabs.png`
- [ ] Consider creating Kraken-themed assets

### 1.6 Command Files
- [ ] **DELETE:** `.opencode/command/omomomo.md` (oh-my-opencode easter egg)
- [ ] Consider creating new easter egg about OpenCode-X
- [ ] Update `.opencode/command/publish.md` references

**Verification Commands:**
```bash
grep -r "oh-my-opencode" src/ package.json
grep -r "sisyphus" src/ --include="*.ts"
grep -r "code-yeongyu" . --exclude-dir=node_modules
```

---

## Phase 2: Agent System Modernization (CORE FUNCTIONALITY)

**Priority:** 🔴 HIGH | **Risk:** 🟡 MEDIUM | **Dependencies:** Phase 1.2

### 2.1 Remove Legacy Tool Restrictions

**Problem:** All subagents deny non-existent tools: `sisyphus_task` and `call_omo_agent`

**Files to modify:**
- [ ] `src/agents/sea-themed/nautilus.ts` (line 169)
- [ ] `src/agents/sea-themed/poseidon.ts` (line 125)
- [ ] `src/agents/sea-themed/scylla.ts`
- [ ] `src/agents/sea-themed/pearl.ts`

**Action:** Remove from restriction arrays, prepare for new `call_agent` tool

### 2.2 Implement Proper Subagent Calling Tool ⭐ CRITICAL

**Problem:** Background agent manager exists but doesn't expose tools for Kraken to call subagents.

**Current state:**
- `src/features/background-agent/manager.ts` - Manager exists
- Line 154: `tools: {}` - No tools exposed!

**Solution:** Create `call_agent` tool

**New file to create:**
- [ ] `src/features/background-agent/tool.ts`

**Implementation approach:**
```typescript
export function createCallAgentTool(manager: BackgroundManager) {
  return tool({
    name: "call_agent",
    description: "Delegate a task to a specialized subagent for domain expertise",
    parameters: z.object({
      agent: z.enum(["Nautilus", "Abyssal", "Maelstrom", "Coral", "Siren",
                     "Leviathan", "Poseidon", "Scylla", "Pearl"]),
      task: z.string().describe("Clear description of what the agent should do"),
      context: z.string().optional().describe("Relevant context"),
      wait: z.boolean().default(false).describe("Wait for completion before returning")
    }),
    async execute(params) {
      // 1. Create background task via manager
      const task = await manager.createTask({
        agent: params.agent,
        task: params.task,
        context: params.context
      })

      // 2. If wait=true, poll until complete
      if (params.wait) {
        return await manager.waitForTask(task.id)
      }

      // 3. Otherwise return task ID for async tracking
      return {
        taskId: task.id,
        status: "running",
        message: `Task delegated to ${params.agent}. Use background_task_status to check progress.`
      }
    }
  })
}
```

**Files to modify:**
- [ ] `src/features/background-agent/manager.ts`
  - Export `createCallAgentTool` and `createBackgroundTaskStatusTool`
  - Update `createBackgroundAgentFeature()` to return tools object
- [ ] `src/index.ts`
  - Capture return value from `createBackgroundAgentFeature()`
  - Register tools with plugin hooks

**Key Design Decisions:**
- Tool name: `call_agent` (simple, clear)
- Supports both sync (wait=true) and async (wait=false) patterns
- Returns task ID for async tracking
- Respects existing concurrency limits in BackgroundManager

### 2.3 Integrate Kraken Prompt Builder ⭐ CRITICAL

**Problem:** `kraken-prompt-builder.ts` exists with sophisticated functionality but is NOT being used

**Current state:**
- `src/agents/kraken-prompt-builder.ts` - Complete implementation exists
- `src/agents/sea-themed/kraken.ts` - Uses static prompt, doesn't import builder

**Solution:** Modify Kraken config to use dynamic prompt building

**Files to modify:**
- [ ] `src/agents/sea-themed/kraken.ts`

**Implementation approach:**
```typescript
import {
  buildKeyTriggersSection,
  buildDelegationTable,
  buildToolSelectionTable,
  buildFrontendSection,
  buildOracleSection,
  buildAgentPrioritySection,
  type AvailableAgent
} from "../kraken-prompt-builder"

export function createKrakenConfig(
  model: string = DEFAULT_MODEL,
  availableAgents?: AgentConfig[],
  availableTools?: string[],
  availableSkills?: SkillInfo[]
): AgentConfig {
  // Convert agents to format with metadata
  const agentsWithMetadata: AvailableAgent[] = availableAgents?.map(agent => ({
    name: agent.name,
    description: agent.description,
    metadata: agent.metadata || defaultMetadata
  })) || []

  // Build dynamic sections
  const keyTriggers = buildKeyTriggersSection(agentsWithMetadata, availableSkills)
  const toolSelection = buildToolSelectionTable(agentsWithMetadata,
                                                categorizeTools(availableTools),
                                                availableSkills)
  const delegationTable = buildDelegationTable(agentsWithMetadata)

  // Construct final prompt
  const dynamicPrompt = `${KRAKEN_SYSTEM_PROMPT}

## Available Resources

${keyTriggers}

${toolSelection}

${delegationTable}

${buildAgentPrioritySection(agentsWithMetadata)}
`

  return {
    description: "...",
    mode: "primary" as const,
    model,
    temperature: 0.1,
    prompt: dynamicPrompt,
    thinking: model.includes("claude") ? {
      type: "enabled" as const,
      budgetTokens: 32_000
    } : undefined,
  }
}
```

- [ ] `src/index.ts`
  - Pass available agents, tools, and skills to `createKrakenConfig()`
  - Ensure proper initialization order

**Benefits:**
- Kraken knows exactly which agents are available
- Dynamic prompt adapts to configuration
- Tool/skill discovery built into prompt
- Better delegation decisions based on actual capabilities

### 2.4 Unify Agent Tool Restriction Patterns

**Problem:** Inconsistent tool restriction syntax across agents

**Files to modify:**
- [ ] `src/agents/sea-themed/abyssal.ts` (line 126)
  - Replace `tools: { write: false, edit: false, background_task: false }`
  - With: `createAgentToolRestrictions(["write", "edit", "task"])`

**Verification:**
```bash
grep -A5 "tools:" src/agents/sea-themed/*.ts
# Should only see permission-compat usage
```

---

## Phase 3: Kraken Orchestration Enhancement

**Priority:** 🟡 MEDIUM | **Risk:** 🟢 LOW | **Dependencies:** Phase 2.2

### 3.1 Add Subagent Calling Examples to Kraken Prompt

**Files to modify:**
- [ ] `src/agents/sea-themed/kraken.ts` (KRAKEN_SYSTEM_PROMPT)

**New section to add:**
```markdown
### Delegation Execution Patterns

**Sequential Delegation** (when results depend on each other):
1. Call Nautilus to find existing patterns
2. Wait for results, analyze findings
3. Call Maelstrom for architectural guidance
4. Use results to inform implementation

**Parallel Delegation** (when tasks are independent):
call_agent({ agent: "Nautilus", task: "Find auth patterns", wait: false })
call_agent({ agent: "Abyssal", task: "Research OAuth docs", wait: false })
call_agent({ agent: "Scylla", task: "Review test coverage", wait: false })

**Tool Usage Examples:**
- Nautilus: call_agent({ agent: "Nautilus", task: "Find all API routes in src/",
                        context: "Need to understand routing structure" })
- Abyssal: call_agent({ agent: "Abyssal", task: "How does express.js middleware work?",
                       context: "Implementing custom middleware" })
- Maelstrom: call_agent({ agent: "Maelstrom", task: "Should we use monorepo or separate repos?",
                         context: "Planning new microservice", wait: true })

**Delegation Anti-Patterns:**
- Don't delegate simple tasks you can do directly (file reads, basic grep)
- Don't delegate without clear task description
- Don't wait for results if you can continue with other work
- Don't delegate to multiple agents for the same task
```

### 3.2 Implement Background Task Status Tool

**New file to create:**
- [ ] `src/features/background-agent/status-tool.ts`

**Tool definition:**
```typescript
export function createBackgroundTaskStatusTool(manager: BackgroundManager) {
  return tool({
    name: "background_task_status",
    description: "Check status of background agent tasks. Returns completion status and results.",
    parameters: z.object({
      taskId: z.string().describe("Task ID from call_agent with wait=false")
    }),
    async execute(params) {
      const task = manager.getTask(params.taskId)
      if (!task) {
        return { error: "Task not found" }
      }

      return {
        taskId: task.id,
        agent: task.agent,
        status: task.status,
        result: task.result,
        error: task.error,
        duration: task.completedAt ? task.completedAt - task.startedAt : null
      }
    }
  })
}
```

**Additional tools to consider:**
- [ ] `background_task_list` - List all active tasks
- [ ] `background_task_cancel` - Cancel a running task

### 3.3 Update Agent Metadata with Delegation Patterns

**Goal:** Make it easier for Kraken to know WHEN to delegate

**Files to modify:**
All agent files in `src/agents/sea-themed/*.ts`

**Enhancement:** Add `callPattern` field to metadata:
```typescript
export const NAUTILUS_PROMPT_METADATA: AgentPromptMetadata = {
  category: "exploration",
  cost: "FREE",
  promptAlias: "Nautilus",
  keyTrigger: "2+ modules involved → fire Nautilus background",
  triggers: [...],
  useWhen: [...],
  avoidWhen: [...],
  callPattern: {
    parallel: true,
    typical: 'call_agent({ agent: "Nautilus", task: "Find all components using React hooks", wait: false })',
    examples: [
      "Find all files importing X",
      "Locate class definitions matching pattern Y",
      "Search for usage of deprecated function Z"
    ]
  }
}
```

- [ ] Update all 9 agent metadata structures

---

## Phase 4: Configuration & Build System

**Priority:** 🟡 MEDIUM | **Risk:** 🟢 LOW | **Dependencies:** Phase 1

### 4.1 Update Build Scripts
- [ ] `script/build-schema.ts` - Generate opencode-x.schema.json only
- [ ] `script/publish.ts` - Update package name to "opencode-x"
- [ ] `script/publish.ts` - Update GitHub release URLs
- [ ] Verify $id URL points to correct repository

### 4.2 CLI Tool Updates
- [ ] `src/cli/index.ts` - Update help text branding
- [ ] `src/cli/install.ts` - Update install wizard branding
- [ ] `src/cli/doctor/checks/*.ts` - Update config path checks
- [ ] Update config path suggestions:
  - FROM: `~/.config/opencode/oh-my-opencode.json`
  - TO: `~/.config/opencode/opencode-x.json`
- [ ] **Consider:** Add migration tool to auto-rename old config files

### 4.3 MCP Configuration
- [ ] Verify MCP configurations don't reference oh-my-opencode
- [ ] Update any hardcoded paths

---

## Phase 5: Testing & Verification

**Priority:** 🔴 HIGH | **Risk:** N/A | **Dependencies:** All previous phases

### 5.1 Create Integration Tests
**New file:**
- [ ] `src/features/background-agent/integration.test.ts`

**Test scenarios:**
- [ ] Kraken can call Nautilus with task
- [ ] Kraken can call Abyssal with task
- [ ] Parallel agent calls work correctly
- [ ] Background task status checking works
- [ ] Task concurrency limits are respected
- [ ] Agent results are properly returned

### 5.2 Update Existing Tests
**Search for tests referencing:**
```bash
find . -name "*.test.ts" -exec grep -l "oh-my-opencode\|sisyphus\|oracle" {} \;
```
- [ ] Update all test references
- [ ] Update test config paths

### 5.3 Manual Testing Checklist
- [ ] Install via CLI: `bunx opencode-x install`
- [ ] Verify config created at `~/.config/opencode/opencode-x.json`
- [ ] Test Kraken delegates to Nautilus
- [ ] Test Kraken delegates to Abyssal
- [ ] Test parallel delegation (3+ agents)
- [ ] Verify all agents work independently
- [ ] Check LSP tools functionality
- [ ] Check AST-grep tools functionality
- [ ] Verify compression features
- [ ] Test model switcher TUI

---

## Phase 6: Documentation & Polish

**Priority:** 🟢 LOW | **Risk:** 🟢 LOW | **Dependencies:** Phase 5

### 6.1 Create Migration Guide
**New file:**
- [ ] `MIGRATION.md`

**Contents:**
- For users migrating from oh-my-opencode
- Config path changes
- Agent name mapping
- Breaking changes list
- Migration script (if created)

### 6.2 Update Developer Documentation
- [ ] `docs/agent-development.md` - How to create new agents
- [ ] `docs/orchestration-guide.md` - Complete rewrite for Kraken
- [ ] `docs/subagent-calling.md` - NEW: How agents call each other

### 6.3 Create Demos
- [ ] Video/GIF: Kraken delegating to multiple agents
- [ ] Video/GIF: Parallel agent execution
- [ ] Video/GIF: Background task monitoring

---

## Implementation Roadmap

### Sprint 1: Core Identity (Week 1)
**Goal:** Clean build with new identity
- Phase 1.1 - Remove @code-yeongyu dependency
- Phase 1.2 - Update schema files
- Phase 1.3 - Update README.md (English only)
- Phase 1.4 - Update publish.yml workflow
- Phase 4.1 - Update build scripts
**Deliverable:** Builds with no oh-my-opencode references in source

### Sprint 2: Agent System (Week 2)
**Goal:** Working subagent calling system
- Phase 2.1 - Remove legacy tool restrictions
- Phase 2.4 - Unify agent tool patterns
- Phase 2.2 - Implement call_agent tool ⭐
- Phase 2.3 - Integrate Kraken prompt builder ⭐
- Phase 5.1 - Create integration tests
**Deliverable:** Kraken can delegate tasks to subagents

### Sprint 3: Enhancement (Week 3)
**Goal:** Enhanced orchestration capabilities
- Phase 3.1 - Enhance Kraken prompt with examples
- Phase 3.2 - Add background task status tools
- Phase 3.3 - Update agent metadata
- Phase 5.2 - Update existing tests
**Deliverable:** Full-featured orchestration with async support

### Sprint 4: Polish & Release (Week 4)
**Goal:** Production-ready release
- Phase 1.3 - Complete all documentation (ZH, JA)
- Phase 1.4 - Update kraken-agent.yml workflow
- Phase 1.5 - Replace asset files
- Phase 1.6 - Update command files
- Phase 4.2 - CLI updates
- Phase 5.3 - Manual testing
- Phase 6 - Final documentation
**Deliverable:** v1.0.0 release ready

---

## Risk Assessment

### 🔴 High Risk

**1. Subagent Calling Implementation (Phase 2.2)**
- **Risk:** May require changes to @opencode-ai/sdk or plugin API
- **Mitigation:** Start with prototype, verify SDK capabilities early
- **Fallback:** Implement via tool simulation if SDK doesn't support

**2. Breaking Changes for Existing Users**
- **Risk:** Config path/structure changes break existing setups
- **Mitigation:** Create migration tool, maintain backward compatibility
- **Fallback:** Support both old and new config paths temporarily

**3. Background Task Concurrency**
- **Risk:** Too many parallel agents overwhelm API rate limits
- **Mitigation:** BackgroundManager already has concurrency limits
- **Testing:** Stress test with 10+ parallel agent calls

### 🟡 Medium Risk

**1. Dependency on @code-yeongyu/comment-checker**
- **Risk:** Removing might break comment checking hook
- **Mitigation:** Vendor the code or find replacement
- **Action:** Check license compatibility first

**2. GitHub Workflow Changes**
- **Risk:** Breaking CI/CD pipeline
- **Mitigation:** Test in branch first, gradual rollout
- **Fallback:** Keep old workflow as backup

### 🟢 Low Risk

- Documentation updates (no functional impact)
- Asset file removal (no code dependencies)
- README translations (no functional impact)

---

## Critical Files for Implementation

### Top 5 Most Critical

1. **`src/features/background-agent/manager.ts`**
   - Core of subagent calling system
   - Need to add tool exports and SDK integration
   - Currently has manager but no tools exposed (line 154: `tools: {}`)

2. **`src/agents/sea-themed/kraken.ts`**
   - Primary orchestrator agent
   - Need to integrate kraken-prompt-builder
   - Add delegation examples
   - Currently uses static prompt

3. **`src/index.ts`**
   - Main plugin entry point
   - Wire up background agent tools
   - Pass agent/tool lists to Kraken config
   - Critical for connecting all pieces

4. **`assets/oh-my-opencode.schema.json`**
   - Legacy schema with extensive oh-my-opencode references
   - Contains old agent names (Sisyphus, oracle, librarian)
   - Either delete or complete overhaul

5. **`README.zh-cn.md`**
   - Most heavily branded documentation (50+ references)
   - Critical for user-facing identity
   - Installation commands, config paths, repo URLs all need updates

### Honorable Mentions

- **`.github/workflows/sisyphus-agent.yml`** - 497 lines, complete rename/rewrite needed
- **`AGENTS.md`** - Internal documentation with oh-my-opencode terminology throughout
- **`src/agents/kraken-prompt-builder.ts`** - Already exists, just needs integration!

---

## Verification Commands

### Phase 1 Verification
```bash
# No oh-my-opencode references in code
grep -r "oh-my-opencode" src/ package.json

# No sisyphus references in code
grep -r "sisyphus" src/ --include="*.ts"

# No code-yeongyu references
grep -r "code-yeongyu" . --exclude-dir=node_modules

# Schema files correct
ls -la assets/
cat assets/opencode-x.schema.json | grep '$id'

# Build succeeds
bun run build
ls -la dist/
```

### Phase 2 Verification
```bash
# call_agent tool exists
ls src/features/background-agent/tool.ts

# No legacy tool references
grep -r "sisyphus_task\|call_omo_agent" src/agents/

# Kraken uses prompt builder
grep "buildKeyTriggersSection\|buildDelegationTable" src/agents/sea-themed/kraken.ts

# Type checking passes
bun run typecheck

# Tests pass
bun test
```

### Phase 5 Verification
```bash
# All tests pass
bun test

# Manual install test
bunx opencode-x install --no-tui
ls ~/.config/opencode/opencode-x.json
```

---

## Success Criteria

### Phase 1 Complete ✓
- [ ] Zero oh-my-opencode references in source code
- [ ] Zero code-yeongyu references except attribution
- [ ] All documentation updated to OpenCode-X branding
- [ ] Build completes without errors
- [ ] Package publishes with correct name

### Phase 2 Complete ✓
- [ ] `call_agent` tool implemented and registered
- [ ] Kraken uses prompt builder for dynamic agent awareness
- [ ] All agents use unified tool restriction pattern
- [ ] Integration tests pass
- [ ] Kraken successfully delegates to Nautilus

### Phase 3 Complete ✓
- [ ] Kraken prompt includes concrete delegation examples
- [ ] Background task status tools implemented
- [ ] All agents have enhanced metadata with call patterns
- [ ] Parallel delegation works correctly

### Phases 4-6 Complete ✓
- [ ] CLI updated with new branding
- [ ] All tests pass (unit + integration)
- [ ] Manual testing checklist complete
- [ ] Migration guide created
- [ ] Developer documentation complete

---

## Next Steps

1. **Review this plan** - Validate approach and priorities
2. **Start Sprint 1** - Begin with Phase 1.1 (dependency removal)
3. **Prototype Phase 2.2** - Verify SDK supports agent calling
4. **Create tracking issues** - One per phase for progress tracking
5. **Set up branch** - `feature/kraken-enhancement` for development

---

## Notes & Observations

**What OpenCode-X Does Better Than oh-my-opencode:**
- Sea-themed agent names (more cohesive than Greek mythology mix)
- Sophisticated prompt builder architecture
- Enhanced agent metadata system
- PDSA framework for Kraken
- Background task manager with concurrency control

**What Still Needs Work:**
- Actual tool exposure for subagent calling (the critical gap!)
- Integration of existing sophisticated components (prompt builder)
- Complete brand separation
- Enhanced documentation

**Key Insight:**
The architecture is already excellent - we have all the pieces (BackgroundManager, prompt builder, agent metadata). We just need to **wire them together** and **expose the tools** so Kraken can actually USE them. This is less about building new features and more about **connecting existing capabilities**.

---

**Document Version:** 1.0
**Last Updated:** 2026-01-16
**Author:** Kraken Planning Session
**Status:** Ready for Implementation
