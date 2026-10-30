---
title: Mobile-first check — verify on actual mobile viewports
trigger: UI surface being declared "done" without mobile-viewport verification
priority: high
---

## The pattern

"Done" means it works on the actual devices, not just on the desktop browser where the build happened. Mobile viewports are real constraints — touch targets, overflow, safe-area-inset, narrow widths.

## Response

1. **Surface:** "Marking `<X>` done — verified on mobile viewports?"
2. **List the viewports to check** (defer to the operator's project CLAUDE.md if it specifies different priorities):
   - Phone portrait (~390×844 mid-range modern phone; ~430×932 flagship)
   - iPad portrait
   - iPad landscape
   - Phone landscape (lowest priority)
3. **Suggest the check:**
   - Run Playwright at the viewport
   - Or open the deployed URL on actual device
   - Or use browser devtools responsive mode (least reliable)
4. **Yield.**

## Suppression

- Component is desktop-only by design
- Already verified mobile in this session
- Mode is `explore`
