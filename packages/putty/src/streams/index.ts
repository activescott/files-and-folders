export * from "./StreamLogger.js"
export * from "./StringWriter.js"

export type WritableStreamLike = {
  write(str: string): void
  end(): void
}
