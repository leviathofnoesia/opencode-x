import path from "node:path"
import os from "node:os"
import { xdgConfig } from "xdg-basedir"

export function getDataDir(): string {
  if (xdgConfig) {
    return path.join(xdgConfig, "opencode-x")
  }
  return path.join(os.homedir(), ".config", "opencode-x")
}
