---
title: Name the version — "the new one" creates ambiguity that compounds
trigger: "the new one" / "the latest version" / "the v2" / "the rebuild" / "the redo" / "the most recent" / "the updated one" without an actual version number or descriptive name
priority: low
---

## The pattern

Every meaningful version gets an explicit name. Semver if it's code (`v0.24.0`), descriptive if it's design (`Phase 2 rewrite`, `2026-Q2 cut`, `pre-revert`, `post-rename`). "The new one" or "the latest" works for a week — then breaks.

This matters especially when you have multiple products with frequent rebuilds and multiple "v2"s living in the same conversation. Three months from now, running `git log` or browsing CHANGELOG, you'll encounter "the new one" — which one? The old one? Or the one before that?

Without names, every reference is ambiguous later. Naming explicitly preserves the timeline.

## Response

1. **Name the ambiguity:** "'The new one' — which one specifically?"
2. **Suggest a name:**
   - For code: semver bump (`v0.24.1`, `v0.25.0`)
   - For design: descriptive label (`Phase 2 rewrite`, `2026-Q2 cut`, `post-rename`)
   - For products: brand-version (`<Product> v2`)
3. **Use the name from now on:** "Calling this `<name>` in chat from here. Will write to decision-log if it's worth recording."
4. **Yield.**

## Suppression

- Inside an active conversation where "the new one" is unambiguous (just discussed `v0.24.0` — calling it "the new one" briefly is fine)
- Mode is `explore` — sketching can be loose
- Operator already named the version explicitly in this session
- Code where the version IS the variable (`currentVersion`, no need to also say "v1.2.3")

## Override

- "'the new one' is fine in context"
- "this is throwaway — won't matter"
- "naming will come at v1"
- "explore"
