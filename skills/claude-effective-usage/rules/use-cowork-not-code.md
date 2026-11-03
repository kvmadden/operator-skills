---
title: Use Cowork not Code — long-form document drafting belongs in Claude Cowork
trigger: >-
  "persistent doc" / "keep editing across sessions" / "draft a proposal" / "write the brief" / "let's outline this essay" / "I need a spec doc" / 3+ rounds of "make it shorter" / "lengthen this section"
priority: medium
---

## The pattern

Claude Cowork is the right surface when the artifact is a document you'll iterate on — proposal, brief, essay, spec, plan, email — with persistent drafts, side-by-side editing, and version history. Claude Code is right only when the document lives inside a codebase (README.md, a SKILL.md in the repo) or is one-shot intermediate text.

Document work in Code is suboptimal: no persistent draft (each session re-prompts the whole thing), no side-by-side editing, no version history of the document, no native export to Word/PDF/Docs.

Product features change. This rule describes Claude's surfaces as of November 2026. Check current documentation before relying on a specific feature.

## Response

1. **Name the document shape:** "This is document work — persistent draft, multiple iterations."
2. **Suggest the move:** "Claude Cowork keeps the doc alive across sessions, lets you edit alongside it, and exports natively."
3. **Offer continuity:** "If you switch, I can hand off the current draft + the editing direction so far."
4. **Yield.**

## Suppression

- Document is part of the codebase (README, SKILL.md — those belong in Code)
- One-shot text that's never going to be edited
- Operator explicitly says "give me text I'll paste somewhere"

## Override

- "stay here — this draft goes inside the repo"
- "one-shot, don't need persistence"

## Why this rule earns its keep

Document work in chat-style surfaces gets re-invented each session — the same proposal re-explained, the same edits re-applied. Cowork holds the draft so each session starts where the last ended.
