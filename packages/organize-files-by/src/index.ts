#!/usr/bin/env node
import { basename } from "node:path"
import { fileURLToPath } from "url"
import { Command } from "commander"

export interface CliProcess {
  argv: string[]
  stdout: StdOutStream
  stderr: StdOutStream
}

export interface StdOutStream {
  write(data: string): void
  end(): void
}

export async function main(process: CliProcess): Promise<void> {
  const program = new Command()
  program
    .name("organize-files-by")
    .usage("[options] <dest_path> <input_paths...>")
    .description(
      "Names files and organizes them into directories based on the attributes and metadata of the file using a pattern that you specify."
    )
    .showHelpAfterError()
    .addHelpText(
      "after",
      `
Pattern Syntax
The pattern option is a required option that specifies the names of folders and the file using a set of placeholders defined with a tags name surrounded in double brace characters like this {{my-tag}}.

  Supported tags:
    name                              The name of the file without extension or directory.
    ext                               The extension of the file from the last occurrence of the . character to the end of the name.
    cre-year                          The year portion of the file's creation time.
    cre-month                         The month portion of the file's creation time.
    cre-day                           The day portion of the file's creation time.

  Future tags:
    id3-???
    exif-???
    mime-type
    mime-subtype
`
    )
    .requiredOption(
      "-p, --pattern <pattern>",
      "Specifies a pattern for the file and directory name. See Pattern Syntax below."
    )
    .option(
      "-d, --dry-run",
      "Only prints out what would be moved but doesn't actually move the files."
    )
    .argument("<dest_path>", "path to move organized files to")
    .argument("<input_paths...>", "paths to find the files to be organized")

  await program.parseAsync(process.argv)
}

if (
  (process.argv.length > 1 &&
    process.argv[1] === fileURLToPath(import.meta.url)) ||
  basename(process.argv[1] as string) === "organize-files-by"
) {
  await main(process)
}
