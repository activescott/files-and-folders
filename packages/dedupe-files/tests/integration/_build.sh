#!/usr/bin/env sh
THISDIR=$(cd $(dirname "$0"); pwd) #this script's directory
THISSCRIPT=$(basename $0)

echo "Rebuilding package..."
pushd .

cd "${THISDIR}/../.."

npm run build

popd

echo "Rebuilding package complete.\n"