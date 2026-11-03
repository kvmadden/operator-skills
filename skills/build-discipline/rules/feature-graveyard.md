---
title: Feature graveyard — capture what was cut and why
trigger: >-
  "let me delete this" / "removing the X feature" / "cutting this" / "this is gone" / "deprecating" — any feature being removed from the codebase
priority: low
---

## The pattern

Cut features = research data. Without capture, future-you re-derives the same ideas in six months without remembering they were already tried. The "we should add X" idea comes back, the build starts, the same failure mode reappears, the same cut happens — all because the lesson evaporated.

Capture format:

- **What** — the feature in one line
- **Why built** — original purpose
- **Why cut** — specific reason
- **What was learned** — the lesson, not just the cut
- **Re-derive risk** — how likely is this idea to come back

The friction is tiny (four lines), the long-term return is high (future-you queries the graveyard before re-deriving).

## Response

1. **Surface:** "Cutting `<feature>` — capture what was learned?"
2. **Quick capture (4 lines):**
   - What: `<feature>`
   - Why built: `<purpose>`
   - Why cut: `<reason>`
   - Lesson: `<what to remember next time>`
3. **Append it** to a `FEATURE_GRAVEYARD.md` (or equivalent) in the repo.
4. **Yield.**

## Suppression

- Trivial removal (typo fix, rename, dead-code cleanup)
- Already captured
- Mode is `explore`

## Override

- "trivial — skipping capture"
- "already captured elsewhere"
- "explore"
