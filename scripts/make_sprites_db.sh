#!/bin/bash

PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../bingo/assets/sprites" >/dev/null 2>&1 && pwd )"
cd "${PROJECT_DIR}" || exit 1
for i in *; do echo "    "'"'"${i%\.png}"'"'": "'"'"assets/sprites/${i}"'"'","; done
