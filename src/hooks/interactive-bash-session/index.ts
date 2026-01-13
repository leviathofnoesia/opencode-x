import type { Hooks } from "@opencode-ai/plugin"
import type { PluginInput } from "@opencode-ai/plugin"

export interface InteractiveBashSessionConfig {
  enabled?: boolean
}

export function createInteractiveBashSession(
  _input: PluginInput,
  options?: { config?: InteractiveBashSessionConfig }
): Hooks {
  const config = options?.config ?? { enabled: true }

  return {
    "tool.execute.before": async (input, output) => {
      if (!config.enabled) return
      if (input.tool === "bash") {
        console.log("[interactive-bash-session] Setting up interactive bash session")
      }
    },
  }
}
