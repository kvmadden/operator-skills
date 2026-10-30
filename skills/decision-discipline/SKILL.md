---
name: decision-discipline
description: |
  Use this skill whenever the operator is at a decision moment and a discipline-question applies — a substantive call about to be made, a deliberation that's spinning without new signal, options surfaced without a pick, a tradeoff left implicit, a reversibility frame missing, a Q1 that might not be the real question, a new product / initiative being committed to without kill criteria, or a pattern of declined opportunities to surface. Triggers include "let's go with", "decided", "the call is", "I'm picking", "going with", "we're doing X not Y", "final answer", "locking this in", "the decision is" (substantive call being made — log it); "should I do X or Y", "I'm not sure if", "I keep going back and forth", "this is the right call" (deliberation or commitment moment); "we could do X, Y, or Z" (three+ options without a pick); "I'm starting [product]", "spinning up [X]", "new initiative", "let me commit to [Y]" (kill criteria upfront); "I passed on X", "decided not to pursue Y", "turned down [thing]" (unpursued opportunities surfacing). Consult the skill's rules/ folder to identify the specific decision-shape (decision-log, if-i-flipped-a-coin, kill-criteria, name-the-tradeoff, pick-one, reversible-or-not, unpursued, whats-the-real-question) and apply that rule's response. Soft teaching response. Do NOT use during acute time-critical / no-analysis-room situations, mode is `explore`, the decision is already documented in this session, or the operator has explicitly invoked "skip" / "trivial".
license: MIT — see plugin LICENSE
metadata:
  priority: high
  promptSignals:
    phrases:
      - "let's go with"
      - "decided"
      - "the call is"
      - "I'm picking"
      - "going with"
      - "we're doing X not Y"
      - "final answer"
      - "locking this in"
      - "the decision is"
      - "should I do X or Y"
      - "I'm not sure if"
      - "I keep going back and forth"
      - "this is the right call"
      - "we could do X, Y, or Z"
      - "we could do A, B, or C"
      - "options are"
      - "three approaches"
      - "lots of ways to do this"
      - "maybe even a hybrid"
      - "or maybe a hybrid"
      - "could try a few different things"
      - "give me the options"
      - "what are the tradeoffs"
      - "one-way door"
      - "two-way door"
      - "I'm starting"
      - "spinning up"
      - "new initiative"
      - "let me commit to"
      - "I passed on"
      - "decided not to pursue"
      - "turned down"
      - "kill criteria"
      - "what's the real question"
---

# Decision-discipline watch

Eight rules around decision moments.

## Rules

| Pattern | Trigger | Rule |
|---|---|---|
| Substantive decision being made — log it | "let's go with" / "decided" / "the call is" / "locking this in" | [decision-log](rules/decision-log.md) |
| Deliberation producing no new signal — commit instead | extended back-and-forth on a binary; "I keep going back and forth" | [if-i-flipped-a-coin](rules/if-i-flipped-a-coin.md) |
| New product / commitment without abandonment conditions | "I'm starting [product]" / "spinning up" / "new initiative" / "let me commit to" | [kill-criteria](rules/kill-criteria.md) |
| Decision made without naming the cost / tradeoff | "we're going with X" without "X gives up Y" | [name-the-tradeoff](rules/name-the-tradeoff.md) |
| Three+ options surfaced without picking one | "we could do X, Y, or Z" closer with no recommendation | [pick-one](rules/pick-one.md) |
| Type-1 vs type-2 (reversible) decision frame missing | decision without "one-way / two-way door" distinction | [reversible-or-not](rules/reversible-or-not.md) |
| Declined opportunities — surface the pattern | "I passed on X" / "turned down" / monthly + quarterly cadence | [unpursued](rules/unpursued.md) |
| Q1 turns out not to be the real question | stuck loop on a question; conversation circling | [whats-the-real-question](rules/whats-the-real-question.md) |

## Dispatch

Match the decision moment to the rule. Apply the rule's specific diagnostic. Yield.

## Suppression rules

- Acute time-critical (no analysis room)
- Mode is `explore`
- Decision is already documented in this session

## What this skill never does

- Force any specific decision
- Demand a long deliberation when the choice is type-2 / reversible
- Lecture on decision theory
