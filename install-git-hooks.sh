#!/usr/bin/env sh
THISDIR=$(cd $(dirname "$0"); pwd)

cp -v "${THISDIR}/git-hooks/pre-commit" "${THISDIR}/.git/hooks/"
