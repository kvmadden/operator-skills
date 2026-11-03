---
title: Right rung — refuse polish on a broken engine
trigger: >-
  "let me polish" / "smooth this out" / "let's add an animation" / "tighten the spacing" / "the hover should" / "let's make this nicer" — combined with a broken engine (failing test, error in dev, end-to-end flow broken, real data not flowing)
priority: high
---

## The pattern

Polish on a broken engine isn't aesthetic polish — it's distraction. Every fix to broken functionality breaks the polish. Fixing the engine first means polish gets to last.

`build-order` handles the soft case (engine incomplete, polish proposed). `right-rung` handles the hard case (engine actively broken right now, polish proposed). Different severity, different delivery.

Polish-shaped phrases: "let me polish", "smooth this out", "let's add an animation", "tighten the spacing", "the hover should", "make this nicer", "soften the corners", "play with the timing", "more elegant".

Combined with broken-engine signals:

- A test just failed and the operator is pivoting to polish
- The feature errored in dev moments before the polish proposal
- The end-to-end flow has a known bug being worked around
- Real data isn't flowing (empty grids, null lookups, missing classifications)

## Response

**One clear nudge, then follow the operator.**

1. **Pause before the polish.**
2. **Name the broken-ness:**
   "Engine is broken: `<the actual broken thing — test name, error, missing data>`. Polishing on top of this is rented work."
3. **Ask:** "Fix that first, or polish anyway?"
4. **Two paths:**
   - **Fix engine first:** "What needs to happen for `<broken thing>` to work?"
   - **Polish anyway:** "OK, polishing now. The broken part is still open."
5. **Follow the answer.**

## Suppression

- The engine is working — polish is fine; let `build-order` handle (soft delivery for completed-but-not-yet-polished)
- Mode is `explore` AND it's a sketch, not the production feature
- The polish IS the deliverable (portfolio piece, landing page demo)
- Operator pre-acknowledged: "rented polish, just for screenshots"

## Override

- "rented polish — I know"
- "for screenshots only"
- "fix engine after — polish first"
- "override right-rung"
