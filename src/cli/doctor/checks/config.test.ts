import { describe, it, expect } from "bun:test"
import { checkConfigValidity, getConfigCheckDefinition } from "./config"

describe("Config Check", () => {
  it("should return pass for valid config", async () => {
    const result = await checkConfigValidity()
    expect(result.status).toBe("pass")
  })

  it("should return correct check definition", () => {
    const definition = getConfigCheckDefinition()
    expect(definition.category).toBe("configuration")
    expect(definition.critical).toBe(false)
  })
})
