---
title: Auth floor. The security boundary is the API, proven by a request that should fail
trigger: >-
  an auth or role check that exists in the UI (hidden button, conditional render, gated route, disabled control) for an action whose API route, server action, database policy or function call has not been checked for the same rule
priority: high
---

## The pattern

A check in the UI is a convenience, not a control. Anyone can call the API directly. The boundary is the server: route handler, server action, database row-level security policy or service method.

The presence of middleware, a policy or an `auth()` call is not proof. A route can authenticate the user and still let one user change another user's record or one tenant read another tenant's data.

This floor holds in every mode. Code the operator calls a sketch still reaches a real database once it runs against one, so a label never turns the check off.

## Response

1. **Surface the gap:** "The UI hides `<action>` from non-admins. Is the same rule enforced where `<action>` runs?"
2. **Check the server side:** the route or action checks the role, and checks ownership of the specific record or tenant, not only that a session exists.
3. **Prove it with a failing request:** add a test that calls the API as the wrong user, the wrong role and the wrong tenant, and expects a 401, 403 or 404. A passing happy-path test does not show the boundary works.
4. **Yield** once the server check and the negative test exist.

## Suppression

- The endpoint is public by design and the operator says so
- The server already enforces the rule and a negative test covers it

## Override

- "public by design: <why>"

No override for shipping a data-changing endpoint whose only check is in the UI.
