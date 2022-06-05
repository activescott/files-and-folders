#!/usr/bin/env sh
THISDIR=$(cd $(dirname "$0"); pwd) #this script's directory
THISSCRIPT=$(basename $0)

# 2014 is <3K photos and takes ~20s:
node "$THISDIR/../dist/es/index.js" print \
  --out "${THISDIR}/${THISSCRIPT}.out" \
  '/Volumes/scott-photos/photos/2014' \
  '/Volumes/home/!Backups/PHOTOS/Photos - backup misc/2014'
