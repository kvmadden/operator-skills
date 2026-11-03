# Precedence across operator-skills

This file is the single source for how the rules relate when more than one could respond. The block between the markers is copied into every SKILL.md by `npm run sync:precedence`, so Claude sees it whichever skill loads, and `npm test` fails if a copy drifts.

<!-- precedence:start -->
## Precedence across operator-skills

When more than one rule could respond, use this order. Give at most one correction per turn: the highest tier wins, and lower tiers wait or drop.

| Tier | Rules | How they respond |
|---|---|---|
| 1 | `secrets-walk`, `phi-floor`, `migration-not-mutation`, `schema-discipline`, `auth-floor`, `solo-run-checklist`, `solo-run-contract`, `solo-run-log`, `solo-run-debrief` | Stop before the risky action and wait for the operator. No mode, sketch or "explore" label suppresses them. |
| 2 | `code-i-can-actually-run`, `hallucination-tripwire`, `citation-or-it-didnt-happen`, `claude-confabulating-context`, `am-i-being-led`, `reading-claudes-output-honestly`, `is-claude-just-agreeing`, `claude-disagrees` | Check or correct Claude's own output, say what changed, then continue. |
| 3 | Every other engineering-floor and build-discipline rule | One short nudge, then yield. Never a hard stop. |
| 4 | Every other rule (communication, decision, honesty, strategy, usage and effective-usage rules, solo-run-postmortem) | Mention only when asked or clearly useful. Never interrupt work. |

Shared meanings:
- **Explore mode** starts only when the operator says so ("explore mode", "just sketching") and ends when they say so or start building something to ship. It quiets tiers 3 and 4, never tier 1.
- **Logged** means said in the conversation. Write to a file only after the operator agrees to that file, and never copy credentials or patient data into it.
- **Unknown stays unknown.** Claude cannot see clock time between messages, earlier sessions or usage counts. When a rule depends on them, ask or say they are unknown instead of guessing.

Owners for situations two rules both claim:

| Situation | Owner | The other rule |
|---|---|---|
| "ship it" or "looks good" right after a long change | reading-claudes-output-honestly asks once whether it was read | handoff-at-the-boundary waits until the operator has confirmed the review |
| "perfect" or "exactly" | reading-claudes-output-honestly, when it approves a long output | prompt-archeology only when the operator asks to keep a prompt |
| "while we're at it" during an active build | scope-lock | park-the-idea owns stray ideas outside an active build |
| "the latest version" of outside software | citation-or-it-didnt-happen | name-the-version owns the operator's own artifacts |
| Several options on the table | pick-one when the operator asks for a recommendation | am-i-being-led applies when Claude steered without being asked |
| An inline color or spacing value | tokens-not-values, only when the project has design tokens | config-or-code for other hardcoded values |
| "done" or "shipped" | output-vs-outcome for a report of finished work | vibe-vs-real only for a maturity claim about a product |
| A clinical, safety or data-integrity edge case | the engineering floors, as first-version work | v1-versus-v2-thinking never defers it |
<!-- precedence:end -->

## Why this exists

Four independent reviews found rules that gave opposite answers to the same words, a style rule that could outrank a credential rule, safety floors that "explore" mode could switch off, and thirteen rules that hard-stopped work although the README promised hard stops for a few floors only. The tiers above fix those cases in one place. The rule files were edited to match.
