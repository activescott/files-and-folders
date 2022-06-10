[![npm version](https://badge.fury.io/js/dedupe-files.svg)](https://www.npmjs.com/package/dedupe-files)
[![npm downloads](https://img.shields.io/npm/dt/dedupe-files.svg?logo=npm)](https://www.npmjs.com/package/dedupe-files)
[![Build Status](https://github.com/activescott/files-and-folders/workflows/build/badge.svg)](https://github.com/activescott/files-and-folders/actions)
[![License](https://img.shields.io/github/license/activescott/files-and-folders.svg)](https://github.com/activescott/files-and-folders/blob/master/LICENSE)

# dedupe-files

Finds all files that are the same file (by content, or optionally name) across the set of paths and **print** out the duplicates, **move** the duplicates to a specified directory, or **delete** the duplicate.

## Install / Requirements

Requires Node.js >=16
Just run it with `npx` (as shown below) or install it globally with `npm install -g dedupe-files`

## Usage

```sh
npx dedupe-files [print | move dest_path | delete] input_path [input_path...]
```

### Examples

#### print

```
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

#### move

```
$ npx dedupe-files@beta move \
  --out "~/Downloads/duplicates" \
  "~/Downloads/one" \
  "~/Downloads/two"

Searching /Users/scott/Downloads/dedupe-files-temp/one (priority 0)
Searching /Users/scott/Downloads/dedupe-files-temp/two (priority 1)
Searching /Users/scott/Downloads/dedupe-files-temp/two/toodeep (priority 1)
Found 8 files...
Hashing 6 files in batches of 64...
Hashing files complete.
Moving /Users/scott/Downloads/dedupe-files-temp/two/not-the-eye-test-pic.jpg to /Users/scott/Downloads/dedupe-files-temp/duplicates/not-the-eye-test-pic.jpg
Moving /Users/scott/Downloads/dedupe-files-temp/two/tv-test-pattern.png to /Users/scott/Downloads/dedupe-files-temp/duplicates/tv-test-pattern.png
```

#### Large Example (with print command)

```
npx dedupe-files print \
  --out "dupe-photos.out" \
  /Volumes/scott-photos/photos \
  /Volumes/home/\!Backups/PHOTOS/

Searching /Volumes/scott-photos/photos (priority 0)
...
Searching /Volumes/home/!Backups/PHOTOS/Scotts Photos Library2020-12-21.photoslibrary/resources/cloudsharing/resources/derivatives/masters/5 (priority 1)
Found 61,347 files...
Writing to output file /Users/scott/src/activescott/files-and-folders/packages/dedupe-files/tests/integration/print-photos-all.sh.out.
Comparing files with identical sizes...
Hashing 29,244 files in batches of 64: 0%...0%...1%...1%...1%...1%...2%...2%...2%...2%...2%...3%...3%...3%...3%...4%...4%...4%...4%...4%...5%...5%...5%...5%...5%...6%...6%...6%...6%...7%...7%...7%...7%...7%...8%...8%...8%...8%...9%...9%...9%...9%...9%...10%...10%...10%...10%...11%...11%...11%...11%...11%...12%...12%...12%...12%...12%...13%...13%...13%...13%...14%...14%...14%...14%...14%...15%...15%...15%...15%...16%...16%...16%...16%...16%...17%...17%...17%...17%...18%...18%...18%...18%...18%...19%...19%...19%...19%...19%...20%...20%...20%...20%...21%...21%...21%...21%...21%...22%...22%...22%...22%...23%...23%...23%...23%...23%...24%...24%...24%...24%...25%...25%...25%...25%...25%...26%...26%...26%...26%...26%...27%...27%...27%...27%...28%...28%...28%...28%...28%...29%...29%...29%...29%...30%...30%...30%...30%...30%...31%...31%...31%...31%...32%...32%...32%...32%...32%...33%...33%...33%...33%...33%...34%...34%...34%...34%...35%...35%...35%...35%...35%...36%...36%...36%...36%...37%...37%...37%...37%...37%...38%...38%...38%...38%...39%...39%...39%...39%...39%...40%...40%...40%...40%...40%...41%...41%...41%...41%...42%...42%...42%...42%...42%...43%...43%...43%...43%...44%...44%...44%...44%...44%...45%...45%...45%...45%...46%...46%...46%...46%...46%...47%...47%...47%...47%...47%...48%...48%...48%...48%...49%...49%...49%...49%...49%...50%...50%...50%...50%...51%...51%...51%...51%...51%...52%...52%...52%...52%...53%...53%...53%...53%...53%...54%...54%...54%...54%...54%...55%...55%...55%...55%...56%...56%...56%...56%...56%...57%...57%...57%...57%...58%...58%...58%...58%...58%...59%...59%...59%...59%...60%...60%...60%...60%...60%...61%...61%...61%...61%...61%...62%...62%...62%...62%...63%...63%...63%...63%...63%...64%...64%...64%...64%...65%...65%...65%...65%...65%...66%...66%...66%...66%...67%...67%...67%...67%...67%...68%...68%...68%...68%...68%...69%...69%...69%...69%...70%...70%...70%...70%...70%...71%...71%...71%...71%...72%...72%...72%...72%...72%...73%...73%...73%...73%...74%...74%...74%...74%...74%...75%...75%...75%...75%...76%...76%...76%...76%...76%...77%...77%...77%...77%...77%...78%...78%...78%...78%...79%...79%...79%...79%...79%...80%...80%...80%...80%...81%...81%...81%...81%...81%...82%...82%...82%...82%...83%...83%...83%...83%...83%...84%...84%...84%...84%...84%...85%...85%...85%...85%...86%...86%...86%...86%...86%...87%...87%...87%...87%...88%...88%...88%...88%...88%...89%...89%...89%...89%...90%...90%...90%...90%...90%...91%...91%...91%...91%...91%...92%...92%...92%...92%...93%...93%...93%...93%...93%...94%...94%...94%...94%...95%...95%...95%...95%...95%...96%...96%...96%...96%...97%...
Hashing files complete.
Duplicate files consume 117.7 GB.
8,978 duplicates written to output file /Users/scott/src/activescott/files-and-folders/packages/dedupe-files/tests/integration/print-photos-all.sh.out.
print took 2264 seconds.
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
- [x] feat: move file action for found duplicate to specified path
  - [x] feat: ensure move command never loses a file by using "original" file's name with a postfixed a counter for uniqueness
- [ ] feat: delete action for found duplicate

## Alternatives

- [`rdfind`](https://github.com/pauldreik/rdfind) does this quite well but it isn't very flexible on what to do with the duplicates and it's slow (despite being in c++, which is not as easy to maintain or contribute to by others.

Below are more but I found these after I was well down the road of writing this one...

- https://github.com/mixu/file-dedupe ?
- https://qarmin.github.io/czkawka/ ?
- https://www.pixelbeat.org/fslint/ ?
