#!/usr/bin/env bash
# Between runs: closes open PRs and deletes every branch but main in each sb-<agent>-* repo.
# Usage: ./reset.sh <org> <agent>...
set -euo pipefail
org=$1; shift
for agent in "$@"; do
  for repo in $(gh repo list "$org" --limit 500 --json name -q ".[].name | select(startswith(\"sb-$agent-\"))"); do
    for pr in $(gh pr list -R "$org/$repo" --state open --json number -q '.[].number'); do
      gh pr close -R "$org/$repo" "$pr" >/dev/null
    done
    for br in $(gh api "repos/$org/$repo/branches" -q '.[].name | select(. != "main")'); do
      gh api -X DELETE "repos/$org/$repo/git/refs/heads/$br" >/dev/null
    done
    echo "reset $org/$repo"
  done
done
