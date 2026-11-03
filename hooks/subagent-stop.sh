#!/usr/bin/env bash
# subagent-stop.sh: Claude Code SubagentStop hook for operator-skills.
#
# Records one metadata line each time a subagent finishes. It never stores
# reply text, prompts, file names or file contents, so a credential or a
# patient identifier that appears in a subagent reply cannot be copied into
# this log.
#
# Input contract, read from the installed Claude Code 2.1.304 bundle (not
# captured from a live session): stdin is one JSON object with session_id,
# transcript_path, cwd, permission_mode, hook_event_name ("SubagentStop"),
# stop_hook_active, agent_id, agent_type, agent_transcript_path and
# last_assistant_message. Only metadata fields are read. The length of
# last_assistant_message is recorded. Its text is not.
#
# Output contract: prints nothing and exits 0 on every path. Claude Code
# treats exit 0 with no output as silent, and exit 2 would keep the subagent
# running, so this script never exits 2.
#
# Where it writes: $OPERATOR_SKILLS_STATE_DIR, or
# ${XDG_STATE_HOME:-$HOME/.local/state}/operator-skills when that is unset.
# The file is agent-activity.jsonl, created with mode 600, outside any
# project tree. When it grows past 1 MiB it is renamed to
# agent-activity.jsonl.1 (one previous file is kept) and a new file starts.
#
# Off switch: OPERATOR_SKILLS_ACTIVITY_LOG=off records nothing.
# Requires jq. Without jq it records nothing and stays silent.

umask 077
trap 'exit 0' ERR

[ "${OPERATOR_SKILLS_ACTIVITY_LOG:-on}" = "off" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0

payload="$(cat 2>/dev/null)" || exit 0
[ -n "$payload" ] || exit 0

# One jq call turns the payload into a metadata record, or fails on input
# that is not a JSON object. last_assistant_message contributes its length only.
record="$(printf '%s' "$payload" | jq -c --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" '
  select(type == "object") |
  {
    ts: $ts,
    event: (.hook_event_name // null),
    session_id: (.session_id // null),
    agent_id: (.agent_id // null),
    agent_type: (.agent_type // null),
    project: (.cwd // null),
    agent_transcript_path: (.agent_transcript_path // null),
    stop_hook_active: (.stop_hook_active // null),
    last_message_chars: (if (.last_assistant_message | type) == "string"
                         then (.last_assistant_message | length) else null end)
  } |
  select(.agent_id != null or .agent_type != null)
' 2>/dev/null)" || exit 0
[ -n "$record" ] || exit 0

state_dir="${OPERATOR_SKILLS_STATE_DIR:-${XDG_STATE_HOME:-$HOME/.local/state}/operator-skills}"
mkdir -p "$state_dir" 2>/dev/null || exit 0
log_file="$state_dir/agent-activity.jsonl"

if [ -f "$log_file" ]; then
  size="$(wc -c < "$log_file" 2>/dev/null | tr -d ' ')"
  if [ -n "$size" ] && [ "$size" -gt 1048576 ] 2>/dev/null; then
    mv -f "$log_file" "$log_file.1" 2>/dev/null || true
  fi
fi

printf '%s\n' "$record" >> "$log_file" 2>/dev/null || true
chmod 600 "$log_file" 2>/dev/null || true
exit 0
