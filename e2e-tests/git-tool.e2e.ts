/**
 * Git Tool E2E Tests
 */

import { describe, test, expect, beforeAll, afterAll } from "bun:test"
import { tmpdir } from "node:os"
import { mkdirSync, rmSync, existsSync, writeFileSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { execSync } from "node:child_process"

describe("git-tool", () => {
  const testDir = join(tmpdir(), "opencode-x-git-test-" + Date.now())
  const gitTool = (await import("../src/tools/git/tools")).createGitTool

  beforeAll(() => {
    mkdirSync(testDir, { recursive: true })
    execSync("git init", { cwd: testDir, stdio: "pipe" })
  })

  afterAll(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  test("status shows clean working tree initially", async () => {
    const result = await gitTool().git.execute({ operation: "status" })
    expect(result).toContain("Working tree clean")
  })

  test("status shows branch name", async () => {
    const result = await gitTool().git.execute({ operation: "status" })
    expect(result).toMatch(/## (master|main|dev)/)
  })

  test("creates a file and shows it as untracked", async () => {
    writeFileSync(join(testDir, "test.txt"), "Hello World")
    const result = await gitTool().git.execute({ operation: "status" })
    expect(result).toContain("Untracked")
    expect(result).toContain("test.txt")
  })

  test("stages a file", async () => {
    const result = await gitTool().git.execute({
      operation: "add",
      add: ["test.txt"],
    })
    expect(result).toContain("Staged")
  })

  test("commits staged files", async () => {
    const result = await gitTool().git.execute({
      operation: "commit",
      message: "Initial commit",
    })
    expect(result).toContain("Commit created")
    expect(result).toContain("Initial commit")
  })

  test("creates a new branch", async () => {
    const result = await gitTool().git.execute({
      operation: "branch",
      create: "feature-branch",
    })
    expect(result).toContain("Branch created: feature-branch")
  })

  test("lists branches", async () => {
    const result = await gitTool().git.execute({
      operation: "branch",
      list: true,
    })
    expect(result).toMatch(/(\*|\s)(master|main)/)
    expect(result).toContain("feature-branch")
  })

  test("shows commit log", async () => {
    const result = await gitTool().git.execute({
      operation: "log",
      oneline: true,
      count: 5,
    })
    expect(result).toContain("Initial commit")
  })
})
