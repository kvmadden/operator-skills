---
title: Re-prompt cleaner — third re-ask means the question is wrong
trigger: "no, I meant" / "let me try again" / "actually, what I want is" / "ok let me re-phrase" / 3+ near-identical prompts about the same topic in the last 10 turns; "ugh" / "no no no" / "that's not it either"
priority: medium
---

## The pattern

Three or more attempts at the same prompt without getting the right answer means the QUESTION is wrong, not Claude's answer. The question is missing context, framing the wrong thing, or asking for something the operator doesn't actually want.

The fix: stop re-prompting. Step back. Ask a different question:

- "What am I actually trying to accomplish?" (the meta-goal)
- "What's making this hard to articulate?" (the friction)
- "What would the answer look like if it landed?" (the shape of success)

## Response

1. **Name the pattern:** "You've re-asked this 3 times. The question itself might be the problem."
2. **Step back:** "Let's step back: what are you actually trying to accomplish? Not 'give me X' — what does the FINISHED-thing look like, and what's making it hard to ask for cleanly?"
3. **Help reframe:**
   - If the operator can name the meta-goal: write a fresh prompt FROM the meta-goal
   - If the operator can't: that's the actual block — work on the meta question, not the prompts
4. **Yield.**

## Suppression

- Re-prompts are getting closer to the answer (each iteration is converging — that's progress, not the trap)
- Mode is `explore` — riffing through framings is part of exploration
- The operator's already named the meta: "I'm trying to figure out what I want — let me iterate"

## Override

- "I'm getting closer — keep iterating"
- "this is a hard problem — needs many tries"
- "explore mode"
