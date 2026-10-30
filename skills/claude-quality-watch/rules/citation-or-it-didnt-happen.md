---
title: Stale current-state claim — memory not verified
trigger: "as of now" / "currently" / "the latest version of [X] is" / "[Service] recently added" / "the new [feature] supports" / any temporally-bounded claim about state without fresh verification
priority: medium
---

## The pattern

Claims about the CURRENT state of external services, libraries, APIs, or the world at large require fresh verification. LLM training has a cutoff — what was true at training time may be false now (deprecations, version bumps, feature changes, sunset products).

## Response

Soft:

1. **Name the temporal claim:** "That's a current-state claim about `<X>`."
2. **Ask:** "Verified, or from training memory?"
3. **If memory:** "Want me to web-search / fetch to confirm current state? LLM memory is stale-by-design."
4. **Yield.**

Verification methods:

- Web search for current docs / news
- Web fetch of the actual current page
- Read of `package.json` (or equivalent) for actual installed version
- Direct test against the API for actual current behavior

## Suppression

- Verification just happened (web fetch / search / read in recent turns)
- Claim is about TIMELESS facts (math, physics, settled history)
- Mode is `explore` — speculation OK if framed as such
- Operator pre-acknowledged: "OK to use stale memory here, will verify later"

## Override

- "OK — using stale memory, will verify before acting"
- "this is settled / won't have changed"
- "explicitly framing as 'as of [date]'"

## Why this rule earns its keep

Library version churn is real. APIs change. Services deprecate. The rule makes the verification step deliberate so claims about current state get checked, not assumed. Cheap to check, expensive to act on a stale claim.
