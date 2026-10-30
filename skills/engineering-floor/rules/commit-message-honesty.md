---
title: Commit message honesty — specific or it's not documentation
trigger: vague commit messages — "minor updates", "wip", "fix stuff", "tweaks", "polish", "fixes", "updates", "changes", "improvements"
priority: medium
---

## The pattern

Commit messages are documentation. The future-operator reading `git log` should understand what changed and why without opening the diff. Vague messages defeat the entire point.

Format: `<verb in present tense>: <what>, <why if not obvious>`

Bad: `minor updates`, `wip`, `fix stuff`, `polish`, `tweaks`, empty.
Good: `add retry with backoff to the upload client`, `fix(upload): respect content-length on mobile Safari`.

## Response

1. **Show the message:** "That commit message: `<message>`. Future-operator reading `git log` won't know what changed."
2. **Offer the format:** "Try: `<verb in present tense>: <what>, <why>`. Looking at the diff: `<suggested message>`."
3. **Yield.**

## Suppression

- Commit is truly trivial AND named specifically (e.g., "fix typo in README")
- Mid-amend on personal branch that hasn't shipped
- Mode is `explore` AND no push planned

## Override

- "wip on personal branch"
- "will squash before merge"
- "trivial typo, accepted"
