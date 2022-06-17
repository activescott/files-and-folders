#!/usr/bin/env sh
THISDIR=$(cd $(dirname "$0"); pwd)

cp -v ${THISDIR}/git-hooks/* "${THISDIR}/.git/hooks/"
