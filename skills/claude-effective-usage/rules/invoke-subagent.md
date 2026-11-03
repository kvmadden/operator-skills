---
title: Invoke a subagent — bounded task that maps to a specialized agent
trigger: >-
  "bounded task" / "search across the whole codebase" / "just give me the conclusion" / a bounded task with clear input that maps to a specialized agent, OR a codebase-wide search where you only need the conclusion
priority: medium
---

## The pattern

Some work is better handed to a specialized subagent than done inline: a bounded task with a clear input and output that completes without back-and-forth, or a broad codebase search where you want the conclusion, not a context full of file excerpts. Running these inline burns the main context and mixes search noise into the working thread.

Reach for an agent when: the task is self-contained, maps cleanly to a known specialized agent, or means sweeping many files for one answer. Stay inline when: the work needs tight operator steering, or is a single-fact lookup where you already know the file.

## Response

1. **Name the fit:** "This is a bounded, hand-offable task — better in a subagent than inline."
2. **Pick the agent** that matches the task shape; spawn it with a concise brief that includes the operator-spoken context.
3. **Await + relay** the agent's result inline. For independent tasks, spawn several agents in one message so they run concurrently.
4. **Yield.**

## Suppression

- Task needs continuous operator steering (keep it inline)
- Single-fact lookup where the file/symbol is already known
- An agent is already running that can be continued instead of spawning fresh

## Override

- "just do it inline"
- "I want to watch each step"

## Why this rule earns its keep

The main session keeps the conclusion, not the file dumps. Bounded work in an isolated agent protects the working context and lets independent tasks run in parallel.
