---
title: Accessibility floor — four non-negotiables at write-time
trigger: UI being authored without explicit a11y checks; new component without focus / contrast / touch-target / keyboard considerations
priority: high
---

## The pattern

Four non-negotiable a11y floors. These aren't goals — they're floors. Violations are bugs:

1. **Contrast** — WCAG AA minimum (4.5:1 normal text, 3:1 large)
2. **Visible focus** — every interactive element shows focus state
3. **Touch targets ≥44pt** — every tappable element meets the floor
4. **Keyboard-navigable** — every action reachable without mouse

## Response

Soft for soft fixes, hard interrupt for severe violations:

1. **Surface the missing floor:** "Component is missing `<X>` floor."
2. **Suggest the fix:** "For contrast: use token `<X>`. For touch target: add `min-h-[44px]`. For focus: add `focus-visible:` ring."
3. **Yield.**

## Suppression

- Component is internal-tooling with named accessibility waiver
- Component is dev-only (not user-facing)
- Mode is `explore` AND floor is acceptably violated for a sketch
