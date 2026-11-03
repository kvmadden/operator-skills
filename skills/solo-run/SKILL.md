---
name: solo-run
description: "Do NOT use for normal sessions where the operator stays present, when the operator is drained or distracted, or for windows under 30 minutes. Use the moment the operator wants Claude to keep working unattended (\"work on this while I'm gone\", \"I'm going to be away\", \"keep going while I sleep\", \"start a solo run\"): run the intake checklist, write a contract with scope, authority and stop conditions, wait for an explicit go, log at stop conditions and milestones, and debrief on return."
license: MIT — see plugin LICENSE
---

# Solo-run umbrella

Orchestrates Claude doing autonomous work while the operator is away. The full lifecycle has 5 sub-skills, each fired by the parent at the right moment. Reading: at the start of the solo-run umbrella, the operator wants long-form autonomy; the umbrella decides which sub-skill to dispatch based on context.

## Sub-skills (lifecycle order)

| Phase | Rule | When it fires |
|---|---|---|
| 1. Pre-flight | [solo-run-checklist](rules/solo-run-checklist.md) | First action when solo-run is invoked. Captures environmental state (time, wifi, battery, interruption risk, scope, stopping conditions). |
| 2. Contract | [solo-run-contract](rules/solo-run-contract.md) | After checklist. Writes the contract file; requires explicit "go" before run starts. |
| 3. In-progress logging | [solo-run-log](rules/solo-run-log.md) | Every 30 minutes during an active run. Appends status to a run log file. |
| 4. Debrief | [solo-run-debrief](rules/solo-run-debrief.md) | When operator returns OR contracted window expires. Summarizes done-vs-planned. |
| 5. Postmortem | [solo-run-postmortem](rules/solo-run-postmortem.md) | Every ~5 completed runs (or quarterly). Surfaces cross-run patterns for contract refinement. |

## Dispatch logic

1. **First trigger** — operator says "solo-run" / "I'm stepping away" / equivalent → fire `solo-run-checklist`.
2. **Checklist done** → fire `solo-run-contract`.
3. **Operator says "go"** → run starts; fire `solo-run-log` on 30-min cadence.
4. **Operator returns OR window expires** → fire `solo-run-debrief`.
5. **5 runs accumulated since last postmortem** → fire `solo-run-postmortem` (during debrief, as additional output).

## Suppression rules

- Operator said they are drained or distracted (autonomy then is a bad call)
- Time window < 30 minutes (overhead exceeds value)
- Operator hasn't named a concrete scope
- Wifi is unreliable (solo-run can't recover from network failures unattended)
- Operator is mid-flow on something else; don't switch contexts

## What this skill never does

- Run an unattended session without an explicit contract + "go"
- Skip the debrief (every run gets a debrief, even if interrupted)
- Make decisions outside the contract's authority scope
- Continue past a stopping condition without operator confirmation
- Burn the full time window when the work completed early (escalate completion to operator)

## Cross-references

- `decision-discipline` umbrella — companion (decisions within the solo-run need their own discipline)
- `build-discipline` umbrella — companion (scope-lock applies within solo-run)

## Why this umbrella earns its keep

Autonomous work is high-leverage but high-risk. The contract structure (checklist → contract → log → debrief → postmortem) makes the autonomy safe by forcing the operator and Claude to agree on scope, decision authority, and stopping conditions UPFRONT. Without the contract, "go work on it for a while" turns into either anxious over-checking or runaway scope drift. With the contract, the operator can actually step away.

## Trigger catalogue

Moved here from the skill description on 3 November 2026, unchanged. Claude Code shows at most 1,536 characters of a skill description in its skill listing and can show less when many skills are installed, so the long list was being cut. Claude reads this section after the skill loads.

> Use this skill the moment the operator wants Claude to keep working autonomously while they step away. Triggers include "I'm going to be away", "set this up to run", "work on this while I'm gone", "I have a few hours and good wifi", "set me up for autonomy", "you've got this — keep going", "work on it for me", "I'll come back in [time]", "solo-run", "start a solo run", or any phrasing that signals the operator wants long-form unattended work with defined decision rules. The skill orchestrates the full solo-run lifecycle by dispatching to rule files in the rules/ folder: pre-flight checklist (solo-run-checklist) → contract authoring + explicit "go" gate (solo-run-contract) → periodic in-progress logging during the run (solo-run-log) → debrief on return (solo-run-debrief) → cross-run pattern analysis every ~5 runs (solo-run-postmortem). Each sub-skill has its own trigger context within the lifecycle. Do NOT use this skill outside an explicit solo-run request, for normal interactive sessions where the operator stays present, when the operator says they are drained or distracted (autonomy then is a bad call), or when the time window is < 30 minutes (overhead exceeds value).
