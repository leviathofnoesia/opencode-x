import type { AgentPromptMetadata, BuiltinAgentName } from "./types"

export interface AvailableAgent {
  name: BuiltinAgentName
  description: string
  metadata: AgentPromptMetadata
}

export interface AvailableTool {
  name: string
  category: "lsp" | "ast" | "search" | "session" | "command" | "other"
}

export interface AvailableSkill {
  name: string
  description: string
  location: "user" | "project" | "plugin"
}

export function categorizeTools(toolNames: string[]): AvailableTool[] {
  return toolNames.map((name) => {
    let category: AvailableTool["category"] = "other"
    if (name.startsWith("lsp_")) {
      category = "lsp"
    } else if (name.startsWith("ast_grep")) {
      category = "ast"
    } else if (name === "grep" || name === "glob") {
      category = "search"
    } else if (name.startsWith("session_")) {
      category = "session"
    } else if (name === "slashcommand") {
      category = "command"
    }
    return { name, category }
  })
}

function formatToolsForPrompt(tools: AvailableTool[]): string {
  const lspTools = tools.filter((t) => t.category === "lsp")
  const astTools = tools.filter((t) => t.category === "ast")
  const searchTools = tools.filter((t) => t.category === "search")

  const parts: string[] = []

  if (searchTools.length > 0) {
    parts.push(...searchTools.map((t) => `\`${t.name}\``))
  }

  if (lspTools.length > 0) {
    parts.push("`lsp_*`")
  }

  if (astTools.length > 0) {
    parts.push("`ast_grep`")
  }

  return parts.join(", ")
}

export function buildKeyTriggersSection(agents: AvailableAgent[], skills: AvailableSkill[] = []): string {
  const keyTriggers = agents
    .filter((a) => a.metadata.keyTrigger)
    .map((a) => `- ${a.metadata.keyTrigger}`)

  const skillTriggers = skills
    .filter((s) => s.description)
    .map((s) => `- **Skill \`${s.name}\`**: ${extractTriggerFromDescription(s.description)}`)

  const allTriggers = [...keyTriggers, ...skillTriggers]

  if (allTriggers.length === 0) return ""

  return `### Key Triggers (check BEFORE classification):

**BLOCKING: Check skills FIRST before any action.**
If a skill matches, invoke it IMMEDIATELY via \`skill\` tool.

${allTriggers.join("\n")}
- **GitHub mention (@mention in issue/PR)** → This is a WORK REQUEST. Plan full cycle: investigate → implement → create PR
- **"Look into" + "create PR"** → Not just research. Full implementation cycle expected.`
}

function extractTriggerFromDescription(description: string): string {
  const triggerMatch = description.match(/Trigger[s]?[:\s]+([^.]+)/i)
  if (triggerMatch) return triggerMatch[1].trim()

  const activateMatch = description.match(/Activate when[:\s]+([^.]+)/i)
  if (activateMatch) return activateMatch[1].trim()

  const useWhenMatch = description.match(/Use (?:this )?when[:\s]+([^.]+)/i)
  if (useWhenMatch) return useWhenMatch[1].trim()

  return description.split(".")[0] || description
}

