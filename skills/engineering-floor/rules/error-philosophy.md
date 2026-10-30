---
title: Error philosophy — catch where you can act, bubble where you can't
trigger: try/catch being written; "let me catch this" / "wrap it in a try" / "handle the error" / "swallow the exception"
priority: medium
---

## The pattern

Three anti-patterns:

1. **Catch-and-swallow** — `catch { }` empty. Silent failure. Worst pattern.
2. **Catch-and-log** — logs then returns null/undefined. Caller has no signal.
3. **Catch-and-toast-generic** — "something went wrong" with no recovery path.

Right cases for catch:

- **Retry** — network blip; retry with backoff
- **Fall back** — primary failed, use known-good secondary
- **Inform user with action** — "remote unreachable; buffered locally; will sync"
- **System boundary** — top-level error boundary; prevent app crash

If none apply, **let it bubble**.

## Response

1. **Name the rule:** "Catch where you can act, bubble where you can't."
2. **Ask:** "What action does this catch enable? Retry? Fall back? Inform with recovery? Boundary protection?"
3. **If none:** "Let it bubble — silent failure is worse than loud."
4. **Yield.**

## Suppression

- Inside infrastructure with documented "should not block" rationale
- Top-level error boundary
- Mode is `explore`
- Operator pre-acknowledged: "swallowing intentionally"
