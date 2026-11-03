# Evaluation: what is measured, on what data, and what is not

## The short answer

Agent behavior in live sessions is **not measured**. Zero sessions have been run. Everything below is either a structural check, a contract test of the hooks, or a lexical lint of text, and every routing number comes from development data.

## Data status

A set becomes development data once anyone changing the rules has seen it. Numbers on development data can show whether something regressed. They cannot support a headline.

| Set | Size | Where | Status | Why |
|---|---|---|---|---|
| Shipped phrases | 28 | tests/fire-test-phrases.json | development | Written with the v1.0.0 rules. Their wording overlaps phrases copied into skill metadata. |
| Reviewer probes | 58 (28 should fire, 30 should stay quiet) | tests/routing/claude-probes.dev.json | development | Written during the review on 3 Nov 2026, then seen while rewriting descriptions. |
| Paraphrases | 28 | tests/routing/claude-paraphrases.dev.json | development | Meaning-preserving rewrites of the shipped phrases, seen while rewriting. |
| Other reviewers' probes | 36 (GPT), 30 (Grok), 32 (Gemini) | review reports, not in the repository | development | Read before the rules changed. |
| Eval harness cases | 8 | evals/cases | development | Written by the same session that changed the rules. |

No locked held-out set exists. A fresh one will be written blind by a different model family from a spec held with the review notes, locked by a committed checksum before its first run, and scored once.

## Lexical routing lint

`node tools/fire-test.mjs` picks a skill from the listing text Claude Code 2.1.304 shows (name plus description, cut at 1,536 characters), then a rule from the SKILL.md trigger table and rule triggers, with precedence tiers deciding between rules. Phrases match whole words, ties count as failures, a negated phrase does not count, and a "Do NOT use" phrase suppresses the skill. Stay-quiet probes are gated in CI. Should-fire cases are reported only.

A pass means the visible text contains the intended words. Claude Code chooses skills semantically, so this is a lint for wording, not a measure of routing.

All rows are development data.

| Set | Old scorer, v1.0.0 text | New scorer, v1.0.0 text | New scorer, after the description rewrite (4bba337) | New scorer, current text |
|---|---|---|---|---|
| Shipped phrases, should fire | 28 of 28 | 12 of 28 | 7 of 28 | 7 of 28 |
| Paraphrases, should fire | 0 of 28 | 0 of 28 | 0 of 28 | 0 of 28 |
| Probes, should fire | 6 of 28 | 6 of 28 | 3 of 28 | 5 of 28 |
| Probes, should stay quiet | 1 of 30 | 20 of 30 | 30 of 30 | 30 of 30 |
| Ties for first place | 2 of the 28 shipped passes were alphabetical tie-breaks | 1 | 0 | 0 |

How to read it:
- The old scorer's 28 of 28 relied on `metadata.promptSignals`, which Claude Code never reads. Without it, the same scorer passed 12 of 28.
- Should-fire counts fall after the rewrite because descriptions are now 487 to 814 characters instead of up to 4,595, so they hold fewer trigger words. The full trigger lists moved into the SKILL.md bodies, which Claude reads after a skill loads.
- Stay-quiet counts rise because word-boundary matching, the negation rule and the removal of one-word signals ("great", "done", "ready", "margin") stop false alarms such as "already" matching "ready".
- The rise from 3 to 5 should-fire probes came from adding current key shapes to the secrets-walk trigger, a general fix. Those probes are development data, so this is not evidence of better routing.

Saved runs: docs/evidence/routing-before-description-rewrite.txt, routing-after-description-rewrite.txt and routing-current.txt.

## Structure

`node tools/validate-skills.mjs` passes on 10 of 10 skills and 118 of 118 rules. It parses every frontmatter block with a strict YAML parser. Before this branch, 45 of 117 rule frontmatters were invalid YAML, 51 of 117 rules had no Override section, 1 had no Suppression section, 7 of 10 descriptions exceeded the 1,536 character listing cap, and the old validator printed OK for a deliberately broken plugin. tests/validate.test.mjs keeps each of those failure classes covered.

## Hooks

tests/hook-contract.test.mjs runs both hooks against temporary git repositories and payload fixtures reconstructed from the Claude Code 2.1.304 bundle. 21 of 21 pass on macOS. CI runs them on macOS and Linux. Before this branch, a SubagentStop payload with the real fields produced no record, the Stop warning was printed as plain stdout that Claude Code does not show, and a squash-merged branch was reported as unmerged. The fixtures are not captured from a live session, which is a limit.

## Behavioral harness, not run

evals/ holds eight paired cases for `claude plugin eval` with three arms: without the plugin, with it, and a placebo plugin of generic caution. See evals/README.md for the commands, the cost cap and the reporting rules. It has not been run, because running it sends repository content to a model API. That decision belongs to the owner.

## What is not measured

- Whether Claude Code loads the right skill at the right moment in a real session
- Whether the agent follows a rule once loaded, and what that changes
- False interruptions per session, which is the main risk of a plugin like this
- Speed, cost or outcome effects
- Whether the safety floors catch credentials or patient data they were not written for
