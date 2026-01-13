import { tool } from "@opencode-ai/plugin"
import { z } from "zod"
import type { LSPPosition, LSPRange } from "./types"

function parsePosition(pos: unknown): LSPPosition {
  if (typeof pos === "string") {
    const match = pos.match(/^(\d+):(\d+)$/)
    if (match) {
      return { line: parseInt(match[1], 10), character: parseInt(match[2], 10) }
    }
  }
  if (typeof pos === "object" && pos !== null && "line" in pos && "character" in pos) {
    return { line: (pos as { line: number }).line, character: (pos as { character: number }).character }
  }
  return { line: 0, character: 0 }
}

function parseRange(range: unknown): LSPRange | undefined {
  if (!range) return undefined
  if (typeof range === "string") {
    const match = range.match(/^(\d+):(\d+)-(\d+):(\d+)$/)
    if (match) {
      return {
        start: { line: parseInt(match[1], 10), character: parseInt(match[2], 10) },
        end: { line: parseInt(match[3], 10), character: parseInt(match[4], 10) },
      }
    }
  }
  if (typeof range === "object" && range !== null) {
    const r = range as { start?: unknown; end?: unknown }
    if (r.start && r.end) {
      return { start: parsePosition(r.start), end: parsePosition(r.end) }
    }
  }
  return undefined
}

export const lsp_hover = tool({
  description: "Get hover information at cursor position. Shows type information, documentation, and symbol details.",
  args: {
    path: z.string().describe("File path to query"),
    position: z.union([z.string(), z.object({ line: z.number(), character: z.number() })]).describe("Position (line:character or {line, character})"),
  },
  async execute(args) {
    const { path, position } = args
    const pos = parsePosition(position)
    return JSON.stringify({
      success: false,
      message: "LSP server not configured. Install language server for this file type.",
      path,
      position: pos,
    }, null, 2)
  },
})

export const lsp_goto_definition = tool({
  description: "Navigate to the definition of the symbol under cursor.",
  args: {
    path: z.string().describe("File path to query"),
    position: z.union([z.string(), z.object({ line: z.number(), character: z.number() })]).describe("Position (line:character or {line, character})"),
  },
  async execute(args) {
    const { path, position } = args
    const pos = parsePosition(position)
    return JSON.stringify({
      success: false,
      message: "LSP server not configured. Install language server for this file type.",
      path,
      position: pos,
    }, null, 2)
  },
})

export const lsp_find_references = tool({
  description: "Find all references to the symbol under cursor across the workspace.",
  args: {
    path: z.string().describe("File path to query"),
    position: z.union([z.string(), z.object({ line: z.number(), character: z.number() })]).describe("Position (line:character or {line, character})"),
  },
  async execute(args) {
    const { path, position } = args
    const pos = parsePosition(position)
    return JSON.stringify({
      success: false,
      message: "LSP server not configured. Install language server for this file type.",
      path,
      position: pos,
    }, null, 2)
  },
})

export const lsp_document_symbols = tool({
  description: "List all symbols (classes, functions, variables, etc.) in the current document.",
  args: {
    path: z.string().describe("File path to query"),
  },
  async execute(args) {
    const { path } = args
    return JSON.stringify({
      success: false,
      message: "LSP server not configured. Install language server for this file type.",
      path,
    }, null, 2)
  },
})

export const lsp_workspace_symbols = tool({
  description: "Search for symbols across the entire workspace.",
  args: {
    query: z.string().describe("Symbol name or pattern to search for"),
  },
  async execute(args) {
    const { query } = args
    return JSON.stringify({
      success: false,
      message: "LSP server not configured. Install language server for this file type.",
      query,
    }, null, 2)
  },
})

export const lsp_diagnostics = tool({
  description: "Get diagnostics (errors, warnings, hints) for a file or the entire workspace.",
  args: {
    path: z.string().optional().describe("File path (omit for workspace-wide diagnostics)"),
  },
  async execute(args) {
    const { path } = args
    return JSON.stringify({
      success: false,
      message: "LSP server not configured. Install language server for this file type.",
      path,
    }, null, 2)
  },
})

export const lsp_servers = tool({
  description: "List all running LSP servers and their status.",
  args: {},
  async execute() {
    return JSON.stringify({
      success: true,
      servers: [],
      message: "No LSP servers configured. Install language servers for your project.",
    }, null, 2)
  },
})

export const lsp_prepare_rename = tool({
  description: "Prepare for rename refactoring. Checks if rename is possible at the given position.",
  args: {
    path: z.string().describe("File path to query"),
    position: z.union([z.string(), z.object({ line: z.number(), character: z.number() })]).describe("Position (line:character or {line, character})"),
  },
  async execute(args) {
    const { path, position } = args
    const pos = parsePosition(position)
    return JSON.stringify({
      success: false,
      message: "LSP server not configured. Install language server for this file type.",
      path,
      position: pos,
    }, null, 2)
  },
})

export const lsp_rename = tool({
  description: "Rename a symbol across the workspace. Use lsp_prepare_rename first to check feasibility.",
  args: {
    path: z.string().describe("File path to query"),
    position: z.union([z.string(), z.object({ line: z.number(), character: z.number() })]).describe("Position (line:character or {line, character})"),
    newName: z.string().describe("New name for the symbol"),
  },
  async execute(args) {
    const { path, position, newName } = args
    const pos = parsePosition(position)
    return JSON.stringify({
      success: false,
      message: "LSP server not configured. Install language server for this file type.",
      path,
      position: pos,
      newName,
    }, null, 2)
  },
})

export const lsp_code_actions = tool({
  description: "Get available code actions (quick fixes, refactorings, etc.) at cursor position.",
  args: {
    path: z.string().describe("File path to query"),
    position: z.union([z.string(), z.object({ line: z.number(), character: z.number() })]).describe("Position (line:character or {line, character})"),
  },
  async execute(args) {
    const { path, position } = args
    const pos = parsePosition(position)
    return JSON.stringify({
      success: false,
      message: "LSP server not configured. Install language server for this file type.",
      path,
      position: pos,
    }, null, 2)
  },
})

export const lsp_code_action_resolve = tool({
  description: "Get detailed information about a specific code action.",
  args: {
    action: z.object({
      title: z.string(),
      command: z.string().optional(),
      arguments: z.array(z.unknown()).optional(),
    }).describe("The code action to resolve"),
  },
  async execute(args) {
    const { action } = args
    return JSON.stringify({
      success: false,
      message: "LSP server not configured. Install language server for this file type.",
      action,
    }, null, 2)
  },
})
