/**
 * State Persistence E2E Tests
 */

import { describe, test, expect, beforeAll, afterAll } from "bun:test"
import { tmpdir } from "node:os"
import { mkdirSync, rmSync, existsSync } from "node:fs"
import { join } from "node:path"
import {
  readState,
  writeState,
  createState,
  getOrCreateState,
  addWorkflow,
  getWorkflow,
  updateWorkflow,
  addSession,
  getSession,
  updateSession,
  incrementSessionMessages,
  getProjectStats,
  clearState,
  getActiveWorkflow,
  setActiveWorkflow,
  clearActiveWorkflow,
} from "../src/features/opencode-x-state/storage"
import type {
  WorkflowState,
  SessionState,
} from "../src/features/opencode-x-state/types"

describe("state-persistence", () => {
  const testDir = join(tmpdir(), "opencode-x-state-test-" + Date.now())

  beforeAll(() => {
    mkdirSync(testDir, { recursive: true })
  })

  afterAll(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  test("createState initializes state file", () => {
    const state = createState(testDir, "test-project")
    expect(state).toBeDefined()
    expect(state.version).toBe("1.0.0")
    expect(state.project.name).toBe("test-project")
    expect(state.workflows).toEqual({})
    expect(state.sessions).toEqual({})
  })

  test("readState returns null for non-existent state", () => {
    const nonExistentDir = join(testDir, "non-existent")
    const state = readState(nonExistentDir)
    expect(state).toBeNull()
  })

  test("getOrCreateState returns existing state", () => {
    const state1 = getOrCreateState(testDir, "test-project")
    const state2 = getOrCreateState(testDir, "test-project")
    expect(state1).toEqual(state2)
  })

  test("addWorkflow adds workflow to state", () => {
    const workflow: WorkflowState = {
      id: "wf-1",
      name: "Test Workflow",
      description: "A test workflow",
      filePath: join(testDir, "workflow.json"),
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: {},
      metadata: {},
    }
    const result = addWorkflow(testDir, workflow)
    expect(result).toBe(true)

    const saved = getWorkflow(testDir, "wf-1")
    expect(saved).not.toBeNull()
    expect(saved?.name).toBe("Test Workflow")
    expect(saved?.status).toBe("pending")
  })

  test("updateWorkflow updates existing workflow", () => {
    const result = updateWorkflow(testDir, "wf-1", {
      status: "in_progress",
    })
    expect(result).toBe(true)

    const saved = getWorkflow(testDir, "wf-1")
    expect(saved?.status).toBe("in_progress")
  })

  test("addSession adds session to state", () => {
    const session: SessionState = {
      id: "session-1",
      agent: "Kraken",
      model: "claude-opus-4-5",
      startedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      messages: 0,
    }
    const result = addSession(testDir, session)
    expect(result).toBe(true)

    const saved = getSession(testDir, "session-1")
    expect(saved).not.toBeNull()
    expect(saved?.agent).toBe("Kraken")
    expect(saved?.messages).toBe(0)
  })

  test("incrementSessionMessages increases message count", () => {
    const result = incrementSessionMessages(testDir, "session-1")
    expect(result).toBe(true)

    const saved = getSession(testDir, "session-1")
    expect(saved?.messages).toBe(1)
  })

  test("updateSession updates session fields", () => {
    const result = updateSession(testDir, "session-1", {
      tokensUsed: 1000,
    })
    expect(result).toBe(true)

    const saved = getSession(testDir, "session-1")
    expect(saved?.tokensUsed).toBe(1000)
  })

  test("getProjectStats returns correct statistics", () => {
    const stats = getProjectStats(testDir)
    expect(stats.totalWorkflows).toBe(1)
    expect(stats.completedWorkflows).toBe(0)
    expect(stats.activeWorkflows).toBe(1)
    expect(stats.totalSessions).toBe(1)
  })

  test("setActiveWorkflow and getActiveWorkflow work", () => {
    const result = setActiveWorkflow(testDir, "wf-1", "task-1")
    expect(result).toBe(true)

    const active = getActiveWorkflow(testDir)
    expect(active).not.toBeNull()
    expect(active?.workflowId).toBe("wf-1")
    expect(active?.currentTaskId).toBe("task-1")
  })

  test("clearActiveWorkflow removes active workflow", () => {
    const result = clearActiveWorkflow(testDir)
    expect(result).toBe(true)

    const active = getActiveWorkflow(testDir)
    expect(active).toBeNull()
  })

  test("clearState removes state file", () => {
    const result = clearState(testDir)
    expect(result).toBe(true)

    const state = readState(testDir)
    expect(state).toBeNull()
  })
})
