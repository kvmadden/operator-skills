---
title: Error state first — design the failure paths BEFORE the happy path
trigger: network-dependent UI being designed without error path (timeout, 500, malformed response) explicitly considered
priority: medium
---

## The pattern

Errors are the OTHER state often forgotten — and more common than the happy path admits. Network timeouts, 500s, malformed responses, auth failures, rate limits.

A good error state:

- Names what went wrong (not generic "Something went wrong")
- Gives the user a recovery path (retry button, alternate action, link to support)
- Uses brand voice for tone
- Distinguishes from empty state (zero-data ≠ failure)

## Response

1. **Surface:** "Error state for `<this surface>` — what does the user see when the network / API / data fails?"
2. **Walk the failure paths:**
   - Network timeout
   - 500 / service error
   - Malformed response
   - Auth failure
   - Rate limit
3. **Build error states BEFORE shipping.**
4. **Yield.**

## Suppression

- Surface is offline-only (no network failures possible)
- Error states already designed
- Mode is `explore`
