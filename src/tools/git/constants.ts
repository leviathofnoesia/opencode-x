export const GIT_TOOL_DESCRIPTION = `
Git version control tool for managing commits, branches, and repository state.

## Available Operations

- **status**: Show current repository status (modified, staged, untracked files)
- **diff**: Show staged and unstaged changes
- **commit**: Create a commit with message (supports multi-line messages)
- **branch**: List, create, or delete branches
- **log**: Show commit history with customizable format
- **stage**: Stage files for commit
- **unstage**: Unstage files
- **checkout**: Switch branches or restore files

## Usage Examples

\`\`\`json
{
  "operation": "status"
}
\`\`\`

\`\`\`json
{
  "operation": "commit",
  "message": "feat(auth): Add JWT authentication",
  "files": ["src/auth/"]
}
\`\`\`
`

export const GIT_COMMIT_MESSAGE_SCHEMA = `
# Commit Message Format

## Required
- Short summary (50 chars or less)
- Blank line
- Detailed description (if needed)

## Examples

\`\`\`
feat: Add user login functionality

- Implement JWT token generation
- Add login endpoint
- Update user model
\`\`\`

\`\`\`
fix: Resolve memory leak in data loader

The loader was not properly disposing of connections,
causing gradual memory growth over time.
\`\`\`
`
