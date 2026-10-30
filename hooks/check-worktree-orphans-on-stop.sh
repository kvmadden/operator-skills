#!/usr/bin/env bash
# check-worktree-orphans-on-stop.sh — Claude Code Stop hook.
#
# When a Claude Code session ends inside a Cowork-spawned git worktree, check
# if the worktree's branch has unmerged commits ahead of the default branch.
# If so, print a warning so the operator decides what to do BEFORE the
# worktree fades from view.
#
# Hook contract:
#   - Stdout is shown to the operator after the assistant turn ends.
#   - Exit 0 always (don't block session close).
#   - Be fast. Under 100ms ideal. Never block.
#
# Detection:
#   - cwd contains `/.claude/worktrees/` -> we're in a Cowork-spawned worktree
#   - `git rev-list <default>..HEAD --count` > 0 -> unmerged commits exist
#
# Default branch detection: tries `main` then `master`. Skips silently if neither.

set +e  # don't blow up the session on any subcommand failure
cwd="$(pwd)"

# Only fire if we're inside a Cowork-spawned worktree
case "$cwd" in
  */.claude/worktrees/*) ;;
  *) exit 0 ;;
esac

# Need git available
command -v git >/dev/null 2>&1 || exit 0

# Determine default branch (main vs master)
default_branch="main"
if ! git -C "$cwd" rev-parse --verify "$default_branch" >/dev/null 2>&1; then
  if git -C "$cwd" rev-parse --verify master >/dev/null 2>&1; then
    default_branch="master"
  else
    exit 0  # no main/master — can't compute diff
  fi
fi

# Count commits ahead of default
ahead="$(git -C "$cwd" rev-list --count "${default_branch}..HEAD" 2>/dev/null)"
[ -z "$ahead" ] && exit 0
[ "$ahead" -le 0 ] && exit 0

# We have unmerged commits — print the warning
branch="$(git -C "$cwd" rev-parse --abbrev-ref HEAD 2>/dev/null)"
last_subject="$(git -C "$cwd" log -1 --format=%s 2>/dev/null | head -c 80)"

cat <<EOF

⚠  Worktree orphan check — this Claude session ran in a worktree with unmerged commits.

   branch:        $branch
   commits ahead: $ahead
   last commit:   $last_subject

   Decide before this fades from view:
     · merge to $default_branch:    cd \$(git -C "$cwd" rev-parse --show-toplevel | sed 's|/\.claude/.*||') && git merge $branch
     · open PR:                     cd "$cwd" && gh pr create --base $default_branch --head $branch
     · push for later:              cd "$cwd" && git push origin HEAD
     · discard:                     git worktree remove "$cwd" && git branch -D $branch

EOF
exit 0
