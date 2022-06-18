#!/usr/bin/env sh
THISDIR=$(cd $(dirname "$0"); pwd) #this script's directory
THISSCRIPT=$(basename $0)

"${THISDIR}/_build.sh"

# 2013+2014 is ~5K photos and takes several minutes:
node "$THISDIR/../../dist/es/index.js" print \
  --out "${THISDIR}/${THISSCRIPT}.out" \
  '/Volumes/scott-photos/photos/2013' \
  '/Volumes/scott-photos/photos/2014' \
  '/Volumes/home/!Backups/PHOTOS/Photos - backup misc/2013' \
  '/Volumes/home/!Backups/PHOTOS/Photos - backup misc/2014'

