# dedupe-files

Given a set of paths, find all files that are the same file (by content, ignore name) across the set of paths and take an action on it such as **print** out the duplicates, or **delete** the duplicate or **move** the duplicates to a specified directory.

## Install / Requirements

Requires Node.js >=16
Just run it with `npx` (as shown below) or install it globally with `npm install -g dedupe-files`

## Usage

```sh
npx dedupe-files [print | move dest_path | delete] input_path [input_path...]
```

### Example

```
$ npx dedupe-files print --out "duplicates.txt" \
  "./test-data/one" \
  "./test-data/two"

Searching /Users/scott/src/activescott/files-and-folders/packages/dedupe-files/tests/integration/../../test-data/one (priority 0)
Searching /Users/scott/src/activescott/files-and-folders/packages/dedupe-files/tests/integration/../../test-data/two (priority 1)
Searching /Users/scott/src/activescott/files-and-folders/packages/dedupe-files/test-data/two/toodeep (priority 1)
Found 8 files...
Writing to output file /Users/scott/src/activescott/files-and-folders/packages/dedupe-files/tests/integration/duplicates.txt.
Comparing files with identical sizes...
Hashing 6 files in batches of 64...
Hashing files complete.
Duplicates written to output file /Users/scott/src/activescott/files-and-folders/packages/dedupe-files/tests/integration/duplicates.txt.
```

duplicates.txt:

```
content identical: /Users/scott/src/activescott/files-and-folders/packages/dedupe-files/test-data/one/eye-test.jpg and /Users/scott/src/activescott/files-and-folders/packages/dedupe-files/test-data/two/not-the-eye-test-pic.jpg
content identical: /Users/scott/src/activescott/files-and-folders/packages/dedupe-files/test-data/one/tv-test-pattern.png and /Users/scott/src/activescott/files-and-folders/packages/dedupe-files/test-data/two/tv-test-pattern.png
```

## Features

- Actions to be taken on duplicates:
  - `print`
  - `move`
  - `delete`
- Priorities: Files have priorities. Essentially the ones that are first on the specified set of input paths will be considered the "original".
- Algorithm: Compares sizes first, and then hashes files. Could maybe be faster by doing partial hashes of same-size files

## Roadmap

- [x] feat: searches multiple input paths
- [x] feat: compares files by content, not merely name or size

  - name same, content different
  - name same, content different, size same
  - name different, content same

- [x] chore: typescript. because types help (proven to myself yet again)
- [x] chore: fix git paths (git dir needs moved up to parent monorepo dir)
- [x] feat: optimize perf by tracking all files w/ size instead of hash, and only hash files where size is the same
- [x] feat: use deterministic algorithm to classify the "original" and the "duplicate" (i.e. first argument passed in is a higher priority for "original")

  - [x] test: test-dir/one test-dir/two
  - [x] test: test-dir/two test-dir/one

- actions to be taken for each duplicate:

- [x] feat: print/dry-run action (no action) for found duplicate: prints to output file or stdout

- [ ] feat: move file action for found duplicate to specified path
  - [ ] Use the "original" file's name with a postfixed a counter for uniqueness
- [ ] feat: delete action for found duplicate

## Alternatives

- [`rdfind`](https://github.com/pauldreik/rdfind) does this quite well but it isn't very flexible on what to do with the duplicates and it's slow (despite being in c++, which is not as easy to maintain or contribute to by others.

Below are more but I found these after I was well down the road of writing this one...

- https://github.com/mixu/file-dedupe ?
- https://qarmin.github.io/czkawka/ ?
- https://www.pixelbeat.org/fslint/ ?
