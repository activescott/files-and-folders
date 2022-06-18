import { join, parse } from "node:path"
import { exists, isDirectory } from "@activescott/putty/fs"
import type { WritableStreamLike } from "@activescott/putty/streams"
import { StreamLogger } from "@activescott/putty/streams"
import { FileTracker } from "../lib/FileTracker.js"

export type MoveFileFunction = (
  oldPath: string,
  newPath: string
) => Promise<void>

export type FileExistsFunction = (path: string) => Promise<boolean>

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
  stdOut: WritableStreamLike,
  stdErr: WritableStreamLike
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
      const { name, ext } = parse(oldPath)
      let newPath = join(options.out, name + ext)
      let counter = 0
      while (await exists(newPath)) {
        const { name, ext } = parse(oldPath)
        newPath = join(options.out, name + ` (${++counter})` + ext)
      }
      logger.info("Moving", oldPath, "to", newPath)
      await moveFileImpl(oldPath, newPath)
    }
  }
}
