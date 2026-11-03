---
name: engineering-floor
description: Do NOT use for style nudges (tokens, config, tests, file splits, commit wording) on spike code, throwaway helpers or work the operator called a sketch. The safety floors apply in every mode. Use when code or data work risks a floor. Safety floors are a credential-shaped string such as `sk-`, `sk_live_`, `AKIA`, `ghp_` or `-----BEGIN`, or a connection string with a password, in chat, tool output, code or logs, real-looking patient or personal data in prompts, fixtures, logs or commits, a bulk change to existing rows ("run an UPDATE", "delete these rows", "clean up the data"), a schema change ("add a column", "rename this column", "drop the [field]") and auth checked only in the UI. Everyday floors are error and empty states, accessibility, contracts, reuse, tests, design tokens and vague commit messages.
license: MIT — see plugin LICENSE
---

# Engineering floor checklist

Twenty-one rules covering the engineering floors a vibe-coded build can violate — from safety floors (secrets, schema, migration, auth) through everyday floors (config, tokens, errors, tests, accessibility). Each rule has its own specific check + response.

## Rules

| Pattern | Trigger | Rule |
|---|---|---|
| Accessibility floors (contrast, focus, touch targets, keyboard nav) violated | UI authored without explicit a11y checks | [accessibility-floor](rules/accessibility-floor.md) |
| Auth enforced only at UI; missing API/RLS layer | hidden button / conditional render / gated route without API enforcement | [auth-floor](rules/auth-floor.md) |
| Generic commit message | "minor updates", "wip", "fix stuff", "tweaks", "polish" | [commit-message-honesty](rules/commit-message-honesty.md) |
| Tweakable value being hardcoded instead of extracted | "let's hardcode" / "set this to <value>" / inline hex / magic number | [config-or-code](rules/config-or-code.md) |
| Function body written without contract sketched | "what does this function take" / "interface between" | [contracts-and-interfaces](rules/contracts-and-interfaces.md) |
| Domain entities implemented before modeling in plain English | tables / types authored without prior entity-relationship articulation | [domain-modeling](rules/domain-modeling.md) |
| List / grid / table / dashboard designed without empty-state consideration | data view being built without zero-data path | [empty-state-first](rules/empty-state-first.md) |
| API / workflow / pipeline designed without error modeling | endpoint or async pipeline being designed without failure paths | [error-modeling](rules/error-modeling.md) |
| try/catch being written without philosophy | "let me catch this" / "wrap it in a try" / "swallow the exception" | [error-philosophy](rules/error-philosophy.md) |
| Network-dependent UI designed without error path | timeout / 500 / malformed-response not considered | [error-state-first](rules/error-state-first.md) |
| UPDATE-in-place on existing rows | "let me UPDATE" / "fix up the data" / "consolidate these duplicates" | [migration-not-mutation](rules/migration-not-mutation.md) |
| UI declared "done" without mobile-viewport verification | "we'll mobile-test later" / mobile not checked | [mobile-first-check](rules/mobile-first-check.md) |
| New component / utility being built without checking existing code | "I'll create a [thing] for X" without reuse check | [reuse-radar](rules/reuse-radar.md) |
| Schema shape change without migration plan | "let's add a field" / "rename this column" / "drop the [field]" / edits to migration files | [schema-discipline](rules/schema-discipline.md) |
| Credentials in chat / repos / logs | `sk-`, `ghp_`, `AKIA`, `.env` paste, bash credential leak | [secrets-walk](rules/secrets-walk.md) |
| Real-looking patient or personal data in prompts, fixtures, logs or commits | "use this EHR export", "turn these patient rows into fixtures", MRNs, HL7 `PID` segments, FHIR `Patient` resources | [phi-floor](rules/phi-floor.md) |
| Premature file / component / module split before reuse is real | "let me extract this" / "let me split this" without earned extraction | [single-file-check](rules/single-file-check.md) |
| System complexity threshold; friction managing single big thing | designing something complex from scratch without seams | [system-decomposition](rules/system-decomposition.md) |
| Test written against implementation, not contract | "let me mock this" / `.toHaveBeenCalled` / `*.test.*` patterns | [testing-philosophy](rules/testing-philosophy.md) |
| Inline design literals (hex, arbitrary spacing, off-scale type) | `#xxxxxx` / `p-[17px]` / `padding: 17px` / off-scale sizes | [tokens-not-values](rules/tokens-not-values.md) |
| "Useful" claimed without specificity | "this is useful" without naming for-whom / when / what-task | [useful-test](rules/useful-test.md) |

## Dispatch

Match the engineering moment to the rule. Apply. Yield.

## Suppression rules

The safety floors (secrets-walk, phi-floor, migration-not-mutation, schema-discipline, auth-floor) are never suppressed by mode, by "spike" or by "throwaway". The suppressions below apply to the everyday floors only.

