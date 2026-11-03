---
name: claude-effective-usage
description: 'Do NOT use when the operator is mid-build on the right surface, chose the current tool on purpose, or a solo run is active. Never run /clear or /compact for the operator. Use when a better surface or tool tier exists: async multi-step research with a deadline ("have this ready when I get back"), open brainstorming with no files or tools ("brainstorm with me"), long document drafting kept across sessions, a dedicated app connector instead of screenshots, a completion signal instead of a sleep loop, independent tool calls that can run in parallel, a bounded search better handed to a subagent, a conclusion worth saving ("remember this"), or stale context ("you keep forgetting").'
license: MIT — see plugin LICENSE
---

# Claude effective usage

Patterns for getting more out of Claude — right surface, right tool tier, right session hygiene. Each is a small rule file with its own trigger, corrective, and override. When the operator's situation matches a rule's trigger, consult that rule and apply its specific response. One nudge per turn — don't stack.

## Rules

| Family | Pattern | Trigger | Rule |
|---|---|---|---|
| Surface | Async multi-step work | "by EOD", "have this ready", "investigate X and report" | [dispatch-this](rules/dispatch-this.md) |
| Surface | Open-ended brainstorming | "let me think about", "brainstorm with me", "what do you think of" | [switch-to-chat-instead](rules/switch-to-chat-instead.md) |
| Surface | Long-form document drafting | "draft a proposal", "write the brief", "compose an email" | [use-cowork-not-code](rules/use-cowork-not-code.md) |
| Tier | Bounded task → specialized agent | bounded task that maps to an agent, or a codebase-wide search | [invoke-subagent](rules/invoke-subagent.md) |
| Tier | Polling when event-driven is possible | about to sleep-loop / retry-poll for a condition | [monitor-instead-of-poll](rules/monitor-instead-of-poll.md) |
| Tier | Generic tool when a specific MCP exists | about to screenshot / computer-use when an app MCP exists | [prefer-dedicated-mcp](rules/prefer-dedicated-mcp.md) |
| Tier | Serial calls that could be parallel | about to Read→Read→Read or grep→grep sequentially | [single-message-multi-tool](rules/single-message-multi-tool.md) |
| Hygiene | Pin-worthy conclusion | "save this", "remember this", a decision/insight surfaced | [pin-this](rules/pin-this.md) |
| Hygiene | Context staleness | "you keep forgetting", repeating, drift back to old assumptions | [clear-context-when-stale](rules/clear-context-when-stale.md) |
| Hygiene | Long resolved thread | 30+ turns, core question resolved, drift starting | [summarize-and-archive](rules/summarize-and-archive.md) |

## Dispatch logic

1. **Match the situation to the closest rule trigger.** If unclear, name what you see and let the operator pick.
2. **Open that rule file.** Apply its corrective shape.
3. **Be soft.** Name the better path; offer the handoff; yield.
4. **Don't stack.** One nudge per turn unless the operator engages a second.

## Suppression rules (across all sub-rules)

