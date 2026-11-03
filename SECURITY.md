# Security

## What this plugin is and is not

The rules are prompts. They ask the agent to stop before risky actions, such as repeating a credential, copying patient data or running a bulk data change, but they do not block anything. Do not rely on them as a security or privacy control. Use Claude Code permission rules, secret scanning in your repository host and your organization's data handling controls for that.

## What the hooks do on your machine

- The Stop hook runs git read commands in the session's directory and writes the states it has already shown, one file per session, under `~/.local/state/operator-skills/worktree-check/`.
- The SubagentStop hook writes one metadata line per subagent run to `~/.local/state/operator-skills/agent-activity.jsonl` (mode 600). It never stores reply text, paths or custom agent names. Set `OPERATOR_SKILLS_ACTIVITY_LOG=off` to turn it off.
- The state directory is refused when it is a symlink, is not owned by you or sits inside the project. Neither hook writes through a symlink.
- Neither hook makes network calls or prints shell commands built from branch names, paths or commit subjects.
- The Stop hook runs git with fsmonitor, the untracked cache, external diff, textconv and git hooks turned off, and without optional locks, so repository config cannot make it start those programs or write the index. A content filter set in the repository's own `.git/config` can still run during `git status`, as it would for any `git status` in that repository. Do not open a repository whose local git config you do not trust.

Details are in docs/HOOKS.md.

## Reporting a vulnerability

Use GitHub's private vulnerability reporting on this repository (Security tab, "Report a vulnerability"). Please do not open a public issue for a security problem. Include the Claude Code version, the hook or rule involved and a synthetic reproduction. Never include real credentials or real patient data in a report.

## Test data

Every fixture in this repository is synthetic. The hook tests assemble credential-shaped values at run time from fragments. The routing probes and eval cases hold short synthetic shapes such as `sk_live_51FIXTURE0NLY` and `EVALFIXTURE0NLY` markers, which are not valid keys.