- Spike code or a one-off throwaway helper
- Explore mode, as defined in the precedence section below
- Already addressed this rule in the current task

## What this skill never does

- Block all hardcoding (constants are real)
- Block all try/catch (legitimate uses exist)
- Demand a multi-page brief for trivial fixes
- Apply rules to non-code work

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

## Trigger catalogue

Moved here from the skill description on 3 November 2026, unchanged. Claude Code shows at most 1,536 characters of a skill description in its skill listing and can show less when many skills are installed, so the long list was being cut. Claude reads this section after the skill loads. Where this older text disagrees with a rule file or the precedence section above, the rule file and the precedence section win.

> Use this skill whenever the operator is authoring, editing, designing, or shipping code AND an engineering-discipline floor is at risk of being violated — including data shape changes, secrets handling, error flow design, accessibility, and the everyday floors of a vibe-coded session. Triggers (high-priority floors first): credential-shaped strings (`sk-`, `sk_live`, `sk_test`, `AKIA`, `ghp_`, `github_pat_`, `eyJ...`, `PEM private-key headers`), `.env` content being pasted, Bash output containing credentials, hardcoded credentials in source (secrets-walk — never enters chat, repos, or logs); "let me UPDATE", "run a one-off SQL", "mutate the existing rows", "fix up the data", "let's clean these up", "transform these rows in place", "consolidate these duplicates", "rename these values" (migration-not-mutation — never UPDATE in place); "let's add a field", "rename this column", "change the type to", "restructure this", "split this table", "merge these", "drop the [field]", "make this required", edits to `*.sql` migration files, type definitions for persisted data, JSONB shape changes (schema-discipline — no shape change without migration plan); auth check at UI without API/RLS enforcement (auth-floor — security boundary is at the API, not the UI); new UI without contrast / focus / touch-target / keyboard considerations (accessibility-floor — four non-negotiables at write-time). Standard-priority floor triggers: "let me hardcode", "I'll just write it inline", "set this to <value>", inline hex codes, magic numbers, template strings (config-or-code — extract what varies); inline hex codes (`#xxxxxx`, `rgb(...)`, `hsl(...)`), Tailwind arbitrary values (`p-[17px]`, `bg-[#abc123]`), CSS literals (`padding: 17px`, `margin: 22px`), off-scale spacing or type sizes (tokens-not-values); "let me catch this", "wrap it in a try", "handle the error", "swallow the exception" (error-philosophy — catch where you can act, bubble where you can't); API endpoint design / multi-step workflow / async pipeline / system design without error modeling (error-modeling); network-dependent UI being designed without error path (timeout, 500, malformed response) explicitly considered (error-state-first); list / grid / table / dashboard being designed without empty-state consideration (empty-state-first); "let me extract this", premature file / component / module split (single-file-check — don't split before reuse is real); "I'll create a [component / function / utility] for X" without checking existing code (reuse-radar); function body being written without contract sketched, "what does this function take" / "interface between" (contracts-and-interfaces — name the contract before the body); domain data shapes (Orders, Invoices, Shipments) being designed / tables or types being authored without prior entity-relationship articulation (domain-modeling — plain English first); system complexity threshold, friction managing a single big thing (system-decomposition — draw the seams deliberately); UI surface being declared "done" without mobile-viewport verification (mobile-first-check); "let me write a test", "add a test for", `*.test.*` files being created, `.toHaveBeenCalled` / `.toHaveBeenCalledWith` patterns (testing-philosophy — test the contract, not the implementation); vague commit messages — "minor updates", "wip", "fix stuff", "tweaks", "polish", "fixes", "updates", "changes", "improvements" (commit-message-honesty — specific or it's not documentation); "useful" claimed without specificity (useful-test). Also fires on pathPatterns (matching source files) and bashPatterns (matching `git commit -m "<generic>"`). Consult the skill's rules/ folder to identify the specific engineering-floor pattern (accessibility-floor, auth-floor, commit-message-honesty, config-or-code, contracts-and-interfaces, domain-modeling, empty-state-first, error-modeling, error-philosophy, error-state-first, migration-not-mutation, mobile-first-check, reuse-radar, schema-discipline, secrets-walk, single-file-check, system-decomposition, testing-philosophy, tokens-not-values, useful-test) and apply that rule's matching response. Hard interrupt for the safety floors: secrets-walk (credentials in chat / repos / logs), migration-not-mutation (UPDATE in place), schema-discipline (shape change without plan), auth-floor (security boundary only at UI), and severe error-philosophy violations (empty catch blocks). Soft teaching response for the rest. Do NOT use for one-off spike code / throwaway helpers, `explore` mode sketches, floors already addressed this task, or non-code work.
