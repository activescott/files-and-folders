export function humanReadableDataSize(sizeInBytes: number): string {
  type Unit = {
    size: number
    name: string
  }

  /* eslint-disable no-magic-numbers */
  const units: Unit[] = [
    { name: "KB", size: 1024 },
    { name: "MB", size: 1024 ** 2 },
    { name: "GB", size: 1024 ** 3 },
    { name: "TB", size: 1024 ** 4 },
  ]

  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  let index = 0
  while (index < units.length && sizeInBytes > units[index]!.size) {
    index++
  }
  index = Math.max(0, index - 1)
  return (
    Number(sizeInBytes / units[index]!.size).toFixed(1) +
    " " +
    units[index]!.name
  )
}
