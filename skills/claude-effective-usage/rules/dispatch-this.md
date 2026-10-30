---
title: Dispatch this — async multi-step work belongs in Claude Dispatch
trigger: "by EOD" / "have this ready when I get back" / "investigate X and report" / "go gather all the Y and summarize" / "research [topic] and produce [output]" / "while I'm doing other things, can you"
priority: medium
---

## The pattern

Claude Dispatch is built for async, multi-step work with a clear input → process → output shape and a deadline. Doing dispatch-shaped work synchronously in Claude Code blocks the session for the duration, can't run in parallel with other work, and leaves no structured task to revisit later.

Dispatch fits when: clear deliverable + deadline, async (you'll come back to the result), multi-step (research → analysis → synthesis → delivery), and you don't need to steer each step. Code fits when: synchronous, tightly bound to local files, or the output is code you'll touch right after.

## Response

1. **Name the shape:** "This is async multi-step — clear input, clear deliverable, clear deadline."
2. **Suggest the move:** "Claude Dispatch handles this natively and runs in parallel with whatever else you're doing."
3. **Offer the handoff:** "I can write the Dispatch task brief from what you've said."
4. **Yield.**

## Suppression

- Small enough to do synchronously (~5 minutes)
- Operator wants to be in the loop on each step
- Task touches local codebase files (not dispatch-shaped)

## Override

- "do it here so I can watch"
- "small enough — let's just rip it"

## Why this rule earns its keep

Multi-step async work done synchronously blocks the session for hours. Recognizing the shape early frees the operator to do other work while it runs and delivers.
