# Security

## What this plugin is and is not

The rules are prompts. They ask the agent to stop before risky actions, such as repeating a credential, copying patient data or running a bulk data change, but they do not block anything. Do not rely on them as a security or privacy control. Use Claude Code permission rules, secret scanning in your repository host and your organization's data handling controls for that.

## What the hooks do on your machine

- The Stop hook runs git read commands in the session's directory and writes one small dedupe key per session under `~/.local/state/operator-skills/worktree-check/`.
- The SubagentStop hook writes one metadata line per subagent run to `~/.local/state/operator-skills/agent-activity.jsonl` (mode 600). It never stores reply text. Set `OPERATOR_SKILLS_ACTIVITY_LOG=off` to turn it off.
- Neither hook makes network calls, runs code from the repository, or prints shell commands built from branch names or commit subjects.

Details are in docs/HOOKS.md.

## Reporting a vulnerability

Use GitHub's private vulnerability reporting on this repository (Security tab, "Report a vulnerability"). Please do not open a public issue for a security problem. Include the Claude Code version, the hook or rule involved and a synthetic reproduction. Never include real credentials or real patient data in a report.

## Test data

Every fixture in this repository is synthetic. Credential-shaped test values are assembled at run time from fragments, so the repository does not contain them as literals.
