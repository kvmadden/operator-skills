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

When more than one rule could respond, use this order. Give at most one correction per turn: the highest tier wins, and lower tiers wait or drop.

| Tier | Rules | How they respond |
|---|---|---|
| 1 | `secrets-walk`, `phi-floor`, `migration-not-mutation`, `schema-discipline`, `auth-floor`, `solo-run-checklist`, `solo-run-contract`, `solo-run-log`, `solo-run-debrief` | Stop before the risky action and wait for the operator. No mode, sketch or "explore" label suppresses them. |
| 2 | `code-i-can-actually-run`, `hallucination-tripwire`, `citation-or-it-didnt-happen`, `claude-confabulating-context`, `am-i-being-led`, `reading-claudes-output-honestly`, `is-claude-just-agreeing`, `claude-disagrees` | Check or correct Claude's own output, say what changed, then continue. |
| 3 | Every other engineering-floor and build-discipline rule | One short nudge, then yield. Never a hard stop. |
| 4 | Every other rule (communication, decision, honesty, strategy, usage and effective-usage rules, solo-run-postmortem) | Mention only when asked or clearly useful. Never interrupt work. |

Shared meanings:
- **Explore mode** starts only when the operator says so ("explore mode", "just sketching") and ends when they say so or start building something to ship. It quiets tiers 3 and 4, never tier 1.
- **Logged** means said in the conversation. Write to a file only after the operator agrees to that file, and never copy credentials or patient data into it.
- **Unknown stays unknown.** Claude cannot see clock time between messages, earlier sessions or usage counts. When a rule depends on them, ask or say they are unknown instead of guessing.

Owners for situations two rules both claim:

| Situation | Owner | The other rule |
|---|---|---|
| "ship it" or "looks good" right after a long change | reading-claudes-output-honestly asks once whether it was read | handoff-at-the-boundary waits until the operator has confirmed the review |
| "perfect" or "exactly" | reading-claudes-output-honestly, when it approves a long output | prompt-archeology only when the operator asks to keep a prompt |
| "while we're at it" during an active build | scope-lock | park-the-idea owns stray ideas outside an active build |
| "the latest version" of outside software | citation-or-it-didnt-happen | name-the-version owns the operator's own artifacts |
| Several options on the table | pick-one when the operator asks for a recommendation | am-i-being-led applies when Claude steered without being asked |
| An inline color or spacing value | tokens-not-values, only when the project has design tokens | config-or-code for other hardcoded values |
| "done" or "shipped" | output-vs-outcome for a report of finished work | vibe-vs-real only for a maturity claim about a product |
| A clinical, safety or data-integrity edge case | the engineering floors, as first-version work | v1-versus-v2-thinking never defers it |
<!-- precedence:end -->

## Trigger catalogue

Moved here from the skill description on 3 November 2026, unchanged. Claude Code shows at most 1,536 characters of a skill description in its skill listing and can show less when many skills are installed, so the long list was being cut. Claude reads this section after the skill loads. Where this older text disagrees with a rule file or the precedence section above, the rule file and the precedence section win.

> Use this skill whenever the operator is using Claude itself in a suboptimal way for the task at hand — wrong channel (Claude Code for a quick lookup; chat for a 15-file refactor; API for a one-off; chat for a capture that should have been a quick mobile capture); asking Claude something Claude is genuinely the wrong tool for (person-specific questions, physical-world / medical / legal / financial questions, values-based choices); over-using Claude in ways that displace other thinking modes (sleep, conversation, walking, offline drafting); context window filling and session quality degrading (confabulation, repetition, slower responses); long-chat context about to be lost on close; a stray idea or tangent floated mid-task that won't be actioned now (park it before a reset loses it); cost-spike sessions starting without acknowledgment; stuck-chat patterns where reset beats more deliberation; a prompt that landed perfectly (worth archiving); three+ re-prompts on the same topic (the question itself is wrong, not Claude's answer). Triggers include "should I ask Claude", "let me ask Claude", "Claude's getting less helpful", "I'll come back to this", "starting a new chat", "fresh session", "this is a heavy session", "this is going to cost", "should I be using Claude for", "this chat is stuck", "perfect", "exactly", "that's it", "nailed it", "first try", "no, I meant", "let me try again", "actually, what I want is", "let me re-phrase", "ugh", "that's not it either", "we should also", "note to self", "don't let me forget", "while we're at it", "moving on to". Also fires when an arc lands green and the next subject differs, or the session has grown long and the remaining work would run cheaper in a fresh context (handoff-at-the-boundary — take the boundary yourself; never make the operator spend a turn asking). Consult the skill's rules/ folder for the matching diagnostic (right-tool-for-the-prompt, dont-ask-claude, am-i-using-claude-too-much, context-budget, new-chat-handoff, reset-the-frame, compute-budget, prompt-archeology, re-prompt-cleaner, park-the-idea, handoff-at-the-boundary). Soft teaching response. Do NOT use during `solo-run` (contract handles meta concerns), `explore` mode, when the operator already engaged the question this session, or when re-prompts are converging on the right answer (iteration is progress, not the trap).
