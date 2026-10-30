---
title: Prefer the dedicated MCP — right tool tier beats the generic one
trigger: "just screenshot" / "screenshot Slack" / "look at the screen" / about to use a generic tool tier (computer-use, screenshots) when a dedicated app MCP exists — dedicated app MCP > browser MCP > computer-use; PDF MCP > raw file read; database MCP > shell SQL
priority: medium
---

## The pattern

There's a hierarchy of tool surfaces, ordered by precision and speed:

1. **Dedicated MCP for the app** — fastest, most accurate. API-backed, no UI parsing (Slack, Gmail, Linear, GitHub via `gh`, etc.).
2. **Browser MCP** — DOM-aware, reliable. For web apps without a dedicated MCP. Far faster than pixel-clicking.
3. **Computer-use** — pixel-precise but slow and fragile. Only for native desktop apps without MCPs and cross-app workflows.

Same hierarchy elsewhere: PDF MCP > reading raw PDF bytes; Sheets/Excel MCP > CSV export; Calendar MCP > parsing iCal; shell `Bash` > opening a Terminal via computer-use. Using the wrong tier is slow (many more round-trips), fragile (UI changes break it), and imprecise.

## Response

1. **Name the tier mismatch:** "About to use computer-use for [task]. The [app] MCP can do this in one call instead of five clicks."
2. **Suggest the swap** — show the cleaner tool call.
3. **Verify availability** — check whether the dedicated MCP is connected (or needs loading) before relying on it.
4. **Yield.**

## Suppression

- The MCP for the app genuinely doesn't exist or isn't connected
- The task NEEDS pixel-level visual verification (screenshots for review)
- The dedicated MCP is broken/errored — fall back gracefully
- Operator explicitly says "use [specific tool]"

## Override

- "stay in computer-use — I want to see the click happen"
- "the MCP lacks [feature] I need"

## Why this rule earns its keep

Computer-use is slow and needs per-app permission grants. Searching Slack via computer-use takes many round-trips; the Slack MCP is one call with structured JSON back.
