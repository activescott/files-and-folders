import { getFileSize, hashFile, isDirectory } from "./fs.js"
import { basename, resolve } from "node:path"
import { filter, map } from "irritable-iterable"
import { cpus, EOL } from "node:os"
import type { StreamLogger } from "./StreamLogger.js"
import { opendir } from "node:fs/promises"
import assert from "node:assert"
import { humanReadableDataSize } from "./format.js"

interface FileInfo {
  path: string
  priority: number
}

interface FileInfoWithSize extends FileInfo {
  sizeInBytes: number
}

class FileHasher {
  private filePathsByHash = new Map<string, FileInfoWithSize[]>()

  public async trackFiles(files: FileInfoWithSize[]): Promise<void> {
    const promises = files.map((file) => this.trackFile(file))
    await Promise.all(promises)
  }

  public async trackFile(file: FileInfoWithSize): Promise<void> {
    const hash = await hashFile(file.path)
    let paths = this.filePathsByHash.get(hash)
    if (!paths) {
      paths = []
      this.filePathsByHash.set(hash, paths)
    }
    paths.push(file)
  }

  public getAllEntries(): Iterable<[string, FileInfoWithSize[]]> {
    return this.filePathsByHash
  }

  public getFilesWithSameContent(): Iterable<FileInfoWithSize[]> {
    // filter down to only those hashes that had more than one file...
    // ...sort by priority and return only the path
    const filteredPaths = map(this.filePathsByHash, ([, paths]) => paths)
      .filter((paths) => paths.length > 1)
      .map((files) => files.sort((a, b) => a.priority - b.priority))

    return filteredPaths
  }
}

export abstract class FileTracker {
  private filePathsBySize = new Map<number, FileInfo[]>()
  private filePathsByName = new Map<string, FileInfoWithSize[]>()
  private filePathsWithSameSizeCount = 0
  private _fileCount = 0

