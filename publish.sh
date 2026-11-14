#!/usr/bin/env bash
# Copy the working plugin into this repo and publish it.
# The working copy lives outside the repo, so this is the one-way sync.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
src="${1:-$HOME/Documents/deepseek-harness/default-workspace/plugin-studio}"
[ -f "$src/package.json" ] || { echo "no package.json in $src" >&2; exit 1; }
rsync -a --delete \
  --exclude '.git' --exclude 'node_modules' --exclude '.DS_Store' \
  "$src/" "$here/plugin-studio/"
cd "$here"
git add -A
git diff --cached --quiet && { echo "nothing to publish"; exit 0; }
git commit -m "plugin-studio: sync from working copy"
git push origin main
