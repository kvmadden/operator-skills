---
title: Single file check — don't split before reuse is real
trigger: component / file / module split being proposed; "let me extract this" before the extraction has earned itself
priority: medium
---

## The pattern

Single-file is often the right shape for vibe-coded React apps. Premature splitting produces:

- Imports everywhere for code used once
- "Where does this live again?" friction
- Test isolation that doesn't pay off because the splits weren't load-bearing

Reasons to actually split:

- **Real reuse** — used in 2+ places
- **Bounded responsibility** — extraction has a clean contract
- **Test isolation** — splitting makes a unit-testable piece
- **File size** — file is genuinely too big to navigate

If none of those, keep single-file.

## Response

1. **Ask the diagnostic:**
   - "Real reuse — used in 2+ places?"
   - "Bounded responsibility — clean contract?"
   - "Test isolation — does the split make a unit-testable piece?"
   - "File size — too big to navigate?"
2. **If no:** "Keep single-file. Premature split = friction without payoff."
3. **If yes:** proceed with split.
4. **Yield.**

## Suppression

- Mode is `explore`
- Split already named in this session
- Operator pre-acknowledged: "I know — premature, doing it anyway"

## Override

- "skip" or "not now" ends this for the current task. Do not raise it again for the same thing unless something new happens.
