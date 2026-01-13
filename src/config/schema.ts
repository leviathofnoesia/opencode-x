import { z } from "zod"

export const OpenCodeXBuiltinAgentNameSchema = z.enum([
  "Kraken",
  "Maelstrom",
  "Nautilus",
  "Abyssal",
  "Coral",
  "Siren",
  "Leviathan",
  "Poseidon (Plan Consultant)",
  "Scylla (Plan Reviewer)",
  "Pearl",
])

export const OpenCodeXHookNameSchema = z.enum([
  "ralph-loop",
  "think-mode",
  "context-window-monitor",
  "session-recovery",
  "comment-checker",
  "keyword-detector",
  "auto-slash-command",
  "directory-agents-injector",
  "directory-readme-injector",
  "rules-injector",
  "preemptive-compaction",
  "compaction-context-injector",
  "edit-error-recovery",
  "empty-message-sanitizer",
  "thinking-block-validator",
])

export const OpenCodeXBuiltinCommandNameSchema = z.enum([
  "init-deep",
])

export const AgentPermissionSchema = z.object({
  edit: z.enum(["allow", "ask", "deny"]).default("ask"),
  bash: z.union([
    z.enum(["allow", "ask", "deny"]),
    z.record(z.string(), z.enum(["allow", "ask", "deny"])),
  ]).default("ask"),
  webfetch: z.enum(["allow", "ask", "deny"]).default("ask"),
  doom_loop: z.enum(["allow", "ask", "deny"]).default("ask"),
  external_directory: z.enum(["allow", "ask", "deny"]).default("ask"),
})

export const AgentOverrideConfigSchema = z.object({
  model: z.string().optional(),
  temperature: z.number().optional(),
  top_p: z.number().optional(),
  prompt: z.string().optional(),
  prompt_append: z.string().optional(),
  tools: z.record(z.string(), z.boolean()).optional(),
  disable: z.boolean().optional(),
  description: z.string().optional(),
  mode: z.enum(["subagent", "primary", "all"]).optional(),
  color: z.string().optional(),
  permission: AgentPermissionSchema.optional(),
})

export const AgentOverridesSchema = z.object({
  Kraken: AgentOverrideConfigSchema.optional(),
  Maelstrom: AgentOverrideConfigSchema.optional(),
  Nautilus: AgentOverrideConfigSchema.optional(),
  Abyssal: AgentOverrideConfigSchema.optional(),
  Coral: AgentOverrideConfigSchema.optional(),
  Siren: AgentOverrideConfigSchema.optional(),
  Leviathan: AgentOverrideConfigSchema.optional(),
  "Poseidon (Plan Consultant)": AgentOverrideConfigSchema.optional(),
  "Scylla (Plan Reviewer)": AgentOverrideConfigSchema.optional(),
  Pearl: AgentOverrideConfigSchema.optional(),
})

export const RalphLoopConfigSchema = z.object({
  enabled: z.boolean().default(true),
  default_max_iterations: z.number().default(24),
  state_dir: z.string().optional(),
})

export const BackgroundTaskConfigSchema = z.object({
  defaultConcurrency: z.number().optional(),
  providerConcurrency: z.record(z.string(), z.number()).optional(),
  modelConcurrency: z.record(z.string(), z.number()).optional(),
})

export const ThinkModeConfigSchema = z.object({
  enabled: z.boolean().default(true),
  model: z.string().optional(),
  thinkingBudget: z.number().optional(),
})

export const CompressionConfigSchema = z.object({
  enabled: z.boolean().default(true),
  level: z.enum(["cache_hit", "partial", "full"]).default("partial"),
})

export const OpenCodeXConfigSchema = z.object({
  $schema: z.string().optional(),
  disabled_hooks: z.array(OpenCodeXHookNameSchema).optional(),
  disabled_commands: z.array(OpenCodeXBuiltinCommandNameSchema).optional(),
  agents: AgentOverridesSchema.optional(),
  ralphLoop: RalphLoopConfigSchema.optional(),
  backgroundTask: BackgroundTaskConfigSchema.optional(),
  thinkMode: ThinkModeConfigSchema.optional(),
  compression: CompressionConfigSchema.optional(),
  enhanced: z.object({
    enabled: z.boolean().default(true),
    keywords: z.array(z.string()).default(["enhanced", "max", "full"]),
    searchKeywords: z.array(z.string()).default(["search", "find", "locate"]),
    analyzeKeywords: z.array(z.string()).default(["analyze", "examine"]),
    thinkKeywords: z.array(z.string()).default(["think", "reason"]),
  }).optional(),
})

export type OpenCodeXConfig = z.infer<typeof OpenCodeXConfigSchema>
export type OpenCodeXBuiltinAgentName = z.infer<typeof OpenCodeXBuiltinAgentNameSchema>
export type OpenCodeXHookName = z.infer<typeof OpenCodeXHookNameSchema>
export type OpenCodeXBuiltinCommandName = z.infer<typeof OpenCodeXBuiltinCommandNameSchema>
export type AgentOverrideConfig = z.infer<typeof AgentOverrideConfigSchema>
export type AgentOverrides = z.infer<typeof AgentOverridesSchema>
export type RalphLoopConfig = z.infer<typeof RalphLoopConfigSchema>
export type BackgroundTaskConfig = z.infer<typeof BackgroundTaskConfigSchema>
export type ThinkModeConfig = z.infer<typeof ThinkModeConfigSchema>
export type CompressionConfig = z.infer<typeof CompressionConfigSchema>
