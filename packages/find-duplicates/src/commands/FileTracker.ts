import { getFileSize, hashFile } from "../lib/fs.js"
import { basename } from "node:path"
import { filter, map } from "irritable-iterable"
import type { Chain } from "../../node_modules/irritable-iterable/dist/es/chain.js"
import { cpus, EOL } from "node:os"
import type { StreamLogger } from "./StreamLogger.js"

interface FileInfo {
  path: string
  priority: number
}

class FileHasher {
  private filePathsByHash = new Map<string, FileInfo[]>()

  public async trackFiles(files: FileInfo[]): Promise<void> {
    const promises = files.map((file) => this.trackFile(file))
    await Promise.all(promises)
  }

  public async trackFile(file: FileInfo): Promise<void> {
    const hash = await hashFile(file.path)
    let paths = this.filePathsByHash.get(hash)
    if (!paths) {
      paths = []
      this.filePathsByHash.set(hash, paths)
    }
    paths.push(file)
  }

  public getAllEntries(): Iterable<[string, FileInfo[]]> {
    return this.filePathsByHash
  }

  public getFilesWithSameContent(): Iterable<string[]> {
    // filter down to only those hashes that had more than one file...
    // ...sort by priority and return only the path
    const filteredPaths = map(this.filePathsByHash, ([, paths]) => paths)
      .filter((paths) => paths.length > 1)
      .map((files) => files.sort((a, b) => a.priority - b.priority))
      .map((files) => files.map((file) => file.path))

    return filteredPaths
  }
}

export class FileTracker {
  private filePathsBySize = new Map<number, FileInfo[]>()
  private filePathsByName = new Map<string, FileInfo[]>()
  private filePathsWithSameSizeCount = 0
  private _fileCount = 0

  public fileCount(): number {
    return this._fileCount
  }

  public async *getFilesWithSameContent(
    logger: StreamLogger
  ): AsyncGenerator<string[]> {
    // leverage filePathsBySize to avoid expensive hashing of files unnecessarily (if size is different, obviously hash will be too!)
    const pathsWithSameSizes: Chain<FileInfo[]> = map(
      this.filePathsBySize,
      ([, paths]) => paths
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
      `Hashing ${this.filePathsWithSameSizeCount.toLocaleString()} files in batches of ${MAX_OUTSTANDING_HASHES}...`
    )
    const hasher = new FileHasher()
    let allPromises: Promise<unknown>[] = []
    let completedCount = 0
    for (const paths of pathsWithSameSizes) {
      const somePromises = paths.map((paths) => hasher.trackFile(paths))
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

    for (const paths of hasher.getFilesWithSameContent()) {
      yield paths
    }
  }

  public getFilesWithSameName(): Iterable<[string, FileInfo[]]> {
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
    await Promise.all([this.trackFileSize(file), this.trackFileName(file)])
    this._fileCount++
  }

  private async trackFileSize(file: FileInfo): Promise<void> {
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
  }

  private async trackFileName(file: FileInfo): Promise<void> {
    const name = basename(file.path)
    let files = this.filePathsByName.get(name)
    if (!files) {
      files = []
      this.filePathsByName.set(name, files)
    }
    files.push(file)
  }
}
