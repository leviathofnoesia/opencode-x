import type { Hooks } from "@opencode-ai/plugin"
import type { PluginInput } from "@opencode-ai/plugin"
import type { Part } from "@opencode-ai/sdk"

export interface EmptyMessageSanitizerConfig {
  enabled?: boolean
}

function getTextFromParts(parts: Part[]): string {
  return parts
    .filter((p): p is Extract<Part, { type: "text" }> => p.type === "text")
    .map(p => p.text)
    .join("\n")
    .trim()
}

export function createEmptyMessageSanitizer(
  _input: PluginInput,
  options?: { config?: EmptyMessageSanitizerConfig }
): Hooks {
  const config = options?.config ?? { enabled: true }

  return {
    "chat.message": async (input, output) => {
      if (!config.enabled) return
      const text = getTextFromParts(output.parts)
      if (!text || text.length === 0) {
        console.log("[empty-message-sanitizer] Detected empty message, sanitizing")
      }
    },
  }
}
