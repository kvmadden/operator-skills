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

## Trigger catalogue

Moved here from the skill description on 3 November 2026, unchanged. Claude Code shows at most 1,536 characters of a skill description in its skill listing and can show less when many skills are installed, so the long list was being cut. Claude reads this section after the skill loads.

> Use this skill whenever the operator is at a honesty-of-claim or calibration-of-effort moment — claiming a product status (stable / shipped / done / live / v1) without naming real-user signal, a weekly / 4-week sustained gap between stated priority and revealed effort, a dismissal of an option in under 30 seconds without engaging its strongest version, or a moment of accumulated avoidance (the conversation deferred, the decision punted, the work pushed). Triggers include "stable", "shipped", "done", "live", "v1", "in production", "ready" — status claims without user signal (vibe-vs-real); weekly / 4-week sustained gap between stated priority and revealed effort, "I was going to but", "I'll do that later" (stated-vs-revealed); "no way", "that won't work", "that's a bad idea", "we shouldn't do X", "obviously no" — dismissal in under 30 seconds without engaging strength (steelman-it); "what am I avoiding", "what's on the back burner I keep dodging", "what haven't I done that I keep meaning to" + weekly cadence (what-am-i-avoiding). Catches the larger pattern of "what the operator claims about their work vs what their work actually shows" — vibes-stable status, stated-vs-revealed gaps, dismissals without steelman, accumulated avoidance. Consult the skill's rules/ folder for the matching diagnostic (stated-vs-revealed, steelman-it, vibe-vs-real, what-am-i-avoiding). Soft teaching response across all rules. Do NOT use during `solo-run` mode, when the operator has already named the gap and has a plan, in `explore` mode (riffing freely is part of exploration), when the option is genuinely silly or safety-critical (no steelman needed), or for trivial / low-stakes situations where the honesty-check would be overkill. honesty-and-calibration owns the CLAIM-vs-reality check on a maturity claim ('this is stable / shipped / done / live / v1' asserted without real-user signal → vibe-vs-real). It does NOT own the 'what changed for whom' framing of a completed activity ('I shipped X', 'I built Y', 'I finished Z') — that activity report is build-discipline/output-vs-outcome.
