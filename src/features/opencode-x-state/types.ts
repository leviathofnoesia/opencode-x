/**
 * OpenCode-X State Types
 *
 * Defines the shape of persisted state for workflows, sessions, and projects.
 */

export const OPENCODE_X_DIR = ".opencode-x"
export const STATE_FILE = "state.json"
export const WORKFLOWS_DIR = "workflows"

export type OpenCodeXState = {
  version: string
  lastUpdated: string
  activeWorkflow?: ActiveWorkflowState
  workflows: Record<string, WorkflowState>
  sessions: Record<string, SessionState>
  project: ProjectState
}

export type ActiveWorkflowState = {
  workflowId: string
  currentTaskId: string
  startedAt: string
  lastActivityAt: string
}

export type WorkflowState = {
  id: string
  name: string
  description: string
  filePath: string
  status: WorkflowStatus
  createdAt: string
  updatedAt: string
  completedAt?: string
  tasks: Record<string, TaskState>
  metadata: Record<string, unknown>
}

export type WorkflowStatus =
  | "pending"
  | "in_progress"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled"

export type TaskState = {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dependencies: string[]
  assignedAgent?: string
  startedAt?: string
  completedAt?: string
  metadata: Record<string, unknown>
  results?: TaskResult
}

export type TaskStatus =
  | "pending"
  | "in_progress"
  | "waiting"
  | "completed"
  | "failed"
  | "cancelled"
  | "skipped"

export type TaskPriority = "high" | "medium" | "low"

export type TaskResult = {
  success: boolean
  output?: string
  filesModified?: string[]
  error?: string
  completedAt: string
}

export type SessionState = {
  id: string
  agent: string
  model: string
  startedAt: string
  lastActivityAt: string
  messages: number
  tokensUsed?: number
}

export type ProjectState = {
  name: string
  path: string
  createdAt: string
  lastOpenedAt: string
  totalWorkflows: number
  completedWorkflows: number
}

export function createInitialState(projectPath: string, projectName: string): OpenCodeXState {
  return {
    version: "1.0.0",
    lastUpdated: new Date().toISOString(),
    workflows: {},
    sessions: {},
    project: {
      name: projectName,
      path: projectPath,
      createdAt: new Date().toISOString(),
      lastOpenedAt: new Date().toISOString(),
      totalWorkflows: 0,
      completedWorkflows: 0,
    },
  }
}

export function createWorkflowState(
  id: string,
  name: string,
  description: string,
  filePath: string,
  tasks: Record<string, TaskState>
): WorkflowState {
  const now = new Date().toISOString()
  return {
    id,
    name,
    description,
    filePath,
    status: "pending",
    createdAt: now,
    updatedAt: now,
    tasks,
    metadata: {},
  }
}

export function createTaskState(
  id: string,
  title: string,
  description: string,
  priority: TaskPriority = "medium",
  dependencies: string[] = []
): TaskState {
  return {
    id,
    title,
    description,
    status: "pending",
    priority,
    dependencies,
    metadata: {},
  }
}

export function createSessionState(
  id: string,
  agent: string,
  model: string
): SessionState {
  const now = new Date().toISOString()
  return {
    id,
    agent,
    model,
    startedAt: now,
    lastActivityAt: now,
    messages: 0,
  }
}
