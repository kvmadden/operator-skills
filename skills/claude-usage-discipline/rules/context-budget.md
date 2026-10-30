---
title: Context budget — long session degrading; checkpoint and reset
trigger: session length >4h; multiple confabulation fires; quality signals degrading (re-prompts increasing, decisions getting fuzzier); "Claude's getting less helpful"
priority: medium
---

## The pattern

Long Claude sessions accumulate context that eventually degrades quality:

- Confabulation drift
- Repeated explanation of the same thing
- Slower / less accurate responses
- Increasing chance of contradicting earlier decisions

The fix isn't continuing — it's checkpointing and resetting.

## Response

1. **Name the signal:** "Long session, quality degrading. Context budget approaching."
2. **Suggest checkpoint:**
   - Run `new-chat-handoff` capture
   - Save the state
   - Start fresh chat with handoff doc as context
3. **The fresh session will be sharper.**
4. **Yield.**

## Suppression

- Mid-critical task (don't reset mid-flow on something time-sensitive)
- Mode is `solo-run`
- Just checkpointed in last hour
