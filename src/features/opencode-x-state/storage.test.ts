import { describe, expect, test, beforeEach, afterEach } from "bun:test"
import { existsSync, mkdirSync, rmSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import {
  readState,
  writeState,
  createState,
  getOrCreateState,
  clearState,
  getActiveWorkflow,
  setActiveWorkflow,
  clearActiveWorkflow,
  addWorkflow,
  updateWorkflow,
  getWorkflow,
  getAllWorkflows,
  updateTask,
  addSession,
  updateSession,
  getSession,
  getAllSessions,
  incrementSessionMessages,
  getProjectStats,
} from "./storage"
import type { WorkflowState, SessionState } from "./types"

describe("opencode-x-state", () => {
  const TEST_DIR = join(tmpdir(), "opencode-x-state-test-" + Date.now())
  const PROJECT_NAME = "test-project"

  beforeEach(() => {
    if (!existsSync(TEST_DIR)) {
      mkdirSync(TEST_DIR, { recursive: true })
    }
    clearState(TEST_DIR)
  })

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true })
    }
  })

  describe("readState / writeState", () => {
    test("should return null when no state file exists", () => {
      const result = readState(TEST_DIR)
      expect(result).toBeNull()
    })

    test("should write and read state successfully", () => {
      const state = createState(TEST_DIR, PROJECT_NAME)
      expect(state.version).toBe("1.0.0")
      expect(state.project.name).toBe(PROJECT_NAME)

      const readBack = readState(TEST_DIR)
      expect(readBack).not.toBeNull()
      expect(readBack!.project.name).toBe(PROJECT_NAME)
    })

    test("should clear state successfully", () => {
      createState(TEST_DIR, PROJECT_NAME)
      expect(existsSync(join(TEST_DIR, ".opencode-x", "state.json"))).toBe(true)

      const cleared = clearState(TEST_DIR)
      expect(cleared).toBe(true)
      expect(readState(TEST_DIR)).toBeNull()
    })
  })

  describe("getOrCreateState", () => {
    test("should create state if none exists", () => {
      const state = getOrCreateState(TEST_DIR, PROJECT_NAME)
      expect(state.project.name).toBe(PROJECT_NAME)
      expect(state.workflows).toEqual({})
      expect(state.sessions).toEqual({})
    })

    test("should return existing state if exists", () => {
      createState(TEST_DIR, PROJECT_NAME)
      const state = getOrCreateState(TEST_DIR, "different-name")
      expect(state.project.name).toBe(PROJECT_NAME)
    })
  })

  describe("workflow management", () => {
    test("should add workflow successfully", () => {
      createState(TEST_DIR, PROJECT_NAME)

      const workflow: WorkflowState = {
        id: "wf-1",
        name: "Test Workflow",
        description: "A test workflow",
        filePath: "/test/workflow.md",
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tasks: {},
        metadata: {},
      }

      const added = addWorkflow(TEST_DIR, workflow)
      expect(added).toBe(true)

      const retrieved = getWorkflow(TEST_DIR, "wf-1")
      expect(retrieved).not.toBeNull()
      expect(retrieved!.name).toBe("Test Workflow")
    })

    test("should update workflow successfully", () => {
      createState(TEST_DIR, PROJECT_NAME)
      const workflow: WorkflowState = {
        id: "wf-1",
        name: "Original",
        description: "Desc",
        filePath: "/test.md",
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tasks: {},
        metadata: {},
      }
      addWorkflow(TEST_DIR, workflow)

      const updated = updateWorkflow(TEST_DIR, "wf-1", {
        name: "Updated",
        status: "in_progress",
      })

      expect(updated).toBe(true)

      const retrieved = getWorkflow(TEST_DIR, "wf-1")
      expect(retrieved!.name).toBe("Updated")
      expect(retrieved!.status).toBe("in_progress")
    })

    test("should get all workflows", () => {
      createState(TEST_DIR, PROJECT_NAME)

      addWorkflow(TEST_DIR, {
        id: "wf-1",
        name: "Workflow 1",
        description: "",
        filePath: "/test1.md",
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tasks: {},
        metadata: {},
      })

      addWorkflow(TEST_DIR, {
        id: "wf-2",
        name: "Workflow 2",
        description: "",
        filePath: "/test2.md",
        status: "completed",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tasks: {},
        metadata: {},
      })

      const all = getAllWorkflows(TEST_DIR)
      expect(all).toHaveLength(2)
    })

    test("should update task within workflow", () => {
      createState(TEST_DIR, PROJECT_NAME)

      const workflow: WorkflowState = {
        id: "wf-1",
        name: "Test",
        description: "",
        filePath: "/test.md",
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tasks: {
          "task-1": {
            id: "task-1",
            title: "Task 1",
            description: "Do something",
            status: "pending",
            priority: "high",
            dependencies: [],
            metadata: {},
          },
        },
        metadata: {},
      }
      addWorkflow(TEST_DIR, workflow)

      const updated = updateTask(TEST_DIR, "wf-1", "task-1", {
        status: "completed",
      })

      expect(updated).toBe(true)

      const workflowState = getWorkflow(TEST_DIR, "wf-1")
      expect(workflowState!.tasks["task-1"].status).toBe("completed")
    })
  })

  describe("session management", () => {
    test("should add session successfully", () => {
      createState(TEST_DIR, PROJECT_NAME)
      const session: SessionState = {
        id: "session-1",
        agent: "Kraken",
        model: "claude-opus-4-5",
        startedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
        messages: 0,
      }

      const added = addSession(TEST_DIR, session)
      expect(added).toBe(true)

      const retrieved = getSession(TEST_DIR, "session-1")
      expect(retrieved).not.toBeNull()
      expect(retrieved!.agent).toBe("Kraken")
    })

    test("should update session successfully", () => {
      createState(TEST_DIR, PROJECT_NAME)
      const session: SessionState = {
        id: "session-1",
        agent: "Kraken",
        model: "claude-opus-4-5",
        startedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
        messages: 0,
      }
      addSession(TEST_DIR, session)

      const updated = updateSession(TEST_DIR, "session-1", {
        messages: 5,
        tokensUsed: 10000,
      })

      expect(updated).toBe(true)

      const retrieved = getSession(TEST_DIR, "session-1")
      expect(retrieved!.messages).toBe(5)
      expect(retrieved!.tokensUsed).toBe(10000)
    })

    test("should increment session messages", () => {
      createState(TEST_DIR, PROJECT_NAME)
      const session: SessionState = {
        id: "session-1",
        agent: "Kraken",
        model: "claude-opus-4-5",
        startedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
        messages: 0,
      }
      addSession(TEST_DIR, session)

      incrementSessionMessages(TEST_DIR, "session-1")
      incrementSessionMessages(TEST_DIR, "session-1")

      const retrieved = getSession(TEST_DIR, "session-1")
      expect(retrieved!.messages).toBe(2)
    })

    test("should get all sessions", () => {
      createState(TEST_DIR, PROJECT_NAME)

      addSession(TEST_DIR, {
        id: "s1",
        agent: "Kraken",
        model: "claude",
        startedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
        messages: 0,
      })

      addSession(TEST_DIR, {
        id: "s2",
        agent: "Maelstrom",
        model: "gpt-5.2",
        startedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
        messages: 0,
      })

      const all = getAllSessions(TEST_DIR)
      expect(all).toHaveLength(2)
    })
  })

  describe("active workflow", () => {
    test("should set and get active workflow", () => {
      createState(TEST_DIR, PROJECT_NAME)

      const set = setActiveWorkflow(TEST_DIR, "wf-1", "task-1")
      expect(set).toBe(true)

      const active = getActiveWorkflow(TEST_DIR)
      expect(active).not.toBeNull()
      expect(active!.workflowId).toBe("wf-1")
      expect(active!.currentTaskId).toBe("task-1")
    })

    test("should clear active workflow", () => {
      createState(TEST_DIR, PROJECT_NAME)
      setActiveWorkflow(TEST_DIR, "wf-1", "task-1")

      const cleared = clearActiveWorkflow(TEST_DIR)
      expect(cleared).toBe(true)

      const active = getActiveWorkflow(TEST_DIR)
      expect(active).toBeNull()
    })
  })

  describe("project statistics", () => {
    test("should return correct stats for empty project", () => {
      createState(TEST_DIR, PROJECT_NAME)
      const stats = getProjectStats(TEST_DIR)

      expect(stats.totalWorkflows).toBe(0)
      expect(stats.completedWorkflows).toBe(0)
      expect(stats.activeWorkflows).toBe(0)
      expect(stats.totalSessions).toBe(0)
    })

    test("should return correct stats with workflows and sessions", () => {
      createState(TEST_DIR, PROJECT_NAME)

      addWorkflow(TEST_DIR, {
        id: "wf-1",
        name: "WF1",
        description: "",
        filePath: "/1.md",
        status: "completed",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tasks: {},
        metadata: {},
      })

      addWorkflow(TEST_DIR, {
        id: "wf-2",
        name: "WF2",
        description: "",
        filePath: "/2.md",
        status: "in_progress",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tasks: {},
        metadata: {},
      })

      addSession(TEST_DIR, {
        id: "s1",
        agent: "Kraken",
        model: "claude",
        startedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
        messages: 0,
      })

      const stats = getProjectStats(TEST_DIR)
      expect(stats.totalWorkflows).toBe(2)
      expect(stats.completedWorkflows).toBe(1)
      expect(stats.activeWorkflows).toBe(1)
      expect(stats.totalSessions).toBe(1)
    })
  })
})
