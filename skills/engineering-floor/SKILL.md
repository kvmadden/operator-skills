---
name: engineering-floor
description: Do NOT use for style nudges (tokens, config, tests, file splits, commit wording) on spike code, throwaway helpers or work the operator called a sketch. The safety floors apply in every mode. Use when code or data work risks a floor. Safety floors are a credential-shaped string such as `sk-`, `sk_live_`, `AKIA`, `ghp_` or a `PRIVATE KEY-----` header, or a connection string with a password, in chat, tool output, code or logs, real-looking patient or personal data in prompts, fixtures, logs or commits, a bulk change to existing rows ("run an UPDATE", "delete these rows", "clean up the data"), a schema change ("add a column", "rename this column", "drop the [field]") and auth checked only in the UI. Everyday floors are error and empty states, accessibility, contracts, reuse, tests, design tokens and vague commit messages.
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
| [accessibility-floor](rules/accessibility-floor.md) | UI being written or changed without checks for contrast, keyboard use, visible focus, accessible names or target size: a new component, form, dialog, menu, icon-only button or custom control |
| [auth-floor](rules/auth-floor.md) | an auth or role check that exists in the UI (hidden button, conditional render, gated route, disabled control) for an action whose API route, server action, database policy or function call has not been checked for the same rule |
| [commit-message-honesty](rules/commit-message-honesty.md) | vague commit messages — "minor updates", "wip", "fix stuff", "tweaks", "polish", "fixes", "updates", "changes", "improvements" |
| [config-or-code](rules/config-or-code.md) | "let's hardcode" / "I'll just write it inline" / "set this to <value>" / any inline hex code, magic number, or template string being added |
| [contracts-and-interfaces](rules/contracts-and-interfaces.md) | function body being written without contract sketched; "module X needs to talk to Y" / "what does this function take" / "interface between" |
| [domain-modeling](rules/domain-modeling.md) | domain data shapes (Orders, Invoices, Shipments, etc.) being designed; tables or types being authored without prior entity-relationship articulation |
| [empty-state-first](rules/empty-state-first.md) | list / grid / table / dashboard being designed without explicit empty-state consideration |
| [error-modeling](rules/error-modeling.md) | API endpoint design / multi-step workflow / async pipeline / system design without error modeling |
| [error-philosophy](rules/error-philosophy.md) | try/catch being written; "let me catch this" / "wrap it in a try" / "handle the error" / "swallow the exception" |
| [error-state-first](rules/error-state-first.md) | network-dependent UI being designed without error path (timeout, 500, malformed response) explicitly considered |
| [migration-not-mutation](rules/migration-not-mutation.md) | about to change or delete many existing rows, at the operator's request or by Claude's own plan: "run an UPDATE", "delete these rows", "clean up the data", "fix up the data", "dedupe these", "normalize these values", "backfill", "consolidate these duplicates", "rename these values", "mutate the existing rows", "transform these rows in place", "run a one-off SQL", a statement with `UPDATE`, `DELETE`, `TRUNCATE`, `MERGE` or an upsert, or an ORM bulk call such as `updateMany`, `deleteMany`, `bulk_update`, `update_all` or `delete_all`, run through psql, a database tool, an MCP server or application code |
| [mobile-first-check](rules/mobile-first-check.md) | UI surface being declared "done" without mobile-viewport verification |
| [phi-floor](rules/phi-floor.md) | real-looking data about a person in chat, tool output, fixtures, seed files, logs, screenshots or commits: a name with a date of birth, a medical record number ("MRN"), a Social Security number, an address, phone or email tied to care, dates of service, a diagnosis, medication or lab result tied to a person, an HL7 `PID\|` segment, a FHIR `Patient` resource, a CCD or C-CDA document, DICOM header fields, or a request such as "use this EHR export", "turn these patient rows into fixtures" or "copy the production data into the test database" |
| [reuse-radar](rules/reuse-radar.md) | "I'll create a [component / function / utility] for X" / "let me build a [thing] that does [Y]" / new file with name suggesting a common utility |
| [schema-discipline](rules/schema-discipline.md) | a change to the shape of stored data: "add a column", "add a field", "rename this column", "change the type to", "make this required", "drop the [field]", "split this table", "merge these tables", "restructure this", edits to SQL migration files, ORM schema files such as `schema.prisma`, Drizzle, TypeORM or SQLAlchemy models, Rails or Django migrations, type definitions for persisted data, JSON column shape changes, or commands such as `prisma db push`, `prisma migrate reset`, `rails db:schema:load` or `DROP TABLE` |
| [secrets-walk](rules/secrets-walk.md) | a credential-shaped value in chat, tool output, code, config, logs or a commit: provider prefixes such as `sk-`, `sk-proj-`, `sk-svcacct-`, `sk-admin-`, `sk-ant-`, `sk_live_`, `sk_test_`, `rk_live_`, `rk_test_`, `whsec_`, `AKIA`, `ASIA`, `ghp_`, `gho_`, `ghu_`, `ghs_`, `ghr_`, `github_pat_`, `glpat-`, `xoxb-`, `xoxp-`, `AIza`, `npm_`, a JWT starting `eyJ` with two more dot-separated parts, a private key header ending `PRIVATE KEY-----`, a connection string with a password ("postgres://user:password@host"), "pasted my .env", or a long random value next to "key", "token", "secret" or "password" |
| [single-file-check](rules/single-file-check.md) | component / file / module split being proposed; "let me extract this" before the extraction has earned itself |
| [system-decomposition](rules/system-decomposition.md) | system complexity threshold / friction managing a single big thing / designing something complex from scratch |
| [testing-philosophy](rules/testing-philosophy.md) | "let me write a test" / "add a test for" / "I should test this" / "let me mock this" / `*.test.*` files being created / `expect(...).toHaveBeenCalled` / `.toHaveBeenCalledWith` patterns |
| [tokens-not-values](rules/tokens-not-values.md) | "let me hardcode" / "let me just hardcode" / "hardcode this color" / "hardcode the value" / "I'll just use" + hex code / inline hex codes (`#xxxxxx`, `rgb(...)`, `hsl(...)`) / Tailwind arbitrary values (`p-[17px]`, `text-[19px]`, `bg-[#abc123]`) / CSS literals (`padding: 17px`, `margin: 22px`, `border-radius: 7px`) / off-scale spacing / off-scale type sizes |
| [useful-test](rules/useful-test.md) | "useful" claimed without specificity |
<!-- triggers:end -->
