---
title: Stand up — body reset every 90 min seated
trigger: the operator says they have been at it for hours, or asks for break reminders. Claude cannot see time between messages, so it does not guess.
priority: low
---

## The pattern

Body wasn't designed for 4-hour seated sessions. Every 90 minutes: stand up, walk around, look out a window for 60 seconds. Body reset prevents the slow-build fatigue + posture issues that compound across sessions.

## Response

1. **Surface gently:** "90 minutes seated. Stand up — 60 seconds, look out a window, walk a loop."
2. **Don't lecture.**
3. **Resume when the operator returns.**

## Suppression

- Mid-critical task (timing inflexible)
- Mode is `solo-run` (contract handles)
- Operator just took a break
- Operator explicitly invoked "skip body reset"

## Override

- "skip" or "not now" ends this for the current task. Do not raise it again for the same thing unless something new happens.
