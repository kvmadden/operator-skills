---
title: Hallucinated code — made-up APIs / signatures / libraries
trigger: generated code references an import / package / API / method signature / endpoint that Claude is guessing from training memory rather than verifying
priority: high
---

## The pattern

Hallucination tripwire for code specifically. Claude generates code that references made-up APIs, hallucinated libraries, fabricated method signatures, or imaginary endpoints. Each looks plausible; running the code reveals the lie.

Pattern types:

- Made-up library functions (`import X from 'package'` where X doesn't exist in that package)
- Hallucinated method signatures (right method, wrong argument shape)
- Fabricated endpoints (URL that doesn't exist on the service)
- Outdated APIs (training-data version diverges from current)

## Response

Hard interrupt:

1. **Stop the generation.** Don't ship code with unverified references.
2. **Surface the unverified reference:** "I'm about to use `<library/API/signature>` — I should verify it exists before committing the code."
3. **Verify:**
   - For libraries: read the package source in `node_modules/`
   - For methods: check the actual lib types / docs
   - For endpoints: test against the actual service or read its current docs
4. **If verification fails:** find the actual replacement OR ask the operator to provide the right one.
5. **Resume code generation with verified references.**

## Suppression

- Just verified the reference in the last few turns
- Reference is to clearly-canonical APIs (standard library, well-known framework primitives)
- Operator explicitly said "use placeholder, will replace before ship"

## Override

- "I'll verify before ship — keep going"
- "placeholder code, OK"

## Why this rule earns its keep

Code with hallucinated references fails at runtime. Catching at generation is much cheaper than catching at debug. The cost of one verification call is seconds; the cost of debugging a hallucinated reference is minutes-to-hours.
