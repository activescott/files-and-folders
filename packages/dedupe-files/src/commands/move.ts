import { basename, join } from "node:path"
import { isDirectory } from "../lib/fs.js"
import type { StreamLike } from "../lib/StreamLike.js"
import { StreamLogger } from "../lib/StreamLogger.js"
import { FileTracker } from "../lib/FileTracker.js"

export type MoveFileFunction = (
  oldPath: string,
  newPath: string
) => Promise<void>

export interface MoveOptions {
  /** The set of directories to search for duplicate files in. */
  input_paths: string[]
  /** The specifies a directory name to output the duplicate files to. */
  out: string
}

/** A function to execute the move of the file. */

export default async function move(
  options: MoveOptions,
  moveFileImpl: MoveFileFunction,
  stdOut: StreamLike,
  stdErr: StreamLike
): Promise<void> {
  if (!(await isDirectory(options.out))) {
    throw new Error(
      `out must be a directory that exists (was "${options.out}")`
    )
  }
  const logger = new StreamLogger(stdOut, stdErr)
  const tracker: FileTracker = await FileTracker.findDuplicates(
    options.input_paths,
    logger
  )
  for await (const files of tracker.getFilesWithSameContent(logger)) {
    for (let index = 1; index < files.length; index++) {
      const oldPath: string = files[index] as string
      const fname = basename(oldPath)
      const newPath = join(options.out, fname)
      logger.info("Moving", oldPath, "to", newPath)
      moveFileImpl(oldPath, newPath)
    }
  }
}
