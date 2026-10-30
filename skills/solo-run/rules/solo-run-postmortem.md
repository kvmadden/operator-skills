---
title: Solo-run postmortem
trigger: ~5 solo-run debriefs accumulated, quarterly cadence, postmortem request
priority: low
cadence: every ~5 completed solo-runs OR quarterly
---

## The pattern

Single solo-runs are individual events. The pattern across runs is where solo-run earns or loses its keep — if completion rates are 95%, the contract template is well-tuned; if 50%, something's off (scope too ambitious, time estimates wrong, stopping conditions miscalibrated). The postmortem surfaces the meta-signal so the contract template improves over time.

This is a low-priority, low-frequency rule. It earns its place by accumulating signal across many runs, not by doing much per-run. Don't fire too often — the data has to accumulate to be meaningful.

The postmortem surfaces patterns + offers adjustments. It does NOT auto-apply changes. The operator decides what (if anything) to tune.

## Response

1. **Check fire conditions** — read the timestamps log: `solo-run-postmortem: <last-fired>`. Fire if EITHER:
   - 5+ new debriefs since last postmortem, OR
   - 13+ weeks elapsed since last postmortem
2. **Verify enough data exists.** If fewer than 5 total solo-runs ever, suppress (no pattern to find).
3. **Read the run log** for solo-run debrief entries from the last ~13 weeks.
4. **Compute aggregates:**
   - Average completion rate (%)
   - Median estimate-vs-actual time ratio
   - Most common stopping condition
   - Scope-violation count
   - Lite-mode usage rate (intake skipped)
5. **Surface 3 patterns max** (whatever the data shows most clearly). Examples:
   - "Completion rate is averaging 72% — solo-runs are usually finishing 28% of contract scope short."
   - "Time estimates run +40% over plan on average — contracts may be over-scoped."
   - "Most common stop: `unfamiliar-pattern-surfaces` (60% of stops). Consider adding a research-window to contracts."
6. **Offer adjustments — one per surfaced pattern.** Do NOT auto-apply:
   - "Want to change the time-window question default to add a +25% buffer?"
   - "Want to add a 'research first' phase to contracts where scope is unfamiliar?"
7. **Format the chat output tightly:**

```
Solo-run postmortem (last <N> runs over <span>):

- Avg completion: <%>
- Time estimates run +<%> over plan on average
- Top stop: <stop> (<%> of stops)
- Scope violations: <n>
- Lite-mode rate: <%>

Patterns:
1. <pattern A>
2. <pattern B>
3. <pattern C>

Adjustments to consider:
- <adjustment 1>?
- <adjustment 2>?
- <adjustment 3>?

(No changes auto-applied. Reply with which to apply, or 'none'.)
```

8. **Append the postmortem** to the run log.
9. **Update timestamp** in the timestamps log.
10. **Yield.**

## Suppression

- Mode is solo-run (don't analyze in-progress runs)
- Fewer than 5 total solo-runs ever
- Last postmortem was less than 4 weeks ago
- Operator is in a different focus mode (don't interrupt unrelated work)

## Override

- Operator says "run postmortem now" — fire regardless of cadence
- Operator says "skip postmortems for now" — suppress until they re-enable
