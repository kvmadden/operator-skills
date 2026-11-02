# operator-skills

**Do two coding rules make the necessary correction while staying quiet when no correction is needed?**

Behavior is **unmeasured**. This repository now defines a bounded experiment for `secrets-walk` and `scope-lock`, with saved synthetic tasks and an offline evidence viewer. The existing 28 phrase tests check static description consistency. They do not show that a plugin loaded or changed an agent's behavior.

[Open the evidence viewer](docs/viewer.html) by downloading the repository and opening that file in a browser. It works offline. [Desktop preview](docs/evidence/desktop-light.png) · [Phone preview](docs/evidence/phone-dark.png) · [Short walkthrough](docs/evidence/walkthrough.gif)

| What we test | Evidence | Current answer |
| --- | --- | --- |
| Public phrase routing | 28 unchanged substring checks | Structural regression coverage only |
| Necessary corrections | Six final trigger tasks per selected rule | No observed runs, N/A |
| Quiet suppression | Six final suppression tasks per selected rule | No observed runs, N/A |
| Task completion | Final artifacts, separate from safe pauses | No observed runs, N/A |
| Automatic plugin loading | Actual discovery and rule-read tool records | Unmeasured |
| Manually injected rule-following | Separate manual condition | Unmeasured |
| Existing hook contracts | Temporary git worktrees and synthetic JSON | Tested offline |

The missing dependency is an approved isolated, zero-cost actual runner configuration. No inference calls were made for this benchmark. A local CLI login alone does not establish isolation or cost boundaries. No simulated trace is presented as a behavior observation.

## Inspect the experiment

The [task corpus](benchmark/tasks/tasks.json) contains 12 development and 24 final tasks. Situation families stay in one partition. The final set has 12 triggers and 12 suppressions across the two rules. Values are invented, nonfunctional and outside provider credential formats. No private transcripts, real secrets or employer material are used.

The [frozen rubric](benchmark/rubric.json), [hash manifest](benchmark/freeze.json) and [run protocol](benchmark/RUN-PROTOCOL.md) separate task input from labels. The runtime adapter serializes only messages and initial files. Both conditions use the same bytes. Metadata changes cannot alter task input. Final labels are public, so this is a **fixed public benchmark**, not a blind test.

The evaluator reports corrections per trigger opportunity, false interruptions per suppression opportunity and completion per attempt, by rule and loading mode. Empty denominators are N/A. A safe pause can count as a correct correction while task completion remains false. Matched condition differences use deterministic task-family bootstrap intervals with a small-sample limit.

Always-silent and always-intervene are deliberate evaluator controls, never agent traces. Silence fails trigger correction. Intervention fails suppression and completion. [All results](benchmark/results/report.json) preserve these controls separately. The complete failure list uses a fixed order, with no curated subset.

All labels and automated judgments are **draft, pending operator review** by Kevin. [Blind review sheet](benchmark/reviews/operator-sheet.md). No independent second reviewer has reviewed this benchmark. Exact file-map and phrase checks are draft scoring aids, with equivalent behavior left for human adjudication.

## Reproduce offline

Requires Node 20 or newer, Git, Bash and jq for full hook record checks. There are no npm dependencies and no inference calls in the test gate.

```sh
npm test
npm run benchmark
```

`npm test` verifies the unchanged phrase suite, rule structure, input and key boundaries, degenerate controls, artifacts, provenance, hook fixtures and byte-for-byte report/viewer reproduction. Temporary repositories are removed after the hook checks. `npm run benchmark` rebuilds the static viewer and report from committed files. It does not run an agent.

See [verification commands and baseline comparison](docs/VERIFICATION.md) and [HOW-BUILT](docs/HOW-BUILT.md).

## Install the plugin

This is a content-only Claude Code plugin with 10 skills, 117 rules and two existing hooks. The experiment covers only two rules. The other 115 have no behavior evaluation here.

For a local checkout:

```sh
claude --plugin-dir /path/to/operator-skills
```

Or inside Claude Code:

```text
/plugin marketplace add kvmadden/operator-skills
/plugin install operator-skills@operator-skills-marketplace
```

Each `skills/<name>/SKILL.md` describes situations and links to short rule files. Agents can read the relevant rule, which names the response, suppression cases and override behavior. This describes intended operation, not measured automatic loading.

The existing Stop hook warns about commits ahead of main or master inside `.claude/worktrees/`. SubagentStop writes response summaries into `.claude/agent-activity.jsonl`. Review those behaviors before ordinary installation. The benchmark invokes hook scripts only on temporary synthetic fixtures and does not install hooks or capture real sessions.

## Limits and provenance

This experiment cannot yet establish behavior improvement, live routing reliability, productivity gains or safety on real credentials. It measures no outcome for the other rules. The small synthetic public set and draft artifact rubric are narrow checks, not a population estimate. Generated edits require fresh values, a masked-context classifier and blind edit review before a final score can be released.

The plugin was developed May to October 2026 in a private repository. This cleaned public snapshot excludes the private history and configuration. The benchmark uses only repository-authored synthetic material licensed under MIT. [LICENSE](LICENSE).
