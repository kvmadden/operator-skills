#!/usr/bin/env bash
# subagent-stop.sh: Claude Code SubagentStop hook for operator-skills.
#
# Records one metadata line each time a subagent finishes. It never stores
# reply text, prompts, file names, file contents or paths, so a credential or
# a patient identifier in a reply, a directory name or a custom agent name
# cannot be copied into this log.
#
# Input contract, read from the installed Claude Code 2.1.304 bundle (not
# captured from a live session): stdin is one JSON object with session_id,
# transcript_path, cwd, permission_mode, hook_event_name ("SubagentStop"),
# stop_hook_active, agent_id, agent_type, agent_transcript_path and
# last_assistant_message.
#
# What it records: time, event, session_id and agent_id when they have the
# expected id shape, agent_type when it is a built-in Claude Code agent type
# (other names become "custom-" plus a 12-character hash), project_id (a
# 12-character hash of the project path), stop_hook_active, and the length
# of the last reply. Set OPERATOR_SKILLS_LOG_AGENT_NAMES=1 to keep custom
# agent names that are plain identifiers.
#
# Output contract: prints nothing and exits 0 on every path.
#
# Where it writes: a private directory (mode 700, not a symlink, owned by
# this user, never inside the project): $OPERATOR_SKILLS_STATE_DIR, or
# ${XDG_STATE_HOME:-$HOME/.local/state}/operator-skills. The file is
# agent-activity.jsonl, mode 600, never written through a symlink. Past
# 1 MiB it moves to agent-activity.jsonl.1 under a lock, so two subagents
# finishing together cannot destroy the archive.
#
# Off switch: OPERATOR_SKILLS_ACTIVITY_LOG=off. Requires jq. Without jq it
# records nothing.

umask 077
trap 'exit 0' ERR

[ "${OPERATOR_SKILLS_ACTIVITY_LOG:-on}" = "off" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0
# state-dir.sh is linted on its own (it is in hooks/*.sh).
# shellcheck source=/dev/null
. "$(dirname "$0")/state-dir.sh" || exit 0

payload="$(cat 2>/dev/null)" || exit 0
[ -n "$payload" ] || exit 0

fields="$(printf '%s' "$payload" | jq -r '
  select(type == "object") |
  [ (.hook_event_name // "" | tostring), (.session_id // "" | tostring), (.agent_id // "" | tostring),
    (.agent_type // "" | tostring), (.cwd // "" | tostring), (.stop_hook_active | if . == null then "" else tostring end),
    (if (.last_assistant_message | type) == "string" then (.last_assistant_message | length | tostring) else "" end) ]
  | map(gsub("[\u0000-\u001f]"; " ")) | join("\u001f")' 2>/dev/null)" || exit 0
[ -n "$fields" ] || exit 0
IFS=$'\x1f' read -r event session agent_id agent_type project stop_active chars <<< "$fields"
[ -n "$agent_id" ] || [ -n "$agent_type" ] || exit 0

case "$session" in *[!A-Za-z0-9-]*|'') session="" ;; esac
[ "${#session}" -le 64 ] || session=""
case "$agent_id" in *[!A-Za-z0-9_-]*|'') agent_id="" ;; esac
[ "${#agent_id}" -le 64 ] || agent_id=""
case "$agent_type" in
  general-purpose|Explore|Plan|statusline-setup|claude-code-guide|fork) ;;
  '') ;;
  *)
    if [ "${OPERATOR_SKILLS_LOG_AGENT_NAMES:-0}" = "1" ] && [ "${#agent_type}" -le 64 ] && [[ "$agent_type" =~ ^[A-Za-z0-9:_-]+$ ]]; then :
    else agent_type="custom-$(operator_skills_hash12 "$agent_type")"; fi ;;
esac
project_id=""
[ -n "$project" ] && project_id="$(operator_skills_hash12 "$project")"

state_dir="$(operator_skills_state_dir "$project")"
[ -n "$state_dir" ] || exit 0
log_file="$state_dir/agent-activity.jsonl"
[ -L "$log_file" ] && exit 0

record="$(jq -nc --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" --arg event "$event" --arg session "$session" \
  --arg agent_id "$agent_id" --arg agent_type "$agent_type" --arg project_id "$project_id" \
  --arg stop_active "$stop_active" --arg chars "$chars" '
  { ts: $ts,
    event: ($event | if . == "" then null else . end),
    session_id: ($session | if . == "" then null else . end),
    agent_id: ($agent_id | if . == "" then null else . end),
    agent_type: ($agent_type | if . == "" then null else . end),
    project_id: ($project_id | if . == "" then null else . end),
    stop_hook_active: (if $stop_active == "true" then true elif $stop_active == "false" then false else null end),
    last_message_chars: ($chars | if . == "" then null else tonumber end) }' 2>/dev/null)" || exit 0
[ -n "$record" ] || exit 0

lock="$state_dir/.activity.lock"
if operator_skills_lock "$lock"; then
  if [ -f "$log_file" ] && [ ! -L "$log_file" ]; then
    size="$(wc -c < "$log_file" 2>/dev/null | tr -d ' ')"
    if [ -n "$size" ] && [ "$size" -gt 1048576 ] 2>/dev/null; then
      mv -f "$log_file" "$log_file.1" 2>/dev/null || true
    fi
  fi
  [ -L "$log_file" ] || printf '%s\n' "$record" >> "$log_file" 2>/dev/null || true
  rmdir "$lock" 2>/dev/null || true
else
  # Could not take the lock: append without rotating, which cannot destroy the archive.
  [ -L "$log_file" ] || printf '%s\n' "$record" >> "$log_file" 2>/dev/null || true
fi
[ -f "$log_file" ] && [ ! -L "$log_file" ] && chmod 600 "$log_file" 2>/dev/null
exit 0
