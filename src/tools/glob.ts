import { tool } from "@opencode-ai/plugin"
import { z } from "zod"
import { glob as globAsync } from "glob"
import path from "node:path"

export const glob = tool({
  description:
    "Find files matching a glob pattern. Supports ** for directories, * for any characters, ? for single character. " +
    "Example: glob({pattern: '**/*.test.ts', ignore: 'node_modules/**'})",
  args: {
    pattern: z.string().describe("Glob pattern (e.g., 'src/**/*.ts', '**/*.json')"),
    ignore: z.array(z.string()).optional().describe("Patterns to ignore (e.g., ['node_modules/**', 'dist/**'])"),
    cwd: z.string().optional().describe("Working directory (default: current directory)"),
  },
  async execute(args) {
    const { pattern, ignore, cwd } = args

    try {
      const options: Parameters<typeof globAsync>[1] = {
        cwd: cwd || process.cwd(),
        absolute: true,
      }

      if (ignore && ignore.length > 0) {
        options.ignore = ignore
      }

      const files = await globAsync(pattern, options)

      return JSON.stringify(
        {
          success: true,
          files: files.slice(0, 500),
          count: files.length,
          message: files.length > 500 ? `Showing 500 of ${files.length} files` : undefined,
        },
        null,
        2
      )
    } catch (error) {
      return JSON.stringify(
        {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          pattern,
        },
        null,
        2
      )
    }
  },
})
