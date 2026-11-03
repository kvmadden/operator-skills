---
title: Prompt archeology — archive prompts that worked
trigger: >-
  "perfect" / "exactly" / "that's it" / "nailed it" / "great answer" / "wow that worked" / "first try" / "no edits needed"
priority: medium
---

## The pattern

Good prompts are reusable. Saving them when they produce good results creates a personal library of patterns that work. The cost (a few seconds to log) vs. the cost of re-deriving good prompts later is overwhelming.

What to save:

- The exact prompt text (verbatim)
- The context it was in (what came before)
- What the result was (one-line summary)
- What made it land (the operator's hypothesis: brevity? specificity? tone? format?)

## Response

1. **Acknowledge the win:** "That landed."
2. **Offer to archive:** "Save the prompt + context + what made it work? It'll be searchable next time you need a similar shape."
3. **If yes:** capture verbatim + append it to a prompts file in the repo (for example `PROMPTS.md`).
4. **If no:** "Got it — moving on."

## Suppression

- Result was good but the prompt was trivial (e.g., "what time is it" — not worth archiving)
- Prompt is essentially "do the obvious next step" with no insight
- Mode is `solo-run` — log inside the run; archive after
- A very similar prompt was already archived recently

## Override

- "trivial — skip archive"
- "I know — will archive when I get back to this"
