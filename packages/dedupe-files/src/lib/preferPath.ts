import { parse } from "node:path"
export type FileInfo = {
  path: string
  priority: number
}

export function preferredFileComparer(a: FileInfo, b: FileInfo): number {
  // if the priority is different use that, otherwise we'll try to prefer files that don't have a postfix with a number
  const priority = a.priority - b.priority
  if (priority !== 0) {
    return priority
  }
  // see if the longest path is only different by a postfixed number:
  if (a.path.length === b.path.length) {
    // doesn't matter:
    return 0
  }
  // if a has a numeric postfix on on it choose b. if it doesn't, then lets hope for the best and choose a
  if (hasNumericPostfix(a.path)) {
    if (!hasNumericPostfix(b.path)) {
      return 1
    } else {
      // they both end in numbers, lets choose the shortest:
      return a.path.length - b.path.length
    }
  }
  // eslint-disable-next-line no-magic-numbers
  return -1
}

const hasNumericPostfix = (path: string): boolean => {
  const parts = parse(path)
  const rex = /(\s*\d+)$|(\s*\(\d+\))$/
  return rex.test(parts.name)
}
