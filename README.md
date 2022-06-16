# files and folders command line utilities

Utilities to manage files and folders that I wanted. Trying to make them reusable and portable. Requests and pull requests welcomed!

## dedupe-files

[![NPM version](https://img.shields.io/npm/v/dedupe-files.svg)](https://www.npmjs.com/package/dedupe-files)
[![Node Version](https://img.shields.io/node/v/dedupe-files.svg)](https://github.com/activescott/files-and-folders)

```sh
Usage: dedupe-files <command> [options]

Finds all duplicate files across the set of paths and then will **print** them out, **move** them to a directory, or **delete** them. Duplicates are identified by their actual content not their name or other attributes.

Options:
  -h, --help                        display help for command

Commands:
  print [options] <input_paths...>  print out duplicates
  move [options] <input_paths...>   move duplicates to a directory
  delete <input_paths...>           delete duplicate files
  help [command]                    display help for command

Examples:

The following prints out a line to duplicates.txt for each duplicate file found in /Volumes/photos and /Volumes/backups/photos:

  $ dedupe-files print --out "duplicates.txt" "/Volumes/photos" "/Volumes/backups/photos"

The following moves each duplicate file found in /Volumes/photos and /Volumes/backups/photos to ~/Downloads/duplicates.
The files in ~/Downloads/one are considered more "original" than those in ~/Downloads/two since it appears earlier on the command line:

  $ dedupe-files move --out "~/Downloads/duplicates" "~/Downloads/one" "~/Downloads/two"
```

### Example

```sh
$ npx dedupe-files print \
  --out "duplicates.txt" \
  '/Volumes/scott-photos/photos/2014' \
  '/Volumes/home/!Backups/PHOTOS/Photos - backup misc/2014'

Searching /Volumes/scott-photos/photos/2014 (priority 0)
Searching /Volumes/home/!Backups/PHOTOS/Photos - backup misc/2014 (priority 1)
Searching /Volumes/scott-photos/photos/2014/08 (priority 0)
Searching /Volumes/scott-photos/photos/2014/02 (priority 0)
Searching /Volumes/scott-photos/photos/2014/12 (priority 0)
Searching /Volumes/scott-photos/photos/2014/11 (priority 0)
Searching /Volumes/scott-photos/photos/2014/10 (priority 0)
Searching /Volumes/scott-photos/photos/2014/09 (priority 0)
Searching /Volumes/scott-photos/photos/2014/07 (priority 0)
Searching /Volumes/scott-photos/photos/2014/06 (priority 0)
Searching /Volumes/scott-photos/photos/2014/05 (priority 0)
Searching /Volumes/scott-photos/photos/2014/04 (priority 0)
Searching /Volumes/scott-photos/photos/2014/03 (priority 0)
Searching /Volumes/scott-photos/photos/2014/01 (priority 0)
Found 2,829 files...
Writing to output file /Users/scott/src/activescott/files-and-folders/packages/dedupe-files/tests/integration/print-photos-small.sh.out.
Comparing files with identical sizes...
Hashing 1,749 files in batches of 64: 4%...7%...11%...15%...18%...22%...26%...29%...33%...37%...40%...44%...48%...51%...55%...59%...62%...66%...70%...73%...77%...81%...84%...88%...91%...95%...
Hashing files complete.
Duplicate files consume 5.4 GB.
872 duplicate files written to output file /Users/scott/src/activescott/files-and-folders/packages/dedupe-files/tests/integration/print-photos-small.sh.out.
print took 16.659 seconds.

# duplicates.txt:

content identical: /Volumes/scott-photos/photos/2014/10/IMG_0533.JPG and /Volumes/home/!Backups/PHOTOS/Photos - backup misc/2014/IMG_0070.jpg
content identical: /Volumes/scott-photos/photos/2014/03/IMG_0881.JPG and /Volumes/home/!Backups/PHOTOS/Photos - backup misc/2014/IMG_0881.JPG
...
content identical: /Volumes/scott-photos/photos/2014/08/IMG_1285.MOV and /Volumes/home/!Backups/PHOTOS/Photos - backup misc/2014/IMG_1285.MOV
```

See [packages/dedupe-files/README.md](packages/dedupe-files/README.md) for more detail.

## organize-files-by (future)

See [packages/organize-files-by/README.md](packages/organize-files-by/README.md) for more detail.

## Contributing 🤝

This is a community project. We invite your participation through issues and pull requests! You can peruse the [contributing guidelines](.github/CONTRIBUTING.md).

## Show your support

Give a ⭐️ if this project helped you!

## Release Process (Deploying to NPM)

We use [semantic-release](https://github.com/semantic-release/semantic-release) to consistently release [semver](https://semver.org/)-compatible versions. This project deploys to multiple [npm distribution tags](https://docs.npmjs.com/cli/dist-tag). Each of the below branches correspond to the following npm distribution tags:

| branch | npm distribution tag |
| ------ | -------------------- |
| main   | latest               |
| beta   | beta                 |

To trigger a release use a [Conventional Commit](https://www.conventionalcommits.org/en/v1.0.0/) conventions on one of the above branches. We use the following adjustments to the Conventional Commit conventions:

- **Scope is required**. The scope must be the full name of the package from the package.json. This helps semantic-release and conventional commits work for a monorepo.

## License 📝

Copyright © 2022 [scott@willeke.com](https://github.com/activescott).

This project is [MIT](LICENSE) licensed.
