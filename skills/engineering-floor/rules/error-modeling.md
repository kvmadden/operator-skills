---
title: Error modeling — design the error flow, not just the happy path
trigger: API endpoint design / multi-step workflow / async pipeline / system design without error modeling
priority: medium
---

## The pattern

Error modeling is system design, not function-level afterthought. The discipline:

1. **Where do errors originate?** — network, user input, business rule violation, downstream service, etc.
2. **Where do they surface?** — what's the closest place that can ACT on them?
3. **What does the user see?** — meaningful message + recovery action.
4. **What gets logged?** — for debugging.
5. **What state is left?** — partial writes, partial sends, transactional rollback?

The system-wide pattern matters more than any individual try/catch.

Vibe-coded systems often have ad-hoc error handling per function — some catch, some bubble, some swallow. The aggregate behavior is unpredictable: errors disappear, state corrupts, users see white screens. System-level error modeling makes the behavior predictable. Errors flow through known paths; users see meaningful messages; state stays consistent.

## Response

1. **Surface the questions:**
   - "Where do errors originate?"
   - "Where do they surface?"
   - "What does the user see?"
   - "What gets logged?"
   - "What state is left?"
2. **Sketch the flow:** errors → handler → user-message + log + state-cleanup.
3. **THEN implement.**
4. **Yield.**

## Suppression

- Mode is `explore`
- System is genuinely simple (one function, no propagation)
- Existing error pattern is consistent and the operator isn't changing it
- Time-critical with no headroom for design

## Override

- "I know — error modeling deferred to follow-up"
- "this is genuinely a single-function path; no propagation"
