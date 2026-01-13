import type { Hooks } from "@opencode-ai/plugin"
import type { PluginInput } from "@opencode-ai/plugin"
import type { Part } from "@opencode-ai/sdk"

export interface KeywordDetectorConfig {
  enabled?: boolean
  keywords?: Record<string, string>
}

export function createKeywordDetector(
  _input: PluginInput,
  options?: { config?: KeywordDetectorConfig }
): Hooks {
  const config = options?.config ?? {
    enabled: true,
    keywords: {
      "[BUILD]": "build",
      "[PLAN]": "plan",
      "[RESEARCH]": "research",
      "[DOCS]": "docs",
      "[REVIEW]": "review",
    },
  }

  function getTextFromParts(parts: Part[]): string {
    return parts
      .filter((p): p is Extract<Part, { type: "text" }> => p.type === "text")
      .map(p => p.text)
      .join("\n")
      .trim()
  }

  return {
    "chat.message": async (input, output) => {
      if (!config.enabled) return

      const text = getTextFromParts(output.parts)
      if (!text) return

      for (const [marker, agent] of Object.entries(config.keywords || {})) {
        if (text.includes(marker)) {
          console.log(`[keyword-detector] Detected ${marker}, suggesting agent: ${agent}`)
        }
      }
    },
  }
}
