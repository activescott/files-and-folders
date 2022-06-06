#!/usr/bin/env node
import { fileURLToPath } from "url"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import print from "./commands/print.js"

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
    .command<{ input_paths: string[]; names: boolean }>(
      "print [options] <input_paths..>",
      "find duplicates and print them out",
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
        await print(argv, process.stdout, process.stderr)
      }
    )
    .scriptName("find-duplicates")
    .demandCommand()
    .help()
    .parse()
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main(process)
}
