import type { Plugin, PluginInput } from "@opencode-ai/plugin"
import type { Hooks, ToolDefinition } from "@opencode-ai/plugin"
import { tool } from "@opencode-ai/plugin"
import { z } from "zod"
import type { AgentConfig } from "@opencode-ai/sdk"

import {
  createKrakenConfig,
  createMaelstromConfig,
  createNautilusConfig,
  createAbyssalConfig,
  createCoralConfig,
  createSirenConfig,
  createLeviathanConfig,
  createPoseidonConfig,
  createScyllaConfig,
  createPearlConfig,
} from "./agents/sea-themed"
import { opencodeXCompress } from "./tools/compression"
import { ralphLoop } from "./tools/ralph-loop"
import { createRalphLoopHook } from "./hooks/ralph-loop"
import { createContextInjector } from "./features/context-injector"
import { createBackgroundAgentFeature } from "./features/background-agent/manager"
import { createKeywordDetector } from "./hooks/keyword-detector"
import { createAutoSlashCommand } from "./hooks/auto-slash-command"
import { createRulesInjector } from "./hooks/rules-injector"
import {
  OpenCodeXConfigSchema,
  OpenCodeXBuiltinAgentNameSchema,
  OpenCodeXHookNameSchema,
  AgentOverridesSchema,
  RalphLoopConfigSchema,
  BackgroundTaskConfigSchema,
} from "./config/schema"

import {
  lsp_hover,
  lsp_goto_definition,
  lsp_find_references,
  lsp_document_symbols,
  lsp_workspace_symbols,
  lsp_diagnostics,
  lsp_servers,
  lsp_prepare_rename,
  lsp_rename,
  lsp_code_actions,
  lsp_code_action_resolve,
} from "./tools/lsp"
import { ast_grep_search, ast_grep_replace } from "./tools/ast-grep"
import { session_list, session_read, session_search, session_info } from "./tools/session"
import { grep } from "./tools/grep"
import { glob } from "./tools/glob"

export {
  createKrakenConfig,
  createMaelstromConfig,
  createNautilusConfig,
  createAbyssalConfig,
  createCoralConfig,
  createSirenConfig,
  createLeviathanConfig,
  createPoseidonConfig,
  createScyllaConfig,
  createPearlConfig,
  opencodeXCompress,
  ralphLoop,
  createRalphLoopHook,
  createContextInjector,
  createBackgroundAgentFeature,
  createKeywordDetector,
  createAutoSlashCommand,
  createRulesInjector,
  lsp_hover,
  lsp_goto_definition,
  lsp_find_references,
  lsp_document_symbols,
  lsp_workspace_symbols,
  lsp_diagnostics,
  lsp_servers,
  lsp_prepare_rename,
  lsp_rename,
  lsp_code_actions,
  lsp_code_action_resolve,
  ast_grep_search,
  ast_grep_replace,
  session_list,
  session_read,
  session_search,
  session_info,
  grep,
  glob,
}

export type { AgentConfig } from "@opencode-ai/sdk"
export type { AgentCategory, AgentCost, AgentPromptMetadata, AgentFactory, AgentOverrides } from "./agents/types"
export type {
  OpenCodeXConfig,
  OpenCodeXBuiltinAgentName,
  OpenCodeXHookName,
  AgentOverrides as ConfigAgentOverrides,
  RalphLoopConfig,
  BackgroundTaskConfig,
} from "./config/schema"
export { OpenCodeXConfigSchema }

const SEA_THEMED_AGENTS: Record<string, AgentConfig> = {
  Kraken: createKrakenConfig(),
  Maelstrom: createMaelstromConfig(),
  Nautilus: createNautilusConfig(),
  Abyssal: createAbyssalConfig(),
  Coral: createCoralConfig(),
  Siren: createSirenConfig(),
  Leviathan: createLeviathanConfig(),
  "Poseidon (Plan Consultant)": createPoseidonConfig(),
  "Scylla (Plan Reviewer)": createScyllaConfig(),
  Pearl: createPearlConfig(),
}

export const builtinAgents = SEA_THEMED_AGENTS

export const builtinTools: Record<string, ToolDefinition> = {
  lsp_hover,
  lsp_goto_definition,
  lsp_find_references,
  lsp_document_symbols,
  lsp_workspace_symbols,
  lsp_diagnostics,
  lsp_servers,
  lsp_prepare_rename,
  lsp_rename,
  lsp_code_actions,
  lsp_code_action_resolve,
  ast_grep_search,
  ast_grep_replace,
  grep,
  glob,
  session_list,
  session_read,
  session_search,
  session_info,
}

export async function createOpenCodeXPlugin(input: PluginInput): Promise<Hooks> {
  const { client, directory, project } = input

  const opencodeXAgent = tool({
    description: "Invoke OpenCode-X sea-themed agents (Kraken, Maelstrom, Abyssal, Nautilus, Coral, Siren, Leviathan, Poseidon, Scylla, Pearl)",
    args: {
      agent: z.enum(Object.keys(SEA_THEMED_AGENTS) as [string, ...string[]]),
      prompt: z.string(),
      model: z.string().optional(),
    },
    async execute(args, context) {
      const { agent, prompt, model } = args
      const agentConfig = SEA_THEMED_AGENTS[agent]
      if (!agentConfig) {
        return `Agent ${agent} not found`
      }
      return `[OpenCode-X] Would invoke ${agent} with model ${model || agentConfig.model}`
    },
  })

  const ralphLoopHook = createRalphLoopHook(input)
  const contextInjector = createContextInjector(input)
  const backgroundAgent = createBackgroundAgentFeature(input)

  return {
    tool: {
      "opencode-x-agent": opencodeXAgent,
      "opencode-x-compress": opencodeXCompress,
      "ralph-loop": ralphLoop,
      ...builtinTools,
    },
    ...ralphLoopHook,
    ...contextInjector,
  }
}

export const OpenCodeXPlugin: Plugin = createOpenCodeXPlugin

export default OpenCodeXPlugin
