import type { Hooks } from "@opencode-ai/plugin"
import type { PluginInput } from "@opencode-ai/plugin"

export interface SessionRecoveryConfig {
  enabled?: boolean
}

export function createSessionRecovery(
  _input: PluginInput,
  options?: { config?: SessionRecoveryConfig }
): Hooks {
  const config = options?.config ?? { enabled: true }

  return {
    "chat.message": async (input, output) => {
      if (!config.enabled) return
      console.log("[session-recovery] Checking for recoverable session state")
    },
  }
}
