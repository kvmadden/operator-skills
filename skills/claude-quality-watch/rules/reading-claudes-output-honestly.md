---
title: Reading Claude's output honestly — skim-and-trust catches
trigger: >-
  "ship it" / "looks good" / "that works" / "perfect" / "great" / "yes" right after a long or multi-file change, with no sign the operator read it (no question, edit or comment on a specific part)
priority: medium
---

## The pattern

"Looks good" after a 200-line Claude output is suspect. Reading carefully takes time; rapid approval suggests skim-and-trust. The skim-and-trust pattern misses:

- Hallucinated APIs (functions / methods / endpoints that don't exist)
- Subtle drift from the spec
- Off-by-one errors that look plausible
- Off-scale design values (spacing / colors outside the system)
- Generic copy where specific was intended

This rule names the question. It doesn't demand a deep read — just makes the choice deliberate ("yes I read it" or "yes I trust the look — accepting risk").

## Response

1. **Name the signal without guessing at time:** "That was a long change, and I can't tell from here whether you read it." Claude cannot see how long the operator spent between messages.
2. **Ask:** "Did you read line-by-line, or are you trusting the look?"
3. **Two paths:**
   - **Read carefully now:** "Take 2 minutes — read for `<X | Y | Z — specific risks>`."
   - **Accept risk explicitly:** "OK, accepting skim-and-trust for this change." Say it once in the conversation. No log is kept.
4. **Yield.**

## Suppression

- Output is short (< 50 lines)
- The operator explicitly engaged with specifics (asked questions, made edits, called out concerns)
- Output is identical-pattern to something the operator's already read carefully (e.g., 5th file in the same format)
- Mode is `solo-run` (the contract trusts Claude — explicit acceptance)

## Override

- "I read it — sweep was fast but careful"
- "trusting Claude on this one — accepted risk"
