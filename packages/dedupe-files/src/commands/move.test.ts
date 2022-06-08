import { jest, it, describe, expect } from "@jest/globals"
import move, { MoveFileFunction, MoveOptions } from "./move.js"
import StringWriter from "../../tests/support/StringWriter.js"
import { existsSync, mkdirSync, rmSync } from "node:fs"
import { basename, relative, resolve } from "node:path"

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

function getOutputDir(createDir: boolean): string {
  const orig = "./test-data/temp-out"
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

it("should move duplicates to destination", async () => {
  const moveFileMock = jest.fn<MoveFileFunction>()
  const options: MoveOptions = {
    input_paths: ["./test-data/one", "./test-data/two"],
    out: getOutputDir(true),
  }
  try {
    const moveFileImpl = moveFileMock

    await move(options, moveFileImpl, new StringWriter(), new StringWriter())

    // make the paths relative so we don't have to worry about qualified paths:
    const fromPath = resolve("./")
    const calls = moveFileMock.mock.calls.map(([oldPath, newPath]) => [
      relative(fromPath, oldPath),
      relative(options.out, newPath),
    ])

    // eslint-disable-next-line no-magic-numbers
    expect(calls.length).toBe(2)

    const expectFileInCallsMovedInCalls = (fileMovedFromPath: string): void => {
      const to = basename(fileMovedFromPath)
      const fromIndex = 0
      const toIndex = 1
      const found =
        calls.findIndex(
          (elem) => elem[fromIndex] == fileMovedFromPath && elem[toIndex] == to
        ) >= 0
      expect(found).toBe(true)
    }

    expectFileInCallsMovedInCalls("test-data/two/tv-test-pattern.png")
    expectFileInCallsMovedInCalls("test-data/two/not-the-eye-test-pic.jpg")
  } finally {
    rmSync(options.out, { recursive: true, force: true })
  }
})
