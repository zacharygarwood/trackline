#!/usr/bin/env bash
# Formats and lints a file Claude just edited, then runs the tests related to it.
# Exit code 2 sends the output back to Claude so it can fix the problem.
set -uo pipefail

file=$(jq -r '.tool_input.file_path // empty')
project="${CLAUDE_PROJECT_DIR:-$(pwd)}"

[[ -z "$file" || ! -f "$file" || "$file" != "$project"/* ]] && exit 0
cd "$project" || exit 0

output=$(pnpm exec prettier --write --ignore-unknown --log-level warn "$file" 2>&1) || {
	echo "$output" >&2
	exit 2
}

case "$file" in
*.ts | *.js | *.svelte)
	output=$(pnpm exec eslint --fix --max-warnings 0 --no-warn-ignored "$file" 2>&1) || {
		echo "$output" >&2
		exit 2
	}
	output=$(pnpm exec vitest related --run --passWithNoTests "$file" 2>&1) || {
		echo "$output" >&2
		exit 2
	}
	;;
esac

exit 0
