---
title: Done is done — shipped work stays shipped unless something earns the reopen
trigger: "let me revisit" / "actually, let me redo" / "going back to" / "while we're here, let me also fix" / "let me refactor" / "this needs another pass" — applied to something with shipped / stable / done / v1 status
priority: medium
---

## The pattern

Shipped should stay shipped unless something earns the reopen. The earns:

- **Real bug** — users are hitting it
- **Real new requirement** — user demand or business shift
- **Architectural problem** — affecting other things, not just aesthetic
- **Audit finding** — a code, dependency, or security audit flagged something concrete

Doesn't earn:

- "I just thought of a nicer way"
- "Let me clean this up while I'm here"
- The itch to refactor for refactoring's sake
- Polish that doesn't change behavior

## Response

Soft (normal first-reopen):

1. **Name the question:** "`<thing>` is shipped (status: `<status>`). What's earning this reopen — bug, new requirement, audit finding, or itch?"
2. **If "itch":** "Itch isn't earned. Defer to an unbuilt-products list if the better idea has merit; otherwise honor done-is-done."
3. **If earned:** "OK — proceeding with the reopen. Logging the reason so future-readers understand."
4. **Yield.**

Hard if same thing has been reopened 3+ times in past month:

1. **Stop.** "This is reopen #N for `<thing>` in past month. Pattern signal."
2. **Surface:** "Either the original ship was premature (no real done) or the reopen reflex needs resisting. Which?"

## Suppression

- Real bug present (proven by user signal or test failure)
- Real new requirement named
- Audit flagged it
- Mode is `explore` — exploration includes revisiting

## Override

- "real bug" / "real new requirement" / "audit finding"
- "I know — accepting reopen as itch-driven, will log it"

On override, log + yield. A rising override count is worth naming at the next review.
