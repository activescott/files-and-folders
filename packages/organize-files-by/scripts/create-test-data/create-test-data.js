#!/usr/bin/env node
import { rm, mkdir, writeFile } from "node:fs/promises"
import { resolve, join, parse, dirname } from "node:path"
import { utimes } from "utimes"
import { fileURLToPath } from "node:url"

// https://github.com/baileyherbert/utimes

// create a set of files with unique times, paths, & extensions:
const times = [
  "1999-12-30T23:55:10.007Z",
  "2000-11-29T22:44:20.007Z",
  "2001-10-28T21:33:30.007Z",
  "2002-09-27T20:22:40.007Z",
]

const paths = [
  "one/test-{0}.raw",
  "one/test-{0}.mp3",
  "one/test-{0}-no-ext",
  "two/test-{0}.txt",
]
// bring the times and paths together:
const timesIter = times[Symbol.iterator]()
const filesToCreate = paths.map((path) => {
  const btimeStr = timesIter.next().value
  const btime = new Date(btimeStr)
  return {
    path: path.replace("{0}", btimeStr.replace(/:/g, "-")),
    btime,
  }
})
// console.log({ filesToCreate })

// now write them to test-data dir:
const thisDir = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(thisDir, "../../test-data/test-case-1")

await rm(rootDir, { recursive: true, force: true })
await mkdir(rootDir, { recursive: true })

for (let f of filesToCreate) {
  const absPath = join(rootDir, f.path)
  const parts = parse(absPath)
  await mkdir(parts.dir, { recursive: true })
  await writeFile(absPath, JSON.stringify(f))
  await utimes(absPath, {
    btime: f.btime.valueOf(),
  })
}
