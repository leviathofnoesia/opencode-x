import { tool, type ToolDefinition } from "@opencode-ai/plugin"
import { execSync, ExecSyncOptions } from "node:child_process"
import { existsSync } from "node:fs"
import { cwd } from "node:process"
import {
  GIT_TOOL_DESCRIPTION,
  GIT_COMMIT_MESSAGE_SCHEMA,
} from "./constants"
import type {
  GitOperation,
  GitStatusOptions,
  GitDiffOptions,
  GitCommitOptions,
  GitBranchOptions,
  GitLogOptions,
  GitCheckoutOptions,
  GitStageOptions,
  GitPushOptions,
  GitPullOptions,
  GitStashOptions,
} from "./types"

function runGitCommand(args: string[], options?: ExecSyncOptions): string {
  const defaultOptions: ExecSyncOptions = {
    encoding: "utf-8",
    cwd: cwd(),
    stdio: ["pipe", "pipe", "pipe"],
  }

  try {
    return execSync(`git ${args.join(" ")}`, { ...defaultOptions, ...options }).toString().trim()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Git command failed: ${message}`)
  }
}

function getRepoRoot(): string {
  try {
    return runGitCommand(["rev-parse", "--show-toplevel"])
  } catch {
    return cwd()
  }
}

function isGitRepo(): boolean {
  return existsSync(`${getRepoRoot()}/.git`)
}

interface GitStatusResult {
  branch: string
  status: string
  staged: string[]
  unstaged: string[]
  untracked: string[]
  clean: boolean
}

function parseStatusOutput(output: string): GitStatusResult {
  const lines = output.split("\n").filter(Boolean)
  const branch = lines[0]?.replace(/^## /, "") || "unknown"
  const staged: string[] = []
  const unstaged: string[] = []
  const untracked: string[] = []

  for (const line of lines.slice(1)) {
    const statusMatch = line.match(/^(\s*)([MADRC]?[MADRC]?)\s+(.+)$/)
    if (statusMatch) {
      const [, , status, file] = statusMatch
      if (status === "??") {
        untracked.push(file)
      } else if (status) {
        if (status.includes("M") || status.includes("A") || status.includes("D") || status.includes("R") || status.includes("C")) {
          staged.push(`${status} ${file}`)
        }
        if (status.length > 1 && status[1] !== " ") {
          unstaged.push(`${status[1]} ${file}`)
        }
      }
    }
  }

  const clean = staged.length === 0 && unstaged.length === 0 && untracked.length === 0

  return { branch, status: output, staged, unstaged, untracked, clean }
}

export interface GitToolOptions {
  requireCleanWorkingDir?: boolean
  maxCommitMessageLength?: number
}

export function createGitTool(_options?: GitToolOptions): Record<string, ToolDefinition> {
  return {
    git: tool({
    description: GIT_TOOL_DESCRIPTION,
    args: {
      operation: tool.schema.string().describe(
        "Git operation to perform: status, diff, commit, branch, log, stage, unstage, checkout, push, pull, stash, unstash"
      ),
      // Status options
      short: tool.schema.boolean().optional(),
      porcelain: tool.schema.boolean().optional(),
      branch: tool.schema.boolean().optional(),
      // Diff options
      staged: tool.schema.boolean().optional(),
      unstaged: tool.schema.boolean().optional(),
      cached: tool.schema.boolean().optional(),
      stat: tool.schema.boolean().optional(),
      numstat: tool.schema.boolean().optional(),
      // Commit options
      message: tool.schema.string().optional(),
      files: tool.schema.array(tool.schema.string()).optional(),
      all: tool.schema.boolean().optional(),
      amend: tool.schema.boolean().optional(),
      noVerify: tool.schema.boolean().optional(),
      signoff: tool.schema.boolean().optional(),
      // Branch options
      list: tool.schema.boolean().optional(),
      create: tool.schema.string().optional(),
      delete: tool.schema.string().optional(),
      rename: tool.schema.string().optional(),
      current: tool.schema.boolean().optional(),
      verbose: tool.schema.boolean().optional(),
      // Log options
      oneline: tool.schema.boolean().optional(),
      count: tool.schema.number().optional(),
      format: tool.schema.string().optional(),
      author: tool.schema.string().optional(),
      grep: tool.schema.string().optional(),
      since: tool.schema.string().optional(),
      until: tool.schema.string().optional(),
      // Checkout options
      branch_switch: tool.schema.string().optional().describe("Branch to switch to"),
      createBranch: tool.schema.string().optional(),
      file: tool.schema.string().optional(),
      orphan: tool.schema.string().optional(),
      // Stage options
      add: tool.schema.array(tool.schema.string()).optional(),
      update: tool.schema.boolean().optional(),
      // Push options
      remote: tool.schema.string().optional(),
      setUpstream: tool.schema.boolean().optional(),
      force: tool.schema.boolean().optional(),
      // Pull options
      rebase: tool.schema.boolean().optional(),
      // Stash options
      push: tool.schema.boolean().optional(),
      pop: tool.schema.boolean().optional(),
      apply: tool.schema.boolean().optional(),
      show: tool.schema.string().optional(),
      drop: tool.schema.string().optional(),
      clear: tool.schema.boolean().optional(),
    },
    async execute(args) {
      const operation = args.operation as GitOperation

      if (!isGitRepo()) {
        return "❌ Not a git repository. Initialize with: git init"
      }

      try {
        switch (operation) {
          case "status": {
            const short = args.short === true
            const porcelain = args.porcelain === true

            if (porcelain) {
              return runGitCommand(["status", "--porcelain"])
            }

            if (short) {
              return runGitCommand(["status", "-s"])
            }

            const output = runGitCommand(["status", "-sb"])
            const parsed = parseStatusOutput(output)

            let result = `## ${parsed.branch}\n\n`

            if (parsed.staged.length > 0) {
              result += `### Staged (${parsed.staged.length})\n`
              parsed.staged.forEach((s) => result += `- ${s}\n`)
              result += "\n"
            }

            if (parsed.unstaged.length > 0) {
              result += `### Modified (${parsed.unstaged.length})\n`
              parsed.unstaged.forEach((s) => result += `- ${s}\n`)
              result += "\n"
            }

            if (parsed.untracked.length > 0) {
              result += `### Untracked (${parsed.untracked.length})\n`
              parsed.untracked.forEach((s) => result += `- ${s}\n`)
              result += "\n"
            }

            result += parsed.clean ? "✅ Working tree clean" : ""

            return result
          }

          case "diff": {
            const staged = args.staged === true || args.cached === true
            const unstaged = args.unstaged === true
            const stat = args.stat === true
            const numstat = args.numstat === true

            if (stat) {
              if (staged) return runGitCommand(["diff", "--stat", "--cached"])
              if (unstaged) return runGitCommand(["diff", "--stat"])
              return runGitCommand(["diff", "--stat"])
            }

            if (numstat) {
              if (staged) return runGitCommand(["diff", "--numstat", "--cached"])
              if (unstaged) return runGitCommand(["diff", "--numstat"])
              return runGitCommand(["diff", "--numstat"])
            }

            if (staged) return runGitCommand(["diff", "--cached"])
            if (unstaged) return runGitCommand(["diff"])

            return runGitCommand(["diff"])
          }

          case "commit": {
            const message = args.message
            if (!message) {
              return `❌ Commit message is required.\n\n${GIT_COMMIT_MESSAGE_SCHEMA}`
            }

            if (args.all) {
              runGitCommand(["add", "-A"])
            } else if (args.files && args.files.length > 0) {
              runGitCommand(["add", ...args.files])
            }

            let commitArgs = ["commit"]

            if (args.noVerify) commitArgs.push("--no-verify")
            if (args.signoff) commitArgs.push("--signoff")
            if (args.amend) commitArgs.push("--amend", "--no-edit")

            commitArgs.push("-m", message)

            const result = runGitCommand(commitArgs)

            const shortHash = runGitCommand(["rev-parse", "--short", "HEAD"]).slice(0, 7)
            return `✅ Commit created: ${shortHash}\n\nMessage: ${message}\n\n${result}`
          }

          case "branch": {
            const list = args.list === true
            const create = args.create
            const deleteBranch = args.delete
            const rename = args.rename
            const current = args.current === true
            const verbose = args.verbose === true

            if (current) {
              return runGitCommand(["rev-parse", "--abbrev-ref", "HEAD"])
            }

            if (create) {
              runGitCommand(["branch", create])
              return `✅ Branch created: ${create}`
            }

            if (deleteBranch) {
              runGitCommand(["branch", "-d", deleteBranch])
              return `✅ Branch deleted: ${deleteBranch}`
            }

            if (rename) {
              runGitCommand(["branch", "-m", rename])
              return `✅ Branch renamed to: ${rename}`
            }

            const verboseFlag = verbose ? "-v" : ""
            const output = runGitCommand(["branch", verboseFlag])
            const lines = output.split("\n").filter(Boolean)
            const currentBranch = runGitCommand(["rev-parse", "--abbrev-ref", "HEAD"])

            return lines.map((line) => {
              const isCurrent = line.trim() === currentBranch || line.startsWith(`* ${currentBranch}`)
              return isCurrent ? `* ${line.trim()}` : `  ${line.trim()}`
            }).join("\n")
          }

          case "log": {
            const oneline = args.oneline === true
            const count = args.count || 10
            const format = args.format
            const author = args.author
            const grep = args.grep
            const since = args.since
            const until = args.until

            let logArgs = ["log"]

            if (oneline) {
              logArgs.push("--oneline")
            } else if (format) {
              logArgs.push(`--format=${format}`)
            }

            logArgs.push(`-${count}`)

            if (author) logArgs.push(`--author=${author}`)
            if (grep) logArgs.push(`--grep=${grep}`)
            if (since) logArgs.push(`--since=${since}`)
            if (until) logArgs.push(`--until=${until}`)

            return runGitCommand(logArgs)
          }

          case "stage":
          case "add": {
            const add = args.add
            const all = args.all === true
            const update = args.update === true

            if (all) {
              return runGitCommand(["add", "-A"])
            }

            if (update) {
              return runGitCommand(["add", "-u"])
            }

            if (add && add.length > 0) {
              runGitCommand(["add", ...add])
              return `✅ Staged ${add.length} file(s)`
            }

            return "❌ No files specified to stage. Use 'all: true' or provide 'add' array."
          }

          case "unstage": {
            const files = args.add
            if (files && files.length > 0) {
              runGitCommand(["reset", "--", ...files])
              return `✅ Unstaged ${files.length} file(s)`
            }
            return runGitCommand(["reset", "--", "."])
          }

          case "checkout": {
            const branch = args.branch_switch
            const createBranch = args.createBranch
            const file = args.file
            const orphan = args.orphan

            if (file) {
              runGitCommand(["checkout", "--", file])
              return `✅ Restored file: ${file}`
            }

            if (orphan) {
              runGitCommand(["checkout", "--orphan", orphan])
              runGitCommand(["rm", "-rf", "."])
              return `✅ Created orphan branch: ${orphan}`
            }

            if (createBranch) {
              runGitCommand(["checkout", "-b", createBranch])
              return `✅ Created and switched to branch: ${createBranch}`
            }

            if (branch) {
              runGitCommand(["checkout", branch])
              return `✅ Switched to branch: ${branch}`
            }

            return "❌ Specify branch, createBranch, or file to restore"
          }

          case "push": {
            const remote = args.remote || "origin"
            const branch = args.files?.[0]
            const force = args.force === true
            const setUpstream = args.setUpstream === true

            let pushArgs = ["push"]

            if (force) pushArgs.push("--force")
            if (setUpstream) pushArgs.push("-u")

            if (branch) {
              runGitCommand([...pushArgs, remote, branch])
              return `✅ Pushed ${branch} to ${remote}`
            }

            runGitCommand(pushArgs)
            return `✅ Pushed to ${remote}`
          }

          case "pull": {
            const remote = args.remote || "origin"
            const branch = args.files?.[0]
            const rebase = args.rebase === true

            if (branch) {
              if (rebase) {
                runGitCommand(["pull", "--rebase", remote, branch])
                return `✅ Pulled and rebased ${branch} from ${remote}`
              }
              runGitCommand(["pull", remote, branch])
              return `✅ Pulled ${branch} from ${remote}`
            }

            if (rebase) {
              runGitCommand(["pull", "--rebase"])
              return `✅ Pulled with rebase`
            }

            runGitCommand(["pull"])
            return `✅ Pulled from ${remote}`
          }

          case "stash": {
            const push = args.push === true
            const pop = args.pop === true
            const apply = args.apply === true
            const show = args.show
            const drop = args.drop
            const clear = args.clear === true

            if (clear) {
              runGitCommand(["stash", "clear"])
              return "✅ Cleared all stashes"
            }

            if (drop) {
              runGitCommand(["stash", "drop", drop])
              return `✅ Dropped stash: ${drop}`
            }

            if (show) {
              return runGitCommand(["stash", "show", "-p", show])
            }

            if (pop) {
              const result = runGitCommand(["stash", "pop"])
              return `✅ Applied and dropped stash\n\n${result}`
            }

            if (apply) {
              const result = runGitCommand(["stash", "apply"])
              return `✅ Applied stash\n\n${result}`
            }

            if (push) {
              runGitCommand(["stash", "push", "-m", "WIP"])
              return "✅ Stashed changes"
            }

            return runGitCommand(["stash", "list"])
          }

          default:
            return `❌ Unknown operation: ${operation}`
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return `❌ Git error: ${message}`
      }
    },
  })
  }
}
