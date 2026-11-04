#!/usr/bin/env bash
# check-worktree-orphans-on-stop.sh: Claude Code Stop hook for operator-skills.
#
# When the session directory is a linked git worktree (git-dir differs from
# git-common-dir) and its work is not in the default branch, or the worktree
# has uncommitted changes, this hook shows the user one short warning. Each
# distinct state (HEAD, default-branch tip, clean or dirty, unmerged count)
# is warned about once per session.
#
# Input contract (Claude Code 2.1.304, read from the installed bundle): stdin
# is one JSON object with session_id, cwd, hook_event_name ("Stop") and
# stop_hook_active, among other fields. Stop runs at the end of every
# assistant turn.
#
# Output contract: one JSON object, {"systemMessage": "..."}, which Claude
# Code shows to the user. Always exits 0. The message holds counts, short
# SHAs, the branch name and the worktree path. It never holds commit
# subjects and never holds shell commands.
#
# What counts as merged: HEAD is reachable from the local or remote-tracking
# default branch, or every path the branch changed since its merge base is
# identical at the default-branch tip and at HEAD. That covers fast-forward,
# rebase, cherry-pick and squash merges, and it reports work that was merged
# and then reverted, and work that exists only in a merge commit. A later
# change on the default branch to the same paths also makes the work look
# unmerged, which errs toward warning.
#
# Safety: git runs with fsmonitor, untracked cache, external diff, textconv
# and optional locks turned off, so repository configuration cannot make
# this hook run a program or write to the index. State lives in a private
# directory outside the project (see state-dir.sh) and is never written
# through a symlink. If state cannot be saved, the warning still shows.

umask 077
trap 'exit 0' ERR
export GIT_OPTIONAL_LOCKS=0

payload="$(cat 2>/dev/null)" || payload=""
have_jq=0
command -v jq >/dev/null 2>&1 && have_jq=1

json_get() {
  # Prints a top-level string or boolean field. Without jq only plain
  # identifier-shaped values (session_id, stop_hook_active) can be read.
  [ -n "$payload" ] || return 0
  if [ "$have_jq" = "1" ]; then
    printf '%s' "$payload" | jq -r --arg k "$1" \
      'if type == "object" then (.[$k] | if type == "string" or type == "boolean" then tostring else empty end) else empty end' \
      2>/dev/null || true
  else
    printf '%s' "$payload" | tr -d '\n' | sed -n "s/.*\"$1\"[[:space:]]*:[[:space:]]*\"\{0,1\}\([A-Za-z0-9-]\{1,64\}\)\"\{0,1\}[[:space:]]*[,}].*/\1/p" | head -1
  fi
}

[ "$(json_get stop_hook_active)" = "true" ] && exit 0

cwd=""
[ "$have_jq" = "1" ] && cwd="$(json_get cwd)"
[ -n "$cwd" ] || cwd="$PWD"
session_id="$(json_get session_id)"

command -v git >/dev/null 2>&1 || exit 0
g() {
  git -C "$cwd" -c core.fsmonitor=false -c core.untrackedCache=false -c diff.external= \
    -c core.hooksPath=/dev/null "$@" 2>/dev/null
}

[ "$(g rev-parse --is-inside-work-tree)" = "true" ] || exit 0
git_dir="$(g rev-parse --path-format=absolute --git-dir)" || exit 0
common_dir="$(g rev-parse --path-format=absolute --git-common-dir)" || exit 0
[ -n "$git_dir" ] && [ -n "$common_dir" ] || exit 0
[ "$git_dir" != "$common_dir" ] || exit 0   # main checkout, not a linked worktree

top="$(g rev-parse --show-toplevel)" || exit 0
head_sha="$(g rev-parse --verify --quiet HEAD)" || exit 0
[ -n "$head_sha" ] || exit 0
short_sha="$(g rev-parse --short HEAD)" || short_sha="${head_sha:0:8}"
branch="$(g symbolic-ref --quiet --short HEAD)" || branch=""

# Default branch: origin/HEAD first, then init.defaultBranch, then common names.
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
bases=()
if [ -n "$default_name" ]; then
  if g show-ref --verify --quiet "refs/heads/$default_name"; then bases+=("refs/heads/$default_name"); fi
  if g show-ref --verify --quiet "refs/remotes/origin/$default_name"; then bases+=("refs/remotes/origin/$default_name"); fi
fi

if dirty_output="$(g status --porcelain=v1 --untracked-files=normal)"; then
  if [ -n "$dirty_output" ]; then
    dirty_count="$(printf '%s\n' "$dirty_output" | wc -l | tr -d ' ')"
  else
    dirty_count=0
  fi
  [ -n "$dirty_count" ] || dirty_count=0
else
  dirty_count="unknown"
fi

paths_between() (
  set -o pipefail
  g diff --no-ext-diff --no-textconv --name-only --no-renames -z "$1" "$2" | tr '\0' '\n' | LC_ALL=C sort -u
)

ahead="unknown"
unknown_reason="No usable default branch reference was found"
base_tips="none"
if [ -n "$branch" ] && [ "$branch" = "$default_name" ]; then
  ahead=0   # the default branch itself: only uncommitted changes are reported
