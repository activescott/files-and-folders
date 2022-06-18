import { FileTracker } from "../lib/FileTracker.js"
import type { WritableStreamLike } from "@activescott/putty/streams"
import { StreamLogger } from "@activescott/putty/streams"

export interface DeleteOptions {
  /** The set of directories to search for duplicate files in. */
  input_paths: string[]
  dryRun?: boolean
}

export type DeleteFileFunction = (path: string) => Promise<void>

export default async function deleteCommand(
  options: DeleteOptions,
  deleteFileImpl: DeleteFileFunction,
  stdOut: WritableStreamLike,
  stdErr: WritableStreamLike
): Promise<void> {
  const logger = new StreamLogger(stdOut, stdErr)
  const tracker: FileTracker = await FileTracker.findDuplicates(
    options.input_paths,
    logger
  )

  const deleteFileDryRun = async (path: string): Promise<void> =>
    logger.info("(dry run) NOT deleting", path)
  const deleteFileSeriously = async (path: string): Promise<void> => {
    logger.info("Deleting", path)
    await deleteFileImpl(path)
  }

  const deleteFileOrDryRun = options.dryRun
    ? deleteFileDryRun
    : deleteFileSeriously

  for await (const files of tracker.getFilesWithSameContent(logger)) {
    for (let index = 1; index < files.length; index++) {
      const oldPath: string = files[index] as string
      await deleteFileOrDryRun(oldPath)
    }
  }
}
