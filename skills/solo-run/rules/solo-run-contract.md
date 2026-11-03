---
title: Solo-run contract
trigger: solo-run intake complete, solo-run contract write, contract acceptance
priority: high
---

## The pattern

After intake collects the answers, the contract makes them durable and visible. The contract is the source of truth for the run — every other rule checks against it before deviating. Scope-lock checks the named scope, the stopping conditions check the named conditions, the time window drives the +50% threshold.

The contract is also a respect mechanism. Autonomy without explicit agreement is presumption. The contract makes the agreement concrete: here's what you said you wanted, here's what I'll do, here's what would halt me. The operator must explicitly say "go" before the run begins — silence is not consent.

The contract's terms are not modified mid-run. HALT notes are appended below the terms. If the work needs to deviate, the rule is: halt, debrief, write a new contract. This preserves the contract's role as a stable reference.

## Response

1. **Read the checklist answers** (passed from the intake rule).
2. **Write the contract file** to a deterministic path in the project (e.g. `.claude/solo-run/SOLO_RUN_<YYYY-MM-DD>_<HHMM>.md`). Use this template:

```markdown
# Solo-run contract — <YYYY-MM-DD HH:MM>

**Started:** <ISO timestamp>
**Estimated return:** <stated time window>
**Effective time** (after interruption/calendar adjustments): <duration>

## One-line goal

<Named scope, in one sentence. Names a feature, file, or deliverable.>

## Scope

**In:**
- <specific file/folder paths, features, deliverables>

**Out:**
- <explicit out-of-scope>

## Decision authority

**Granted** (Claude does these without asking):
- <bullet list from intake>

**Withheld** (Claude STOPS and waits):
- <bullet list — defaults always include push, deps, ci, delete, secrets/credentials>

## Stopping conditions

Hitting ANY of these halts the run and waits for the operator:
- <bullet list — defaults plus any custom>

## Environmental notes

- Connectivity: <answer>
- Battery: <answer>
- Interruptions: <answer>
- Calendar: <answer>

## Logging cadence

Status row via the solo-run-log rule every <30 min default | customized>.

## Debrief expected at

<Estimated return time — operator can return earlier; if later than +50%, halt and wait>

---

**Acceptance:** Operator must explicitly say "go", "approved", "start", or similar before the run begins.
```

3. **Show the contract to the operator** in the chat — full text, formatted for read-through.
4. **Ask for explicit "go":**
   > "Contract above. Reply 'go' to start, 'edit X' to revise field X, or 'cancel' to scrap."
5. **On 'go':** parent solo-run logs the start row + sets mode.
6. **On 'edit X':** revise the field, regenerate, re-confirm.
7. **On 'cancel':** delete the contract file, log a `solo-run-cancelled` row, return to normal session mode.
8. **If the operator does not reply, do not start.** Claude cannot act between messages, so silence means no run.

## Contract archival

When the run ends, the contract file is NOT deleted — it remains as run history. It serves as the debrief reference. Periodic archival is a separate concern.

## Suppression

- No checklist answers available (the contract has nothing to write — re-run the intake first)
- Mode is not solo-run (this rule belongs to the solo-run umbrella)

## Override

- Operator says "lite contract, just start" — write a minimal contract (goal + time window + defaults for everything else), log the minimization, proceed without explicit "go" only if the operator says "go without contract review"
- Operator explicitly accepts via any clear equivalent of "go" — proceed
