# shellcheck shell=bash
# Shared helpers for the operator-skills hooks. Sourced, not executed.

# Prints a private state directory for the hooks, or nothing when it cannot
# be made safe. Safe means: not a symlink, owned by this user, mode 700, and
# not inside the project directory given as $1 (so state cannot be committed).
operator_skills_resolve_path() {
  local input="$1" part next parent suffix
  local physical="/" unresolved=0 index
  local -a parts tail=()
  case "$input" in /*) ;; *) input="$PWD/$input" ;; esac
  IFS='/' read -r -a parts <<< "$input"
  for part in "${parts[@]}"; do
    case "$part" in
      ''|.) continue ;;
      ..)
        if [ "$unresolved" -eq 1 ] && [ "${#tail[@]}" -gt 0 ]; then
          index=$((${#tail[@]} - 1))
          unset "tail[$index]"
          if [ "${#tail[@]}" -eq 0 ]; then unresolved=0; fi
        else
          parent="$(cd "$physical/.." 2>/dev/null && pwd -P)" || return 0
          physical="$parent"
        fi
        ;;
      *)
        if [ "$unresolved" -eq 1 ]; then
          tail+=("$part")
        else
          next="${physical%/}/$part"
          [ -n "$next" ] || next="/$part"
          if [ -d "$next" ]; then
            physical="$(cd "$next" 2>/dev/null && pwd -P)" || return 0
          elif [ -e "$next" ] || [ -L "$next" ]; then
            return 0
          else
            unresolved=1
            tail+=("$part")
          fi
        fi
        ;;
    esac
  done
  suffix="$(IFS=/; printf '%s' "${tail[*]}")"
  if [ "$physical" = "/" ]; then printf '/%s' "$suffix"; else printf '%s/%s' "$physical" "$suffix"; fi
}

operator_skills_state_dir() {
  local project="$1" dir real_candidate real_project final_check
  dir="${OPERATOR_SKILLS_STATE_DIR:-${XDG_STATE_HOME:-$HOME/.local/state}/operator-skills}"
  real_candidate="$(operator_skills_resolve_path "$dir")" || return 0
  [ -n "$real_candidate" ] || return 0
  [ "$real_candidate" != "/" ] || return 0

  # A trailing slash makes test -L follow a symlink to a directory. Strip
  # trailing separators and dot components before checking the final entry.
  final_check="$dir"
  while [ "$final_check" != "/" ]; do
    case "$final_check" in
      */) final_check="${final_check%/}" ;;
      */.) final_check="${final_check%/.}" ;;
      *) break ;;
    esac
  done
  [ ! -L "$final_check" ] || return 0

  if [ -n "$project" ]; then
    if [ -d "$project" ]; then
      real_project="$(cd "$project" 2>/dev/null && pwd -P)" || return 0
    else
      real_project=""
    fi
    if [ -n "$real_project" ]; then
      [ "$real_project" != "/" ] || return 0
      case "$real_candidate/" in
        "$real_project/"*) return 0 ;;
      esac
    fi
  fi

  mkdir -p "$real_candidate" 2>/dev/null || return 0
  [ -d "$real_candidate" ] && [ ! -L "$real_candidate" ] && [ -O "$real_candidate" ] || return 0
  real_candidate="$(cd "$real_candidate" 2>/dev/null && pwd -P)" || return 0
  if [ -n "$project" ]; then
    if [ -d "$project" ]; then
      real_project="$(cd "$project" 2>/dev/null && pwd -P)" || return 0
    else
      real_project=""
    fi
    if [ -n "$real_project" ]; then
      [ "$real_project" != "/" ] || return 0
      case "$real_candidate/" in
        "$real_project/"*) return 0 ;;
      esac
    fi
  fi
  chmod 700 "$real_candidate" 2>/dev/null || return 0
  real_candidate="$(cd "$real_candidate" 2>/dev/null && pwd -P)" || return 0
  printf '%s' "$real_candidate"
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
