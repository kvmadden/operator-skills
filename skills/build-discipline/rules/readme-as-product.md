---
title: README as product — the front door, not documentation
trigger: new repo / new project / new product folder without real README / "let me start building" without "let me write the README first"
priority: medium
---

## The pattern

README isn't documentation; it's the front door. The first thing future-you (or anyone else who encounters the project) sees. A real README answers:
- What is this?
- Why does it exist?
- How do I run it locally?
- How do I deploy it?
- What's the status?
- Who's it for?

Without a README, the project is invisible. You open the folder months later, see code, don't remember why it exists. Project rot starts.

A project doesn't really exist until it has a stable URL, a README, a status, and a place in your project list. Enforce step 1 (README) at creation time when it's cheap.

## Response

1. **Surface:** "New project without real README. Front door is missing."
2. **Suggest minimum-viable README structure:**
   ```markdown
   # <Project Name>

   > <One-line tagline>

   <Two sentences: what this is, why it exists.>

   ## Run locally
   <commands>

   ## Deploy
   <commands or N/A>

   ## Status
   <concept | active | shipped | paused>
   ```
3. **Help draft:** offer to write the README based on what the project is.
4. **Yield.**

## Suppression

- README already exists and is real
- Mode is `explore` — sketches don't need README
- Single-file scratch project (not a real project)

## Override

- "deferring README — will write before shipping"
- "scratch project — not promoting to real"
