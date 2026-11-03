# Evaluation: what is measured, on what data, and what is not

## The short answer

Agent behavior in live sessions is **not measured**. Zero sessions have been run. Everything below is either a structural check, a contract test of the hooks, a content check of rule text, or a lexical lint of text, and every routing number comes from development data.

## Data status

A set becomes development data once anyone changing the rules has seen it. Numbers on development data can show whether something regressed. They cannot support a headline.

| Set | Size | Where | Status | Why |
|---|---|---|---|---|
| Shipped phrases | 28 | tests/fire-test-phrases.json | development | Written with the v1.0.0 rules. Their wording overlaps phrases copied into skill metadata. |
| Reviewer probes | 59 (28 should fire, 31 should stay quiet) | tests/routing/claude-probes.dev.json | development | 58 written during the review on 3 Nov 2026, then seen while rewriting descriptions. claude-R1 added in the second review round, after the routing check changed. |
| Paraphrases | 28 | tests/routing/claude-paraphrases.dev.json | development | Meaning-preserving rewrites of the shipped phrases, seen while rewriting. |
| Other reviewers' probes | 36 (GPT), 30 (Grok), 32 (Gemini) | review reports, not in the repository | development | Read before the rules changed. |
| Eval harness cases | 10 | evals/cases | development | Written by the same session that changed the rules. Two added in the second review round. |

No locked held-out set exists. A fresh one will be written blind by a different model family from a spec held with the review notes, locked by a committed checksum before its first run, and scored once.

## Lexical routing lint

`node tools/fire-test.mjs` reads only text Claude Code can see. Stage 1 picks a skill from the listing text Claude Code 2.1.304 shows (name plus description, cut at 1,536 characters). Stage 2 picks a rule from the chosen SKILL.md alone, which now holds a rule trigger table generated from the rule files. It never reads a rule file the agent has not opened.

How it scores:
- Quoted phrases match whole words, with hyphens counted as part of a word. A phrase counts once whatever its case, and only if one of its occurrences is not negated within its own clause. A clause ends at a full stop, question mark, exclamation mark, semicolon, colon or comma, and "cannot" and "can't" negate.
- Backtick tokens such as `sk_live_` are case-sensitive prefixes at the start of a word. A key prefix needs at least ten key characters including a digit after it, so `sk_live_REPLACE_ME` is not a key. Tokens are never negated, and a "Do NOT use" phrase never cancels one.
- A skill whose loaded text matches a tier 1 rule outranks every skill that does not, and every matching tier 1 rule is reported.
- A tie for first place, between skills or between rules, fails every expectation, negative ones included.
- Stay-quiet probes are gated in CI, and so are four credential-shape probes (D1, D3, D5 and D22), so deleting a provider prefix from the engineering-floor description fails CI. Other should-fire cases are reported only.
- A known failure needs a written reason, must name a real case, and fails the run once it passes, so the list cannot hide a case or go stale. Two are listed: claude-B4 and claude-R1.

A pass means the visible text contains the intended words. Claude Code chooses skills semantically, so this is a lint for wording, not a measure of routing. Some limits are lexical by nature. The placeholder in "drop the [field]" also matches "drop the mic" (claude-R1), and "let me polish" matches README polish that no rule is about (claude-B4).

### A scoring bug, and the numbers it changed

The first-round scorer put a description's whole remaining text in its "Do NOT use" part when the description had no "Use when" phrase. Three descriptions start their positive part another way: build-discipline ("Use at build moments"), decision-discipline ("Use at decision moments") and solo-run ("Use the moment"). None of their phrases could score. It also read rule files the agent has not opened. Both are fixed, and every number from that scorer is withdrawn:

- "30 of 30 stay-quiet probes" depended on the bug. claude-B4 ("Let me polish the README wording before I push") stayed quiet only because build-discipline could not score.
- The other figures that change: on v1.0.0 text, 12 of 28 shipped phrases becomes 11 of 28 and 20 of 30 stay-quiet probes becomes 22 of 30. After the description rewrite, 3 of 28 should-fire probes becomes 4 of 28 and 30 of 30 becomes 29 of 30. At the end of the first round, 5 of 28 should-fire probes becomes 4 of 28 and 30 of 30 becomes 29 of 30. These counts leave out claude-R1, which did not exist then.

### Numbers from the corrected check

All rows are development data. Every column uses the current case files, so claude-R1 counts in every stay-quiet denominator (31) and fails in every column.

| Set | Old scorer, v1.0.0 text | v1.0.0 text (64513a4) | After the description rewrite (3761485) | End of the first round (e4fc02a) | Current |
|---|---|---|---|---|---|
| Shipped phrases, should fire | 28 of 28 | 11 of 28 | 7 of 28 | 7 of 28 | 8 of 28 |
| Paraphrases, should fire | 0 of 28 | 0 of 28 | 0 of 28 | 0 of 28 | 0 of 28 |
| Probes, should fire | 6 of 28 | 6 of 28 | 4 of 28 | 4 of 28 | 6 of 28 |
| Probes, should stay quiet | 1 of 30 | 22 of 31 | 29 of 31 | 29 of 31 | 29 of 31 |
| Ties for first place | 2 of the 28 shipped passes were alphabetical tie-breaks | 1 | 0 | 0 | 0 |

