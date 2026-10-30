---
title: Unit economics — does each additional unit earn more than it costs?
trigger: considering scaling a product without unit-economics analysis / "let's scale this" / "more users" / "wider rollout" / "open this up"
priority: medium
---

## The pattern

Unit economics: pick the relevant unit (user, transaction, seat, request, etc.), name the cost per unit, name the return per unit. If return > cost: scaling earns. If cost > return: scaling makes things worse.

Many projects have positive unit economics for one user (the builder themselves) and negative for scale (each additional user adds cost). That's important to know BEFORE scaling.

Scaling without unit economics is a fast way to amplify problems. Negative unit economics scaled = problems compound (each new user adds net cost). Positive unit economics scaled = compounding return.

Vibe-builders often skip this because the unit isn't obvious for personal-use tools. The discipline forces the question.

Each product has a natural unit. Naming it (and the cost + return per unit) catches negative-economics products before they get scaled.

## Response

1. **Surface the question:** "Unit economics on `<product>`?"
2. **Walk through:**
   - What's the unit? (user, transaction, request, visit, capture, etc.)
   - Cost per unit (time, money, attention, compute)
   - Return per unit (use, money, learning, retention)
3. **Net per-unit:** "Each additional `<unit>` adds: `<X cost>` for `<Y return>`. Net: `<Z>`."
4. **Decision:**
   - Positive → scale safely
   - Negative → fix unit economics before scaling, or accept that scaling makes it worse
5. **Yield.**

## Suppression

- Pre-scale (genuinely too early to have unit data)
- Personal-use tool (unit = operator; analysis is simpler but still worth doing)
- Mode is `explore`
- Scaling already validated (positive unit economics confirmed)

## Override

- "unit economics negative — accepted as loss-leader / investment"
- "pre-scale — revisit at <threshold>"
