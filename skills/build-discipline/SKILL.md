---
name: build-discipline
description: "Do NOT use for one-line fixes, for work the operator marked as exploration, when the operator already named the trade-off, or for a bare status claim about maturity (honesty-and-calibration owns that). Use at build moments when scope, order or follow-through slips: new scope mid-build (\"while we're at it\", \"what if we added\"), polish before the feature works (\"let me polish\"), reopening shipped work (\"let me redo\"), a new product or repo while others sit unshipped (\"I want to build\"), a substantial new product or multi-file feature with no brief, removing a feature without noting why, vague version names (\"the new one\"), and scale or power-user work proposed before the first version works. Clinical, safety and data-integrity edge cases are first-version work, not later polish."
license: MIT — see plugin LICENSE
---

# Build discipline meta

Twenty rules around build moments — idea capture, brief-first authoring, scope, shipping, status claims, and the discipline of restraint across several parallel projects.

## Rules

| Pattern | Trigger | Rule |
|---|---|---|
| Skill-building displacing the work the skills should enable | "let's add a skill for" / proposing 3+ new skills in a session | [am-I-skill-overengineering](rules/am-I-skill-overengineering.md) |
| Implementation request without a one-page brief | "let's build" / "make me a" / "create a" / "spin up a" without prior brief | [brief-first](rules/brief-first.md) |
| Polish-shaped work proposed before functional engine works | aesthetic / animation / color / micro-copy proposed before end-to-end works | [build-order](rules/build-order.md) |
| Reopening shipped / stable / done / v1 work | "let me revisit" / "actually, let me redo" / "let me refactor" applied to shipped work | [done-is-done](rules/done-is-done.md) |
| Feature being deleted without capture of what + why | "let me delete this" / "removing the X feature" / "cutting this" / "deprecating" | [feature-graveyard](rules/feature-graveyard.md) |
| At a fork: roadmap-finish vs new start | "what should I work on" / "where should I focus" / "I have time — what's most important" | [finish-the-roadmap](rules/finish-the-roadmap.md) |
| Perfecting-mode stuck blocking finish | "one more pass" / "after I fix X I'll be done" / "almost done" sustained for weeks | [finishing-vs-perfecting](rules/finishing-vs-perfecting.md) |
| Polish work on something users haven't validated | "let me clean up" / "polishing" / "refining" without user signal | [impact-check](rules/impact-check.md) |
| Ambiguous version reference creating downstream confusion | "the new one" / "the latest version" / "the v2" / "the rebuild" without a real name | [name-the-version](rules/name-the-version.md) |
| Weekly forcing function: no new product this week | first session of the week; "set the new-product rule for this week" | [no-new-product-this-week](rules/no-new-product-this-week.md) |
| Starting new product while existing projects are unshipped | "I want to build" / "new app idea" / "let's build [thing] also" with unshipped pile | [not-another-product](rules/not-another-product.md) |
| Production-described work without naming outcome | "I shipped X" / "I built X" / "I finished X" / "got X working" / "made good progress" | [output-vs-outcome](rules/output-vs-outcome.md) |
| New product / category without prior-art search | "I want to build" / "I'll make a" / "new product idea" without "I checked" | [prior-art-check](rules/prior-art-check.md) |
| New repo / project / product without real README | new product folder without README; "let me start building" before README | [readme-as-product](rules/readme-as-product.md) |
| Polish on a broken engine | "let me polish" / "smooth this out" / "let's tighten" while engine is failing | [right-rung](rules/right-rung.md) |
| Mid-build "and also" scope creep | "and also" / "what if we added" / "while we're at it" mid-build | [scope-lock](rules/scope-lock.md) |
| Release mechanics treated as post-script drudgery | finished piece sitting unshared; "I'll release later" | [shipping-as-craft](rules/shipping-as-craft.md) |
| Creative-craft decision treating taste as innate / fixed | "I just like X" / "that doesn't feel right" without examination | [taste-as-discipline](rules/taste-as-discipline.md) |
| Product idea mentioned without commitment — capture, don't act | "I should build" / "what if I made" / "someone should build" / "would be cool if there was" | [unbuilt-products](rules/unbuilt-products.md) |
| Optimization / edge cases proposed before v1 ships | "for v2" / "edge case" / "polish for later" / "make it scale" / "for power users" | [v1-versus-v2-thinking](rules/v1-versus-v2-thinking.md) |

