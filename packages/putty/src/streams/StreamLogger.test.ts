import { it, expect } from "@jest/globals"
import { StreamLogger } from "./StreamLogger.js"
import { StringWriter } from "./StringWriter.js"

it("should have a test", () => {
  const stdout = new StringWriter()
  const stderr = new StringWriter()

  const log = new StreamLogger(stdout, stderr)
  const now = new Date().toISOString()
  log.info("foo:", now)
  expect(stdout.toString()).toMatch(now)
})
