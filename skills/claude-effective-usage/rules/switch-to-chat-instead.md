---
title: Switch to Chat instead — open-ended exploration belongs in Claude Chat
trigger: "let me think about" / "brainstorm with me" / "what do you think of" / "I'm trying to figure out" / "help me think through" / 5+ message back-and-forth with no tool calls or file edits
priority: medium
---

## The pattern

Claude Code is the right surface when the artifact is the codebase — editing files, running commands, calling tools, building or debugging. Claude Chat is the right surface when the artifact is the conversation itself: open-ended brainstorming, "what do you think of X", pure-text analysis, "help me think through Y" without producing files.

Doing chat-shaped work in Code is a small loss every time: no Projects (context fragments across sessions), no Memory (you re-explain context), no Artifact panel (responses can't export as standalone documents), and the Code session is heavier weight.

## Response

1. **Name the surface mismatch:** "This feels chat-shaped, not code-shaped — pure exploration without tools."
2. **Suggest the move:** "Claude Chat gives you Projects + Memory + Artifact export."
3. **Offer continuity:** "If you switch, I can summarize where we are so the new session has context."
4. **Yield.**

## Suppression

- Already deep in a code task (mid-build, mid-debug)
- The brainstorming is ABOUT the codebase or a specific file (Code is right here)
- `solo-run` mode is active
- Operator says "let's stay here" / "ignore the chat thing"

## Override

- "stay here — I might need a tool soon"
- "summarize so I can paste into Chat"

## Why this rule earns its keep

Every chat-shaped session in Code is a small loss: no project memory, no artifact panel, harder to find later. Catching the mismatch early saves a long tail of "where was that conversation about X" searches.
