import type { StreamLogger } from "@activescott/putty/streams"
import { isDirectory } from "@activescott/putty/fs"
import { opendir } from "node:fs/promises"
import { join, normalize } from "node:path"
import { repath } from "./repath.js"

export interface OrganizeOptions {
  pattern: string
  "dry-run"?: boolean
}

export type MoveFileFunction = (
  oldPath: string,
  newPath: string
) => Promise<void>

export default async function organize(
  logger: StreamLogger,
  moveFileImpl: MoveFileFunction,
  dest_path: string,
  input_paths: string[],
  options: OrganizeOptions
): Promise<void> {
  const traverser = async (path: string, priority: number): Promise<void> => {
    logger.info(`Searching ${path} (priority ${priority})`)
    if (!(await isDirectory(path))) {
      logger.error(`${path} is not a directory`)
      return
    }
    const dir = await opendir(path)
    for await (const entry of dir) {
      if (entry.isFile()) {
        const oldPath = join(dir.path, entry.name)
        const newPath = await repath(oldPath, dest_path, options.pattern)
        if (normalize(oldPath) != normalize(newPath)) {
          await moveFileImpl(oldPath, newPath)
        }
      }
    }
  }
  const promisedTraversers: Promise<void>[] = []
  for (let priority = 0; priority < input_paths.length; priority++) {
    const path: string = input_paths[priority] as string
    promisedTraversers.push(traverser(path, priority))
  }
  await Promise.all(promisedTraversers).catch((reason) =>
    logger.error(String(reason))
  )
}
