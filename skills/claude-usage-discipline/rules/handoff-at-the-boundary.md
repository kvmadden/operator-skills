---
title: Take the handoff boundary yourself — don't make the operator ask
trigger: a long/expensive session where remaining work would run cheaper cold, OR an arc just landed green and the next thing is different / "ok that's done" / "ship it" after a substantial build / "is this session getting long"
priority: high
---

## The pattern

Much of an agentic session's token cost comes from re-reading the whole conversation on every turn. So a session costs roughly **size × remaining turns**, and the largest available lever is starting the next arc in a fresh, small context.

That lever only works if someone *takes* it. The operator is mid-flow and won't, and shouldn't have to: asking for a handoff on an already-expensive session spends the most costly turn in that session. So the assistant takes it, unprompted.

Fire when **either** holds:

- **The session is getting expensive.** Long arc, many turns, heavy tool output (large reads, test logs, screenshots) accumulated, and the remaining work would run cheaper cold.
- **An arc just landed.** Verified green, committed, pushed, and the next subject is different. This is the *cheapest* reset — the boundary is clean and nothing is half-finished. Don't wait for the expensive case; by then the free win is already paid for.


## Response

1. **Finish and verify the current coherent unit first.** Never hand off ambiguous or failing state.
2. **Draft a compact durable handoff** for the project's established handoff location. Include exact repo/worktree, branch and commit, accepted artifacts, **verified versus assumed** state, locked decisions, every parked loose thread, non-goals, and one concrete next action. Never dump the transcript.
3. **Harvest the loose threads before going** — park anything still open, so the reset cannot drop it. This is what makes the boundary lossless.
4. **Offer the boundary in a few lines:** say where the handoff would go and what it holds, and write it only after the operator agrees. Keep working on the current task meanwhile. Never copy credentials or patient data into it.

Prefer a lossless handoff over aggressive context caps: a cap that causes rework costs more than it saves.

## Suppression

- Mid-task: anything half-edited, failing or unverified. A handoff from a broken state hands the next session a mess.
- A short session with no resolved arc. A prompt the operator learns to ignore stops working when it matters.
- The same arc was already offered a handoff and nothing material changed.
- The operator said to keep going in this session.

## Override

- "skip" or "not now" ends this for the current task. Do not raise it again for the same thing unless something new happens.
