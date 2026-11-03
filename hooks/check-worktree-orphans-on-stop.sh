#!/usr/bin/env bash
# check-worktree-orphans-on-stop.sh: Claude Code Stop hook for operator-skills.
#
# When the session directory is a linked git worktree (git-dir differs from
# git-common-dir) and its HEAD has commits that are not in the default branch,
# or the worktree has uncommitted changes, this hook shows the user one short
# warning. It shows it once per session for a given HEAD, default-branch tip
# and clean or dirty state, so it does not repeat on every turn.
#
# Input contract (Claude Code 2.1.304, read from the installed bundle): stdin
# is one JSON object with session_id, cwd, hook_event_name ("Stop") and
# stop_hook_active, among other fields. Stop runs at the end of every
# assistant turn, not only when a session ends.
#
# Output contract: Claude Code does not show plain stdout from a Stop hook
# that exits 0. A warning is therefore printed as one JSON object,
# {"systemMessage": "..."}, which Claude Code shows to the user. The script
# always exits 0, never blocks the turn and never prints shell commands built
# from branch names, paths or commit subjects.
#
# What counts as merged: a commit is treated as already in the default branch
# when it is reachable from the local or remote-tracking default branch, when
# an equivalent patch is there (rebase or cherry-pick merges), or when the
# combined change of the branch matches one commit there (squash merges). The
# squash check covers the newest 100 commits of the default branch only. When
# the default branch cannot be found, the warning says the merge state is
# unknown instead of claiming there is nothing to merge.
#
# State: dedupe keys live in $OPERATOR_SKILLS_STATE_DIR, or
# ${XDG_STATE_HOME:-$HOME/.local/state}/operator-skills, outside any project.

umask 077
trap 'exit 0' ERR

payload="$(cat 2>/dev/null)" || payload=""

json_get() {
  # Prints a top-level string or boolean field of the payload, or nothing.
  [ -n "$payload" ] || return 0
  command -v jq >/dev/null 2>&1 || return 0
  printf '%s' "$payload" | jq -r --arg k "$1" \
    'if type == "object" then (.[$k] | if type == "string" or type == "boolean" then tostring else empty end) else empty end' \
    2>/dev/null || true
}

[ "$(json_get stop_hook_active)" = "true" ] && exit 0

cwd="$(json_get cwd)"
[ -n "$cwd" ] || cwd="$PWD"
session_id="$(json_get session_id)"

command -v git >/dev/null 2>&1 || exit 0
g() { git -C "$cwd" "$@" 2>/dev/null; }

[ "$(g rev-parse --is-inside-work-tree)" = "true" ] || exit 0
git_dir="$(g rev-parse --path-format=absolute --git-dir)" || exit 0
common_dir="$(g rev-parse --path-format=absolute --git-common-dir)" || exit 0
[ -n "$git_dir" ] && [ -n "$common_dir" ] || exit 0
[ "$git_dir" != "$common_dir" ] || exit 0   # main checkout, not a linked worktree

top="$(g rev-parse --show-toplevel)" || exit 0
head_sha="$(g rev-parse --verify --quiet HEAD)" || exit 0
[ -n "$head_sha" ] || exit 0
short_sha="$(g rev-parse --short HEAD)"
branch="$(g symbolic-ref --quiet --short HEAD)" || branch=""

# Default branch: origin/HEAD first, then init.defaultBranch, then common names.
bases=()
default_name=""
remote_head="$(g symbolic-ref --quiet --short refs/remotes/origin/HEAD)" || remote_head=""
if [ -n "$remote_head" ]; then
  default_name="${remote_head#origin/}"
else
  configured="$(g config --get init.defaultBranch)" || configured=""
  for candidate in "$configured" main master trunk develop; do
    [ -n "$candidate" ] || continue
    if g show-ref --verify --quiet "refs/heads/$candidate" || g show-ref --verify --quiet "refs/remotes/origin/$candidate"; then
      default_name="$candidate"
      break
    fi
  done
fi
if [ -n "$default_name" ]; then
  g show-ref --verify --quiet "refs/heads/$default_name" && bases+=("refs/heads/$default_name")
  g show-ref --verify --quiet "refs/remotes/origin/$default_name" && bases+=("refs/remotes/origin/$default_name")
fi
# A worktree checked out on the default branch itself has nothing to merge.
if [ -n "$branch" ] && [ "$branch" = "$default_name" ]; then
  bases=()
  default_name=""
  branch_is_default=1
else
  branch_is_default=0
fi

dirty_count="$(g status --porcelain=v1 --untracked-files=normal | wc -l | tr -d ' ')"
[ -n "$dirty_count" ] || dirty_count=0

