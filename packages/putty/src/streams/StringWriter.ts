// from https://nodejs.org/api/stream.html#implementing-a-writable-stream
import { Writable, WritableOptions } from "node:stream"
import { StringDecoder } from "node:string_decoder"

export class StringWriter extends Writable {
  private _decoder: StringDecoder
  private _data: string

  public constructor(options?: WritableOptions) {
    super(options)
    this._decoder = new StringDecoder(
      options ? options.defaultEncoding : "utf8"
    )
    this._data = ""
  }

  public override _write(
    chunk: ChunkAny,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void
  ): void {
    if (chunk instanceof Buffer) {
      chunk = this._decoder.write(chunk)
    }
    this._data += chunk
    callback()
  }

  public override _final(callback: (error?: Error | null) => void): void {
    this._data += this._decoder.end()
    callback()
  }

  public override toString(): string {
    return this._data
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChunkAny = any
