# Hooks

The plugin registers two command hooks in hooks/hooks.json. Both exit 0 on every path, so neither can block a turn or keep a subagent running.

Input contract: the fields below come from the hook input objects built by the installed Claude Code 2.1.304 bundle, read locally on 3 November 2026. They were not captured from a live session. tests/fixtures/hooks/claude-code-2.1.304 holds the reconstructed payloads the tests use.

## Stop: unmerged work in a linked worktree

When it runs: at the end of every assistant turn. Claude Code's Stop event is per turn, not per session.

What it checks: whether the session directory (the payload's `cwd`) is a linked git worktree, found from git metadata (`git-dir` differs from `git-common-dir`), and if so whether HEAD has work that is not in the default branch, or the worktree has uncommitted changes.

- Default branch: `origin/HEAD`, then `init.defaultBranch`, then main, master, trunk or develop.
- Merged means one of two things. Every commit of HEAD is reachable from the local or remote-tracking default branch. Or every path the branch changed since its merge base is identical at the default-branch tip and at HEAD, which covers rebase, cherry-pick and squash merges.
- Work that was merged and later reverted on the default branch is reported, because the tip no longer holds it. So is work that exists only in a merge commit, such as a conflict resolution.
- A later change on the default branch to the same paths makes merged work look unmerged. That errs toward a warning.
- A linked worktree on the default branch itself reports only its uncommitted paths.
- No default branch found: the warning says the merge state is unknown and needs review. It does not claim there is nothing to merge.

What it shows: one JSON object, `{"systemMessage": "..."}`, which Claude Code displays to the user. Plain stdout from a Stop hook that exits 0 is not displayed. The message names the worktree path, the branch and its short SHA (or the detached commit), the count of commits not found in the default branch with the newest short SHA, and the count of uncommitted paths. It never holds commit subjects, which anyone who can push a commit can write, and never holds shell commands built from branch names or paths.

Repeats: each distinct state is shown at most once per session. A state is HEAD, the default-branch tips, clean or dirty, and the unmerged count. Going from one dirty path to five is the same state. Going dirty, clean, dirty shows it twice, not three times. Two Stop events that finish at the same instant in one session can both show it.

State written: one file per session under `worktree-check/` in the state directory, holding the states already shown, at most 200 lines. The state directory is `$OPERATOR_SKILLS_STATE_DIR`, or `${XDG_STATE_HOME:-$HOME/.local/state}/operator-skills`. It is refused when it is a symlink, is not owned by the user or sits inside the project, and files in it are never written through a symlink. If the state cannot be saved, the warning still shows, and it can show again next turn. Nothing is written inside the repository.

Git safety: every git call runs with `-c core.fsmonitor=false -c core.untrackedCache=false -c diff.external= -c core.hooksPath=/dev/null` and `GIT_OPTIONAL_LOCKS=0`, and diffs run with `--no-ext-diff --no-textconv`, so repository config cannot make the hook start an fsmonitor, diff driver or textconv program or write the index. A content filter (`filter.<name>.clean`) set in the repository's own `.git/config` can still run during `git status`, as it would for any `git status` there.

Requires git 2.31 or later. Without jq it reads only identifier-shaped `session_id` and `stop_hook_active` values from the payload, uses the process working directory, and still prints valid JSON.

## SubagentStop: one metadata line per subagent run

What it records, as one JSON line: time, event name, `session_id` and `agent_id` when they have the expected identifier shape, `agent_type`, `project_id`, `stop_hook_active`, and the character count of the last reply.

- `agent_type` is kept for Claude Code's built-in agent types (general-purpose, Explore, Plan, statusline-setup, claude-code-guide, fork). Any other name becomes `custom-` plus a 12-character hash, because custom agent names are free text. Set `OPERATOR_SKILLS_LOG_AGENT_NAMES=1` to keep custom names that are plain identifiers.
- `project_id` is the first 12 hex characters of a SHA-256 of the project path. It groups lines by project without storing the path. It is a label, not encryption: someone who already knows a path can confirm it.

What it never records: reply text, prompts, file names, file contents, the project path or any transcript path. A credential or a patient identifier in a reply, a directory name or a custom agent name therefore cannot be copied into this log. The earlier version stored up to 2,000 characters of reply text inside the project tree, and the version before this review round stored the project and transcript paths.

Where: `agent-activity.jsonl` in the same state directory as the Stop hook, with the same refusals. The file is mode 600 and is never written through a symlink.

Retention: when the file passes 1 MiB it is renamed to `agent-activity.jsonl.1`, replacing any older copy, and a new file starts. The size check, rename and append run under a lock directory, so two subagents finishing together cannot destroy the archive. If the lock cannot be taken within about two seconds, the line is appended without rotating, so nothing is lost. A lock older than two minutes counts as stale. Delete the state directory to remove all history.

Off switch: set `OPERATOR_SKILLS_ACTIVITY_LOG=off` in the environment Claude Code runs in.

Requires jq. Without jq it records nothing and stays silent.

## Testing

`npm run test:hooks` runs 35 contract tests on temporary repositories. They cover the payload shape, reply text never stored, the empty-reply case PR #1 fixed, malformed input, the off switch, no jq, an unwritable state directory, rotation, two processes rotating at once (forced with an `mv` shim), a symlinked log, identifiers in paths and agent names, a state directory inside the project, outside a repository, the main checkout, one commit ahead, dedupe across clean and dirty states, squash, squash then revert, cherry-pick, work only in a merge commit, stale local main with a current remote, a dirty worktree on the default branch, detached HEAD, trunk and unknown default branches, hostile paths and branch names, no commit subject in the message, uncommitted changes, a failed state save, symlinks in the state directory, two sessions without jq, `stop_hook_active`, payload `cwd`, JSON escaping without jq, and fsmonitor, diff driver and textconv programs that must not run.

## Credit

PR #1 (grok/operator-skills-showcase-standard) found and fixed the case where a reply naming no file produced invalid JSON. That fix was applied first on this branch, then superseded when the hook stopped deriving fields from reply text. Its case remains as a named test.
