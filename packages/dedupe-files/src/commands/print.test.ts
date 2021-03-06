import { it, describe, expect } from "@jest/globals"
import print, { PrintOptions } from "./print.js"
import { StringWriter } from "@activescott/putty/streams"
import { resolve } from "node:path"
import { rm, stat } from "node:fs/promises"

async function printOutput(
  inputPaths: string[],
  otherOptions?: Partial<PrintOptions>
): Promise<string> {
  const outStream = new StringWriter()
  await print(
    { ...otherOptions, input_paths: inputPaths, names: true },
    outStream,
    new StringWriter()
  )
  return outStream.toString()
}

async function printError(inputPaths: string[]): Promise<string> {
  const errStream = new StringWriter()
  await print(
    { input_paths: inputPaths, names: true },
    new StringWriter(),
    errStream
  )
  return errStream.toString()
}

describe("argument validation", () => {
  it("requires input_paths arg", async () => {
    await expect(
      print(
        { input_paths: undefined as unknown as string[] },
        new StringWriter(),
        new StringWriter()
      )
    ).rejects.toThrowError(/input_paths must be provided/)
  })

  it("requires input_paths arg to be array", async () => {
    const badOptions = { input_paths: 1 }
    await expect(
      print(
        badOptions as unknown as { input_paths: string[] },
        new StringWriter(),
        new StringWriter()
      )
    ).rejects.toThrowError(/input_paths must be an array/)
  })

  it("accepts path that is relative and exists", async () => {
    await expect(printError(["./test-data/one"])).resolves.toBe("")
  })

  it("rejects path that is relative and doesn't exist", async () => {
    await expect(
      printError(["./test-data/one", "./doesnotexistanywhere"])
    ).resolves.toMatch(/.*\/doesnotexistanywhere is not a directory/)
  })

  it("accepts path that is absolute and exists", async () => {
    await expect(
      print(
        { input_paths: [resolve("./test-data/one")] },
        new StringWriter(),
        new StringWriter()
      )
    ).resolves.not.toThrow()
  })

  it("rejects path that is absolute and doesn't exist", async () => {
    await expect(printError(["/doesnotexistanywhere"])).resolves.toMatch(
      /\/doesnotexistanywhere is not a directory/
    )
  })
})

describe("file comparison", () => {
  it("name same, content different", async () => {
    const output = await printOutput(["./test-data/one", "./test-data/two"])
    expect(output).toMatch(
      /content differs with identical name: .*\/test-data\/one\/same-name-diff-content.jpg and .*\/test-data\/two\/same-name-diff-content.jpg/
    )
  })

  it("name same, content different; reversed", async () => {
    const output = await printOutput(["./test-data/two", "./test-data/one"])
    expect(output).toMatch(
      /content differs with identical name: .*\/test-data\/two\/same-name-diff-content.jpg and .*\/test-data\/one\/same-name-diff-content.jpg/
    )
  })

  it("name same, content different, size same", async () => {
    const output = await printOutput(["./test-data/one", "./test-data/two"])
    expect(output).toMatch(
      /content differs with identical name: .*test-data\/one\/simple-text and .*test-data\/two\/toodeep\/simple-text/
    )
  })

  it("name same, content different, size same; reversed", async () => {
    const output = await printOutput(["./test-data/two", "./test-data/one"])
    expect(output).toMatch(
      /content differs with identical name: .*test-data\/two\/toodeep\/simple-text and .*test-data\/one\/simple-text/
    )
  })

  it("name same, content same", async () => {
    const output = await printOutput(["./test-data/one", "./test-data/two"])
    expect(output).toMatch(
      /content identical: .*test-data\/one\/tv-test-pattern.png and .*test-data\/two\/tv-test-pattern.png/
    )
  })

  it("name same, content same; reversed", async () => {
    const output = await printOutput(["./test-data/two", "./test-data/one"])
    expect(output).toMatch(
      /content identical: .*test-data\/two\/tv-test-pattern.png and .*test-data\/one\/tv-test-pattern.png/
    )
  })
})

describe("out option", () => {
  const outFile = "./test-data/out-temp.txt"

  afterEach(async () => {
    await rm(outFile, { force: true })
  })

  it("should save to output file with out option", async () => {
    await printOutput(["./test-data/two", "./test-data/one"], { out: outFile })
    const st = await stat(outFile)
    expect(st.isFile()).toBe(true)
  })
})
