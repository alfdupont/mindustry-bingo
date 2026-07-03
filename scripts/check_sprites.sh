#!/bin/bash

PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )"
DB_FILE="${PROJECT_DIR}/public/js/db.js"
SPRITES_DIR="${PROJECT_DIR}/public/assets/sprites"

total=0
missing=0

while IFS= read -r id; do
    total=$((total + 1))
    if [ ! -f "${SPRITES_DIR}/${id}.png" ]; then
        echo "MISSING sprite for id: ${id}"
        missing=$((missing + 1))
    fi
done < <(grep -oP '"id":\s*"\K[^"]+' "${DB_FILE}")

echo "Checked ${total} bingo entries, ${missing} missing sprite(s)."

if [ "${missing}" -gt 0 ]; then
    exit 1
fi
