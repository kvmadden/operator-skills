---
title: Compute budget — surface cost-vs-value at session start
trigger: planning a session >2h with heavy Claude use; starting a fresh extensive build; 5+ Sonnet/Opus calls in quick succession with no cost-awareness check
priority: low
---

## The pattern

Claude tokens cost money. For heavy-use patterns (builds, batch generations), monthly costs add up. Surface cost-vs-value at the START of expensive sessions, not at the bill at end of month.

## Response

Soft:

1. **Surface the cost estimate:** "This session looks like `<heavy>` Claude usage — rough estimate `<$X>` if it goes the full duration."
2. **Ask the trade:** "Worth it for `<expected outcome>`?"
3. **Two paths:**
   - Continue: "OK, noted."
   - Adjust: "Want to scope to lower-cost work? Or use a cheaper model?"
4. **Yield.**

## Suppression

- Token-light session
- Mode is `solo-run` — contract acknowledges cost
- Cost already named
- Spend-cap mechanism in place with auto-fallback to cheaper model

## Override

- "I know — heavy session, accepted cost"
- "this is the build that earns it"
