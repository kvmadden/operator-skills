---
name: claude-usage-discipline
description: "Do NOT use during a solo run, when the operator already engaged the question this session, or when re-prompts are converging on an answer. Use when Claude itself is being used poorly: the wrong channel for the task, a question Claude is the wrong source for (one person's private view, a patient-specific clinical decision, a legal or financial ruling, a values choice), Claude time crowding out other thinking, a long session losing quality, an arc that just finished (\"starting a new chat\", \"moving on to\"), a stray idea to park before a reset (\"note to self\", \"don't let me forget\"), an expensive session starting, a prompt worth keeping, or a third re-ask of the same question (\"let me try again\")."
license: MIT — see plugin LICENSE
---

# Claude usage discipline

Eleven rules around HOW the operator uses Claude.

## Rules

| Pattern | Rule |
|---|---|
| Wrong Claude channel for the task (Code vs chat vs API vs Mobile) | [right-tool-for-the-prompt](rules/right-tool-for-the-prompt.md) |
| Asking Claude a question Claude is the wrong tool for | [dont-ask-claude](rules/dont-ask-claude.md) |
| Claude-time displacing other thinking modes | [am-i-using-claude-too-much](rules/am-i-using-claude-too-much.md) |
| Context window filling — checkpoint and reset | [context-budget](rules/context-budget.md) |
| Arc boundary — handoff to a fresh session, lossless | [new-chat-handoff](rules/new-chat-handoff.md) |
| Stray idea floated mid-task — park it before a reset loses it | [park-the-idea](rules/park-the-idea.md) |
| Session boundary reached or session getting expensive — take the handoff unprompted | [handoff-at-the-boundary](rules/handoff-at-the-boundary.md) |
| Chat stuck — fresh start beats fighting it | [reset-the-frame](rules/reset-the-frame.md) |
| Token-heavy session starting without cost-awareness | [compute-budget](rules/compute-budget.md) |
| Prompt landed perfectly — worth archiving | [prompt-archeology](rules/prompt-archeology.md) |
| 3+ re-prompts on the same topic — the question is wrong | [re-prompt-cleaner](rules/re-prompt-cleaner.md) |

## Dispatch

Match the situation to the rule. Apply. Yield.

## Suppression rules

- Mode is `solo-run` (contract handles meta concerns)
- Mode is `explore`
- Operator already engaged the question this session

## What this skill never does

- Force a specific Claude-use pattern
- Push Claude-usage away from areas where it's working
- Pretend Claude is the wrong tool for everything (it's the right tool for many things)

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
| [am-i-using-claude-too-much](rules/am-i-using-claude-too-much.md) | weekly check; sustained Claude-heavy usage; "Claude is my default for everything" pattern |
| [compute-budget](rules/compute-budget.md) | planning a session >2h with heavy Claude use; starting a fresh extensive build; 5+ Sonnet/Opus calls in quick succession with no cost-awareness check |
| [context-budget](rules/context-budget.md) | session length >4h; multiple confabulation fires; quality signals degrading (re-prompts increasing, decisions getting fuzzier); "Claude's getting less helpful" |
| [dont-ask-claude](rules/dont-ask-claude.md) | asking Claude something Claude is the wrong tool for — person-specific questions, physical-world / medical / legal / financial questions, values-based choices |
| [handoff-at-the-boundary](rules/handoff-at-the-boundary.md) | a long/expensive session where remaining work would run cheaper cold, OR an arc just landed green and the next thing is different / "ok that's done" / "ship it" after a substantial build / "is this session getting long" |
| [new-chat-handoff](rules/new-chat-handoff.md) | arc boundary / end of long session + operator about to close, reset, or pivot; "I'll come back to this" / "starting a new chat" / "fresh session" / "about to close" / "moving on to" / "let's switch to" / "next thing" / "this is getting long" |
| [park-the-idea](rules/park-the-idea.md) | operator floats an idea / tangent / "we should also" mid-task that won't be actioned now; "idea:", "note to self", "don't let me forget", "remind me later", "while we're at it", "side thought", "tangent", "what if we also", "oh that reminds me", "down the line", "someday" |
| [prompt-archeology](rules/prompt-archeology.md) | "perfect" / "exactly" / "that's it" / "nailed it" / "great answer" / "wow that worked" / "first try" / "no edits needed" |
| [re-prompt-cleaner](rules/re-prompt-cleaner.md) | "no, I meant" / "let me try again" / "actually, what I want is" / "ok let me re-phrase" / 3+ near-identical prompts about the same topic in the last 10 turns; "ugh" / "no no no" / "that's not it either" |
| [reset-the-frame](rules/reset-the-frame.md) | chat going in circles; contradicting itself; producing increasingly bad output; operator visibly frustrated; "this chat is stuck" |
| [right-tool-for-the-prompt](rules/right-tool-for-the-prompt.md) | asking Claude something via a channel that's wrong for the task (Claude Code for a quick lookup; chat for a 15-file refactor; API for a one-off; chat for a capture that should have been Mobile) |
<!-- triggers:end -->
