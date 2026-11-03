---
name: decision-discipline
description: "Do NOT use in time-critical moments, for trivial choices, when the decision is already documented this session, or when the operator says to skip the check. Use at decision moments: a substantive call being made (\"let's go with\", \"the decision is\"), three or more options with no pick, a trade-off left unnamed, a one-way versus two-way door question, deliberation going in circles (\"I keep going back and forth\"), a new initiative with no kill criteria, a declined opportunity worth recording, or a question that may not be the real question."
license: MIT — see plugin LICENSE
---

# Decision-discipline watch

Eight rules around decision moments.

## Rules

| Pattern | Trigger | Rule |
|---|---|---|
| Substantive decision being made — log it | "let's go with" / "decided" / "the call is" / "locking this in" | [decision-log](rules/decision-log.md) |
| Deliberation producing no new signal — commit instead | extended back-and-forth on a binary; "I keep going back and forth" | [if-i-flipped-a-coin](rules/if-i-flipped-a-coin.md) |
| New product / commitment without abandonment conditions | "I'm starting [product]" / "spinning up" / "new initiative" / "let me commit to" | [kill-criteria](rules/kill-criteria.md) |
| Decision made without naming the cost / tradeoff | "we're going with X" without "X gives up Y" | [name-the-tradeoff](rules/name-the-tradeoff.md) |
| Three+ options surfaced without picking one | "we could do X, Y, or Z" closer with no recommendation | [pick-one](rules/pick-one.md) |
| Type-1 vs type-2 (reversible) decision frame missing | decision without "one-way / two-way door" distinction | [reversible-or-not](rules/reversible-or-not.md) |
| Declined opportunities — surface the pattern | "I passed on X" / "turned down" / monthly + quarterly cadence | [unpursued](rules/unpursued.md) |
| Q1 turns out not to be the real question | stuck loop on a question; conversation circling | [whats-the-real-question](rules/whats-the-real-question.md) |

## Dispatch

Match the decision moment to the rule. Apply the rule's specific diagnostic. Yield.

## Suppression rules

- Acute time-critical (no analysis room)
- Mode is `explore`
- Decision is already documented in this session

## What this skill never does

- Force any specific decision
- Demand a long deliberation when the choice is type-2 / reversible
- Lecture on decision theory

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
| [decision-log](rules/decision-log.md) | "let's go with" / "decided" / "the call is" / "I'm picking" / "going with" / "we're doing X not Y" / "final answer" / "locking this in" / "the decision is" |
| [if-i-flipped-a-coin](rules/if-i-flipped-a-coin.md) | extended deliberation on a binary choice producing no new information; "I keep going back and forth"; 50/50 calls being over-comparison-ed |
| [kill-criteria](rules/kill-criteria.md) | "let's start [product]" / "I'm going to build [thing]" / "new initiative" / "spinning up [X]" / "let me commit to [Y]" / a new project being proposed — without "kill if Y" clause |
| [name-the-tradeoff](rules/name-the-tradeoff.md) | decision being made without explicitly naming what's given up; "we're going with X" without "X gives up Y, accepting Z" |
| [pick-one](rules/pick-one.md) | three or more options surfaced for a decision without a single recommendation being made; "we could do X, Y, or Z" / "we could do A, B, or C" / "options are X / Y / Z" / "three approaches" / "lots of ways to do this" / "maybe even a hybrid" / "could try a few different things" |
| [reversible-or-not](rules/reversible-or-not.md) | decision being made without distinguishing type-1 (one-way door, hard to reverse) from type-2 (two-way door, easy to reverse) |
| [unpursued](rules/unpursued.md) | monthly cadence (first session) + quarterly recalibrate + capture / mention of declined opportunities ("I passed on X", "decided not to pursue Y", "turned down [thing]") |
| [whats-the-real-question](rules/whats-the-real-question.md) | stuck on a specific question; the surface question keeps not-quite-answering; conversation circles around the same framing |
<!-- triggers:end -->
