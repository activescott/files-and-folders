# organize-files-by

Names files and organizes them into directories based on the attributes and metadata of the file using a pattern that you specify.

[![NPM version](https://img.shields.io/npm/v/organize-files-by.svg)](https://www.npmjs.com/package/organize-files-by)
[![Node Version](https://img.shields.io/node/v/organize-files-by.svg)](https://github.com/activescott/files-and-folders)
[![Build Status](https://github.com/activescott/files-and-folders/workflows/organize-files-by-build/badge.svg?branch=main)](https://github.com/activescott/files-and-folders/actions?query=workflow%3Aorganize-files-by-build)
[![License](https://img.shields.io/github/license/activescott/files-and-folders.svg)](https://github.com/activescott/files-and-folders/blob/master/LICENSE)

## Install / Requirements

Requires Node.js >=16
Just run it with `npx` (as shown below) or install it globally with `npm install -g organize-files-by`

## Usage

```
Usage: organize-files-by [options] <dest_path> <input_paths...>

Names files and organizes them into directories based on the attributes and metadata of the file using a pattern that you specify.

Arguments:
  dest_path                path to move organized files to
  input_paths              paths to find the files to be organized

Options:
  -p, --pattern <pattern>  Specifies a pattern for the file and directory name. See Pattern Syntax below.
  -d, --dry-run            Only prints out what would be moved but doesn't actually move the files.
  -h, --help               display help for command

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
```

## Requirements:

Given a set of input paths, find each file and move them to a destination root organized in a hierarchy by `year/month`. This is hyper useful for photos (among other things).

- [ ] feat: searches multiple input paths
- [ ] feat: dry-run support (no action taken on each file, just log it)
- [ ] feat: handles duplicates in the destination by appending a postfixed number
