import { tool } from "@opencode-ai/plugin"
import { z } from "zod"

export interface SessionInfo {
  sessionID: string
  created: string
  lastActive: string
  messageCount: number
  agent?: string
}

export const session_list = tool({
  description: "List all OpenCode sessions with their metadata.",
  args: {},
  async execute() {
    return JSON.stringify({
      success: true,
      sessions: [],
      message: "Session storage not configured. Sessions are managed by the OpenCode server.",
    }, null, 2)
  },
})

export const session_read = tool({
  description: "Read messages from a specific session.",
  args: {
    sessionID: z.string().describe("Session ID to read from"),
    limit: z.number().optional().describe("Maximum number of messages to return (default: 50)"),
  },
  async execute(args) {
    const { sessionID, limit } = args
    return JSON.stringify({
      success: false,
      message: "Session access requires OpenCode server connection.",
      sessionID,
      limit: limit || 50,
    }, null, 2)
  },
})

export const session_search = tool({
  description: "Search for sessions containing specific text or matching patterns.",
  args: {
    query: z.string().describe("Text to search for in sessions"),
  },
  async execute(args) {
    const { query } = args
    return JSON.stringify({
      success: false,
      message: "Session search requires OpenCode server connection.",
      query,
    }, null, 2)
  },
})

export const session_info = tool({
  description: "Get detailed metadata about a specific session.",
  args: {
    sessionID: z.string().describe("Session ID to query"),
  },
  async execute(args) {
    const { sessionID } = args
    return JSON.stringify({
      success: false,
      message: "Session info requires OpenCode server connection.",
      sessionID,
    }, null, 2)
  },
})
