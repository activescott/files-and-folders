import { it, expect, describe, beforeAll } from "@jest/globals"
import { exec as execCallback } from "node:child_process"
import { promisify } from "node:util"
const exec = promisify(execCallback)

// NOTE: We do some shenanigans here to run the command line since I gave up getting jest to be happy with ESM+import.meta...

async function cmd(
  command: string,
  allowError?: boolean
): Promise<{
  stdout: string
  stderr: string
}> {
  try {
    return await exec(command)
  } catch (err) {
    if (allowError) {
      type ExecError = Error & { stderr: string; stdout: string }
      const execErr = err as ExecError
      return { stderr: execErr.stderr, stdout: execErr.stdout }
    } else {
      throw err
    }
  }
}

beforeAll(async () => {
  await exec("npm run build")
})

describe("cli", () => {
  describe("argument parsing", () => {
    it("should require pattern", async () => {
      const { stderr } = await cmd("node ./dist/es/index.js", true)

      expect(stderr).toMatch(
        /error: required option '-p, --pattern <pattern>' not specified/
      )
    })

    it.todo("should require dest_path")
    it.todo("should require one input_path")
    it.todo("should accept multiple input_paths")
    it.todo("should accept option dry-run to delete empty directories")
    it.todo("should accept option to delete empty directories")
  })
})
