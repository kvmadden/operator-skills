---
title: No new product this week — weekly forcing function for restraint
trigger: first session of the week; or explicit invocation "set the new-product rule for this week"
priority: medium
cadence: weekly (first session of the week)
---

## The pattern

The first session of each week sets the new-product bound. Default: NO NEW PRODUCTS this week unless an existing one ships first. The operator can override at week-start ("this is the week I start `<X>`") but the default is restraint.

The forcing function: weekly explicit decision. Without it, "let me start one more thing" creeps in mid-week without weekly accountability. Across weeks, the unshipped pile grows; nothing closes.

When `not-another-product` fires later in the week, it reads this flag — if "no new products allowed," it fires harder. The weekly bound is the upstream forcing function; per-fire interrupts handle the downstream cases.

## Response

1. **Set the default:** "New-product bound for this week: NONE unless existing product ships. Default: restraint."
2. **Ask if exception:**
   - "Any existing product close to shipping this week?"
   - "Any new product you've decided IS the week's start?"
3. **Lock the answer:** write to mode / session state (`new-product-allowed: false` or `new-product-allowed: <name>`).
4. **Yield.**

## Suppression

- Already set this week
- Mode is `explore` — exploration is by-design new-product-curious
- Operator pre-acknowledged: "I know — starting `<X>` this week, accepting"

## Override

- "this is the week I start `<X>`"
- "no bound — open this week"
- "I know — overriding"
- "explore"
