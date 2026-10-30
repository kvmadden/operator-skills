---
title: Tokens not values — never inline design literals
trigger: "let me hardcode" / "let me just hardcode" / "hardcode this color" / "hardcode the value" / "I'll just use" + hex code / inline hex codes (`#xxxxxx`, `rgb(...)`, `hsl(...)`) / Tailwind arbitrary values (`p-[17px]`, `text-[19px]`, `bg-[#abc123]`) / CSS literals (`padding: 17px`, `margin: 22px`, `border-radius: 7px`) / off-scale spacing / off-scale type sizes
priority: high
---

## The pattern

Tokens, not values. Your design tokens define the canonical scales for color, spacing, type, radius, shadow. Inline literals bypass the system and create drift — every "padding: 17px" is a value that doesn't match anything else, doesn't update with the system, and won't be caught by audits.

The system EXISTS to prevent drift. Every inline literal is a vote against the system — and votes accumulate. After 50 inline literals, the system is meaningless because nothing actually uses it.

Common drift vectors:
- Inline hex codes (`#xxxxxx`, `rgb(...)`, `hsl(...)`)
- Tailwind arbitrary values (`p-[17px]`, `text-[19px]`, `bg-[#abc123]`)
- CSS literals off the spacing scale
- Type sizes off the type scale
- Shadow/radius values that don't match the tokens

Across several apps or packages: tokens make visual coherence possible. Without enforced tokens, apps drift — same brand, different padding scales, different type sizes. Looks unprofessional even when individual screens look fine.

## Response

**HARD INTERRUPT.**

1. **Stop.** Don't apply the literal.
2. **Name the literal + nearest token:**
   - "`#abc123` — not a known token. Which accent-color token applies here?"
   - "`padding: 17px` — not on the spacing scale. Nearest tokens: `<lower-token>` / `<upper-token>`."
   - "`font-size: 19px` — not on the type scale. Nearest: `<lower-size>` / `<upper-size>`."
3. **Two paths:**
   - **Use token:** apply the canonical value.
   - **Update tokens:** "If this literal IS the right value, the token system needs updating — open a discussion in your design-tokens package, don't just inline."
4. **Wait.**

## Suppression

- The value IS canonical (e.g., `0` margin, `1px` border on a token-safe value)
- File is in the design-tokens package itself (where canonical values live)
- Mode is `explore` AND clearly a sketch
- The operator already named: "I know — testing a non-standard value"

## Override

- "I know — non-standard value, accepting drift"
- "this is a one-off prototype"
- "your design tokens need this value added — separate work"
