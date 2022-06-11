import { FileTracker } from "../lib/FileTracker.js"
import type { StreamLike } from "../lib/StreamLike.js"
import { StreamLogger } from "../lib/StreamLogger.js"

export interface DeleteOptions {
  /** The set of directories to search for duplicate files in. */
  input_paths: string[]
}

export type DeleteFileFunction = (path: string) => Promise<void>

export default async function deleteCommand(
  options: DeleteOptions,
  deleteFileImpl: DeleteFileFunction,
  stdOut: StreamLike,
  stdErr: StreamLike
): Promise<void> {
  const logger = new StreamLogger(stdOut, stdErr)
  const tracker: FileTracker = await FileTracker.findDuplicates(
    options.input_paths,
    logger
  )

  for await (const files of tracker.getFilesWithSameContent(logger)) {
    for (let index = 1; index < files.length; index++) {
      const oldPath: string = files[index] as string
      logger.info("Deleting", oldPath)
      await deleteFileImpl(oldPath)
    }
  }
}
