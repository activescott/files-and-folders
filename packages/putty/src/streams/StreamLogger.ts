import util from "node:util"
import { performance } from "node:perf_hooks"
import type { WritableStreamLike } from "./index.js"

const EOL = "\n"

export class StreamLogger {
  public constructor(
    private readonly stdout: WritableStreamLike,
    private readonly stderr: WritableStreamLike
  ) {}

  /* eslint-disable @typescript-eslint/no-explicit-any */
  public info(message: string, ...optionalParams: any[]): void {
    const output = util.format(message, ...optionalParams)
    this.stdout.write(output + EOL)
  }

  public infoNoLine(message: string, ...optionalParams: any[]): void {
    const output = util.format(message, ...optionalParams)
    this.stdout.write(output)
  }

  public error(message: string, ...optionalParams: any[]): void {
    const output = util.format(message, ...optionalParams)
    this.stderr.write(output + EOL)
  }
}

export async function logTimeTaken(
  command: () => Promise<void>,
  operationName: string,
  stdout: WritableStreamLike
): Promise<void> {
  const start = performance.now()
  await command()
  const end = performance.now()
  const MILLISECONDS_PER_SECOND = 1000
  const seconds = (end - start) / MILLISECONDS_PER_SECOND
  stdout.write(
    `${operationName} took ${seconds.toLocaleString()} seconds.` + EOL
  )
}
