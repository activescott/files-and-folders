import { isDirectory } from "../lib/fs.js"
import { resolve } from "node:path"
import { opendir } from "node:fs/promises"
import { FileTracker } from "./FileTracker.js"
import { StreamLike, StreamLogger } from "./StreamLogger.js"
import { createWriteStream, WriteStream } from "node:fs"

export interface PrintOptions {
  input_paths: string[]
  /** include files with duplicate names, but different content */
  names?: boolean
  /** The specifies a file name to output the duplicate file paths to. If not specified output goes to outStream */
  out?: string
}

export default async function print(
  options: PrintOptions,
  stdOut: StreamLike,
  stdErr: StreamLike
): Promise<void> {
  if (!options.input_paths) {
    throw new Error("input_paths must be provided")
  }
  if (!Array.isArray(options.input_paths)) {
    throw new Error("input_paths must be an array")
  }
  const logger = new StreamLogger(stdOut, stdErr)

  const inputPathsResolved = options.input_paths.map((p) => resolve(p))
  const tracker = new FileTracker()
  //TODO: refactor this whole traverser business into FileTracker.
  const traverser = async (path: string, priority: number): Promise<void> => {
    logger.info(`Searching ${path} (priority ${priority})`)
    if (!(await isDirectory(path))) {
      logger.error(`${path} is not a directory`)
      return
    }
    const dir = await opendir(path)
    const promisedTrackers: Promise<unknown>[] = []

    //TODO: filter & map via irritable iterable:
    for await (const entry of dir) {
      if (entry.isFile()) {
        const promise = tracker.trackFile({
          path: resolve(dir.path, entry.name),
          priority: priority,
        })
        promisedTrackers.push(promise)
      } else if (entry.isDirectory()) {
        const promise = traverser(resolve(dir.path, entry.name), priority)
        promisedTrackers.push(promise)
      }
    }
    await Promise.all(promisedTrackers)
  }

  const promisedTraverses: Promise<void>[] = []
  for (let priority = 0; priority < inputPathsResolved.length; priority++) {
    const path: string = inputPathsResolved[priority] as string
    promisedTraverses.push(traverser(path, priority))
  }
  await Promise.all(promisedTraverses).catch((reason) =>
    logger.error(String(reason))
  )
  logger.info(`Found ${tracker.fileCount().toLocaleString()} files...`)

  let outFile: StreamLogger | undefined = undefined
  let outStream: WriteStream
  if (options.out) {
    logger.info(`Writing to output file ${options.out}.`)
    outStream = createWriteStream(options.out)
    outFile = new StreamLogger(outStream, outStream)
  }
  await writeOutputString(tracker, options, logger, outFile)
  if (options.out) {
    logger.info(`Duplicates written to output file ${options.out}.`)
  }
}

async function writeOutputString(
  tracker: FileTracker,
  options: PrintOptions,
  logger: StreamLogger,
  outFile?: StreamLogger
): Promise<void> {
  // if there is an output file use it; otherwise just use stdout
  outFile = outFile ? outFile : logger
  // duplicate content:
  logger.info("Comparing files with identical sizes...")
  for await (const paths of tracker.getFilesWithSameContent(logger)) {
    outFile.info("content identical: " + paths.join(" and "))
  }

  // duplicate names
  if (options.names) {
    logger.info("Comparing contents of files with identical names...")
    for await (const pathsWithSameNamesDiffContent of tracker.getFilesWithSameNameDifferentContent()) {
      outFile.info(
        "content differs with identical name: " +
          pathsWithSameNamesDiffContent.join(" and ")
      )
    }
  }
}
