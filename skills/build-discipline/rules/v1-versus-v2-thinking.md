---
title: v1 versus v2 — typical case ships before edge cases
trigger: >-
  "for v2" / "we should also" / "edge case" / "polish for later" / "optimize" / "make it scale" / "what if [unusual case]" / "for power users" — proposed before v1 has shipped
priority: medium
---

## The pattern

v1 = "the typical case works end-to-end, shippable to a user." v2 = "edge cases handled, scale considered, polish applied, second-order needs met."

Conflating the two is the most common reason products stay at v0.x. v2 work always feels reasonable in the moment ("we'll need this eventually") but defers v1 indefinitely. The cost: nothing ships, no real users, no real feedback, no real improvement.

The discipline: when v2-shaped work is proposed mid-v1 build, name it as v2-shaped. Either defer it (note in `unbuilt-products` for after v1 ships) or accept that v1 just got bigger and time-to-ship just lengthened.

The pattern is invisible per-feature ("this would be nice") but visible in aggregate ("v1 has been almost done for four months"). Clinical, safety and data-integrity edge cases are first-version work: a missing allergy record, a weight of zero, a renal dose adjustment, a null in a field that drives a decision. This rule never defers them.

## Response

**Soft (default):**

1. **Name the shape:** "That's v2-shaped. v1 still has `<remaining v1 work>` outstanding."
2. **Two paths:**
   - **Defer to v2:** "Note in `unbuilt-products` for post-v1. Keeps v1 ship-able."
   - **Add to v1 scope deliberately:** "OK — but acknowledge v1 just got bigger by `<estimate>`. Want to update kill-criteria too?"
3. **Yield.**

**When the operator says v1 has been close for weeks** (Claude cannot see that history itself), still one nudge, never a stop:

1. **Stop.** "v1 has been 'almost done' for `<duration>`. Every v2-shaped addition pushes v1 farther."
2. **Force the choice:** "Either ship v1 with the typical case working, OR formally accept v1 scope creep and update the timeline."

## Suppression

- The edge case affects patient safety, clinical correctness, security, auth or data integrity. That is v1 work.
- The "edge case" is genuinely v1 (e.g., a security / auth case — those are typical-case requirements)
- v1 has shipped already — we're in v2 territory by definition
- Mode is `explore` — sketches can include v2 thinking
- Operator pre-acknowledged: "adding to v1 scope deliberately"

## Override

- "this is genuinely v1 — typical case requires it"
- "scope creep accepted — updating timeline"
- "explore"