  public static async findDuplicates(
    input_paths: string[],
    logger: StreamLogger
  ): Promise<FileTracker> {
    const tracker = new FileTrackerImpl()
    const traverser = async (path: string, priority: number): Promise<void> => {
      logger.info(`Searching ${path} (priority ${priority})`)
      if (!(await isDirectory(path))) {
        logger.error(`${path} is not a directory`)
        return
      }
      const dir = await opendir(path)
      const promisedTrackers: Promise<unknown>[] = []

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
    const promisedTraversers: Promise<void>[] = []
    for (let priority = 0; priority < input_paths.length; priority++) {
      const path: string = input_paths[priority] as string
      promisedTraversers.push(traverser(path, priority))
    }
    await Promise.all(promisedTraversers).catch((reason) =>
      logger.error(String(reason))
    )
    logger.info(`Found ${tracker.fileCount().toLocaleString()} files...`)
    return tracker
  }

  public fileCount(): number {
    return this._fileCount
  }

  public async *getFilesWithSameContent(
    logger: StreamLogger
  ): AsyncGenerator<string[]> {
    // leverage filePathsBySize to avoid expensive hashing of files unnecessarily (if size is different, obviously hash will be too!)
    const filesWithSameSizes: Iterable<FileInfoWithSize[]> = map(
      this.filePathsBySize,
      ([size, paths]) => paths.map((path) => ({ sizeInBytes: size, ...path }))
    ).filter((paths) => paths.length > 1)

    /**
     * Here are some anecdotal timings for different values of MAX_OUTSTANDING_HASHES on a network
     * drive with ~3K photos with lots of duplicates via `time ./tests/photos-small.sh`:
     *   1: 25s
     *   4: 19s
     *   8: 17s (cpus().length)
     *  16: 18s
     *  32: 18s
     *  64: 17s
     * 125: 18s
     * 250: 17s
     * 500: 17s
     * tldr; no meaningful difference with single-digit thousand files.
     */
    // maintain an upper bound of maximum open file handles
    const MAX_OPEN_FILES = 500
    const ANECDOTAL_FACTOR = 8
    const MAX_OUTSTANDING_HASHES = Math.min(
      cpus().length * ANECDOTAL_FACTOR,
      MAX_OPEN_FILES
    )
    logger.infoNoLine(
      `Hashing ${this.filePathsWithSameSizeCount.toLocaleString()} files in batches of ${MAX_OUTSTANDING_HASHES}: `
    )
    const hasher = new FileHasher()
    let allPromises: Promise<unknown>[] = []
    let completedCount = 0
    for (const files of filesWithSameSizes) {
      const somePromises = files.map((file) => hasher.trackFile(file))
      allPromises = allPromises.concat(somePromises)
      if (allPromises.length > MAX_OUTSTANDING_HASHES) {
        await Promise.all(allPromises)
        completedCount += MAX_OUTSTANDING_HASHES
        allPromises = []
        const PERCENT = 100
        logger.infoNoLine(
          Math.round(
            (completedCount / this.filePathsWithSameSizeCount) * PERCENT
          ) + "%..."
        )
      }
    }
    if (allPromises.length > 0) {
      await Promise.all(allPromises)
    }
    logger.info(EOL + "Hashing files complete.")

    // NOTE: a full extra iteration of these duplicate files for the sole purpose of getting the size of files:
    let sizeInBytes = 0
    for (const files of hasher.getFilesWithSameContent()) {
      assert(files[0])
      sizeInBytes += (files.length - 1) * files[0].sizeInBytes
    }
    logger.info(
      `Duplicate files consume ${humanReadableDataSize(sizeInBytes)}.`
    )

    for (const files of hasher.getFilesWithSameContent()) {
      yield files.map((f) => f.path)
    }
  }

  public getFilesWithSameName(): Iterable<[string, FileInfoWithSize[]]> {
    return filter(this.filePathsByName, ([, files]) => files.length > 1)
  }

  public async *getFilesWithSameNameDifferentContent(): AsyncGenerator<
    string[]
  > {
    // duplicate name, diff values:
    const duplicateNames = this.getFilesWithSameName()
    for (const entry of duplicateNames) {
      const [, files] = entry
      const dupeNamesTracker = new FileHasher()
      await dupeNamesTracker.trackFiles(files)

      // now dupeNamesTracker has all files with the same name.
      // if there's more than one entry, then they have the same name, but different content.
      const entries = Array.from(dupeNamesTracker.getAllEntries())
      if (entries.length > 1) {
        // now we know files with the same name have different hashes...
        // flatten the files out from each entry:
        const flattened = map(entries, ([, files]) => files)
          .collect()
          .flat()
        // sort them by priority and turn them into paths
        const sorted = flattened
          .sort((a, b) => a.priority - b.priority)
          .map((f) => f.path)

        yield sorted
      }
    }
  }

  public async trackFile(file: FileInfo): Promise<void> {
    const fileWithSize: FileInfoWithSize = await this.trackFileSize(file)
    await this.trackFileName(fileWithSize)
    this._fileCount++
  }

  private async trackFileSize(file: FileInfo): Promise<FileInfoWithSize> {
    const size = await getFileSize(file.path)
    let files = this.filePathsBySize.get(size)
    if (!files) {
      files = []
      this.filePathsBySize.set(size, files)
    } else {
      // we'll have to hash/compare these:
      if (files.length == 1) {
        // count the first one too
        this.filePathsWithSameSizeCount++
      }
      this.filePathsWithSameSizeCount++
    }
    files.push(file)
    return { sizeInBytes: size, ...file }
  }

  private async trackFileName(file: FileInfoWithSize): Promise<void> {
    const name = basename(file.path)
    let files = this.filePathsByName.get(name)
    if (!files) {
      files = []
      this.filePathsByName.set(name, files)
    }
    files.push(file)
  }
}

/** Private implementation of FileTracker to prevent FileTracker from being instantiated directly */
class FileTrackerImpl extends FileTracker {}