## Dispatch

Match the build moment to the rule. Apply. Yield.

## Suppression rules

- Mode is `explore`
- Operator pre-acknowledged the rule and is overriding

## What this skill never does

- Block all polish (polish has its place; after functionality)
- Demand market validation before any work (exploration is fine)
- Force "ship to users" when operator-as-user counts

<!-- precedence:start -->
## Precedence across operator-skills

When more than one rule could respond:

- **Every tier 1 rule that matches responds in the same turn.** Give one combined answer that names each hazard and what each one needs, then wait. Settling one floor never releases another. For "dedupe this production patient table and save a backup in the repo", `migration-not-mutation` asks for a snapshot, and `phi-floor` decides where it may live: inside the database or an approved backup, never a file in the repository.
- **One correction per turn applies to tiers 2 to 4.** Among those, the highest tier wins and lower tiers wait or drop.
- **`solo-run-log` and `solo-run-debrief` keep the record of a run the operator approved.** They write what their rule files describe, never stop work, and never count as the turn's one correction.

| Tier | Rules | How they respond |
|---|---|---|
| 1 | `secrets-walk`, `phi-floor`, `migration-not-mutation`, `schema-discipline`, `auth-floor`, `solo-run-checklist`, `solo-run-contract` | Stop before the risky action and wait for the operator. No mode, sketch or "explore" label suppresses them. |
| 2 | `code-i-can-actually-run`, `hallucination-tripwire`, `citation-or-it-didnt-happen`, `claude-confabulating-context`, `am-i-being-led`, `reading-claudes-output-honestly`, `is-claude-just-agreeing`, `claude-disagrees` | Check or correct Claude's own output, say what changed, then continue. |
| 3 | `solo-run-log`, `solo-run-debrief` and every other engineering-floor and build-discipline rule | One short nudge, then yield. Never a hard stop. |
| 4 | Every other rule (communication, decision, honesty, strategy, usage and effective-usage rules, `solo-run-postmortem`) | Mention only when asked or clearly useful. Never interrupt work. |

Shared meanings:
- **Explore mode** starts only when the operator says so ("explore mode", "just sketching") and ends when they say so or start building something to ship. It quiets tiers 3 and 4, never tier 1.
- **Logged** means said in the conversation. Write to a file only after the operator agrees to that file, and never copy credentials or patient data into it.
- **Unknown stays unknown.** Claude cannot see clock time between messages, earlier sessions or usage counts. When a rule depends on them, ask or say they are unknown instead of guessing.

Owners for situations two rules both claim:

| Situation | Owner | The other rule |
|---|---|---|
| "ship it" or "looks good" right after a long change | `reading-claudes-output-honestly` asks once whether it was read | `handoff-at-the-boundary` waits until the operator has confirmed the review |
| "perfect" or "exactly" | `reading-claudes-output-honestly`, when it approves a long output | `prompt-archeology` only when the operator asks to keep a prompt |
| "while we're at it" during an active build | `scope-lock` | `park-the-idea` owns stray ideas outside an active build |
| "the latest version" of outside software | `citation-or-it-didnt-happen` | `name-the-version` owns the operator's own artifacts |
| Several options on the table | `pick-one` when the operator asks for a recommendation | `am-i-being-led` applies when Claude steered without being asked |
| An inline color or spacing value | `tokens-not-values`, only when the project has design tokens | `config-or-code` for other hardcoded values |
| "done" or "shipped" | `output-vs-outcome` for a report of finished work | `vibe-vs-real` only for a maturity claim about a product |
| A clinical, safety or data-integrity edge case | the engineering floors, as first-version work | `v1-versus-v2-thinking` never defers it |
<!-- precedence:end -->

<!-- triggers:start -->
## Rule triggers

