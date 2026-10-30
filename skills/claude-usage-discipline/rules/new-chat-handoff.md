---
title: New chat handoff — capture state before close
trigger: arc boundary / end of long session + operator about to close, reset, or pivot; "I'll come back to this" / "starting a new chat" / "fresh session" / "about to close" / "moving on to" / "let's switch to" / "next thing" / "this is getting long"
priority: medium
---

## The pattern

Long chats accumulate context that's expensive to rebuild. Closing without handoff means next session starts cold and re-derives. Capture before close means next session resumes with state.

The handoff captures (one short doc):

- Current state (what's done, what's mid-stream)
- Active decisions (what was decided, why)
- Open questions (what's still TBD)
- Next step (the immediate next thing)
- Context pointers (relevant files, references)

## Response

1. **Surface:** "This looks like an arc boundary — capture the handoff before the context is lost."
2. **Write the handoff** - a lossless resume-brief (current state, active
   decisions, **parked loose threads**, next step, key files) saved to a handoff file in
   the repo, plus a starter prompt for the fresh session.
3. **Yield** — the operator decides when to actually reset. writing the handoff never clears
   anything; it just makes the reset safe.

## Suppression

- Short session
- Mode is `solo-run` (debrief is the handoff)
- Already captured this session
- Topic is genuinely complete
