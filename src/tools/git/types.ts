import { z } from "zod"

export const GitOperationSchema = z.enum([
  "status",
  "diff",
  "commit",
  "add",
  "stage",
  "unstage",
  "branch",
  "checkout",
  "log",
  "push",
  "pull",
  "stash",
  "unstash",
])

export const GitStatusOptionsSchema = z.object({
  short: z.boolean().optional().describe("Show short format"),
 porcelain: z.boolean().optional().describe("Show porcelain format"),
  branch: z.boolean().optional().describe("Show branch info"),
})

export const GitDiffOptionsSchema = z.object({
  staged: z.boolean().optional().describe("Show staged changes only"),
  unstaged: z.boolean().optional().describe("Show unstaged changes only"),
  cached: z.boolean().optional().describe("Alias for staged"),
  stat: z.boolean().optional().describe("Show diffstat only"),
  numstat: z.boolean().optional().describe("Show diffstat with numbers"),
})

export const GitCommitOptionsSchema = z.object({
  message: z.string().describe("Commit message (supports multi-line)"),
  files: z.array(z.string()).optional().describe("Files to commit (auto-stages)"),
  all: z.boolean().optional().describe("Stage all modified files"),
  amend: z.boolean().optional().describe("Amend to previous commit"),
  noVerify: z.boolean().optional().describe("Skip pre-commit hooks"),
  signoff: z.boolean().optional().describe("Add Signed-off-by line"),
})

export const GitBranchOptionsSchema = z.object({
  list: z.boolean().optional().describe("List all branches"),
  create: z.string().optional().describe("Create new branch"),
  delete: z.string().optional().describe("Delete branch"),
  rename: z.string().optional().describe("Rename current branch (new name)"),
  current: z.boolean().optional().describe("Show current branch name"),
  verbose: z.boolean().optional().describe("Show commit info"),
})

export const GitLogOptionsSchema = z.object({
  oneline: z.boolean().optional().describe("Show one line per commit"),
  count: z.number().optional().describe("Limit number of commits"),
  format: z.string().optional().describe("Custom format string"),
  author: z.string().optional().describe("Filter by author"),
  grep: z.string().optional().describe("Filter by message"),
  since: z.string().optional().describe("Since date"),
  until: z.string().optional().describe("Until date"),
})

export const GitCheckoutOptionsSchema = z.object({
  branch: z.string().optional().describe("Switch to branch"),
  createBranch: z.string().optional().describe("Create and switch to branch"),
  file: z.string().optional().describe("Restore file to HEAD"),
  orphan: z.string().optional().describe("Create orphan branch"),
})

export const GitStageOptionsSchema = z.object({
  add: z.array(z.string()).optional().describe("Files to stage"),
  all: z.boolean().optional().describe("Stage all modified files"),
  update: z.boolean().optional().describe("Update tracked files only"),
})

export const GitPushOptionsSchema = z.object({
  remote: z.string().optional().describe("Remote name (default: origin)"),
  branch: z.string().optional().describe("Branch to push"),
  setUpstream: z.boolean().optional().describe("Set upstream tracking"),
  force: z.boolean().optional().describe("Force push"),
})

export const GitPullOptionsSchema = z.object({
  remote: z.string().optional().describe("Remote name (default: origin)"),
  branch: z.string().optional().describe("Branch to pull"),
  rebase: z.boolean().optional().describe("Rebase instead of merge"),
})

export const GitStashOptionsSchema = z.object({
  push: z.boolean().optional().describe("Stash changes"),
  pop: z.boolean().optional().describe("Apply and drop stash"),
  apply: z.boolean().optional().describe("Apply stash without dropping"),
  list: z.boolean().optional().describe("List stashes"),
  show: z.string().optional().describe("Show stash content"),
  drop: z.string().optional().describe("Drop stash by index"),
  clear: z.boolean().optional().describe("Drop all stashes"),
})

export type GitOperation = z.infer<typeof GitOperationSchema>
export type GitStatusOptions = z.infer<typeof GitStatusOptionsSchema>
export type GitDiffOptions = z.infer<typeof GitDiffOptionsSchema>
export type GitCommitOptions = z.infer<typeof GitCommitOptionsSchema>
export type GitBranchOptions = z.infer<typeof GitBranchOptionsSchema>
export type GitLogOptions = z.infer<typeof GitLogOptionsSchema>
export type GitCheckoutOptions = z.infer<typeof GitCheckoutOptionsSchema>
export type GitStageOptions = z.infer<typeof GitStageOptionsSchema>
export type GitPushOptions = z.infer<typeof GitPushOptionsSchema>
export type GitPullOptions = z.infer<typeof GitPullOptionsSchema>
export type GitStashOptions = z.infer<typeof GitStashOptionsSchema>

export interface GitResult {
  success: boolean
  output: string
  error?: string
}