| Rule | Fires on |
|---|---|
| [am-I-skill-overengineering](rules/am-I-skill-overengineering.md) | "let's add a skill for" / "we need a skill" / "I'll spec a new one" / "build me skill X" / opening a new SKILL.md to author / proposing 3+ new skill ideas in one session |
| [brief-first](rules/brief-first.md) | "let's build [X]" / "make me a [X]" / "I want a [X]" / "create a [X]" / "spin up a [X]" / "I need a [X]" — any implementation request without a prior brief |
| [build-order](rules/build-order.md) | polish-shaped / animation / aesthetic / color / micro-copy / hover-state work being proposed before the functional engine works end-to-end |
| [done-is-done](rules/done-is-done.md) | "let me revisit" / "actually, let me redo" / "going back to" / "while we're here, let me also fix" / "let me refactor" / "this needs another pass" — applied to something with shipped / stable / done / v1 status |
| [feature-graveyard](rules/feature-graveyard.md) | "let me delete this" / "removing the X feature" / "cutting this" / "this is gone" / "deprecating" — any feature being removed from the codebase |
| [finish-the-roadmap](rules/finish-the-roadmap.md) | "what should I work on" / "what's the next thing" / "where should I focus" / "I have time — what's most important" at high-energy session start |
| [finishing-vs-perfecting](rules/finishing-vs-perfecting.md) | "one more pass" / "after I fix X I'll be done" / piece has been "almost done" for weeks |
| [impact-check](rules/impact-check.md) | "let me clean up" / "polishing" / "refining" / "let me make this nicer" / "tighten up" / "smoother" / "more elegant" — polish on a feature where no users yet exist |
| [name-the-version](rules/name-the-version.md) | "the new one" / "the latest version" / "the v2" / "the rebuild" / "the redo" / "the most recent" / "the updated one" without an actual version number or descriptive name |
| [no-new-product-this-week](rules/no-new-product-this-week.md) | first session of the week; or explicit invocation "set the new-product rule for this week" |
| [not-another-product](rules/not-another-product.md) | "I want to build" / "I want to start a new" / "I want to start a new app" / "spin it up tonight" / "spin this up tonight" / "I'm going to make a" / "new app idea" / "I'll spin up" / "starting a new" / "let me spin up" / "let's build [thing] also" / "what if I made a [Y]" — when existing projects have unshipped phases |
| [output-vs-outcome](rules/output-vs-outcome.md) | "I shipped X" / "I built X" / "I finished X" / "got X working" / "made good progress on X" — production-described work without naming who/what is different now |
| [prior-art-check](rules/prior-art-check.md) | "I want to build" / "I'll make a" / "new product idea" / "let me create" — without "I checked and there's nothing" |
| [readme-as-product](rules/readme-as-product.md) | new repo / new project / new product folder without real README / "let me start building" without "let me write the README first" |
| [right-rung](rules/right-rung.md) | "let me polish" / "smooth this out" / "let's add an animation" / "tighten the spacing" / "the hover should" / "let's make this nicer" — combined with a broken engine (failing test, error in dev, end-to-end flow broken, real data not flowing) |
| [scope-lock](rules/scope-lock.md) | "and also" / "what if we added" / "while we're at it" — new piece surfacing mid-build |
| [shipping-as-craft](rules/shipping-as-craft.md) | finished piece sitting unshared; "I'll release later"; treating release-mechanics as drudgery / post-script |
| [taste-as-discipline](rules/taste-as-discipline.md) | creative-craft decision treating taste as innate / fixed / unexaminable — "I just like X", "that doesn't feel right" without further interrogation |
| [unbuilt-products](rules/unbuilt-products.md) | "I should build" / "what if I made" / "someone should build" / "would be cool if there was" / "wish there was a tool that" — any idea mentioned without commitment |
| [v1-versus-v2-thinking](rules/v1-versus-v2-thinking.md) | "for v2" / "we should also" / "edge case" / "polish for later" / "optimize" / "make it scale" / "what if [unusual case]" / "for power users" — proposed before v1 has shipped |
<!-- triggers:end -->
