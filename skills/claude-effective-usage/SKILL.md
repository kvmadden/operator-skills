---
name: claude-effective-usage
description: |
  Use this skill whenever the operator could work with Claude more effectively — by picking the right surface, the right tool tier, or the right session hygiene. Three families: (1) RIGHT SURFACE — choosing among Claude Code / Chat / Cowork / Dispatch. Triggers like "by EOD", "have this ready when I get back", "investigate X and report", "go gather all the Y and summarize" (async multi-step → Dispatch); "brainstorm with me", "what do you think of", "help me think through", "think out loud" (open exploration → Chat); "draft a proposal", "write the brief", "compose an email", "I need a spec doc" (document drafting → Cowork). (2) TOOL-TIER EFFICIENCY — about to use computer-use / screenshots when a dedicated app MCP exists; about to poll or sleep-loop for a condition that could be event-driven; about to make several independent tool calls sequentially when they could run in parallel in one message; a bounded task that maps to a specialized agent or a codebase-wide search. (3) SESSION HYGIENE — "save this" / "remember this" / "that's an important point" / a decision or insight worth keeping (pin a durable conclusion); "you keep forgetting" / "we already did this" / response quality drifting (clear or compact stale context); a long resolved thread that's starting to drift (summarize + archive). Consult the rules/ folder for the specific pattern and apply its corrective. Soft teaching response — names the better path and yields. Never forces a surface switch or runs /clear autonomously (those are operator actions). Do NOT use when the operator is mid-build on the correct surface, in solo-run mode, or has explicitly chosen the current surface/tool.
license: MIT — see plugin LICENSE
metadata:
  priority: medium
  promptSignals:
    phrases:
      - "by EOD"
      - "have this ready when I get back"
      - "investigate"
      - "research this and"
      - "gather all the"
      - "brainstorm with me"
      - "what do you think of"
      - "help me think through"
      - "draft a proposal"
      - "write the brief"
      - "compose an email"
      - "I need a spec doc"
      - "just screenshot"
      - "let me look at the screen"
      - "keep checking"
      - "poll until"
      - "wait for it to finish"
      - "read these files"
      - "save this"
      - "remember this"
      - "that's an important point"
      - "you keep forgetting"
      - "we already did this"
      - "you just told me that"
      - "we basically solved this"
      - "let me start a new chat"
      - "persistent doc"
      - "bounded task"
      - "search across the whole codebase"
      - "sleep loop"
      - "poll the deploy"
      - "read this file, then"
---

# Claude effective usage

Patterns for getting more out of Claude — right surface, right tool tier, right session hygiene. Each is a small rule file with its own trigger, corrective, and override. When the operator's situation matches a rule's trigger, consult that rule and apply its specific response. One nudge per turn — don't stack.

## Rules

| Family | Pattern | Trigger | Rule |
|---|---|---|---|
| Surface | Async multi-step work | "by EOD", "have this ready", "investigate X and report" | [dispatch-this](rules/dispatch-this.md) |
| Surface | Open-ended brainstorming | "let me think about", "brainstorm with me", "what do you think of" | [switch-to-chat-instead](rules/switch-to-chat-instead.md) |
| Surface | Long-form document drafting | "draft a proposal", "write the brief", "compose an email" | [use-cowork-not-code](rules/use-cowork-not-code.md) |
| Tier | Bounded task → specialized agent | bounded task that maps to an agent, or a codebase-wide search | [invoke-subagent](rules/invoke-subagent.md) |
| Tier | Polling when event-driven is possible | about to sleep-loop / retry-poll for a condition | [monitor-instead-of-poll](rules/monitor-instead-of-poll.md) |
| Tier | Generic tool when a specific MCP exists | about to screenshot / computer-use when an app MCP exists | [prefer-dedicated-mcp](rules/prefer-dedicated-mcp.md) |
| Tier | Serial calls that could be parallel | about to Read→Read→Read or grep→grep sequentially | [single-message-multi-tool](rules/single-message-multi-tool.md) |
| Hygiene | Pin-worthy conclusion | "save this", "remember this", a decision/insight surfaced | [pin-this](rules/pin-this.md) |
| Hygiene | Context staleness | "you keep forgetting", repeating, drift back to old assumptions | [clear-context-when-stale](rules/clear-context-when-stale.md) |
| Hygiene | Long resolved thread | 30+ turns, core question resolved, drift starting | [summarize-and-archive](rules/summarize-and-archive.md) |

## Dispatch logic

1. **Match the situation to the closest rule trigger.** If unclear, name what you see and let the operator pick.
2. **Open that rule file.** Apply its corrective shape.
3. **Be soft.** Name the better path; offer the handoff; yield.
4. **Don't stack.** One nudge per turn unless the operator engages a second.

## Suppression rules (across all sub-rules)

- The operator is mid-build on the correct surface (don't suggest switching surfaces mid-flow)
- `solo-run` mode is active — suppress surface/efficiency nudges
- The operator explicitly chose the current surface or tool ("stay here", "use [tool]")
- The corrective is destructive of conversation state (`/clear`, `/compact`) — suggest, never run autonomously

## What this skill never does

- Force a surface switch (Code ↔ Chat ↔ Cowork ↔ Dispatch are operator actions)
- Run `/clear` or `/compact` autonomously
- Spin up a Dispatch task or send a draft to Cowork on the operator's behalf
- Add narrative noise when the right move is just to silently batch tool calls
- Repeat a nudge the operator already declined

## Cross-references

- `build-discipline` umbrella — sibling; right-tool-for-the-job at the build layer
- `decision-discipline` umbrella — companion; `pin-this` chains into decision capture

## Why this umbrella earns its keep

The most common quiet losses in a Claude session: doing chat-shaped work in a heavy Code session, pixel-clicking when an MCP exists, serial tool calls that could be parallel, letting durable conclusions evaporate, and running a session past the point its context stays sharp. Each is cheap to catch and compounds across every session. Bundling them under one umbrella means the operator doesn't track ten slugs — the umbrella fires on a broad signal set and each rule stays small.
