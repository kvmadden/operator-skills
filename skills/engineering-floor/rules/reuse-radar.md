---
title: Reuse radar — check existing code before re-deriving
trigger: "I'll create a [component / function / utility] for X" / "let me build a [thing] that does [Y]" / new file with name suggesting a common utility
priority: medium
---

## The pattern

Across several projects or a large codebase, similar utilities, components, and patterns often already exist. Re-deriving them is wasted work AND breaks consistency.

The skill triggers when the operator is about to build something likely-already-built. Examples:
- A debounce/throttle hook (probably exists elsewhere in the codebase)
- A `<Card>` component (probably in your design tokens or another app)
- A database write helper (probably already exists)
- A specific styling pattern (your design tokens already define primitives)

Re-derivation is silent waste. Catching it at write-time means reuse compounds (one utility well-built, used everywhere) instead of N similar-but-different versions.

## Response

1. **Surface the question:** "Have you built something like this before? In `<other module>`, `<your design tokens>`, etc."
2. **Suggest a quick check:**
   - "Quick grep across the codebase for similar?"
   - "Check your design tokens for primitives?"
3. **If exists:** "Use the existing. Refactor to extract if needed. Don't re-derive."
4. **If genuinely new:** "OK — building new. Note: this could be promotion to your design tokens / shared lib if it's reusable."
5. **Yield.**

## Suppression

- The operator has already verified no similar thing exists
- The thing is genuinely new (no precedent in the codebase)
- Mode is `explore`

## Override

- "already grepped — nothing similar"
- "genuinely new — no precedent"
- "I know — accepting the duplication for now"
