import { jest, it, describe, expect } from "@jest/globals"
import move, { MoveFileFunction, MoveOptions } from "./move.js"
import StringWriter from "../../tests/support/StringWriter.js"
import { existsSync, mkdirSync, rmSync, cpSync } from "node:fs"
import { join, relative, resolve } from "node:path"
import type { Matchers } from "expect"
import type { JestExpect } from "@jest/expect"
import { rename } from "node:fs/promises"
import { exists } from "../lib/fs.js"

describe("destination", () => {
  it("should be a directory", async () => {
    const options: MoveOptions = {
      input_paths: ["./test-data/one", "./test-data/two"],
      out: "./test-data/must-not-exist",
    }
    const moveFileImpl = jest.fn<MoveFileFunction>()
    await expect(
      move(options, moveFileImpl, new StringWriter(), new StringWriter())
    ).rejects.toThrowError(/out must be a directory that exists/)
  })
})

type PathString = string

function getTempDir(nickName: string, createDir: boolean): PathString {
  const orig = `./test-data/temp-${nickName}`
  let dir = orig
  let counter = 0
  while (existsSync(dir)) {
    dir = `${orig}-${++counter}`
  }
  if (createDir) {
    mkdirSync(dir, { recursive: true })
  }
  return dir
}

function copyTestFilesTo(outputDir: PathString): void {
  mkdirSync(`${outputDir}/one`)
  cpSync("./test-data/one", `${outputDir}/one`, {
    recursive: true,
    errorOnExist: true,
  })
  mkdirSync(`${outputDir}/two`)
  cpSync("./test-data/two", `${outputDir}/two`, {
    recursive: true,
    errorOnExist: true,
  })
}

type JestExpectationResultSync = {
  pass: boolean
  message(): string
}

expect.extend({
  toMoveFileFromPath(
    moveFileCalls: Array<string[]>,
    fileMovedFromPath: string
  ): JestExpectationResultSync {
    const fromIndex = 0
    const pass =
      moveFileCalls.findIndex((elem) =>
        (elem[fromIndex] as string).endsWith(fileMovedFromPath)
      ) >= 0
    return {
      message: () => `expected '${fileMovedFromPath}' to be moved`,
      pass,
    }
  },
  toMoveFileToPath(
    moveFileCalls: Array<string[]>,
    relativeToPath: string
  ): JestExpectationResultSync {
    const toIndex = 1
    const pass =
      moveFileCalls.findIndex((elem) =>
        (elem[toIndex] as string).endsWith(relativeToPath)
      ) >= 0
    return {
      message: () => `expected a file to be moved to '${relativeToPath}'`,
      pass,
    }
  },
})

interface MoveMatchers<R = void> extends Matchers<void> {
  toMoveFileFromPath(fileMovedFromPath: string): R
  toMoveFileToPath(relativeToPath: string): R
}

type MoveFileFuncCalls = Array<string[]>

type MoveFilesExpect = JestExpect & MoveMatchers

function expectMoveFiles(actual: MoveFileFuncCalls): MoveFilesExpect {
  // this works because of the call to expect.extend!
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return expect(actual) as any as MoveFilesExpect
}

it("should move duplicates to destination", async () => {
  const moveFileMock = jest.fn<MoveFileFunction>()
  const options: MoveOptions = {
    input_paths: ["./test-data/one", "./test-data/two"],
    out: getTempDir("out", true),
  }
  try {
    const moveFileImpl = moveFileMock

    await move(options, moveFileImpl, new StringWriter(), new StringWriter())

    // make the paths relative so we don't have to worry about qualified paths:
    const fromPath = resolve("./")
    const moveFileCalls = moveFileMock.mock.calls.map(([oldPath, newPath]) => [
      relative(fromPath, oldPath),
      relative(options.out, newPath),
    ])

    // eslint-disable-next-line no-magic-numbers
    expect(moveFileCalls.length).toBeGreaterThan(2)

    expectMoveFiles(moveFileCalls).toMoveFileFromPath(
      "test-data/two/tv-test-pattern.png"
    )
    expectMoveFiles(moveFileCalls).toMoveFileFromPath(
      "test-data/two/not-the-eye-test-pic.jpg"
    )
  } finally {
    rmSync(options.out, { recursive: true, force: true })
  }
})

it("should rename to prevent collisions in output directory", async () => {
  // prepare a clone of test files dir
  const testFileDir = getTempDir("in", true)
  copyTestFilesTo(testFileDir)

  const options: MoveOptions = {
    input_paths: [`${testFileDir}/one`, `${testFileDir}/two`],
    out: getTempDir("out", true),
  }

  try {
    await move(options, rename, new StringWriter(), new StringWriter())

    await expect(
      exists(join(options.out, "same-name-same-content-thrice.jpeg"))
    ).resolves.toBe(true)
    // Here is the interesting part where we make sure that the file was renamed:
    await expect(
      exists(join(options.out, "same-name-same-content-thrice (1).jpeg"))
    ).resolves.toBe(true)
  } finally {
    rmSync(testFileDir, { recursive: true, force: true })
    rmSync(options.out, { recursive: true, force: true })
  }
})
