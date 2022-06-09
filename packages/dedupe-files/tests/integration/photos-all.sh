#!/usr/bin/env sh
THISDIR=$(cd $(dirname "$0"); pwd) #this script's directory
THISSCRIPT=$(basename $0)
node "$THISDIR/../../dist/es/index.js" print \
  --out "${THISDIR}/${THISSCRIPT}.out" \
  /Volumes/scott-photos/photos \
  /Volumes/home/\!Backups/PHOTOS/