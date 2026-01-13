import type { Hooks } from "@opencode-ai/plugin"
import type { PluginInput } from "@opencode-ai/plugin"
import type { Part } from "@opencode-ai/sdk"

export interface CommentCheckerConfig {
  enabled?: boolean
  customPrompt?: string
}

const DEFAULT_COMMENT_PATTERNS = [
  { pattern: /TODO:/i, type: "todo" },
  { pattern: /FIXME:/i, type: "fixme" },
  { pattern: /XXX:/i, type: "note" },
  { pattern: /HACK:/i, type: "hack" },
  { pattern: /NOTE:/i, type: "note" },
  { pattern: /BUG:/i, type: "bug" },
]

function getTextFromParts(parts: Part[]): string {
  return parts
    .filter((p): p is Extract<Part, { type: "text" }> => p.type === "text")
    .map(p => p.text)
    .join("\n")
    .trim()
}

export function createCommentChecker(
  _input: PluginInput,
  options?: { config?: CommentCheckerConfig }
): Hooks {
  const config = options?.config ?? { enabled: true }

  return {
    "chat.message": async (input, output) => {
      if (!config.enabled) return
      const text = getTextFromParts(output.parts)

      const comments: Array<{ type: string; line: number; text: string }> = []

      for (const { pattern, type } of DEFAULT_COMMENT_PATTERNS) {
        const lines = text.split("\n")
        lines.forEach((line, index) => {
          if (pattern.test(line)) {
            comments.push({
              type,
              line: index + 1,
              text: line.trim(),
            })
          }
        })
      }

      if (comments.length > 0) {
        console.log(`[comment-checker] Found ${comments.length} annotated comments`)
      }
    },
  }
}
