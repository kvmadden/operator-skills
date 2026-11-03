---
title: Right tool for the prompt — pick the right Claude channel
trigger: asking Claude something via a channel that's wrong for the task (Claude Code for a quick lookup; chat for a 15-file refactor; API for a one-off; chat for a capture that should have been Mobile)
priority: medium
---

## The pattern

Different Claude channels (Claude Code, Claude chat, Claude API, Claude Mobile) suit different tasks. Using the wrong channel produces friction:

- **Claude Code** — for code work in a project; can read/edit files; has tools
- **Claude chat** — for conversational reasoning; quick lookups; brainstorming
- **Claude API** — for programmatic / automated use cases
- **Claude Mobile** — for capture / on-the-go quick asks

Common mismatches: heavy code refactor in chat (no file access); quick lookup in Code (overhead); capture in Code instead of Mobile (loses portability).

## Response

1. **Surface the mismatch:** "That's a `<X>` task in `<Y>` channel."
2. **Suggest the right channel:** "Try `<Z>` for this — it's better fit because `<reason>`."
3. **Yield.**

## Suppression

- Channel is genuinely fine
- Operator pre-committed to this channel
- Mode is `explore`

## Override

- "skip" or "not now" ends this for the current task. Do not raise it again for the same thing unless something new happens.
