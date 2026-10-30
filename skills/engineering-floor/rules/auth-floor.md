---
title: Auth floor — security boundary is at the API, not the UI
trigger: auth check exists at UI (hidden button / conditional render / gated route) without matching API/RLS enforcement
priority: high
---

## The pattern

UI without API enforcement = trivially bypassable. A user can forge the API call directly with cURL; the hidden UI button doesn't stop them. The security boundary is at the API.

## Response

1. **Surface the gap:** "UI auth check on `<X>` — is there matching API/RLS enforcement?"
2. **If no:** "Add API-side check. UI alone is bypassable."
3. **Verify:**
   - For API routes: check for auth middleware
   - For Postgres with row-level security: check the RLS policy on the table
   - For server actions: check `auth()` call in the action
4. **Yield once both layers verified.**

## Suppression

- Endpoint is public (no auth required by design)
- Auth IS enforced at API layer (just being added at UI too)
- Mode is `explore` (sketches don't need full enforcement)
