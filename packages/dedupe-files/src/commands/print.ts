import { FileTracker } from "../lib/FileTracker.js"
import { StreamLogger, WritableStreamLike } from "@activescott/putty/streams"
import { createWriteStream, WriteStream } from "node:fs"

export interface PrintOptions {
  /** The set of directories to search for duplicate files in. */
  input_paths: string[]
  /** include files with duplicate names, but different content */
  names?: boolean
  /** The specifies a file name to output the duplicate file paths to. If not specified output goes to outStream */
  out?: string
}

export default async function print(
  options: PrintOptions,
  stdOut: WritableStreamLike,
  stdErr: WritableStreamLike
): Promise<void> {
  if (!options.input_paths) {
    throw new Error("input_paths must be provided")
  }
  if (!Array.isArray(options.input_paths)) {
    throw new Error("input_paths must be an array")
  }
  const logger = new StreamLogger(stdOut, stdErr)
  const tracker: FileTracker = await FileTracker.findDuplicates(
    options.input_paths,
    logger
  )

  let outFile: StreamLogger | undefined = undefined
  let outStream: WriteStream
  if (options.out) {
    logger.info(`Writing to output file ${options.out}.`)
    outStream = createWriteStream(options.out)
    outFile = new StreamLogger(outStream, outStream)
  }
  const duplicateCount = await writeOutputString(
    tracker,
    options,
    logger,
    outFile
  )
  if (options.out) {
    logger.info(
      `${duplicateCount.toLocaleString()} duplicate files written to output file ${
        options.out
      }.`
    )
  }
}

async function writeOutputString(
  tracker: FileTracker,
  options: PrintOptions,
  logger: StreamLogger,
  outFile?: StreamLogger
): Promise<number> {
  let duplicateCount = 0
  // if there is an output file use it; otherwise just use stdout
  outFile = outFile ? outFile : logger
  // duplicate content:
  logger.info("Comparing files with identical sizes...")
  for await (const paths of tracker.getFilesWithSameContent(logger)) {
    outFile.info("content identical: " + paths.join(" and "))
    duplicateCount++
  }

  // duplicate names
  if (options.names) {
    logger.info("Comparing contents of files with identical names...")
    for await (const pathsWithSameNamesDiffContent of tracker.getFilesWithSameNameDifferentContent()) {
      outFile.info(
        "content differs with identical name: " +
          pathsWithSameNamesDiffContent.join(" and ")
      )
      duplicateCount++
    }
  }
  return duplicateCount
}
