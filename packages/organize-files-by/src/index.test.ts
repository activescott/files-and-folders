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

    const testDir1 = "./test-data/test-case-1/one"
    const testDir2 = "./test-data/test-case-1/two"
    const destDir = "./test-data/dest"

    it("should require dest_path", async () => {
      const { stderr } = await cmd(`node ./dist/es/index.js -p foo`, true)
      expect(stderr).toMatch(/error: missing required argument 'dest_path'/)
    })

    it("should require input_path", async () => {
      const { stderr } = await cmd(
        `node ./dist/es/index.js -p foo ${destDir}`,
        true
      )
      expect(stderr).toMatch(/error: missing required argument 'input_paths'/)
    })

    it.skip("should accept multiple input_paths", async () => {
      const { stderr, stdout } = await cmd(
        `node ./dist/es/index.js -p foo ${destDir} ${testDir1} ${testDir2}`,
        false
      )
      console.log({ stderr, stdout })
    })

    it.todo("should require dest_path")

    it.todo("should accept option dry-run to delete empty directories")
    it.todo("should accept option to delete empty directories")
  })
})
