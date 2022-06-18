/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-magic-numbers */
import { it, expect } from "@jest/globals"
import { humanReadableDataSize } from "./format.js"

it("should handle KB", () => {
  expect(humanReadableDataSize(10240)).toMatch("10.0 KB")
})

it("should handle MB", () => {
  expect(humanReadableDataSize(1024 ** 2 * 12)).toMatch("12.0 MB")
})

it("should handle TB", () => {
  expect(humanReadableDataSize(1024 ** 4 * 11)).toMatch("11.0 TB")
})

it("should handle fractional", () => {
  expect(humanReadableDataSize(1024 ** 4 * 1.5)).toMatch("1.5 TB")
})

it("should handle big TB", () => {
  expect(humanReadableDataSize(1024 ** 4 * 2500)).toMatch("2500.0 TB")
})
