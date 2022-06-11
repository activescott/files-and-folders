#!/usr/bin/env sh
THISDIR=$(cd $(dirname "$0"); pwd) #this script's directory
THISSCRIPT=$(basename $0)

npx dedupe-files@beta delete \
  /Volumes/scott-photos/photos \
  /Volumes/home/\!Backups/PHOTOS
