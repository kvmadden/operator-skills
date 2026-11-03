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
- Says it plainly. Styling and brand voice come later with the rest of the polish (build-order)

## Response

1. **Surface:** "Empty state for `<this surface>` — what does the first user see when there's no data?"
2. **Walk the design:**
   - What is this surface for?
   - What's the action that ends the empty state?
   - What's the brand voice for the zero-state copy?
3. **Make the empty state work before polishing either state.** Function first, styling with the rest of the polish.
4. **Yield.**

## Suppression

- Surface will never be empty (system always has data)
- Empty state already designed
- Mode is `explore`

## Override

- "skip" or "not now" ends this for the current task. Do not raise it again for the same thing unless something new happens.
