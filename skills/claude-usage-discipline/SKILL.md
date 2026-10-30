---
name: claude-usage-discipline
description: |
  Use this skill whenever the operator is using Claude itself in a suboptimal way for the task at hand — wrong channel (Claude Code for a quick lookup; chat for a 15-file refactor; API for a one-off; chat for a capture that should have been a quick mobile capture); asking Claude something Claude is genuinely the wrong tool for (person-specific questions, physical-world / medical / legal / financial questions, values-based choices); over-using Claude in ways that displace other thinking modes (sleep, conversation, walking, offline drafting); context window filling and session quality degrading (confabulation, repetition, slower responses); long-chat context about to be lost on close; a stray idea or tangent floated mid-task that won't be actioned now (park it before a reset loses it); cost-spike sessions starting without acknowledgment; stuck-chat patterns where reset beats more deliberation; a prompt that landed perfectly (worth archiving); three+ re-prompts on the same topic (the question itself is wrong, not Claude's answer). Triggers include "should I ask Claude", "let me ask Claude", "Claude's getting less helpful", "I'll come back to this", "starting a new chat", "fresh session", "this is a heavy session", "this is going to cost", "should I be using Claude for", "this chat is stuck", "perfect", "exactly", "that's it", "nailed it", "first try", "no, I meant", "let me try again", "actually, what I want is", "let me re-phrase", "ugh", "that's not it either", "we should also", "note to self", "don't let me forget", "while we're at it", "moving on to". Also fires when an arc lands green and the next subject differs, or the session has grown long and the remaining work would run cheaper in a fresh context (handoff-at-the-boundary — take the boundary yourself; never make the operator spend a turn asking). Consult the skill's rules/ folder for the matching diagnostic (right-tool-for-the-prompt, dont-ask-claude, am-i-using-claude-too-much, context-budget, new-chat-handoff, reset-the-frame, compute-budget, prompt-archeology, re-prompt-cleaner, park-the-idea, handoff-at-the-boundary). Soft teaching response. Do NOT use during `solo-run` (contract handles meta concerns), `explore` mode, when the operator already engaged the question this session, or when re-prompts are converging on the right answer (iteration is progress, not the trap).
license: MIT — see plugin LICENSE
metadata:
  priority: medium
  promptSignals:
    phrases:
      - "should I ask Claude"
      - "let me ask Claude"
      - "Claude's getting less helpful"
      - "I'll come back to this"
      - "starting a new chat"
      - "fresh session"
      - "this is a heavy session"
      - "this is going to cost"
      - "should I be using Claude for"
      - "this chat is stuck"
      - "how should I structure"
      - "what's the right interface"
      - "how do I model this"
      - "perfect"
      - "exactly"
      - "that's it"
      - "nailed it"
      - "first try"
      - "no edits needed"
      - "no, I meant"
      - "let me try again"
      - "actually, what I want is"
      - "let me re-phrase"
      - "ugh"
      - "that's not it either"
      - "going in circles"
      - "this chat is stuck"
      - "we should also"
      - "note to self"
      - "don't let me forget"
      - "while we're at it"
      - "oh that reminds me"
      - "moving on to"
---

# Claude usage discipline

Eleven rules around HOW the operator uses Claude.

## Rules

| Pattern | Rule |
|---|---|
| Wrong Claude channel for the task (Code vs chat vs API vs Mobile) | [right-tool-for-the-prompt](rules/right-tool-for-the-prompt.md) |
| Asking Claude a question Claude is the wrong tool for | [dont-ask-claude](rules/dont-ask-claude.md) |
| Claude-time displacing other thinking modes | [am-i-using-claude-too-much](rules/am-i-using-claude-too-much.md) |
| Context window filling — checkpoint and reset | [context-budget](rules/context-budget.md) |
| Arc boundary — handoff to a fresh session, lossless | [new-chat-handoff](rules/new-chat-handoff.md) |
| Stray idea floated mid-task — park it before a reset loses it | [park-the-idea](rules/park-the-idea.md) |
| Session boundary reached or session getting expensive — take the handoff unprompted | [handoff-at-the-boundary](rules/handoff-at-the-boundary.md) |
| Chat stuck — fresh start beats fighting it | [reset-the-frame](rules/reset-the-frame.md) |
| Token-heavy session starting without cost-awareness | [compute-budget](rules/compute-budget.md) |
| Prompt landed perfectly — worth archiving | [prompt-archeology](rules/prompt-archeology.md) |
| 3+ re-prompts on the same topic — the question is wrong | [re-prompt-cleaner](rules/re-prompt-cleaner.md) |

## Dispatch

Match the situation to the rule. Apply. Yield.

## Suppression rules

- Mode is `solo-run` (contract handles meta concerns)
- Mode is `explore`
- Operator already engaged the question this session

## What this skill never does

- Force a specific Claude-use pattern
- Push Claude-usage away from areas where it's working
- Pretend Claude is the wrong tool for everything (it's the right tool for many things)
