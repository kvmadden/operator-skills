# Changelog

## Unreleased: claude/operator-skills-real-world

Changes after a four-model review (GPT, Grok, Gemini and Claude) of v1.0.0. Every number in the docs now carries its denominator, and every routing set is labeled development data.

### Fixed

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

### Changed

- Every skill description starts with its "Do NOT use" clause and fits Claude Code's listing cap (487 to 814 characters, about 6,900 in total). The long trigger lists moved, unchanged, into each SKILL.md body.
- The engineering-floor suppression no longer lets explore or spike work switch off the safety floors.
- The routing check scores only text Claude Code can see, matches whole words, reports ties as failures and gates stay-quiet cases. The old 28 of 28 is relabeled as a self-consistency check of metadata the runtime does not read.
- package.json is named operator-skills to match the plugin.
- CI runs on macOS and Linux with Node 20 and 22, runs shellcheck, and installs dependencies with npm ci.

### Added

- phi-floor: a tier 1 rule for real-looking patient or personal data, with "needs review" when part of the input could not be read.
- docs/PRECEDENCE.md: four tiers, one correction per turn, owners for situations two rules both claimed, copied into every SKILL.md by `npm run sync:precedence`.
- A validator that opens every rule file, with negative fixtures.
- Hook contract tests (21), routing unit tests (6), validator fixture tests (8) and harness checks (4).
- evals/: a behavioral harness for `claude plugin eval` with without, with and placebo arms. Not run.
- docs/EVALUATION.md, docs/HOOKS.md, SECURITY.md.

### Removed

- `metadata.promptSignals`, `pathPatterns`, `bashPatterns` and skill-level `priority`. Claude Code reads none of them, and the prompt signals included phrases copied from the test set.
- `files_touched` and `duration_seconds` from the activity log. The first was a regex over reply text, so "no match" read as "no files". The second was always 0.

## 1.0.0 (October 2026)

Initial public release: 10 skills, 117 rules, 2 hooks, a structure check and a 28-phrase keyword check.
