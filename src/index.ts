import type { Plugin, PluginInput, Hooks, ToolDefinition } from "@opencode-ai/plugin";
import { z } from "zod";
import type { AgentConfig } from "@opencode-ai/sdk";

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
import { modelSwitcher } from "./tools/model-switcher"
import { createRalphLoopHook } from "./hooks/ralph-loop"
import { createContextInjector } from "./features/context-injector"
import { createBackgroundAgentFeature } from "./features/background-agent/manager"
import { createKeywordDetector } from "./hooks/keyword-detector"
import { createAutoSlashCommand } from "./hooks/auto-slash-command"
import { createRulesInjector } from "./hooks/rules-injector"
import { createAgentUsageReminder } from "./hooks/agent-usage-reminder"
import { createAnthropicContextWindowLimitRecovery } from "./hooks/anthropic-context-window-limit-recovery"
import { createAutoUpdateChecker } from "./hooks/auto-update-checker"
import { createClaudeCodeHooks } from "./hooks/claude-code-hooks"
import { createCompactionContextInjector } from "./hooks/compaction-context-injector"
import { createDirectoryAgentsInjector } from "./hooks/directory-agents-injector"
import { createDirectoryReadmeInjector } from "./hooks/directory-readme-injector"
import { createEditErrorRecovery } from "./hooks/edit-error-recovery"
import { createEmptyMessageSanitizer } from "./hooks/empty-message-sanitizer"
import { createInteractiveBashSession } from "./hooks/interactive-bash-session"
import { createNonInteractiveEnv } from "./hooks/non-interactive-env"
import { createPreemptiveCompaction } from "./hooks/preemptive-compaction"
import { createSessionRecovery } from "./hooks/session-recovery"
import { createThinkingBlockValidator } from "./hooks/thinking-block-validator"
import { createCommentChecker } from "./hooks/comment-checker"

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

import { OpenCodeXConfigSchema } from "./config/schema"

function getSeaThemedAgents(): Record<string, AgentConfig> {
  return {
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
  };
}

const builtinTools: Record<string, ToolDefinition> = {
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
  "model-switcher": modelSwitcher,
  "opencode-x-compress": opencodeXCompress,
  "ralph-loop": ralphLoop,
}

/**
 * Merges multiple Hooks objects into one.
 * Function hooks are called sequentially.
 * Tool dictionaries are merged.
 */
function mergeHooks(...hooksList: Hooks[]): Hooks {
  const merged: Hooks = {};
  for (const hooks of hooksList) {
    if (!hooks) continue;
    for (const [key, value] of Object.entries(hooks)) {
      if (!value) continue;
      
      if (typeof value === "function") {
        const existing = merged[key as keyof Hooks];
        if (typeof existing === "function") {
          merged[key as keyof Hooks] = (async (input: any, output: any) => {
            await (existing as any)(input, output);
            await (value as any)(input, output);
          }) as any;
        } else {
          merged[key as keyof Hooks] = value as any;
        }
      } else if (key === "tool") {
        merged.tool = { ...merged.tool, ...value };
      } else if (key === "auth") {
        merged.auth = value as any;
      }
    }
  }
  return merged;
}

const createOpenCodeXPlugin: Plugin = async (input: PluginInput): Promise<Hooks> => {
  console.error("OpenCode-X: createOpenCodeXPlugin called");
  
  const hooks: Hooks[] = [];

  // 1. Basic tools
  hooks.push({ tool: builtinTools });

  // 2. Configuration Hook
  hooks.push({
    config: async (config: any) => {
      if (!config.agent) config.agent = {};
      const agents = getSeaThemedAgents();
      for (const [name, agentConfig] of Object.entries(agents)) {
        if (!config.agent[name]) config.agent[name] = agentConfig;
      }
      if (!config.default_agent && config.agent["Kraken"]) config.default_agent = "Kraken";
    }
  });

  // 3. Feature/Lifecycle Hooks
  try {
    hooks.push(createRalphLoopHook(input));
    hooks.push(createContextInjector(input));
    hooks.push(createKeywordDetector(input));
    hooks.push(createAutoSlashCommand(input));
    hooks.push(createRulesInjector(input));
    hooks.push(createAgentUsageReminder(input));
    hooks.push(createAnthropicContextWindowLimitRecovery(input));
    hooks.push(createAutoUpdateChecker(input));
    hooks.push(createClaudeCodeHooks(input));
    hooks.push(createCompactionContextInjector(input));
    hooks.push(createDirectoryAgentsInjector(input));
    hooks.push(createDirectoryReadmeInjector(input));
    hooks.push(createEditErrorRecovery(input));
    hooks.push(createEmptyMessageSanitizer(input));
    hooks.push(createInteractiveBashSession(input));
    hooks.push(createNonInteractiveEnv(input));
    hooks.push(createPreemptiveCompaction(input));
    hooks.push(createSessionRecovery(input));
    hooks.push(createThinkingBlockValidator(input));
    hooks.push(createCommentChecker(input));
    
    const backgroundAgent = createBackgroundAgentFeature(input);
    // Background agent is registered via the feature manager
  } catch (e) {
    console.error("OpenCode-X: Error initializing hooks", e);
  }

  return mergeHooks(...hooks);
};

export default createOpenCodeXPlugin;