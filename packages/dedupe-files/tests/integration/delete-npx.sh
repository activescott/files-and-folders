#!/usr/bin/env sh
THISDIR=$(cd $(dirname "$0"); pwd) #this script's directory
THISSCRIPT=$(basename $0)

TEMP_ROOT=$(mktemp -d -t dedupe-files-delete)

echo "Creating fresh ${TEMP_ROOT}..."
rm -rf "${TEMP_ROOT}"
mkdir "${TEMP_ROOT}"
mkdir "${TEMP_ROOT}/one"
mkdir "${TEMP_ROOT}/two"

echo "\ncopying test files to ${TEMP_ROOT}"
cp -R "$THISDIR/../../test-data/one" "${TEMP_ROOT}/"
cp -R "$THISDIR/../../test-data/two" "${TEMP_ROOT}/"

echo "\nrunning dedupe-files..."

npx dedupe-files@beta delete \
  "${TEMP_ROOT}/one" \
  "${TEMP_ROOT}/two"

echo "\nshowing result:"
find "${TEMP_ROOT}"
