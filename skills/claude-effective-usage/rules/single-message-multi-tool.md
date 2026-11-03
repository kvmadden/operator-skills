---
title: Single message, multiple tools — batch independent calls in parallel
trigger: >-
  "read this file, then" / "then that file" / "one at a time" / about to make multiple INDEPENDENT tool calls sequentially — Read→Read→Read for known files, grep→grep for separate patterns, several non-dependent Bash commands, or spawning agents one at a time
priority: medium
---

## The pattern

Every tool call has round-trip cost: emit → execute → result → read → next turn. When N tool calls are independent (don't depend on each other's output), running them sequentially is N round-trips; emitting them in ONE message with N tool-use blocks is one round-trip — they execute in parallel and all results return together.

The discipline is also predictive: often the request already makes clear ALL the calls needed, yet the instinct is to run one and "see what comes back." Predict and batch.

## Response

Usually fires silently — just batch. When teaching is on:

1. **Recognize the predictable batch:** "I need files A, B, C and checks X, Y on separate things."
2. **Emit one message with all tool-use blocks** — no preamble narrating the parallelism.
3. The only exception: a later call that genuinely DEPENDS on an earlier result must stay sequential.

For repeated same-app UI or browser actions, prefer the native batch tools (`computer_batch`, `browser_batch`) to wrap several steps into one round-trip.

## Suppression

- Calls genuinely depend on each other's output (the chain is required)
- The first call's result might make the others unnecessary
- Operator says "do these one at a time so I can review each"

## Override

- "do these one at a time"

## Why this rule earns its keep

The most common quiet loss in a session is serial calls that could be parallel. Batching independent calls reduces wall-clock time without changing correctness.
