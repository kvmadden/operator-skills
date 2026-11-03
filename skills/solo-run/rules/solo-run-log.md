---
title: Solo-run periodic log
trigger: 30 min elapsed since last log, stopping condition hit, scope completion
priority: medium
cadence: every 30 min during active solo-run, on stop-condition hit, or on scope completion
---

## The pattern

During autonomy, status disappears unless captured. The operator returns at the end and wants to know what happened — but if nothing was logged during the run, the only signal is whatever was committed. Logging during the run creates a thread the operator can follow: where things stood at the 30-minute mark, what got done since, what's next.

Logs are for the log file, not for the chat. The whole point of solo-run is the operator isn't watching; spamming the chat mid-run defeats that. Logs go to a file so the debrief can read them.

There are three triggers: the cadence (30 min), a stopping condition hit (which also halts the run), or a scope item completion (worth capturing for the debrief). Don't log every action — only at these three moments.

## Response

1. **Stop conditions come first.** If a stopping condition was hit, write the log row and the HALT line now (steps 5 and 6), whatever the time since the run started or since the last log.
2. **Verify mode is solo-run.** If not, suppress.
3. **Check elapsed time since last log** (read the clock with `date`, because Claude has no timer between messages). If <30 min AND no completion AND no stop-condition, suppress.
4. **Check elapsed time since solo-run start.** If <5 min, suppress (let the work breathe first).
5. **Write a single log row** to the run log file (e.g. `.claude/solo-run/log.md`). No chat output.
   - Context: one line on where things stand
   - Extra: mode, phase=in-progress, contract path, trigger (`cadence` | `stop-hit` | `completion`), what changed since last log, what's next
6. **If trigger is stop-hit:** also write a HALT line to the contract file, AND notify the operator in chat (the run can't continue without them):

```markdown
## HALT — <ISO timestamp>

**Reason:** <stopping condition hit>
**State:** <where the work was>
**Waiting on:** <operator's input needed>
```

6. **If trigger is completion:** include the completed scope item in the log extras so the debrief can summarize what shipped.
7. **Yield.**

## Suppression

- Mode is not solo-run
- <30 minutes since the last log AND no completion AND no stop-condition (avoid log spam)
- Within the first 5 minutes of the run, for cadence logs only. Stop conditions are always logged.
- Operator has already returned and run has ended

## Override

- Operator says "log now" — force a log row regardless of cadence, mark trigger=manual
- Operator says "quiet mode, no logs" — suppress all cadence logs; still log stop-hits and completions (these are required for the debrief)
