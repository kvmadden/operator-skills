# Hooks

The plugin registers two command hooks in hooks/hooks.json. Both exit 0 on every path, so neither can block a turn or keep a subagent running.

Input contract: the fields below come from the hook input objects built by the installed Claude Code 2.1.304 bundle, read locally on 3 November 2026. They were not captured from a live session. tests/fixtures/hooks/claude-code-2.1.304 holds the reconstructed payloads the tests use.

## Stop: unmerged work in a linked worktree

When it runs: at the end of every assistant turn. Claude Code's Stop event is per turn, not per session.

What it checks: whether the session directory (the payload's `cwd`) is a linked git worktree, found from git metadata (`git-dir` differs from `git-common-dir`), and if so whether HEAD has commits that are not in the default branch, or the worktree has uncommitted changes.

- Default branch: `origin/HEAD`, then `init.defaultBranch`, then main, master, trunk or develop.
- A commit counts as merged when the local or remote-tracking default branch contains it, contains an equivalent patch (rebase or cherry-pick merges), or contains one commit whose change equals the branch's whole change (squash merges). The squash check covers the newest 100 commits of the default branch.
- No default branch found: the warning says the merge state is unknown and needs review. It does not claim there is nothing to merge.

What it shows: one JSON object, `{"systemMessage": "..."}`, which Claude Code displays to the user. Plain stdout from a Stop hook that exits 0 is not displayed, so the earlier plain-text warning was never seen. The message names the worktree, the branch (or the detached commit), the count of commits not found in the default branch, the newest commit subject and the count of uncommitted paths. It never contains shell commands built from branch names, paths or commit subjects, because those can carry shell syntax.

Repeats: once per session for a given HEAD, default-branch tip, clean or dirty state and count. A new commit shows it again.

State written: one small dedupe key per session under `$OPERATOR_SKILLS_STATE_DIR`, or `${XDG_STATE_HOME:-$HOME/.local/state}/operator-skills/worktree-check/`. Nothing is written inside the repository.

Requires git 2.31 or later. Without jq it cannot read the payload, so it uses the process working directory and still prints valid JSON.

## SubagentStop: one metadata line per subagent run

What it records, as one JSON line: time, event name, session id, agent id, agent type, project directory (the payload's `cwd`), the subagent transcript path, `stop_hook_active`, and the character count of the last reply.

What it never records: the reply text, prompts, file names or file contents. A credential or a patient identifier in a reply therefore cannot be copied into this log. The earlier version stored up to 2,000 characters of reply text inside the project tree.

Where: `$OPERATOR_SKILLS_STATE_DIR/agent-activity.jsonl`, or `${XDG_STATE_HOME:-$HOME/.local/state}/operator-skills/agent-activity.jsonl`. Created with mode 600, outside any project, so it cannot be committed by accident.

Retention: when the file passes 1 MiB it is renamed to `agent-activity.jsonl.1`, replacing any older copy, and a new file starts. Delete the directory to remove all history.

Off switch: set `OPERATOR_SKILLS_ACTIVITY_LOG=off` in the environment Claude Code runs in.

Requires jq. Without jq it records nothing and stays silent.

## Testing

`npm run test:hooks` runs 21 contract tests on temporary repositories: real payload shape, no reply text stored, the empty-reply case PR #1 fixed, malformed input, the off switch, no jq, an unwritable state directory, rotation, outside a repository, the main checkout, one commit ahead, dedupe, squash, cherry-pick, stale local main with a current remote, detached HEAD, trunk and unknown default branches, hostile paths, branch names and commit subjects, uncommitted changes, `stop_hook_active`, payload `cwd`, and JSON escaping without jq.

## Credit

PR #1 (grok/operator-skills-showcase-standard) found and fixed the case where a reply naming no file produced invalid JSON. That fix was applied first on this branch, then superseded when the hook stopped deriving fields from reply text. Its case remains as a named test.
