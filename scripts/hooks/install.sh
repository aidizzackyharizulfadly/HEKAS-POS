#!/usr/bin/env bash
# Install HEKAS POS git hooks.
# Run from hekas-app/ or scripts/hooks/.
#
# Hooks:
#   pre-commit:  lint-staged (prettier check) + svelte-check (errors only)
#   commit-msg:  enforce conventional commit format
#   pre-push:    run vitest unit test suite
#
# Bypass dengan SKIP_SIMPLE_GIT_HOOKS=1 untuk emergency commits.
set -e

repo_root="$(git rev-parse --show-toplevel)"
hooks_dir="$repo_root/.git/hooks"
source_dir="$(cd "$(dirname "$0")" && pwd)"

echo "📦 Installing git hooks to $hooks_dir..."

for hook in pre-commit commit-msg pre-push; do
	cp "$source_dir/$hook" "$hooks_dir/$hook"
	chmod +x "$hooks_dir/$hook"
	echo "  ✅ $hook"
done

echo ""
echo "✨ All git hooks installed."
echo ""
echo "Bypass dengan SKIP_SIMPLE_GIT_HOOKS=1 git commit/push (untuk emergency)."
echo "Uninstall:  rm $hooks_dir/pre-commit $hooks_dir/commit-msg $hooks_dir/pre-push"