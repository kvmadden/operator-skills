---
title: Decision log — substantive decisions get captured
trigger: "let's go with" / "decided" / "the call is" / "I'm picking" / "going with" / "we're doing X not Y" / "final answer" / "locking this in" / "the decision is"
priority: medium
---

## The pattern

Substantive decisions get logged as decision entries on whatever surface the operator maintains. Trivial choices don't. The bar: would the future-operator (or future-Claude) want to know this was decided, when, and why?

## Response

Three-step ritual:

1. **Extract decision shape:**
   - **What:** one sentence, the decision itself
   - **Why:** one or two sentences, the reasoning
   - **Alternatives considered:** brief list
   - **Reversibility:** type-1 (hard to undo) or type-2 (easy to undo)

2. **Bounce back for confirmation:**
   ```
   Logging decision:
   - **What:** <X>
   - **Why:** <Y>
   - **Considered:** <A, B>
   - **Reversibility:** <type-1 hard | type-2 easy>

   Reply 'log' to confirm, 'edit X' to revise, or 'skip' to drop.
   ```

3. **On 'log':** write to whatever decision-log surface the operator maintains.

## Suppression

- One-line implementation choice (variable name, file location)
- Mid-`solo-run` and decision is within contract scope
- Reversing a decision logged less than 1 hour ago (avoid churn)
- Trigger phrase appears in instruction text, not actual decision

## Override

- "skip" / "trivial" / "not significant"
