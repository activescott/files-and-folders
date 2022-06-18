import { stat } from "fs/promises"
import Mustache from "mustache"
import { basename, extname, join } from "path"
import type { PathString } from "@activescott/putty/fs"

/**
 * Returns a new file name based on the specified file's attributes the specified pattern.
 * The returned file will be rooted in `destDir`.
 * @param oldFilePath The existing file.
 * @param destDir The directory that the new file path should be rooted in.
 * @param pathPattern A mustache pattern that will result in a new file name. Can have a *relative* path - but not absolute! Available tags for the pattern are defined in @see StatTags.
 * @returns A new path/file name.
 */
export async function repath(
  oldFilePath: PathString,
  destDir: PathString,
  pathPattern: string
): Promise<PathString> {
  const tags = await getStatTags(oldFilePath)
  const newName = Mustache.render(pathPattern, tags)
  return join(destDir, newName)
}

export interface StatTags {
  name: string
  ext: string
  byear: string
  bmonth: string
  bdate: string
}

export type FileTags = StatTags

async function getStatTags(path: PathString): Promise<StatTags> {
  const stats = await stat(path)
  const name = basename(path)
  const ext = extname(path)
  // more on birthtime vs ctime at https://nodejs.org/api/fs.html#fs_stat_time_values
  const created = new Date(stats.birthtime)
  return {
    name,
    ext,
    byear: created.getFullYear().toFixed(0),
    bmonth: created.getMonth().toFixed(0),
    bdate: created.getDate().toFixed(0),
  }
}
