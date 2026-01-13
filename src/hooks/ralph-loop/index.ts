import type { Hooks } from "@opencode-ai/plugin"
import type { PluginInput } from "@opencode-ai/plugin"
import type { Part } from "@opencode-ai/sdk"

export interface RalphConfig {
  maxIterations?: number
  enabled?: boolean
}

export interface RalphSession {
  sessionID: string
  promise: string
  task: string
  maxIterations: number
  currentIteration: number
  status: "active" | "completed" | "maxed_out" | "cancelled"
  transcript: string[]
  startTime: number
}

const DEFAULT_MAX_ITERATIONS = 24

const RALPH_SYSTEM_PROMPT = `You are Ralph, a specialized iteration agent focused on achieving completion promises.

Your methodology:
1. Analyze the current state against the promise criteria
2. Identify gaps between current state and promised outcome
3. Execute targeted improvements to close those gaps
4. Re-evaluate against the promise

Remember: You complement Kraken's orchestration. Kraken plans the overall approach; you iterate until the specific promise is satisfied.`

const RALPH_ITERATION_PROMPT = `## Current Task
{prompt}

## Promise to Satisfy
<promise>{promise}</promise>

## Previous Iterations
{iterations}

## Instructions
1. Evaluate: Has the promise been satisfied?
2. If YES: Return "[RALPH_COMPLETE]" and explain how the promise was met
3. If NO: Identify what's missing and execute improvements, then return "[RALPH_CONTINUE]" with your next steps

Focus on the specific promise criteria. Don't re-plan the entire task—just iterate toward satisfaction.`

export function createRalphLoopHook(
  _ctx: PluginInput,
  options?: { config?: RalphConfig }
): Hooks {
  const config = options?.config ?? {}
  const maxIterations = config.maxIterations ?? DEFAULT_MAX_ITERATIONS
  const enabled = config.enabled ?? true

  const sessions = new Map<string, RalphSession>()

  function extractPromise(text: string): { promise: string; task: string } | null {
    const promiseMatch = text.match(/<promise>\s*([\s\S]*?)\s*<\/promise>/i)
    if (!promiseMatch) return null

    const promise = promiseMatch[1].trim()

    const taskMatch = text.match(/<user-task>\s*([\s\S]*?)\s*<\/user-task>/i)
    const task = taskMatch ? taskMatch[1].trim() : text.split("<promise>")[0].trim()

    return { promise, task }
  }

  function getSession(sessionID: string): RalphSession | undefined {
    return sessions.get(sessionID)
  }

  function createSession(
    sessionID: string,
    promise: string,
    task: string
  ): RalphSession {
    const session: RalphSession = {
      sessionID,
      promise,
      task,
      maxIterations,
      currentIteration: 0,
      status: "active",
      transcript: [],
      startTime: Date.now(),
    }
    sessions.set(sessionID, session)
    return session
  }

  function formatIterations(session: RalphSession): string {
    if (session.currentIteration === 0) {
      return "No previous iterations."
    }

    const iterations = session.transcript
      .slice(-session.currentIteration * 2)
      .join("\n---\n")

    return iterations || `Iteration ${session.currentIteration} completed.`
  }

  function generateIterationPrompt(session: RalphSession): string {
    return RALPH_ITERATION_PROMPT.replace("{prompt}", session.task)
      .replace("{promise}", session.promise)
      .replace("{iterations}", formatIterations(session))
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
      if (!enabled) return

      const { sessionID } = input
      const promptText = getTextFromParts(output.parts)

      if (!promptText) return

      const promiseMatch = extractPromise(promptText)
      if (!promiseMatch) return

      const { promise, task } = promiseMatch

      const existingSession = getSession(sessionID)
      if (existingSession && existingSession.status === "active") {
        existingSession.currentIteration++
        existingSession.transcript.push(`Iteration ${existingSession.currentIteration}:\n${promptText}`)

        if (existingSession.currentIteration >= existingSession.maxIterations) {
          existingSession.status = "maxed_out"
          console.log(`[ralph-loop] Session ${sessionID} reached max iterations (${maxIterations})`)
          return
        }

        const continuation = generateIterationPrompt(existingSession)
        console.log(`[ralph-loop] Continuing iteration ${existingSession.currentIteration}/${maxIterations} for session ${sessionID}`)
        return
      }

      const newSession = createSession(sessionID, promise, task)
      console.log(`[ralph-loop] Starting new session ${sessionID} with promise: "${promise.substring(0, 50)}..."`)
    },

    "tool.execute.after": async (input, output) => {
      if (!enabled) return
      if (input.tool !== "task") return

      const session = getSession(input.sessionID)
      if (!session || session.status !== "active") return

      const toolOutput = output.output ?? ""
      if (!toolOutput) return

      const completePattern = /<RALPH_COMPLETE>/i
      const continuePattern = /<RALPH_CONTINUE>/i

      if (completePattern.test(toolOutput)) {
        session.status = "completed"
        const elapsed = Date.now() - session.startTime
        console.log(`[ralph-loop] Session ${input.sessionID} completed in ${session.currentIteration} iterations (${elapsed}ms)`)
      } else if (continuePattern.test(toolOutput)) {
        console.log(`[ralph-loop] Session ${input.sessionID} continuing to iteration ${session.currentIteration + 1}`)
      }
    },
  }
}

export function getRalphSessionStatus(sessionID: string): RalphSession | undefined {
  return undefined
}

export function cancelRalphSession(_sessionID: string): boolean {
  return false
}

export { RALPH_SYSTEM_PROMPT, DEFAULT_MAX_ITERATIONS }
