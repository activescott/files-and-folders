#!/usr/bin/env node
import { basename } from "node:path"
import { rename } from "fs/promises"
import { fileURLToPath } from "url"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import move from "./commands/move.js"
import print from "./commands/print.js"
import { logTimeTaken } from "./lib/StreamLogger.js"

export interface CliProcess {
  argv: string[]
  stdout: StdOutStream
  stderr: StdOutStream
}

export interface StdOutStream {
  write(data: string): void
  end(): void
}

export function main(process: CliProcess): void {
  yargs(hideBin(process.argv))
    .command<{ input_paths: string[]; out?: string; names: boolean }>(
      "print [options] <input_paths..>",
      "find duplicate files and print them out",
      (yargs) => {
        // see https://github.com/yargs/yargs/issues/541#issuecomment-573347835
        return (
          yargs
            .positional("input_paths", {
              describe: "paths to search for duplicates",
            })
            // see https://yargs.js.org/docs/#api-reference-optionskey-opt
            .options({
              n: {
                alias: "names",
                demandOption: false,
                default: false,
                describe:
                  "include files with duplicate names, but different content",
                type: "boolean",
              },
              o: {
                alias: "out",
                demandOption: false,
                default: false,
                describe:
                  "A file name to output the duplicate file paths to. If not specified, file paths are written to stdout.",
                type: "string",
              },
            })
        )
      },
      async (argv) => {
        // console.log({ command: "print", argv })
        await logTimeTaken(
          () => print(argv, process.stdout, process.stderr),
          "print",
          process.stdout
        )
      }
    )
    .command<{ input_paths: string[]; out: string }>(
      "move [options] <input_paths..>",
      "find duplicate files and move them to specified destination path",
      (yargs) => {
        return (
          yargs
            .positional("input_paths", {
              describe: "paths to search for duplicates",
            })
            // see https://yargs.js.org/docs/#api-reference-optionskey-opt
            .options({
              o: {
                alias: "out",
                demandOption: true,
                default: "",
                describe: "A file name to output the duplicate files to.",
                type: "string",
              },
            })
        )
      },
      async (argv) => {
        // console.log({ command: "move", argv })
        await logTimeTaken(
          () => move(argv, rename, process.stdout, process.stderr),
          "move",
          process.stdout
        )
      }
    )
    .scriptName("dedupe-files")
    .demandCommand()
    .help()
    .parse()
}

if (
  (process.argv.length > 1 &&
    process.argv[1] === fileURLToPath(import.meta.url)) ||
  basename(process.argv[1] as string) === "dedupe-files"
) {
  main(process)
}
