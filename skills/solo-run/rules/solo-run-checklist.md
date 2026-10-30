---
title: Solo-run intake checklist
trigger: solo-run intake, solo-run start, autonomy request, solo-run preflight
priority: high
---

## The pattern

Solo-run is autonomy. Before autonomy starts, the environment, scope, authority, and stopping conditions need to be explicit — gaps default to risk. The intake gates the run: every question the operator skips becomes an assumption you make for them. Assumptions during autonomy cost more than during collaboration because there's no one in the loop to catch the drift.

The intake is not ceremony. Each question maps to a real contract field that other rules will check against — scope-lock fires against the named scope, the stopping conditions fire against the named conditions, etc. The intake is the foundation the run sits on. Skip it sloppily and the run is sloppy.

If the operator explicitly opts into a lite-mode override ("skip intake, just go"), use all defaults — but log what they were so the operator can see what was assumed.

## Response

1. **Group the questions into 1-2 AskUserQuestion calls.** Don't make the operator answer 8 prose questions in sequence.
2. **Group A — environmental (one AskUserQuestion call):**
   - **Time window:** `30-60m` / `1-2h` / `2-4h` / `4h+ / half day`
   - **Connectivity:** `solid` / `spotty` / `unknown`
   - **Battery:** `100%` / `>50%` / `<50%` / `plugged in`
   - **Interruptions likely:** `none expected` / `possible` / `active nearby`
3. **Group B — scope and authority (one AskUserQuestion call):**
   - **Scope:** 3 specific options derived from the current build context + Other (must name a feature, file, or deliverable)
   - **Authority:** `defaults (granted: edits/tests/commits/drafts; withheld: push/deps/ci/delete)` / `tighter (read-mostly, propose changes)` / `looser (push allowed; still no deps/ci/delete)`
   - **Stopping conditions:** `defaults (test-fails-twice, scope-creep, unfamiliar-pattern, +50% time)` / `add a custom condition` / `relax one default`
   - **Calendar — anything in the next window:** `clear` / `1 thing scheduled` / `back-to-back`
4. **Map answers to contract fields:**
   - Time window → contract `time_window` + auto +50% threshold for stopping
   - Spotty connectivity → adds "save aggressively, prefer local-first work" to stops
   - Battery <50% AND not plugged → adds "halt at battery 20%" to stops
   - Active interruptions nearby → reduces effective time by 30%
   - Scope → contract `scope` field (must be specific — 1 sentence, names a feature/file/outcome)
   - Authority → contract `granted` and `withheld` lists
   - Stops → contract `stops` list
   - Calendar conflict → halts before scheduled events
5. **Apply refusal conditions — intake fails → solo-run does not start:**
   - Time window unstated
   - Scope unstated or vague ("keep building" is vague; "ship the feature X" is OK)
   - Battery <20% AND not plugged in
   - Active interruptions AND time window > 90 min
   - Calendar back-to-back AND time window > 60 min
6. **On refusal — name the missing/blocking thing concretely:** "Can't start solo-run yet — your scope was 'keep building.' Need a specific outcome (a feature, a file, a deliverable). What's the one thing this run ships?"
7. **Hand off collected answers to the contract step.** This rule collects; it doesn't write the contract.
8. **Yield.**

## Defaults (when intake is skipped or operator picks "defaults")

```yaml
time_window: <required, no default>
connectivity: solid
battery: plugged-in
interruptions: none expected
scope: <required, no default>
granted:
  - file-edits-in-scope
  - tests
  - local-commits
  - drafts
  - lookups
  - codebase-search
  - refactor-within-scope
withheld:
  - push
  - deps
  - ci-cd
  - delete
  - architectural-decisions-outside-scope
  - external-state-changes (messages, posts, API state mutations)
stops:
  - test-fails-twice-and-fix-not-obvious
  - scope-creep
  - unfamiliar-pattern-surfaces
  - time-window-exceeded-by-50%
  - any-secrets-or-credentials-encounter (HARD HALT — no exceptions)
calendar: clear
```

## Suppression

- Rule is invoked outside a solo-run context (this rule is part of the solo-run umbrella; do not fire standalone)
- A previous intake within the same session has already populated the contract (don't re-intake)

## Override

- Operator says "skip intake, just go" — use all defaults, log what was assumed, surface the assumed defaults so the operator knows what was committed to on their behalf
- Operator says "abbreviated intake" — collect only time window and scope, default the rest
