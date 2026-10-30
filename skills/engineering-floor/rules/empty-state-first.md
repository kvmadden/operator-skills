---
title: Empty state first — design the zero-data view BEFORE the happy path
trigger: list / grid / table / dashboard being designed without explicit empty-state consideration
priority: medium
---

## The pattern

The empty state is what the first user sees. Designing it last produces "Loading… No data" placeholder shame.

A good empty state:

- Names what the surface IS (so users understand the value)
- Points to the action that ends the empty state ("Add your first X")
- Uses brand voice (not generic "No items")
- Designed visually (not just a center-aligned grey line)

## Response

1. **Surface:** "Empty state for `<this surface>` — what does the first user see when there's no data?"
2. **Walk the design:**
   - What is this surface for?
   - What's the action that ends the empty state?
   - What's the brand voice for the zero-state copy?
3. **Build empty BEFORE happy path.**
4. **Yield.**

## Suppression

- Surface will never be empty (system always has data)
- Empty state already designed
- Mode is `explore`