ahead="unknown"
newest_subject=""
squash_note=""
if [ "${#bases[@]}" -gt 0 ]; then
  base_tips="$(for b in "${bases[@]}"; do g rev-parse --verify --quiet "$b"; done | tr '\n' ' ')"
  # A commit is pending when no base contains it or an equivalent patch.
  pending=""
  first=1
  for b in "${bases[@]}"; do
    list="$(g log --format=%H --no-merges --cherry-pick --right-only "$b...HEAD" | sort)"
    if [ "$first" = "1" ]; then
      pending="$list"
      first=0
    else
      pending="$(comm -12 <(printf '%s\n' "$pending") <(printf '%s\n' "$list"))"
    fi
  done
  set -- $pending
  ahead="$#"
  if [ "$ahead" -gt 0 ]; then
    # Squash merge check: the branch's combined diff equals one base commit.
    for b in "${bases[@]}"; do
      mb="$(g merge-base "$b" HEAD)" || continue
      [ -n "$mb" ] || continue
      combined="$(g diff "$mb" HEAD | g patch-id --stable | cut -d' ' -f1)"
      [ -n "$combined" ] || continue
      checked=0
      for c in $(g rev-list --no-merges --max-count=100 "$mb..$b"); do
        checked=$((checked + 1))
        pid="$(g show --format= "$c" | g patch-id --stable | cut -d' ' -f1)"
        if [ "$pid" = "$combined" ]; then
          ahead=0
          break 2
        fi
      done
      [ "$checked" -ge 100 ] && squash_note=" The squash-merge check covered the newest 100 commits of the default branch only."
    done
  fi
  if [ "$ahead" != "0" ]; then
    newest_subject="$(g log -1 --format=%s HEAD | cut -c1-72)"
  fi
else
  base_tips="none"
fi

# Nothing to report: every commit is in the default branch and the tree is clean.
if [ "$branch_is_default" = "1" ] || [ "$ahead" = "0" ]; then
  [ "$dirty_count" -gt 0 ] || exit 0
fi

dirty_flag=0
[ "$dirty_count" -gt 0 ] && dirty_flag=1
state_dir="${OPERATOR_SKILLS_STATE_DIR:-${XDG_STATE_HOME:-$HOME/.local/state}/operator-skills}"
safe_session="$(printf '%s' "${session_id:-nosession}" | tr -cd 'A-Za-z0-9_-' | cut -c1-64)"
[ -n "$safe_session" ] || safe_session="nosession"
key="$head_sha|$base_tips|$dirty_flag|$ahead"
key_file="$state_dir/worktree-check/$safe_session"
if [ -f "$key_file" ] && [ "$(cat "$key_file" 2>/dev/null)" = "$key" ]; then
  exit 0
fi
mkdir -p "$state_dir/worktree-check" 2>/dev/null && printf '%s' "$key" > "$key_file" 2>/dev/null

nl=$'\n'
msg="operator-skills: this session ran in a linked git worktree with work that may not be saved anywhere else.${nl}Worktree: $top"
if [ -n "$branch" ]; then
  msg="$msg${nl}Branch: $branch"
else
  msg="$msg${nl}Detached HEAD at $short_sha. Create a branch at that commit before removing the worktree, or the commits become hard to find."
fi
if [ "$ahead" = "unknown" ]; then
  msg="$msg${nl}Merge state: unknown. No default branch was found (checked origin/HEAD, init.defaultBranch, main, master, trunk and develop), so this hook cannot tell which commits are unmerged. Needs review."
elif [ "$ahead" != "0" ]; then
  msg="$msg${nl}Commits not found in $default_name: $ahead (newest: $newest_subject).$squash_note"
fi
if [ "$dirty_count" -gt 0 ]; then
  msg="$msg${nl}Uncommitted changes: $dirty_count paths."
fi
msg="$msg${nl}Before removing this worktree, merge or push the work, or open a pull request. Removing a worktree with unmerged or uncommitted work can lose it."

if command -v jq >/dev/null 2>&1; then
  jq -nc --arg m "$msg" '{systemMessage: $m}' 2>/dev/null || true
else
  esc="${msg//\\/\\\\}"
  esc="${esc//\"/\\\"}"
  esc="${esc//$'\n'/\\n}"
  esc="${esc//$'\r'/\\r}"
  esc="${esc//$'\t'/\\t}"
  esc="$(printf '%s' "$esc" | LC_ALL=C tr -d '\000-\010\013\014\016-\037')"
  printf '{"systemMessage":"%s"}\n' "$esc"
fi
exit 0
