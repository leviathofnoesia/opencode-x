#!/usr/bin/env bun
import { runDoctor } from "./doctor/runner"

const args = process.argv.slice(2)
const category = args[0] as "installation" | "configuration" | "authentication" | "dependencies" | "tools" | "updates" | undefined
const json = args.includes("--json")
const verbose = args.includes("--verbose")

await runDoctor({
  category,
  json,
  verbose,
})
