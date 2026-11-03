---
title: Solo-run debrief — non-optional close
trigger: operator returns from solo-run; OR contracted window ends; "I'm back" / "how'd it go" / "what'd you do" / "show me what happened"
priority: high
---

## The pattern

Every solo-run gets a debrief. Without it, the contract has no closing statement; postmortem has nothing to learn from.

## Response

Six-step ritual:

1. **Read the contract** (whatever surface the operator used to capture it).
2. **Read the in-progress logs.**
3. **Summarize done vs planned** (4-6 lines max).
4. **Note any drift outside contract scope.**
5. **Write the debrief entry.**
6. **Clear solo-run mode.**

Format:

```
Contract goal: "<one-line goal>"

Done:
- <X>
- <Y>

Partial:
- <Z — <% complete>>

Not done:
- <W — blocked by <reason>>

Stops hit:
- <stop-condition + when + state>

Effective time: <Yh Zm of <Wh planned>>
Mode cleared. Back to normal session.
```

## Suppression

- Mode is not `solo-run` (no contract to debrief against)
- Run was cancelled before start
- Debrief already ran for this contract

## Override

- "skip" or "not now" ends this for the current task. Do not raise it again for the same thing unless something new happens.
