---
title: Clear context when stale — reset or compact a drifting session
trigger: Claude repeating itself / making the same mistake twice / treating refactored things as their old shape / re-asking answered questions / the operator saying "you keep forgetting" / "we already did this" / "you're going in circles"
priority: medium
---

## The pattern

Long sessions accumulate stale context — overridden decisions, refactored files, dead-weight exploration. Quality drops when old context dominates new: Claude treats refactored code as its old shape, recurs on a corrected mistake, or re-asks answered questions.

Two cleanups, by the kind of staleness:

- **`/compact`** — smart compression; keeps the active thread + recent decisions, drops verbose tool output and early exploration. Right when the current task is still active but the session is long.
- **`/clear`** — full reset. Right when starting a fundamentally different task and the prior context is just baggage.

## Response

1. **Name what's happening:** "We're showing context staleness — I just [repeated / forgot / used the old version of] X."
2. **Suggest the right cleanup:** "Staying on this task → `/compact` keeps the thread, drops the noise. Moving on → `/clear` and start fresh."
3. **Offer the bridge:** "I can write a 3-line handoff note before clearing so the next session has the right context."
4. **Yield — the operator decides.**

## Suppression

- Mid-flow on the SAME task (don't compact mid-build)
- The frustration is about a wrong CALL, not forgetting (that's a substantive disagreement, not staleness)
- A chapter was just marked and the new chapter is starting (staleness will fade)
- `solo-run` mode is active

## Override

- "no, we're fine — keep going"
- "compact, but don't drop X" (flag that compact may not support selective preservation)

## Why this rule earns its keep

Stale context degrades quality silently — the operator notices "Claude is being dumb" without naming the mechanism. Naming the signal and the right fix recovers quality without losing genuinely-needed context. Never run `/clear` or `/compact` autonomously — they're destructive of conversation state.
