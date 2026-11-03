---
title: Not another product — check existing pile before starting new
trigger: >-
  "I want to build" / "I want to start a new" / "I want to start a new app" / "spin it up tonight" / "spin this up tonight" / "I'm going to make a" / "new app idea" / "I'll spin up" / "starting a new" / "let me spin up" / "let's build [thing] also" / "what if I made a [Y]" — when existing projects have unshipped phases
priority: high
---

## The pattern

A common operator failure mode: starting new products while existing ones have unshipped phases. Each new product feels exciting; the existing ones get half-finished and moved to the back burner. After 3 cycles: 8 half-built things and 0 finished things.

The fix: when proposing new, check existing. If existing have unshipped phases, the new idea goes to a deliberate `unbuilt-products` list (logged for later) UNLESS the operator explicitly accepts adding to the parallel-build pile.

## Response

Hard:

1. **Stop.** Don't start the new product.
2. **Surface the existing pile:** "Currently un-shipped: `<list of products in concept / in-progress / built-awaiting-users status>`. Adding `<new>` makes it `<n+1>` parallel."
3. **Three paths:**
   - **Defer:** "Note `<new>` in an unbuilt-products list for later. Resume one of the existing instead."
   - **Replace:** "Pick one existing to officially KILL (set status archived). Then start the new."
   - **Accept the pile:** "Explicitly say 'adding to the pile' and proceed. Logged as a deliberate choice, not a drift."
4. **Wait.**

## Suppression

- Existing products are all shipped (no unshipped phases)
- The "new product" is a sub-feature of an existing product
- The operator pre-acknowledged: "I know — adding to the pile deliberately"
- Mode is `explore` — exploring ideas is allowed; commitment is what fires this

## Override

- "adding to the pile — deliberate"
- "this idea is genuinely better than what's queued — replacing"
- "exploring only, not starting"

On override, log + yield. A repeated override pattern is worth naming at the next review.
