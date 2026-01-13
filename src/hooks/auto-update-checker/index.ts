import type { Hooks } from "@opencode-ai/plugin"
import type { PluginInput } from "@opencode-ai/plugin"

export interface AutoUpdateCheckerConfig {
  enabled?: boolean
  cacheDir?: string
}

export function createAutoUpdateChecker(
  _input: PluginInput,
  options?: { config?: AutoUpdateCheckerConfig }
): Hooks {
  const config = options?.config ?? { enabled: true }

  return {
    event: async (input) => {
      if (!config.enabled) return
      if (input.event?.type === "installation.updated") {
        console.log("[auto-update-checker] Installation was updated")
      }
      if (input.event?.type === "installation.update-available") {
        console.log("[auto-update-checker] New update available")
      }
    },
  }
}
