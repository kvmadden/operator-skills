# shellcheck shell=bash
# Shared helpers for the operator-skills hooks. Sourced, not executed.

# Prints a private state directory for the hooks, or nothing when it cannot
# be made safe. Safe means: not a symlink, owned by this user, mode 700, and
# not inside the project directory given as $1 (so state cannot be committed).
operator_skills_state_dir() {
  local project="$1" dir real proj
  dir="${OPERATOR_SKILLS_STATE_DIR:-${XDG_STATE_HOME:-$HOME/.local/state}/operator-skills}"
  [ -L "$dir" ] && return 0
  mkdir -p "$dir" 2>/dev/null || return 0
  [ -d "$dir" ] && [ ! -L "$dir" ] && [ -O "$dir" ] || return 0
  chmod 700 "$dir" 2>/dev/null || return 0
  real="$(cd "$dir" 2>/dev/null && pwd -P)" || return 0
  if [ -n "$project" ] && [ -d "$project" ]; then
    proj="$(cd "$project" 2>/dev/null && pwd -P)" || proj=""
    if [ -n "$proj" ]; then
      case "$real/" in "$proj/"*) return 0 ;; esac
    fi
  fi
  printf '%s' "$real"
}

# Short, non-reversible label for a value (first 12 hex characters of SHA-256).
operator_skills_hash12() {
  if command -v shasum >/dev/null 2>&1; then printf '%s' "$1" | shasum -a 256 | cut -c1-12
  elif command -v sha256sum >/dev/null 2>&1; then printf '%s' "$1" | sha256sum | cut -c1-12
  elif command -v openssl >/dev/null 2>&1; then printf '%s' "$1" | openssl dgst -sha256 | sed 's/^.*= //' | cut -c1-12
  fi
}

# Takes a directory lock by creating it. Returns 1 if it cannot within about
# two seconds. A lock older than two minutes is treated as stale.
operator_skills_lock() {
  local lock="$1"
  for _ in $(seq 1 40); do
    mkdir "$lock" 2>/dev/null && return 0
    if [ -n "$(find "$lock" -maxdepth 0 -mmin +2 2>/dev/null)" ]; then rmdir "$lock" 2>/dev/null || true; fi
    sleep 0.05
  done
  return 1
}