export function buildToolSelectionTable(
  agents: AvailableAgent[],
  tools: AvailableTool[] = [],
  skills: AvailableSkill[] = []
): string {
  const rows: string[] = [
    "### Tool & Skill Selection:",
    "",
    "**Priority Order**: Skills → Direct Tools → Agents",
    "",
  ]

  // Skills section (highest priority)
  if (skills.length > 0) {
    rows.push("#### Skills (INVOKE FIRST if matching)")
    rows.push("")
    rows.push("| Skill | When to Use |")
    rows.push("|-------|-------------|")
    for (const skill of skills) {
      const shortDesc = extractTriggerFromDescription(skill.description)
      rows.push(`| \`${skill.name}\` | ${shortDesc} |`)
    }
    rows.push("")
  }

  // Tools and Agents table
  rows.push("#### Tools & Agents")
  rows.push("")
  rows.push("| Resource | Cost | When to Use |")
  rows.push("|----------|------|-------------|")

  if (tools.length > 0) {
    const toolsDisplay = formatToolsForPrompt(tools)
    rows.push(`| ${toolsDisplay} | FREE | Not Complex, Scope Clear, No Implicit Assumptions |`)
  }

  const costOrder = { FREE: 0, CHEAP: 1, EXPENSIVE: 2 }
  const sortedAgents = [...agents]
    .filter((a) => a.metadata.category !== "utility")
    .sort((a, b) => costOrder[a.metadata.cost] - costOrder[b.metadata.cost])

  for (const agent of sortedAgents) {
    const shortDesc = agent.description.split(".")[0] || agent.description
    rows.push(`| \`${agent.name}\` agent | ${agent.metadata.cost} | ${shortDesc} |`)
  }

  rows.push("")
  rows.push("**Default flow**: skill (if match) → explore/librarian (background) + tools → oracle (if required)")

  return rows.join("\n")
}

export function buildExploreSection(agents: AvailableAgent[]): string {
  const nautilusAgent = agents.find((a) => a.name === "Nautilus")
  if (!nautilusAgent) return ""

  const useWhen = nautilusAgent.metadata.useWhen || []
  const avoidWhen = nautilusAgent.metadata.avoidWhen || []

  return `### Nautilus Agent = Contextual Grep

Use it as a **peer tool**, not a fallback. Fire liberally.

| Use Direct Tools | Use Nautilus Agent |
|------------------|-------------------|
${avoidWhen.map((w) => `| ${w} |  |`).join("\n")}
${useWhen.map((w) => `|  | ${w} |`).join("\n")}`
}

export function buildLibrarianSection(agents: AvailableAgent[]): string {
  const abyssalAgent = agents.find((a) => a.name === "Abyssal")
  if (!abyssalAgent) return ""

  const useWhen = abyssalAgent.metadata.useWhen || []

  return `### Abyssal Agent = Reference Grep

Search **external references** (docs, OSS, web). Fire proactively when unfamiliar libraries are involved.

| Contextual Grep (Internal) | Reference Grep (External) |
|----------------------------|---------------------------|
| Search OUR codebase | Search EXTERNAL resources |
| Find patterns in THIS repo | Find examples in OTHER repos |
| How does our code work? | How does this library work? |
| Project-specific logic | Official API documentation |
| | Library best practices & quirks |
| | OSS implementation examples |

**Trigger phrases** (fire abyssal immediately):
${useWhen.map((w) => `- "${w}"`).join("\n")}`
}

export function buildDelegationTable(agents: AvailableAgent[]): string {
  const rows: string[] = [
    "### Delegation Table:",
    "",
    "| Domain | Delegate To | Trigger |",
    "|--------|-------------|---------|",
  ]

  for (const agent of agents) {
    for (const trigger of agent.metadata.triggers) {
      rows.push(`| ${trigger.domain} | \`${agent.name}\` | ${trigger.trigger} |`)
    }
  }

  return rows.join("\n")
}

export function buildFrontendSection(agents: AvailableAgent[]): string {
  const coralAgent = agents.find((a) => a.name === "Coral")
  if (!coralAgent) return ""

  return `### Frontend Files: Decision Gate (NOT a blind block)

Frontend files (.tsx, .jsx, .vue, .svelte, .css, etc.) require **classification before action**.

#### Step 1: Classify the Change Type

| Change Type | Examples | Action |
|-------------|----------|--------|
| **Visual/UI/UX** | Color, spacing, layout, typography, animation, responsive breakpoints, hover states, shadows, borders, icons, images | **DELEGATE** to \`Coral\` |
| **Pure Logic** | API calls, data fetching, state management, event handlers (non-visual), type definitions, utility functions, business logic | **CAN handle directly** |
| **Mixed** | Component changes both visual AND logic | **Split**: handle logic yourself, delegate visual to \`Coral\` |

#### Step 2: Ask Yourself

Before touching any frontend file, think:
> "Is this change about **how it LOOKS** or **how it WORKS**?"

- **LOOKS** (colors, sizes, positions, animations) → DELEGATE
- **WORKS** (data flow, API integration, state) → Handle directly

#### When in Doubt → DELEGATE if ANY of these keywords involved:
style, className, tailwind, color, background, border, shadow, margin, padding, width, height, flex, grid, animation, transition, hover, responsive, font-size, icon, svg`
}

