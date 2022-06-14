#!/usr/bin/env node
import { basename } from "node:path"
import { fileURLToPath } from "url"
import { Command } from "commander"
import type { PrintOptions } from "./commands/print.js"
import { logTimeTaken } from "@activescott/putty/streams"
import print from "./commands/print.js"
import { rename } from "node:fs/promises"
import move, { MoveOptions } from "./commands/move.js"
import deleteCommand, { DeleteOptions } from "./commands/delete.js"
import { rm } from "node:fs/promises"

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
    .name("dedupe-files")
    .usage("<command> [options]")
    .description(
      "Finds all duplicate files across the set of paths and then will **print** them out, **move** them to a directory, or **delete** them. Duplicates are identified by their actual content not their name or other attributes."
    )
    .showHelpAfterError()
    .addHelpText(
      "after",
      `
Examples:

The following prints out a line to duplicates.txt for each duplicate file found in /Volumes/photos and /Volumes/backups/photos:

  $ dedupe-files print --out "duplicates.txt" "/Volumes/photos" "/Volumes/backups/photos"

The following moves each duplicate file found in /Volumes/photos and /Volumes/backups/photos to ~/Downloads/duplicates.
The files in ~/Downloads/one are considered more "original" than those in ~/Downloads/two since it appears earlier on the command line:

  $ dedupe-files move --out "~/Downloads/duplicates" "~/Downloads/one" "~/Downloads/two"
`
    )

  program
    .command("print")
    .summary("print out duplicates")
    .description("Prints duplicate files to terminal or to a file.")
    .argument("<input_paths...>")
    .option(
      "-n, --names",
      "include files with duplicate names, but different content"
    )
    .option(
      "-o, --out <file>",
      "A file path to output the duplicate file paths to. If not specified, file paths are written to stdout."
    )
    .action(async (input_paths: string[], options: PrintOptions) => {
      options = { ...options, input_paths }
      await logTimeTaken(
        () => print(options, process.stdout, process.stderr),
        "print",
        process.stdout
      )
    })

  program
    .command("move")
    .summary("move duplicates to a directory")
    .description("Moves duplicate files to a designated directory.")
    .argument("<input_paths...>")
    .requiredOption(
      "-o, --out <path>",
      "Directory to output the duplicate files to."
    )
    .addHelpText(
      "after",
      `
Remarks:

Files in *input_paths* that appear earlier on the command line are considered more "original".
That is, the duplicates that are moved are the ones that are rooted in the last-most *input_paths* argument.
`
    )
    .action(async (input_paths: string[], options: MoveOptions) => {
      options = { ...options, input_paths }
      await logTimeTaken(
        () => move(options, rename, process.stdout, process.stderr),
        "move",
        process.stdout
      )
    })

  program
    .command("delete")
    .summary("delete duplicate files")
    .description("Deletes duplicate files.")
    .argument("<input_paths...>")
    .option("-n, --dry-run", "show what would have been deleted")
    .addHelpText(
      "after",
      `
Remarks:

Files in *input_paths* that appear earlier on the command line are considered more "original".
That is, the duplicates that are deleted are the ones that are rooted in the last-most *input_paths* argument.
If duplicates are in the same directory tree, then which one is deleted is not deterministic (but it will leave one behind).
  `
    )
    .action(async (input_paths: string[], options: DeleteOptions) => {
      options = { ...options, input_paths }
      await logTimeTaken(
        () => deleteCommand(options, rm, process.stdout, process.stderr),
        "delete",
        process.stdout
      )
    })

  await program.parseAsync(process.argv)
}

if (
  (process.argv.length > 1 &&
    process.argv[1] === fileURLToPath(import.meta.url)) ||
  basename(process.argv[1] as string) === "dedupe-files"
) {
  await main(process)
}
