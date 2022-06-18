import { stat } from "node:fs/promises"
import { createReadStream, ReadStream } from "node:fs"
import { createHash } from "node:crypto"
import { pipeline } from "node:stream/promises"

export type PathString = string

export async function exists(path: PathString): Promise<boolean> {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

export async function isDirectory(path: PathString): Promise<boolean> {
  try {
    const stats = await stat(path)
    return stats.isDirectory()
  } catch (err) {
    return false
  }
}

export async function getFileSize(path: PathString): Promise<number> {
  try {
    const stats = await stat(path)
    return stats.size
  } catch (err) {
    return 0
  }
}

export async function hashFile(path: PathString): Promise<string> {
  const fileStream = createReadStream(path)
  try {
    return await hashStream(fileStream)
  } finally {
    fileStream.close()
  }
}

export async function hashStream(stream: ReadStream): Promise<string> {
  // NOTE: sha1 is ~2x faster than sha256 and while attacks are possible, we're not using it for security or digital signatures here so it should be fine.
  const hash = createHash("sha1")
  await pipeline(stream, hash)
  return hash.digest("hex")
}
