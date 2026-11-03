---
title: Accessibility floor. WCAG 2.2 AA checks at the moment UI is written
trigger: >-
  UI being written or changed without checks for contrast, keyboard use, visible focus, accessible names or target size: a new component, form, dialog, menu, icon-only button or custom control
priority: high
---

## The pattern

These are WCAG 2.2 Level AA floors (A and AA criteria), checked when the UI is written rather than in an audit later:

1. **Contrast:** text at least 4.5:1, large text at least 3:1 (1.4.3). Control boundaries, icons that carry meaning and focus indicators at least 3:1 against what is next to them (1.4.11).
2. **Keyboard:** every action works from the keyboard, with no trap (2.1.1, 2.1.2).
3. **Focus:** focus is visible (2.4.7), and a focused control is not entirely hidden by content the page adds, such as sticky headers, banners or overlays (2.4.11).
4. **Names and labels:** every control has an accessible name (4.1.2), every input has a label (3.3.2), and every meaningful image has alt text while decorative images are marked as decorative (1.1.1). An icon-only button with no name is the most common failure.
5. **Target size:** pointer targets at least 24 by 24 CSS pixels (2.5.8). A smaller target passes only when a 24 pixel circle centred on it does not intersect another target or the circle of another undersized target. Two 16 pixel icons whose centres are 20 pixels apart fail, because their circles overlap. Inline links in a sentence, a control with an equivalent elsewhere on the page, browser-default controls and a size that is essential to the information are exceptions. 44 by 44 is the Level AAA target (2.5.5), and Apple's guidance is 44 by 44 points. Use 44 where the project has adopted it.

## Response

1. **Name the missing floor and the criterion:** "This icon button has no accessible name (WCAG 4.1.2)."
2. **Suggest the fix with the project's own tokens or scale,** not arbitrary values. For example `aria-label` or visible text for a name, a focus ring from the design tokens, Tailwind `min-h-6 min-w-6` (24px on the default scale) for the AA floor, or `min-h-11 min-w-11` (44px) where the project has adopted 44.
3. **Suggest a quick check:** keyboard-only pass through the flow, and an automated scan such as axe in the test suite.
4. **Yield.**

## Suppression

- Internal tooling with a named accessibility waiver from the operator
- Dev-only screens that never reach users
- A sketch the operator marked as throwaway, for contrast and target size only. Names, labels and keyboard access still apply, because they are cheapest to get right at the start.

## Override

- "waiver: <who approved it and why>"
- "dev-only screen"
