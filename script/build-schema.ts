#!/usr/bin/env bun
import * as z from "zod"
import { OpenCodeXConfigSchema } from "../src/config/schema"

const SCHEMA_OUTPUT_PATH = "assets/opencode-x.schema.json"

async function main() {
  console.log("Generating JSON Schema...")

  const jsonSchema = z.toJSONSchema(OpenCodeXConfigSchema, {
    io: "input",
    target: "draft-7",
  })

  const finalSchema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: "https://raw.githubusercontent.com/leviathofnoesia/opencode-x/master/assets/opencode-x.schema.json",
    title: "OpenCode-X Configuration",
    description: "Configuration schema for opencode-x plugin",
    ...jsonSchema,
  }

  await Bun.write(SCHEMA_OUTPUT_PATH, JSON.stringify(finalSchema, null, 2))

  console.log(`✓ JSON Schema generated: ${SCHEMA_OUTPUT_PATH}`)
}

main()
