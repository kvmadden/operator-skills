---
title: Monitor instead of poll — event-driven beats sleep-loops
trigger: >-
  "sleep loop" / "poll the deploy" / "poll until" / "keep checking" / "wait for it to finish" / about to write a retry-with-delay loop for a condition that could be event-driven (deploys, status checks, background jobs)
priority: medium
---

## The pattern

Polling — `sleep N`, `for i in 1..N do curl`, `until condition do sleep` — wastes wall-clock and compute waiting on a condition. When the underlying system can notify on completion (a lifecycle hook, a webhook, a harness that re-invokes on finish, a file watch, a process-exit signal), an event-driven wait is cheaper and returns the instant the condition is met.

## Response

1. **Name it:** "This is a poll loop — the condition can be event-driven instead."
2. **Suggest the monitor:** replace the sleep/retry with the event source — a completion hook, a background task that notifies on exit, or a condition watch.
3. **Fallback:** if a timer is genuinely unavoidable, make it a long heartbeat, not a tight loop.
4. **Yield.**

## Suppression

- The external system offers no completion signal — then poll at a sane interval, not a tight loop
- A one-shot check (not a loop)
- Operator explicitly wants to watch progress live

## Override

- "just poll it — no event source exists"
- "tight loop is fine here"

## Why this rule earns its keep

Sleep-loops burn round-trips and cache while waiting. Event-driven waits cost nothing between events and fire the moment the condition is true.
