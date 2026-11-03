---
name: solo-run
description: "Do NOT use for normal sessions where the operator stays present, when the operator is drained or distracted, or for windows under 30 minutes. Use the moment the operator wants Claude to keep working unattended (\"work on this while I'm gone\", \"I'm going to be away\", \"keep going while I sleep\", \"start a solo run\"): run the intake checklist, write a contract with scope, authority and stop conditions, wait for an explicit go, log at stop conditions and milestones, and debrief on return."
license: MIT — see plugin LICENSE
---

# Solo-run umbrella

Orchestrates Claude doing autonomous work while the operator is away. The full lifecycle has 5 sub-skills, each fired by the parent at the right moment. Reading: at the start of the solo-run umbrella, the operator wants long-form autonomy; the umbrella decides which sub-skill to dispatch based on context.

## Sub-skills (lifecycle order)

| Phase | Rule | When it fires |
|---|---|---|
| 1. Pre-flight | [solo-run-checklist](rules/solo-run-checklist.md) | First action when solo-run is invoked. Captures environmental state (time, wifi, battery, interruption risk, scope, stopping conditions). |
| 2. Contract | [solo-run-contract](rules/solo-run-contract.md) | After checklist. Writes the contract file; requires explicit "go" before run starts. |
| 3. In-progress logging | [solo-run-log](rules/solo-run-log.md) | Every 30 minutes during an active run. Appends status to a run log file. |
| 4. Debrief | [solo-run-debrief](rules/solo-run-debrief.md) | When operator returns OR contracted window expires. Summarizes done-vs-planned. |
| 5. Postmortem | [solo-run-postmortem](rules/solo-run-postmortem.md) | Every ~5 completed runs (or quarterly). Surfaces cross-run patterns for contract refinement. |

## Dispatch logic

1. **First trigger** — operator says "solo-run" / "I'm stepping away" / equivalent → fire `solo-run-checklist`.
2. **Checklist done** → fire `solo-run-contract`.
3. **Operator says "go"** → run starts; fire `solo-run-log` on 30-min cadence.
4. **Operator returns OR window expires** → fire `solo-run-debrief`.
5. **5 runs accumulated since last postmortem** → fire `solo-run-postmortem` (during debrief, as additional output).

## Suppression rules

- Operator said they are drained or distracted (autonomy then is a bad call)
- Time window < 30 minutes (overhead exceeds value)
- Operator declines to name a concrete scope when the intake asks for one
- Connectivity is unreliable and the operator does not accept the "save often, local work only" stop that the checklist adds
- Operator is mid-flow on something else; don't switch contexts

## What this skill never does

- Run an unattended session without an explicit contract + "go"
- Skip the debrief (every run gets a debrief, even if interrupted)
- Make decisions outside the contract's authority scope
- Continue past a stopping condition without operator confirmation
- Burn the full time window when the work completed early (escalate completion to operator)

## Cross-references

- `decision-discipline` umbrella — companion (decisions within the solo-run need their own discipline)
- `build-discipline` umbrella — companion (scope-lock applies within solo-run)

## Why this umbrella earns its keep

Autonomous work is high-leverage but high-risk. The contract structure (checklist → contract → log → debrief → postmortem) makes the autonomy safe by forcing the operator and Claude to agree on scope, decision authority, and stopping conditions UPFRONT. Without the contract, "go work on it for a while" turns into either anxious over-checking or runaway scope drift. With the contract, the operator can actually step away.

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
| [solo-run-checklist](rules/solo-run-checklist.md) | solo-run intake, solo-run start, autonomy request, solo-run preflight |
| [solo-run-contract](rules/solo-run-contract.md) | solo-run intake complete, solo-run contract write, contract acceptance |
| [solo-run-debrief](rules/solo-run-debrief.md) | operator returns from solo-run; OR contracted window ends; "I'm back" / "how'd it go" / "what'd you do" / "show me what happened" |
| [solo-run-log](rules/solo-run-log.md) | 30 min elapsed since last log, stopping condition hit, scope completion |
| [solo-run-postmortem](rules/solo-run-postmortem.md) | ~5 solo-run debriefs accumulated, quarterly cadence, postmortem request |
<!-- triggers:end -->
