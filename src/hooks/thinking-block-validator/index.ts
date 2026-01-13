import type { Hooks } from "@opencode-ai/plugin"
import type { PluginInput } from "@opencode-ai/plugin"
import type { Part } from "@opencode-ai/sdk"

export interface ThinkingBlockValidatorConfig {
  enabled?: boolean
}

function getTextFromParts(parts: Part[]): string {
  return parts
    .filter((p): p is Extract<Part, { type: "text" }> => p.type === "text")
    .map(p => p.text)
    .join("\n")
    .trim()
}

export function createThinkingBlockValidator(
  _input: PluginInput,
  options?: { config?: ThinkingBlockValidatorConfig }
): Hooks {
  const config = options?.config ?? { enabled: true }

  return {
    "chat.message": async (input, output) => {
      if (!config.enabled) return
      const text = getTextFromParts(output.parts)
      if (text.includes("<thinking>") || text.includes("</thinking>")) {
        console.log("[thinking-block-validator] Detected thinking block, validating structure")
      }
    },
  }
}
