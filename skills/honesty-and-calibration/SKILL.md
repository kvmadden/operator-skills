---
name: honesty-and-calibration
description: "Do NOT use during a solo run, when the operator already named the gap and has a plan, for routine work-status updates, for low-stakes remarks, or when the dismissed option is unsafe and needs no strongest case. Use when a claim and the evidence diverge: a product called stable, shipped, live or v1 with no outside user named, a gap between stated priority and actual effort across weeks, an option dismissed without its strongest case (\"that's a bad idea\"), or the operator asks what they are avoiding (\"what am I avoiding\")."
license: MIT — see plugin LICENSE
---

# Honesty and calibration meta

Four rules around honesty-of-claim and calibration-of-effort.

## Rules

| Pattern | Rule |
|---|---|
| Stated-vs-revealed gap over 4+ weeks | [stated-vs-revealed](rules/stated-vs-revealed.md) |
| Dismissal of option without steelman first | [steelman-it](rules/steelman-it.md) |
| Status claim ("stable / shipped / done / live / v1") without real-user signal | [vibe-vs-real](rules/vibe-vs-real.md) |
| Avoidance surfacing (conversation, decision, work) | [what-am-i-avoiding](rules/what-am-i-avoiding.md) |

## Dispatch

Match the honesty moment to the rule. Apply. Yield.

## Suppression rules

- Mode is `solo-run`
- Already addressed this pattern recently
- Operator already named the honesty gap themselves

## What this skill never does

- Judge the gap as moral failing
- Force resolution
- Lecture on honesty theory

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

> Use this skill whenever the operator is at a honesty-of-claim or calibration-of-effort moment — claiming a product status (stable / shipped / done / live / v1) without naming real-user signal, a weekly / 4-week sustained gap between stated priority and revealed effort, a dismissal of an option in under 30 seconds without engaging its strongest version, or a moment of accumulated avoidance (the conversation deferred, the decision punted, the work pushed). Triggers include "stable", "shipped", "done", "live", "v1", "in production", "ready" — status claims without user signal (vibe-vs-real); weekly / 4-week sustained gap between stated priority and revealed effort, "I was going to but", "I'll do that later" (stated-vs-revealed); "no way", "that won't work", "that's a bad idea", "we shouldn't do X", "obviously no" — dismissal in under 30 seconds without engaging strength (steelman-it); "what am I avoiding", "what's on the back burner I keep dodging", "what haven't I done that I keep meaning to" + weekly cadence (what-am-i-avoiding). Catches the larger pattern of "what the operator claims about their work vs what their work actually shows" — vibes-stable status, stated-vs-revealed gaps, dismissals without steelman, accumulated avoidance. Consult the skill's rules/ folder for the matching diagnostic (stated-vs-revealed, steelman-it, vibe-vs-real, what-am-i-avoiding). Soft teaching response across all rules. Do NOT use during `solo-run` mode, when the operator has already named the gap and has a plan, in `explore` mode (riffing freely is part of exploration), when the option is genuinely silly or safety-critical (no steelman needed), or for trivial / low-stakes situations where the honesty-check would be overkill. honesty-and-calibration owns the CLAIM-vs-reality check on a maturity claim ('this is stable / shipped / done / live / v1' asserted without real-user signal → vibe-vs-real). It does NOT own the 'what changed for whom' framing of a completed activity ('I shipped X', 'I built Y', 'I finished Z') — that activity report is build-discipline/output-vs-outcome.
