# OpenCode-X Integration Tests

## Overview

This directory contains end-to-end and integration tests for OpenCode-X features.

## Test Structure

```
e2e-tests/
├── agent-workflow.e2e.ts    # Agent delegation workflow tests
├── git-tool.e2e.ts          # Git tool integration tests
└── state-persistence.test.ts # State persistence tests
```

## Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test e2e-tests/agent-workflow.e2e.ts

# Run with coverage
bun test --coverage
```

## Test Utilities

Test utilities are located in `src/test-utils/` and provide:
- Mock PluginInput factory
- Mock Agent factory
- Mock Context factory
- Test configuration helpers

## Writing New Tests

### E2E Test Template

```typescript
import { describe, test, expect, beforeAll, afterAll } from "bun:test"
import { tmpdir } from "node:os"
import { mkdirSync, rmSync, existsSync } from "node:fs"
import { join } from "node:path"

describe("feature", () => {
  const testDir = join(tmpdir(), "opencode-x-test-" + Date.now())
  
  beforeAll(() => {
    mkdirSync(testDir, { recursive: true })
  })
  
  afterAll(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })
  
  test("should perform expected behavior", async () => {
    // Test implementation
  })
})
```
