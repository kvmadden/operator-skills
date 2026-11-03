# Changelog

## Unreleased: claude/operator-skills-real-world

Changes after a four-model review (GPT, Grok, Gemini and Claude) of v1.0.0, then a second round in which GPT and Grok reviewed this branch. Every number in the docs carries its denominator, and every routing set is labeled development data.

### Live eval (3 Nov 2026)

- First live run of the harness, approved by Kevin with a $5 cap. It cost $3.92 at list price. As shipped, Claude Code loaded no skill in 12 of 12 plugin runs and every case scored the same with and without the plugin. Invoked by hand, the bulk delete rule stopped the agent before deleting in 4 of 4 runs, against 0 of 6 as shipped. See docs/EVALUATION.md.
- Harness fixes found by the smoke runs: each scaffold script now sits inside its case directory, and every `tool_used` never-check sets `min: 0`.
- Added two invoked variants (bulk-dedupe-skill-invoked, secrets-skill-invoked), evals/results/2026-11-03-summary.json and docs/evidence/live-eval-2026-11-03.txt. Raw eval output is ignored by git because it holds the planted synthetic key.
- Merged main, keeping PR #4's dated correction that withdraws "28 of 28".

### Second review round (3 Nov 2026)

Fixed:
- Precedence: every tier 1 rule that matches now responds in the same turn, and settling one floor never releases another. One correction per turn applies to tiers 2 to 4. solo-run-log and solo-run-debrief moved from tier 1 to tier 3.
- Stop hook: work that lives only in a merge commit, and a squash merge later reverted on the default branch, were reported as merged. A dirty worktree on the default branch said no default branch was found. A failed state save hid the warning. Dedupe remembered one state. Without jq every session shared one key. The message carried the commit subject. git could start fsmonitor, diff driver or textconv programs from repository config.
- SubagentStop hook: two subagents finishing together could destroy the archived log. Paths and custom agent names could carry patient identifiers into the log. Both hooks wrote through symlinks.
- auth-floor still let a "throwaway sketch" suppress it. phi-floor offered edited real records as a stand-in. accessibility-floor checked only one side of the 2.5.8 spacing test. schema-discipline gave a PostgreSQL NOT NULL path that is a syntax error before PostgreSQL 18. migration-not-mutation took its snapshot before the transaction and ignored cascades and triggers. secrets-walk counted a certificate as a private key and searched history with the whole secret. solo-run-log could write before checking the mode.
- The routing check put a whole description in its "Do NOT use" part when it had no "Use when" phrase, so three skills could never score. The first round's "30 of 30 stay quiet" depended on this and is withdrawn. Rule ties could pass negative expectations, negation was checked at the first occurrence only, and case variants counted twice.
- The validator accepted a missing docs/PRECEDENCE.md, a tier 1 rule with a sketch suppression, inexact or empty sections, and hook commands with extra commands, ../ paths or symlinks.
- Eval leak checks scanned the seeded files, the PHI check looked for one marker only, and the bulk delete check matched one-line command text.

Changed:
- The trigger catalogues, which were the pre-rewrite descriptions, are replaced in every SKILL.md by a rule trigger table generated from the rule files by `npm run sync:skills` (`sync:precedence` still works). The routing check's stage 2 reads only that SKILL.md text.
- Four credential-shape probes are gated in CI. Known failures need a written reason.

Added:
- Two stay-quiet eval cases, so each safety floor has a pair, and exposure, task and safety or quiet graders on every case.
- tests/rule-content.test.mjs (9 tests). Hook contract tests now number 35, routing unit tests 16, validator fixture tests 12 and harness checks 10.
- docs/evidence/context-cost.txt, plugin-validate-strict.txt and routing-rescored-history.txt.

### First review round

#### Fixed

- SubagentStop hook read PostToolUse fields that SubagentStop never sends, so it recorded nothing. It now reads the real fields and records metadata only, outside the project, mode 600, with rotation and an off switch.
- Stop hook warnings were plain stdout, which Claude Code hides for a Stop hook that exits 0. They are now a `systemMessage`. Linked worktrees are found from git metadata, the default branch from origin/HEAD and common names, and squash or rebase merges no longer count as unmerged. Detached HEAD names the commit. No shell commands are built from branch names.
- Empty-match JSON bug in SubagentStop, as fixed by PR #1 (applied first, with credit).
- 45 of 117 rule frontmatters were invalid YAML. All are valid now.
- secrets-walk said nothing about rotating an exposed key, missed current key shapes, and its private key pattern missed the PKCS#8 header. All corrected.
- migration-not-mutation omitted DELETE, TRUNCATE, ORM bulk calls, statements Claude plans itself and transactions, and its title contradicted its steps. Rewritten.
- accessibility-floor presented 44 point targets as WCAG AA. It now follows WCAG 2.2 AA (24 by 24 CSS pixels) and covers accessible names.
- Thirteen rules hard-stopped work. Only the tier 1 safety floors stop now.
- Rules that depended on things Claude cannot observe (reading time, seated minutes, timers, usage counts across sessions) now ask or say "unknown".
- solo-run-log could suppress a stop condition in the first five minutes. Stop conditions now come first.
- Rules no longer write into the repository without asking, and never copy credentials or patient data into notes.

#### Changed

- Every skill description starts with its "Do NOT use" clause and fits Claude Code's listing cap (487 to 814 characters, about 6,900 in total). The long trigger lists moved, unchanged, into each SKILL.md body.
- The engineering-floor suppression no longer lets explore or spike work switch off the safety floors.
- The routing check scores only text Claude Code can see, matches whole words, reports ties as failures and gates stay-quiet cases. The old 28 of 28 is relabeled as a self-consistency check of metadata the runtime does not read.
- package.json is named operator-skills to match the plugin.
- CI runs on macOS and Linux with Node 20 and 22, runs shellcheck, and installs dependencies with npm ci.

#### Added

- phi-floor: a tier 1 rule for real-looking patient or personal data, with "needs review" when part of the input could not be read.
- docs/PRECEDENCE.md: four tiers, one correction per turn, owners for situations two rules both claimed, copied into every SKILL.md by `npm run sync:precedence`.
- A validator that opens every rule file, with negative fixtures.
- Hook contract tests (21), routing unit tests (6), validator fixture tests (8) and harness checks (4).
- evals/: a behavioral harness for `claude plugin eval` with without, with and placebo arms. Not run.
- docs/EVALUATION.md, docs/HOOKS.md, SECURITY.md.

#### Removed

- `metadata.promptSignals`, `pathPatterns`, `bashPatterns` and skill-level `priority`. Claude Code reads none of them, and the prompt signals included phrases copied from the test set.
- `files_touched` and `duration_seconds` from the activity log. The first was a regex over reply text, so "no match" read as "no files". The second was always 0.

## 1.0.0 (October 2026)

Initial public release: 10 skills, 117 rules, 2 hooks, a structure check and a 28-phrase keyword check.
