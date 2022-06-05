# files and folders command line utilities

Utilities to manage files and folders.
Lets try to make them reusable and portable.

## Todo:

### find-duplicates

```
find-duplicates [print | delete | move dest_path] input_path [input_path...]
```

Given a set of paths, find all files that are the same file (by content, ignore name) across the set of paths. [`rdfind`](https://github.com/pauldreik/rdfind) does this quite well but it isn't very flexible on what to do with the duplicates and it's slow (despite being in c++, which is not as easy to maintain or contribute to by others.

Requirements:

- [ ] feat: searches multiple input paths
- [ ] feat: compares files by content, not merely name or size

  - name same, content different
  - name same, content different, size same
  - name different, content same

- [ ] chore: typescript. because types help (proven to myself yet again)
- [ ] chore: fix git paths (git dir needs moved up to parent monorepo dir)
- [ ] feat: optimize perf by tracking all files w/ size instead of hash, and only hash files where size is the same
- [ ] feat: use deterministic algorithm to classify the "original" and the "duplicate" (i.e. first argument passed in is a higher priority for "original")

  - [ ] test: test-dir/one test-dir/two
  - [ ] test: test-dir/two test-dir/one

- actions to be taken for each duplicate:

  - [ ] feat: print/dry-run action (no action) for found duplicate: prints to output file or stdout
  - [ ] feat: delete action for found duplicate
  - [ ] feat: move file action for found duplicate to specified path
    - [ ] Use the "original" file's name with a postfixed a counter for uniqueness

- [ ] feat: optimize perf more by doing a file comparison (or partial comparison) before hashing?

### organize-by-date

```
organize-by-date [dry-run | move dest_path] input_path [input_path...]
```

Given a set of input paths, find each file and move them to a destination root organized in a hierarchy by `year/month`. This is hyper useful for photos (among other things).

Requirements:

- [ ] feat: searches multiple input paths
- [ ] feat: dry-run support (no action taken on each file, just log it)
- [ ] feat: action to move file to a provided dest/root path
- [ ] feat: handles duplicates in the dest root path by deleting detected duplicates (duplicates by content only)
- [ ] feat: allow specifying a pattern for organization using other attributes of the file (created, modified, photo tags, music tags, etc.)
