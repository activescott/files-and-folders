import { it, expect, describe, beforeAll } from "@jest/globals"
import { exec as execCallback } from "node:child_process"
import { promisify } from "node:util"
import { mkdtemp } from "node:fs/promises"
import path from "node:path"
import os from "node:os"
const exec = promisify(execCallback)

// NOTE: We do some shenanigans here to run the command line since I gave up getting jest to be happy with ESM+import.meta...
type ProcessStreams = Promise<{
  stdout: string
  stderr: string
}>

async function cmd(command: string, allowError?: boolean): ProcessStreams {
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

async function organize_files_by(
  allowError: boolean,
  ...args: string[]
): ProcessStreams {
  args = args ? args : []
  const result = await cmd(
    "node ./dist/es/index.js" + " " + args.join(" "),
    allowError
  )
  if (!allowError) {
    expect(result.stderr).toEqual("")
    expect(result.stderr).toHaveLength(0)
  }
  return result
}

async function tempDir(prefix): Promise<string> {
  return mkdtemp(path.join(os.tmpdir(), prefix + "-"))
}

beforeAll(async () => {
  await exec("npm run build")
})

describe("cli", () => {
  describe("argument parsing", () => {
    it("should require pattern", async () => {
      const { stderr } = await organize_files_by(true)

      expect(stderr).toMatch(
        /error: required option '-p, --pattern <pattern>' not specified/
      )
    })

    it("should require dest_path", async () => {
      const { stderr } = await organize_files_by(true, "-p foo")

      expect(stderr).toMatch(/error: missing required argument 'dest_path'/)
    })

    it("should require one input_path", async () => {
      const ALLOW_ERROR = true
      const { stderr } = await organize_files_by(
        ALLOW_ERROR,
        "-p foo ./test-data/dest"
      )

      expect(stderr).toMatch(/error: missing required argument 'input_paths'/)
    })

    it("should accept multiple input_paths", async () => {
      const ALLOW_ERROR = false
      const temp = await tempDir("dest")
      await organize_files_by(
        ALLOW_ERROR,
        `-p foo ${temp} ./test-data/test-case-1/one ./test-data/test-case-1/two`
      )
    })

    it("should accept option dry-run", async () => {
      const ALLOW_ERROR = false
      const temp = await tempDir("dest")
      await organize_files_by(
        ALLOW_ERROR,
        `-p foo ${temp} --dry-run ./test-data/test-case-1/one`
      )
    })

    it("should accept option to delete empty directories", async () => {
      const ALLOW_ERROR = false
      const temp = await tempDir("dest")
      await organize_files_by(
        ALLOW_ERROR,
        `-p foo ${temp} --delete-empty ./test-data/test-case-1/one`
      )
    })
  })

  describe("renaming", () => {
    it.todo("should save output files")
    it.todo("should NOT save output files w/ dry-run")

    it.todo("should (re)move input files")
    it.todo("should NOT (re)move input files w/ dry-run")

    it.todo("should handle duplicates in destination - HOW?")

    describe("patterns", () => {
      it.todo("should require at least one pattern placeholder")
      it.todo("should reject unknown pattern placeholders")
      it.todo("should support name & ext")
      it.todo("should support byear, bmonth, bdate")
    })
  })
})
