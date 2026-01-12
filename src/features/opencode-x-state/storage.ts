/**
 * OpenCode-X State Storage
 *
 * Handles reading/writing state.json for workflow and session tracking.
 */

import {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  rmSync,
} from "node:fs"
import { dirname, join, basename } from "node:path"
import type {
  OpenCodeXState,
  WorkflowState,
  TaskState,
  SessionState,
  ActiveWorkflowState,
} from "./types"
import {
  OPENCODE_X_DIR,
  STATE_FILE,
  STATE_VERSION,
  WORKFLOWS_DIR,
} from "./constants"

export function getStateFilePath(directory: string): string {
  return join(directory, OPENCODE_X_DIR, STATE_FILE)
}

export function getWorkflowsDirPath(directory: string): string {
  return join(directory, OPENCODE_X_DIR, WORKFLOWS_DIR)
}

export function readState(directory: string): OpenCodeXState | null {
  const filePath = getStateFilePath(directory)

  if (!existsSync(filePath)) {
    return null
  }

  try {
    const content = readFileSync(filePath, "utf-8")
    const state = JSON.parse(content) as OpenCodeXState

    if (state.version !== STATE_VERSION) {
      console.warn(`State file version mismatch: ${state.version} != ${STATE_VERSION}`)
    }

    return state
  } catch (error) {
    console.error("Failed to read state file:", error)
    return null
  }
}

export function writeState(directory: string, state: OpenCodeXState): boolean {
  const filePath = getStateFilePath(directory)

  try {
    const dir = dirname(filePath)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }

    state.lastUpdated = new Date().toISOString()
    writeFileSync(filePath, JSON.stringify(state, null, 2), "utf-8")
    return true
  } catch (error) {
    console.error("Failed to write state file:", error)
    return false
  }
}

export function createState(
  directory: string,
  projectName: string
): OpenCodeXState {
  const state: OpenCodeXState = {
    version: STATE_VERSION,
    lastUpdated: new Date().toISOString(),
    workflows: {},
    sessions: {},
    project: {
      name: projectName,
      path: directory,
      createdAt: new Date().toISOString(),
      lastOpenedAt: new Date().toISOString(),
      totalWorkflows: 0,
      completedWorkflows: 0,
    },
  }

  writeState(directory, state)
  return state
}

export function getOrCreateState(directory: string, projectName: string): OpenCodeXState {
  const existing = readState(directory)
  if (existing) {
    existing.project.lastOpenedAt = new Date().toISOString()
    return existing
  }

  return createState(directory, projectName)
}

export function clearState(directory: string): boolean {
  const filePath = getStateFilePath(directory)

  try {
    if (existsSync(filePath)) {
      rmSync(filePath)
    }
    return true
  } catch (error) {
    console.error("Failed to clear state file:", error)
    return false
  }
}

export function getActiveWorkflow(directory: string): ActiveWorkflowState | null {
  const state = readState(directory)
  return state?.activeWorkflow ?? null
}

export function setActiveWorkflow(
  directory: string,
  workflowId: string,
  taskId: string
): boolean {
  const state = readState(directory)
  if (!state) return false

  state.activeWorkflow = {
    workflowId,
    currentTaskId: taskId,
    startedAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
  }

  return writeState(directory, state)
}

export function clearActiveWorkflow(directory: string): boolean {
  const state = readState(directory)
  if (!state) return false

  delete state.activeWorkflow
  return writeState(directory, state)
}

export function addWorkflow(
  directory: string,
  workflow: WorkflowState
): boolean {
  const state = readState(directory)
  if (!state) return false

  state.workflows[workflow.id] = workflow
  state.project.totalWorkflows = Object.keys(state.workflows).length

  return writeState(directory, state)
}

export function updateWorkflow(
  directory: string,
  workflowId: string,
  updates: Partial<WorkflowState>
): boolean {
  const state = readState(directory)
  if (!state || !state.workflows[workflowId]) return false

  state.workflows[workflowId] = {
    ...state.workflows[workflowId],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  return writeState(directory, state)
}

export function getWorkflow(directory: string, workflowId: string): WorkflowState | null {
  const state = readState(directory)
  return state?.workflows[workflowId] ?? null
}

export function getAllWorkflows(directory: string): WorkflowState[] {
  const state = readState(directory)
  if (!state) return []

  return Object.values(state.workflows)
}

export function updateTask(
  directory: string,
  workflowId: string,
  taskId: string,
  updates: Partial<TaskState>
): boolean {
  const state = readState(directory)
  if (!state || !state.workflows[workflowId]?.tasks[taskId]) return false

  state.workflows[workflowId].tasks[taskId] = {
    ...state.workflows[workflowId].tasks[taskId],
    ...updates,
  }
  state.workflows[workflowId].updatedAt = new Date().toISOString()

  return writeState(directory, state)
}

export function addSession(
  directory: string,
  session: SessionState
): boolean {
  const state = readState(directory)
  if (!state) return false

  state.sessions[session.id] = session
  return writeState(directory, state)
}

export function updateSession(
  directory: string,
  sessionId: string,
  updates: Partial<SessionState>
): boolean {
  const state = readState(directory)
  if (!state || !state.sessions[sessionId]) return false

  state.sessions[sessionId] = {
    ...state.sessions[sessionId],
    ...updates,
    lastActivityAt: new Date().toISOString(),
  }

  return writeState(directory, state)
}

export function getSession(directory: string, sessionId: string): SessionState | null {
  const state = readState(directory)
  return state?.sessions[sessionId] ?? null
}

export function getAllSessions(directory: string): SessionState[] {
  const state = readState(directory)
  if (!state) return []

  return Object.values(state.sessions)
}

export function incrementSessionMessages(directory: string, sessionId: string): boolean {
  const state = readState(directory)
  if (!state || !state.sessions[sessionId]) return false

  state.sessions[sessionId].messages++
  state.sessions[sessionId].lastActivityAt = new Date().toISOString()

  return writeState(directory, state)
}

export function getProjectStats(directory: string): {
  totalWorkflows: number
  completedWorkflows: number
  activeWorkflows: number
  totalSessions: number
} {
  const state = readState(directory)
  if (!state) {
    return { totalWorkflows: 0, completedWorkflows: 0, activeWorkflows: 0, totalSessions: 0 }
  }

  const workflows = Object.values(state.workflows)
  return {
    totalWorkflows: workflows.length,
    completedWorkflows: workflows.filter((w) => w.status === "completed").length,
    activeWorkflows: workflows.filter((w) => w.status === "in_progress").length,
    totalSessions: Object.keys(state.sessions).length,
  }
}

export function findWorkflowFiles(directory: string): string[] {
  const workflowsDir = getWorkflowsDirPath(directory)

  if (!existsSync(workflowsDir)) {
    return []
  }

  try {
    const files = readdirSync(workflowsDir)
    return files
      .filter((f) => f.endsWith(".json") || f.endsWith(".md"))
      .map((f) => join(workflowsDir, f))
  } catch {
    return []
  }
}

export function resumeWorkflow(directory: string, workflowId: string): {
  workflow: WorkflowState | null
  currentTask: TaskState | null
} {
  const workflow = getWorkflow(directory, workflowId)
  if (!workflow) {
    return { workflow: null, currentTask: null }
  }

  const state = readState(directory)
  const activeTaskId = state?.activeWorkflow?.currentTaskId
  const currentTask = activeTaskId ? workflow.tasks[activeTaskId] : null

  return { workflow, currentTask }
}
