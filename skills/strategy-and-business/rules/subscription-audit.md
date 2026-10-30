---
title: Subscription audit — quarterly catch on silent recurring spend
trigger: quarterly cadence / explicit "subscription audit" invocation / "I should look at my subscriptions" / recurring-spend mention
priority: low
cadence: quarterly
---

## The pattern

Subscriptions accumulate silently. Each one is a small amount; aggregate becomes meaningful. The vibe-coder + indie-builder + creator pattern especially accumulates tools (API providers, hosting, design tools, productivity tools, music/production tools, domains).

The audit:

- List all active subscriptions
- Per-subscription: used in last 30 days?
- Per-subscription: still earning its place vs habit?
- Cancel / downgrade what's not earning

Typical accumulation set:

- AI / model API providers
- Hosting / infra (cloud, DB, edge)
- IDE / coding assistants
- Domain registrars
- Design tools
- Productivity tools (notes, project mgmt, comms)
- Domain-specific tools (analytics, media, monitoring, etc.)

## Response

1. **Surface the audit:** Pull list of active subscriptions (operator will need to provide; could be from credit card statement).
2. **Per-subscription, ask:**
   - Used in last 30 days?
   - Still earning its place?
3. **Recommend:**
   - **Cancel:** not used + not needed
   - **Downgrade:** used but tier is too high
   - **Keep:** earning its place
4. **Yield to operator's choices.**

## Suppression

- Already audited this quarter
- Mode is `solo-run`

## Override

- "skipping this quarter — already on top of it"
- "audited two weeks ago — log only"
