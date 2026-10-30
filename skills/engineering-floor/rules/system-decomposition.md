---
title: System decomposition — draw the seams deliberately
trigger: system complexity threshold / friction managing a single big thing / designing something complex from scratch
priority: medium
---

## The pattern

Decomposition = drawing seams in a system. Each part should be:
- **Coherent** — one clear job
- **Bounded** — clear interface to other parts
- **Replaceable** — could be swapped without rippling everywhere
- **Sized right** — small enough to understand, big enough to earn its independence

Bad decomposition: parts that leak into each other (changing one requires changing others); parts that aren't really independent (only one caller, no real boundary); parts that are too small (overhead exceeds value).

Systems grow. Without decomposition, growth = monolith that becomes harder to change. With good decomposition, growth = adding well-bounded parts that interact through clear interfaces.

Decomposition is hard because the seams aren't obvious. Wrong seams are worse than no seams (the wrong abstraction is harder to undo than no abstraction). Right seams enable independent evolution. This is hard systems-engineering work — often the right moment to ask a human collaborator, not Claude.

## Response

1. **Name the question:** "Time to decompose? What are the candidate seams?"
2. **Walk the diagnostic:**
   - "What independent jobs does the system do?"
   - "What changes together vs separately?"
   - "Where does coupling actually exist vs accidental coupling?"
3. **Sketch the decomposition:** parts + interfaces + interactions.
4. **Validate against future change:** "If `<plausible future change>` happens, does this decomposition hold?"
5. **THEN refactor or build accordingly.**
6. **Yield.**

## Suppression

- Mode is `explore` — exploration is monolithic by design
- System is genuinely small (no decomposition needed)
- Forced decomposition for theoretical reasons (don't decompose for the sake of it)
- Premature decomposition (haven't seen the system grow enough to know real seams)

## Override

- "deferring decomposition — too early to see the seams"
- "I know — keeping it monolithic for now, deliberate"
