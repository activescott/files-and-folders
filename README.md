# files and folders command line utilities

Utilities to manage files and folders.
Lets try to make them reusable and portable.

## dedupe-files

See [packages/dedupe-files/README.md](packages/dedupe-files/README.md)


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
