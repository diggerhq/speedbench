#!/usr/bin/env bash
# Creates one private copy of each fixture per agent: <org>/sb-<agent>-<fixture>.
# Usage: ./setup.sh <org> <agent>...   e.g. ./setup.sh diggerhq computer devin capy replicas hoplite
set -euo pipefail
org=$1; shift
here=$(cd "$(dirname "$0")" && pwd)
for agent in "$@"; do
  for f in "$here"/fixtures/*/; do
    name=sb-$agent-$(basename "$f")
    tmp=$(mktemp -d)
    rsync -a --exclude node_modules "$f" "$tmp/"
    git -C "$tmp" init -q -b main
    git -C "$tmp" add -A
    git -C "$tmp" commit -qm "Initial fixture"
    gh repo create "$org/$name" --private --source "$tmp" --push >/dev/null
    echo "created $org/$name"
  done
done