How to read it:
- The old scorer's 28 of 28 relied on `metadata.promptSignals`, which Claude Code never reads. Scored on visible text, the same phrases give 11 of 28.
- Should-fire counts fell after the description rewrite because descriptions went from up to 4,595 characters to 487 to 829, so they hold fewer trigger words.
- They rose again in the second round, from 7 to 8 and from 4 to 6, because the generated trigger tables put every rule trigger in the loaded SKILL.md, where stage 2 can see it, and the corrected split lets three skills score. At the end of the first round the gated credential probes D5 and D22 found no rule for that reason. These are development sets, so this is not evidence of better routing.
- Stay-quiet counts rose on the rewritten text because whole-word matching, negation and the removal of one-word signals stop false alarms such as "already" matching "ready". The two failures in the last three columns are the known failures B4 and R1.
- Two probes (D1 and D22) hold a shortened synthetic Stripe-style key, because GitHub push protection blocks the original 24-character fake keys. Both still meet the key shape the check requires.

Saved runs: docs/evidence/routing-current.txt, and routing-rescored-history.txt for the three older commits. routing-before-description-rewrite.txt and routing-after-description-rewrite.txt are the first-round scorer's output, kept with a note.

## Structure

`node tools/validate-skills.mjs` passes on 10 of 10 skills and 118 of 118 rules. It parses every frontmatter block with a strict YAML parser, requires exact section headings with non-empty bodies, requires docs/PRECEDENCE.md and checks every rule it names, rejects a tier 1 rule whose suppression names explore, sketch, spike or throwaway, checks that each SKILL.md trigger table matches its rule files, and accepts a hook command only as `bash "${CLAUDE_PLUGIN_ROOT}/<path>"` with a regular executable file inside the plugin. Before this branch, 45 of 117 rule frontmatters were invalid YAML, 51 of 117 rules had no Override section, 1 had no Suppression section, 7 of 10 descriptions exceeded the 1,536 character listing cap, and the old validator printed OK for a deliberately broken plugin. tests/validate.test.mjs keeps each failure class covered, 12 tests in all.

`claude plugin validate --strict` passes on the marketplace manifest, the plugin manifest and the skills directory: docs/evidence/plugin-validate-strict.txt.

## Rule content

tests/rule-content.test.mjs reads whole rule files and checks the corrections the reviews asked for: every matching tier 1 floor responding together, no sketch bypass in auth-floor, generated records and approved de-identification in phi-floor, both WCAG 2.2 target-spacing checks and "not entirely hidden" focus, version-qualified PostgreSQL NOT NULL steps, a same-transaction snapshot of captured keys, private key headers and history search by prefix in secrets-walk, and solo-run-log's mode check before any write. 9 tests. These check that text is present. They do not check that it is correct beyond what the review established.

## Hooks

tests/hook-contract.test.mjs runs both hooks against temporary git repositories and payload fixtures reconstructed from the Claude Code 2.1.304 bundle. 35 of 35 pass on macOS, and CI runs them on macOS and Linux. Of the 35, 18 fail on the hooks as they were before the second review round, including a forced rotation race, work only in a merge commit, a squash merge later reverted, a dirty worktree on the default branch, symlinks in the state directory, identifiers in paths and agent names, and repository config that tries to start fsmonitor, diff driver or textconv programs. The fixtures are not captured from a live session, which is a limit.

## Context cost

Claude Code's own estimate (`claude --plugin-dir . plugin details operator-skills`) is about 2,029 always-on tokens per session now, against about 8,556 for v1.0.0 and about 2,019 at the end of the first round. Always-on means added to every session before any skill fires. The cost when a skill loads went up: engineering-floor is about 5.5k tokens on invoke, against about 1.5k for v1.0.0, because each SKILL.md now carries the precedence block and the full trigger table. All three runs are in docs/evidence/context-cost.txt.

## Behavioral harness, not run

evals/ holds ten cases for `claude plugin eval`, five should-fire and five stay-quiet, one pair per safety floor, with three arms: without the plugin, with it, and a placebo plugin of generic caution. Leak checks read only what the agent produced, and every case records whether a skill loaded and whether the task got done. tests/evals.test.mjs checks the cases without a model call, 10 tests. See evals/README.md for the commands, the smoke run that sets the cost cap, and the reporting rules. It has not been run, because running it sends repository content to a model API. That decision belongs to the owner.

## What is not measured

- Whether Claude Code loads the right skill at the right moment in a real session
- Whether the agent follows a rule once loaded, and what that changes
- False interruptions per session, which is the main risk of a plugin like this
- Speed, cost or outcome effects
- Whether the safety floors catch credentials or patient data they were not written for
