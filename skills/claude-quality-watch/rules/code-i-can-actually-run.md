---
title: Hallucinated code — made-up APIs / signatures / libraries
trigger: >-
  about to write, or has just written, an import, method call, option, CLI flag or endpoint that has not been checked in this session against the installed package, its type definitions, its docs, a type check or a test run
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

The model cannot reliably tell when it is guessing, so the trigger is the missing check, not a feeling of doubt. Check, correct, then continue:

1. **Stop the generation.** Don't ship code with unverified references.
2. **Surface the unverified reference:** "I'm about to use `<library/API/signature>` — I should verify it exists before committing the code."
3. **Verify:**
   - For libraries: read the package source in `node_modules/`
   - For methods: check the actual lib types / docs
   - Mechanically: run the type checker, `node --check`, or the tests that import the code, and read the errors
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