elif [ "${#bases[@]}" -gt 0 ]; then
  base_tips=""
  base_tips_ok=1
  for b in "${bases[@]}"; do
    if tip="$(g rev-parse --verify --quiet "$b")" && [ -n "$tip" ]; then
      base_tips="${base_tips}${tip} "
    else
      base_tips_ok=0
      break
    fi
  done
  if [ "$base_tips_ok" -eq 1 ]; then
    unreachable="$(g rev-list --count HEAD --not "${bases[@]}")" || unreachable=""
    if [ "$unreachable" = "0" ]; then
      ahead=0
    elif [ -n "$unreachable" ]; then
      ahead="$unreachable"
      for b in "${bases[@]}"; do
        if mb="$(g merge-base "$b" HEAD)" && [ -n "$mb" ]; then :; else
          ahead="unknown"
          unknown_reason="Git could not find a merge base reliably"
          break
        fi
        if changed="$(paths_between "$mb" HEAD)"; then :; else
          ahead="unknown"
          unknown_reason="Git could not compare the worktree paths reliably"
          break
        fi
        if differing="$(paths_between "$b" HEAD)"; then :; else
          ahead="unknown"
          unknown_reason="Git could not compare the default branch paths reliably"
          break
        fi
        if [ -z "$changed" ] || [ -z "$(LC_ALL=C comm -12 <(printf '%s\n' "$changed") <(printf '%s\n' "$differing") | sed '/^$/d')" ]; then
          ahead=0
          break
        fi
      done
    else
      unknown_reason="Git could not inspect commit reachability reliably"
    fi
  else
    base_tips="unknown"
    unknown_reason="Git could not inspect the default branch references reliably"
  fi
fi

# Nothing to report: all work is in the default branch and the tree is clean.
if [ "$ahead" = "0" ] && [ "$dirty_count" = "0" ]; then exit 0; fi

dirty_flag=0
if [ "$dirty_count" = "unknown" ]; then dirty_flag="unknown"; elif [ "$dirty_count" -gt 0 ] 2>/dev/null; then dirty_flag=1; fi
key="$head_sha|$base_tips|$dirty_flag|$ahead"

# Dedupe: one file per session holding every state already warned about.
if [ -z "$session_id" ]; then
  session_id="anon-$(printf '%s' "$top" | { shasum -a 256 2>/dev/null || sha256sum 2>/dev/null; } | cut -c1-16)"
fi
safe_session="$(printf '%s' "$session_id" | tr -cd 'A-Za-z0-9_-' | cut -c1-64)"
[ -n "$safe_session" ] || safe_session="nosession"
key_file=""
# state-dir.sh is linted on its own (it is in hooks/*.sh).
# shellcheck source=/dev/null
if . "$(dirname "$0")/state-dir.sh" 2>/dev/null; then
  state_dir="$(operator_skills_state_dir "$top")"
  if [ -n "$state_dir" ]; then
    check_dir="$state_dir/worktree-check"
    if [ ! -L "$check_dir" ] && mkdir -p "$check_dir" 2>/dev/null && [ -d "$check_dir" ] && [ ! -L "$check_dir" ]; then
      key_file="$check_dir/$safe_session"
      if [ -e "$key_file" ] && { [ -L "$key_file" ] || [ ! -f "$key_file" ]; }; then key_file=""; fi
    fi
  fi
fi
if [ -n "$key_file" ] && [ -f "$key_file" ] && grep -Fxq -- "$key" "$key_file" 2>/dev/null; then
  exit 0
fi

nl=$'\n'
msg="operator-skills: this session ran in a linked git worktree with work that may not be saved anywhere else.${nl}Worktree: $top"
if [ -n "$branch" ]; then
  msg="$msg${nl}Branch: $branch at $short_sha"
else
  msg="$msg${nl}Detached HEAD at $short_sha. Create a branch at that commit before removing the worktree, or the commits become hard to find."
fi
if [ "$ahead" = "unknown" ]; then
  msg="$msg${nl}Merge state: unknown. $unknown_reason. Needs review."
elif [ "$ahead" != "0" ]; then
  msg="$msg${nl}Commits not found in $default_name: $ahead (newest $short_sha)."
fi
if [ "$dirty_count" -gt 0 ] 2>/dev/null; then
  if [ "$dirty_count" = "1" ]; then msg="$msg${nl}Uncommitted changes: 1 path."
  else msg="$msg${nl}Uncommitted changes: $dirty_count paths."; fi
elif [ "$dirty_count" = "unknown" ]; then
  msg="$msg${nl}Uncommitted state: unknown. Git status failed, so this worktree needs review."
fi
msg="$msg${nl}Before removing this worktree, merge or push the work, or open a pull request. Removing a worktree with unmerged or uncommitted work can lose it."

if [ "$have_jq" = "1" ]; then
  out="$(jq -nc --arg m "$msg" '{systemMessage: $m}' 2>/dev/null)" || out=""
fi
if [ -z "${out:-}" ]; then
  esc="${msg//\\/\\\\}"
  esc="${esc//\"/\\\"}"
  esc="${esc//$'\n'/\\n}"
  esc="${esc//$'\r'/\\r}"
  esc="${esc//$'\t'/\\t}"
  esc="$(printf '%s' "$esc" | LC_ALL=C tr -d '\000-\010\013\014\016-\037')"
  out="{\"systemMessage\":\"$esc\"}"
fi
printf '%s\n' "$out" || exit 0

# Save the state only after the warning was printed. Failure here is harmless.
if [ -n "$key_file" ]; then
  { printf '%s\n' "$key" >> "$key_file"; } 2>/dev/null || true
  if [ "$(wc -l < "$key_file" 2>/dev/null | tr -d ' ')" -gt 200 ] 2>/dev/null; then
    tmp_file="$key_file.tmp.$$"
    { tail -n 200 "$key_file" > "$tmp_file" && mv -f "$tmp_file" "$key_file"; } 2>/dev/null || rm -f "$tmp_file" 2>/dev/null
  fi
fi
exit 0
