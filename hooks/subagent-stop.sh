#!/usr/bin/env bash
# subagent-stop.sh — Claude Code SubagentStop hook.
#
# Fires when any subagent finishes via the Agent tool. Appends one JSON line
# per run to ${CLAUDE_PROJECT_DIR}/.claude/agent-activity.jsonl so the
# operator can audit which agents fired, in which project, and what they
# touched.
#
# Hook contract:
#   - Reads JSON payload from stdin (Claude Code passes hook context this way).
#   - Writes a single JSONL line; never blocks; always exits 0.
#
# Payload fields used:
#   - tool_input.subagent_type        — the agent name (e.g. "react-builder")
#   - tool_input.description          — short description of the task
#   - tool_response.content[].text    — agent's reply text (we keep first 2000 chars)
#   - session_id                       — Claude Code session identifier
#
# Output JSONL shape per row:
#   { ts, agent, project, description, session_id, summary, files_touched, duration_seconds }
#
# If jq is not installed, falls back to a best-effort grep/sed parser (less
# reliable on edge-case characters but never blocks).

set -euo pipefail

# Default log location: per-project, alongside other Claude state.
LOG_DIR="${CLAUDE_PROJECT_DIR:-$PWD}/.claude"
LOG_FILE="$LOG_DIR/agent-activity.jsonl"
mkdir -p "$LOG_DIR"

# Read the hook payload from stdin
PAYLOAD="$(cat)"

# Helper: extract a JSON field with jq if available, otherwise grep
get_field() {
  local field="$1"
  if command -v jq >/dev/null 2>&1; then
    echo "$PAYLOAD" | jq -r "$field // empty" 2>/dev/null || true
  else
    # Best-effort fallback (less reliable but no dependencies)
    echo "$PAYLOAD" | grep -oE "\"${field##.}\"\\s*:\\s*\"[^\"]*\"" | head -1 | sed 's/.*"\([^"]*\)"$/\1/' || true
  fi
}

# Extract fields
AGENT="$(get_field '.tool_input.subagent_type')"
DESCRIPTION="$(get_field '.tool_input.description')"
SESSION_ID="$(get_field '.session_id')"
TIMESTAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
CWD="$(pwd)"

# If we couldn't identify an agent, this isn't an Agent tool call — exit silently
[ -z "$AGENT" ] && exit 0

# Pull out the agent's response summary (first 2000 chars of all text blocks)
if command -v jq >/dev/null 2>&1; then
  SUMMARY="$(echo "$PAYLOAD" | jq -r '
    .tool_response.content // [] |
    map(select(.type == "text") | .text) |
    join("\n") |
    .[0:2000]
  ' 2>/dev/null || echo "")"

  # File paths mentioned in the response (heuristic: anything looking like a path)
  FILES="$(echo "$SUMMARY" | grep -oE '[a-zA-Z0-9_./-]+\.(tsx?|jsx?|md|css|json|sql|sh|py|html|yaml|yml|toml)' | sort -u | head -20 | jq -R -s -c 'split("\n") | map(select(length > 0))' 2>/dev/null)" || FILES="[]"
else
  SUMMARY="$(echo "$PAYLOAD" | head -c 2000)"
  FILES="[]"
fi

# Duration would require a PreToolUse companion hook; default to 0 for now.
DURATION=0

# Compose the JSON record. Prefer jq for safe escaping; fall back to printf.
if command -v jq >/dev/null 2>&1; then
  jq -nc \
    --arg ts "$TIMESTAMP" \
    --arg agent "$AGENT" \
    --arg cwd "$CWD" \
    --arg desc "$DESCRIPTION" \
    --arg session "$SESSION_ID" \
    --arg summary "$SUMMARY" \
    --argjson files "$FILES" \
    --argjson duration $DURATION \
    '{
      ts: $ts,
      agent: $agent,
      project: $cwd,
      description: $desc,
      session_id: $session,
      summary: $summary,
      files_touched: $files,
      duration_seconds: $duration
    }' >> "$LOG_FILE"
else
  # Fallback: very basic JSON; risk of breaking on quotes in summary
  printf '{"ts":"%s","agent":"%s","project":"%s","description":"%s","session_id":"%s","summary":"%s","files_touched":[],"duration_seconds":0}\n' \
    "$TIMESTAMP" "$AGENT" "$CWD" \
    "$(echo "$DESCRIPTION" | sed 's/"/\\"/g')" \
    "$SESSION_ID" \
    "$(echo "$SUMMARY" | sed 's/"/\\"/g' | tr -d '\n')" \
    >> "$LOG_FILE"
fi

# Always exit 0 — never block the agent on hook failures
exit 0
