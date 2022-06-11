import { jest, it, expect } from "@jest/globals"
import { relative } from "node:path"
import StringWriter from "../../tests/support/StringWriter.js"
import type { DeleteFileFunction, DeleteOptions } from "./delete.js"
import deleteCommand from "./delete.js"

it("should delete only duplicate files", async () => {
  const deleteFn = jest.fn<DeleteFileFunction>()
  const options: DeleteOptions = {
    input_paths: ["./test-data/one", "./test-data/two"],
  }

  await deleteCommand(options, deleteFn, new StringWriter(), new StringWriter())

  const actualDeletes = deleteFn.mock.calls
    .map((args) => args[0])
    .map((path) => {
      return relative(process.cwd(), path)
    })
  const expectedNames = [
    "test-data/two/not-the-eye-test-pic.jpg",
    "test-data/two/same-name-same-content-thrice.jpeg",
    "test-data/two/toodeep/same-name-same-content-thrice.jpeg",
    "test-data/two/tv-test-pattern.png",
  ]
  expect(deleteFn).toHaveBeenCalledTimes(expectedNames.length)
  expectedNames.forEach((name) => expect(actualDeletes).toContain(name))
})
