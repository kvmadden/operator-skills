---
title: Brief first — no implementation without a one-page brief
trigger: >-
  "let's build [X]" / "make me a [X]" / "I want a [X]" / "create a [X]" / "spin up a [X]" / "I need a [X]" — any implementation request without a prior brief
priority: high
---

## The pattern

No code (or substantive deliverable — pitch, decision doc, design spec) without a brief naming: **the problem**, **the success criteria**, **what's in scope**, **what's out of scope**. One page max. Often three sentences is enough.

## Response

**One question before a substantial build, not a stop.** A substantial build is a new product, app or service, or a feature that spans several files. Small requests (a function, script, query, regex, test or fix) go ahead without a brief.

1. **Ask once before starting the build.**
2. **Name what's missing:**
   "Before I build that, I need a brief. Quick version:
   - **Problem:** what hurts today?
   - **Success:** how do we know it worked?
   - **In:** what's the scope?
   - **Out:** what's explicitly NOT this?"
3. **Offer to draft:** "I can draft a brief in 30 seconds — answer those four."
4. **Follow the operator's answer.** "Just build it" means build it.

## Suppression

- Brief was produced earlier in this conversation
- Mode is `explore`
- The operator invokes "skip the brief" / "I know what I want, just build it"
- A single function, script, query, regex, test, fix or mechanical change
- Operator is mid-`solo-run` and the new thing is in the contract

## Override

- "skip the brief"
- "I know what I want"
- "just build it"
- "no brief needed"
- "trust me on this one"
