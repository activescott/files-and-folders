import util from "node:util"

export type StreamLike = {
  write(str: string): void
}

const EOL = "\n"
export class StreamLogger {
  public constructor(
    private readonly stdout: StreamLike,
    private readonly stderr: StreamLike
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