- The operator is mid-build on the correct surface (don't suggest switching surfaces mid-flow)
- `solo-run` mode is active — suppress surface/efficiency nudges
- The operator explicitly chose the current surface or tool ("stay here", "use [tool]")
- The corrective is destructive of conversation state (`/clear`, `/compact`) — suggest, never run autonomously

## What this skill never does

- Force a surface switch (Code ↔ Chat ↔ Cowork ↔ Dispatch are operator actions)
- Run `/clear` or `/compact` autonomously
- Spin up a Dispatch task or send a draft to Cowork on the operator's behalf
- Add narrative noise when the right move is just to silently batch tool calls
- Repeat a nudge the operator already declined

## Cross-references

- `build-discipline` umbrella — sibling; right-tool-for-the-job at the build layer
- `decision-discipline` umbrella — companion; `pin-this` chains into decision capture

## Why this umbrella earns its keep

The most common quiet losses in a Claude session: doing chat-shaped work in a heavy Code session, pixel-clicking when an MCP exists, serial tool calls that could be parallel, letting durable conclusions evaporate, and running a session past the point its context stays sharp. Each is cheap to catch and compounds across every session. Bundling them under one umbrella means the operator doesn't track ten slugs — the umbrella fires on a broad signal set and each rule stays small.

<!-- precedence:start -->
## Precedence across operator-skills

When more than one rule could respond:

- **Every tier 1 rule that matches responds in the same turn.** Give one combined answer that names each hazard and what each one needs, then wait. Settling one floor never releases another. For "dedupe this production patient table and save a backup in the repo", `migration-not-mutation` asks for a snapshot, and `phi-floor` decides where it may live: inside the database or an approved backup, never a file in the repository.
- **One correction per turn applies to tiers 2 to 4.** Among those, the highest tier wins and lower tiers wait or drop.
- **`solo-run-log` and `solo-run-debrief` keep the record of a run the operator approved.** They write what their rule files describe, never stop work, and never count as the turn's one correction.

| Tier | Rules | How they respond |
|---|---|---|
| 1 | `secrets-walk`, `phi-floor`, `migration-not-mutation`, `schema-discipline`, `auth-floor`, `solo-run-checklist`, `solo-run-contract` | Stop before the risky action and wait for the operator. No mode, sketch or "explore" label suppresses them. |
| 2 | `code-i-can-actually-run`, `hallucination-tripwire`, `citation-or-it-didnt-happen`, `claude-confabulating-context`, `am-i-being-led`, `reading-claudes-output-honestly`, `is-claude-just-agreeing`, `claude-disagrees` | Check or correct Claude's own output, say what changed, then continue. |
| 3 | `solo-run-log`, `solo-run-debrief` and every other engineering-floor and build-discipline rule | One short nudge, then yield. Never a hard stop. |
| 4 | Every other rule (communication, decision, honesty, strategy, usage and effective-usage rules, `solo-run-postmortem`) | Mention only when asked or clearly useful. Never interrupt work. |

Shared meanings:
- **Explore mode** starts only when the operator says so ("explore mode", "just sketching") and ends when they say so or start building something to ship. It quiets tiers 3 and 4, never tier 1.
- **Logged** means said in the conversation. Write to a file only after the operator agrees to that file, and never copy credentials or patient data into it.
- **Unknown stays unknown.** Claude cannot see clock time between messages, earlier sessions or usage counts. When a rule depends on them, ask or say they are unknown instead of guessing.

Owners for situations two rules both claim:

| Situation | Owner | The other rule |
|---|---|---|
| "ship it" or "looks good" right after a long change | `reading-claudes-output-honestly` asks once whether it was read | `handoff-at-the-boundary` waits until the operator has confirmed the review |
| "perfect" or "exactly" | `reading-claudes-output-honestly`, when it approves a long output | `prompt-archeology` only when the operator asks to keep a prompt |
| "while we're at it" during an active build | `scope-lock` | `park-the-idea` owns stray ideas outside an active build |
| "the latest version" of outside software | `citation-or-it-didnt-happen` | `name-the-version` owns the operator's own artifacts |
| Several options on the table | `pick-one` when the operator asks for a recommendation | `am-i-being-led` applies when Claude steered without being asked |
| An inline color or spacing value | `tokens-not-values`, only when the project has design tokens | `config-or-code` for other hardcoded values |
| "done" or "shipped" | `output-vs-outcome` for a report of finished work | `vibe-vs-real` only for a maturity claim about a product |
| A clinical, safety or data-integrity edge case | the engineering floors, as first-version work | `v1-versus-v2-thinking` never defers it |
<!-- precedence:end -->

<!-- triggers:start -->
## Rule triggers

| Rule | Fires on |
|---|---|
| [clear-context-when-stale](rules/clear-context-when-stale.md) | Claude repeating itself / making the same mistake twice / treating refactored things as their old shape / re-asking answered questions / the operator saying "you keep forgetting" / "we already did this" / "you're going in circles" |
| [dispatch-this](rules/dispatch-this.md) | "by EOD" / "have this ready when I get back" / "investigate X and report" / "go gather all the Y and summarize" / "research [topic] and produce [output]" / "while I'm doing other things, can you" |
| [invoke-subagent](rules/invoke-subagent.md) | "bounded task" / "search across the whole codebase" / "just give me the conclusion" / a bounded task with clear input that maps to a specialized agent, OR a codebase-wide search where you only need the conclusion |
| [monitor-instead-of-poll](rules/monitor-instead-of-poll.md) | "sleep loop" / "poll the deploy" / "poll until" / "keep checking" / "wait for it to finish" / about to write a retry-with-delay loop for a condition that could be event-driven (deploys, status checks, background jobs) |
| [pin-this](rules/pin-this.md) | "save this" / "remember this" / "that's an important point" / "ok we're going with X" / "let's commit to Y" / a clear decision, insight, or commitment surfaces that the operator will reference again |
| [prefer-dedicated-mcp](rules/prefer-dedicated-mcp.md) | "just screenshot" / "screenshot Slack" / "look at the screen" / about to use a generic tool tier (computer-use, screenshots) when a dedicated app MCP exists — dedicated app MCP > browser MCP > computer-use; PDF MCP > raw file read; database MCP > shell SQL |
| [single-message-multi-tool](rules/single-message-multi-tool.md) | "read this file, then" / "then that file" / "one at a time" / about to make multiple INDEPENDENT tool calls sequentially — Read→Read→Read for known files, grep→grep for separate patterns, several non-dependent Bash commands, or spawning agents one at a time |
| [summarize-and-archive](rules/summarize-and-archive.md) | 30+ turns with the core question resolved and drift starting / "we basically solved this" / "ok we got it" / "great, that worked" / "let me start a new chat for the next thing" |
| [switch-to-chat-instead](rules/switch-to-chat-instead.md) | "let me think about" / "brainstorm with me" / "what do you think of" / "I'm trying to figure out" / "help me think through" / 5+ message back-and-forth with no tool calls or file edits |
| [use-cowork-not-code](rules/use-cowork-not-code.md) | "persistent doc" / "keep editing across sessions" / "draft a proposal" / "write the brief" / "let's outline this essay" / "I need a spec doc" / 3+ rounds of "make it shorter" / "lengthen this section" |
<!-- triggers:end -->
