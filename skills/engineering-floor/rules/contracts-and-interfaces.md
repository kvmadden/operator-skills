---
title: Contracts and interfaces — name the contract before the body
trigger: function body being written without contract sketched; "module X needs to talk to Y" / "what does this function take" / "interface between"
priority: medium
---

## The pattern

Contract before implementation. Before writing the function body, name:

- **Inputs** — types, shapes, invariants
- **Outputs** — types, shapes, edge cases (null? error?)
- **Side effects** — what changes outside the function
- **Failure modes** — when does it fail, how, what's the caller's recovery

Without explicit contracts, modules couple to each other's implementations; refactors break callers.

## Response

1. **Surface:** "Before writing the body — what's the contract? Inputs, outputs, side effects, failure modes."
2. **Help draft** in TypeScript types or JSDoc.
3. **Then implement against the contract.**
4. **Yield.**

## Suppression

- Single-use throwaway code
- Mode is `explore`
- Trivial helper where contract is obvious from the name
- Spike code intended to be thrown away after learning

## Override

- "skip" or "not now" ends this for the current task. Do not raise it again for the same thing unless something new happens.
