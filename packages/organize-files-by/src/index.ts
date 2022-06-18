#!/usr/bin/env node
import { basename } from "node:path"
import { fileURLToPath } from "url"
import { Command } from "commander"
import organize, { OrganizeOptions } from "./lib/organizer.js"
import { rename } from "node:fs/promises"
import { StreamLogger } from "@activescott/putty/streams"

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
    name                           The name of the file without extension or directory.
    ext                            The extension of the file from the last occurrence of the . character to the end of the name.
    byear                          The four digit year of the file's birth/creation time according to local time.
    bmonth                         The zero-based month of the file's birth time according to local time.
    bdate                          The day of the month (between 1 and 31) for the file's birth time according to local time.

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
    .option(
      "--delete-empty",
      "Deletes any empty directories left after moving files"
    )
    .argument("<dest_path>", "path to move organized files to")
    .argument("<input_paths...>", "paths to find the files to be organized")
    .action(
      async (
        dest_path: string,
        input_paths: string[],
        options: OrganizeOptions
      ) => {
        const logger = new StreamLogger(process.stdout, process.stderr)
        await organize(logger, rename, dest_path, input_paths, options)
      }
    )

  await program.parseAsync(process.argv)
}

if (
  (process.argv.length > 1 &&
    process.argv[1] === fileURLToPath(import.meta.url)) ||
  basename(process.argv[1] as string) === "organize-files-by"
) {
  await main(process)
}
