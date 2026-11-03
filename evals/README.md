# Behavioral evaluation harness (not run)

Status: **not run.** Running it starts real Claude Code sessions, which sends these case files and the plugin text to a model API and costs money. That is Kevin's decision. Nothing in this repository reports a behavioral result yet.

## What it measures

Each case is a short coding task in a scaffolded directory. Half are situations where a safety floor should act (a key arrives in tool output, a cleanup needs a bulk DELETE nobody named, a schema change hits existing nulls, patient rows are offered as fixtures, a delete button is guarded only in the UI). The other half are matched situations where the rule should stay quiet (placeholders, a one-row update by primary key, clearly synthetic patients).

Three arms, same cases, same model, same runs per case:

1. **Without plugin:** the built-in baseline arm of `claude plugin eval --ablation with-without`.
2. **With operator-skills:** the plugin arm of the same run.
3. **Placebo:** the same cases against `evals/placebo`, a plugin with one skill of generic caution and none of these rules. It separates "the rules helped" from "any loaded caution helped".

Graders are deterministic where possible (a marker string must not appear in the reply or in written files) and LLM-judged where behavior has to be read. `tool_used: Skill` with `arm: with-only` records whether a skill loaded on its own, which is the automatic-loading question the old README could not answer.

## How to run it, when approved

Requires Claude Code 2.1.304 or later, `sqlite3` for two scaffolds, and an explicit cost cap.

```sh
# operator-skills, with and without
claude plugin eval . --eval-dir evals/cases --ablation with-without --runs 5 \
  --scaffold --allow-tools Bash Edit Write --max-cost-usd 10 --no-publish \
  --json evals/results/operator-skills.json

# placebo, with and without
PLACEBO="$(node evals/prepare-placebo.mjs)"
claude plugin eval "$PLACEBO" --eval-dir evals/cases --ablation with-without --runs 5 \
  --scaffold --allow-tools Bash Edit Write --max-cost-usd 10 --no-publish \
  --json evals/results/placebo.json
```

`--scaffold` runs the bash scripts in `evals/scaffold`. They only write synthetic files into the run's working directory. Read them before running.

## How to report it

- Per case and arm: passes out of runs, with a Wilson 95% interval. Five runs per case is the minimum, because one run of a stochastic agent says little.
- Necessary corrections over should-fire opportunities, false interruptions over stay-quiet opportunities, task completion, leaks (marker found anywhere), and skill-loaded rate, each with its denominator.
- The difference between arms, case by case, including cases where the baseline already does the right thing.

## Data status

These eight cases are **development cases.** They were written by the same session that rewrote the rules, after reading four reviews and the rule text, so they cannot support a headline number. A headline needs a fresh set written blind by a different model family and locked by checksum before its first run. The spec for that set is kept with the review notes for this branch and will be written by the coordinator's other model families.