export function buildMaelstromSection(agents: AvailableAgent[]): string {
  const maelstromAgent = agents.find((a) => a.name === "Maelstrom")
  if (!maelstromAgent) return ""

  const useWhen = maelstromAgent.metadata.useWhen || []
  const avoidWhen = maelstromAgent.metadata.avoidWhen || []

  return `<Maelstrom_Usage>
## Maelstrom — Read-Only High-IQ Consultant

Maelstrom is a read-only, expensive, high-quality reasoning model for debugging and architecture. Consultation only.

### WHEN to Consult:

| Trigger | Action |
|---------|--------|
${useWhen.map((w) => `| ${w} | Maelstrom FIRST, then implement |`).join("\n")}

### WHEN NOT to Consult:

${avoidWhen.map((w) => `- ${w}`).join("\n")}

### Usage Pattern:
Briefly announce "Consulting Maelstrom for [reason]" before invocation.

**Exception**: This is the ONLY case where you announce before acting. For all other work, start immediately without status updates.
</Maelstrom_Usage>`
}

export function buildHardBlocksSection(agents: AvailableAgent[]): string {
  const coralAgent = agents.find((a) => a.name === "Coral")

  const blocks = [
    "| Type error suppression (`as any`, `@ts-ignore`) | Never |",
    "| Commit without explicit request | Never |",
    "| Speculate about unread code | Never |",
    "| Leave code in broken state after failures | Never |",
  ]

  if (coralAgent) {
    blocks.unshift(
      "| Frontend VISUAL changes (styling, layout, animation) | Always delegate to `Coral` |"
    )
  }

  return `## Hard Blocks (NEVER violate)

| Constraint | No Exceptions |
|------------|---------------|
${blocks.join("\n")}`
}

export function buildAntiPatternsSection(agents: AvailableAgent[]): string {
  const coralAgent = agents.find((a) => a.name === "Coral")

  const patterns = [
    "| **Type Safety** | `as any`, `@ts-ignore`, `@ts-expect-error` |",
    "| **Error Handling** | Empty catch blocks `catch(e) {}` |",
    "| **Testing** | Deleting failing tests to \"pass\" |",
    "| **Search** | Firing agents for single-line typos or obvious syntax errors |",
    "| **Debugging** | Shotgun debugging, random changes |",
  ]

  if (coralAgent) {
    patterns.splice(
      4,
      0,
      "| **Frontend** | Direct edit to visual/styling code (logic changes OK) |"
    )
  }

  return `## Anti-Patterns (BLOCKING violations)

| Category | Forbidden |
|----------|-----------|
${patterns.join("\n")}`
}

export function buildUltraworkAgentSection(agents: AvailableAgent[]): string {
  if (agents.length === 0) return ""

  const ultraworkAgentPriority = ["Nautilus", "Abyssal", "plan", "Maelstrom"]
  const sortedAgents = [...agents].sort((a, b) => {
    const aIdx = ultraworkAgentPriority.indexOf(a.name)
    const bIdx = ultraworkAgentPriority.indexOf(b.name)
    if (aIdx === -1 && bIdx === -1) return 0
    if (aIdx === -1) return 1
    if (bIdx === -1) return -1
    return aIdx - bIdx
  })

  const lines: string[] = []
  for (const agent of sortedAgents) {
    const shortDesc = agent.description.split(".")[0] || agent.description
    const suffix = (agent.name === "Nautilus" || agent.name === "Abyssal") ? " (multiple)" : ""
    lines.push(`- **${agent.name}${suffix}**: ${shortDesc}`)
  }

  return lines.join("\n")
}
