---
name: engineering-floor
description: |
  Use this skill whenever the operator is authoring, editing, designing, or shipping code AND an engineering-discipline floor is at risk of being violated — including data shape changes, secrets handling, error flow design, accessibility, and the everyday floors of a vibe-coded session. Triggers (high-priority floors first): credential-shaped strings (`sk-`, `sk_live`, `sk_test`, `AKIA`, `ghp_`, `github_pat_`, `eyJ...`, `PEM private-key headers`), `.env` content being pasted, Bash output containing credentials, hardcoded credentials in source (secrets-walk — never enters chat, repos, or logs); "let me UPDATE", "run a one-off SQL", "mutate the existing rows", "fix up the data", "let's clean these up", "transform these rows in place", "consolidate these duplicates", "rename these values" (migration-not-mutation — never UPDATE in place); "let's add a field", "rename this column", "change the type to", "restructure this", "split this table", "merge these", "drop the [field]", "make this required", edits to `*.sql` migration files, type definitions for persisted data, JSONB shape changes (schema-discipline — no shape change without migration plan); auth check at UI without API/RLS enforcement (auth-floor — security boundary is at the API, not the UI); new UI without contrast / focus / touch-target / keyboard considerations (accessibility-floor — four non-negotiables at write-time). Standard-priority floor triggers: "let me hardcode", "I'll just write it inline", "set this to <value>", inline hex codes, magic numbers, template strings (config-or-code — extract what varies); inline hex codes (`#xxxxxx`, `rgb(...)`, `hsl(...)`), Tailwind arbitrary values (`p-[17px]`, `bg-[#abc123]`), CSS literals (`padding: 17px`, `margin: 22px`), off-scale spacing or type sizes (tokens-not-values); "let me catch this", "wrap it in a try", "handle the error", "swallow the exception" (error-philosophy — catch where you can act, bubble where you can't); API endpoint design / multi-step workflow / async pipeline / system design without error modeling (error-modeling); network-dependent UI being designed without error path (timeout, 500, malformed response) explicitly considered (error-state-first); list / grid / table / dashboard being designed without empty-state consideration (empty-state-first); "let me extract this", premature file / component / module split (single-file-check — don't split before reuse is real); "I'll create a [component / function / utility] for X" without checking existing code (reuse-radar); function body being written without contract sketched, "what does this function take" / "interface between" (contracts-and-interfaces — name the contract before the body); domain data shapes (Orders, Invoices, Shipments) being designed / tables or types being authored without prior entity-relationship articulation (domain-modeling — plain English first); system complexity threshold, friction managing a single big thing (system-decomposition — draw the seams deliberately); UI surface being declared "done" without mobile-viewport verification (mobile-first-check); "let me write a test", "add a test for", `*.test.*` files being created, `.toHaveBeenCalled` / `.toHaveBeenCalledWith` patterns (testing-philosophy — test the contract, not the implementation); vague commit messages — "minor updates", "wip", "fix stuff", "tweaks", "polish", "fixes", "updates", "changes", "improvements" (commit-message-honesty — specific or it's not documentation); "useful" claimed without specificity (useful-test). Also fires on pathPatterns (matching source files) and bashPatterns (matching `git commit -m "<generic>"`). Consult the skill's rules/ folder to identify the specific engineering-floor pattern (accessibility-floor, auth-floor, commit-message-honesty, config-or-code, contracts-and-interfaces, domain-modeling, empty-state-first, error-modeling, error-philosophy, error-state-first, migration-not-mutation, mobile-first-check, reuse-radar, schema-discipline, secrets-walk, single-file-check, system-decomposition, testing-philosophy, tokens-not-values, useful-test) and apply that rule's matching response. Hard interrupt for the safety floors: secrets-walk (credentials in chat / repos / logs), migration-not-mutation (UPDATE in place), schema-discipline (shape change without plan), auth-floor (security boundary only at UI), and severe error-philosophy violations (empty catch blocks). Soft teaching response for the rest. Do NOT use for one-off spike code / throwaway helpers, `explore` mode sketches, floors already addressed this task, or non-code work.
license: MIT — see plugin LICENSE
metadata:
  priority: high
  pathPatterns:
    - "src/**/*.{ts,tsx,js,jsx,mjs}"
    - "app/**/*.{ts,tsx,js,jsx}"
    - "components/**/*.{ts,tsx,js,jsx}"
    - "lib/**/*.{ts,tsx,js,jsx,mjs}"
    - "api/**/*.{ts,js,mjs}"
    - "pages/**/*.{ts,tsx,js,jsx}"
    - "migrations/**/*.sql"
    - "hosted-Postgres/migrations/**/*.sql"
    - "*.config.{ts,js,mjs}"
  bashPatterns:
    - '\bgit\s+commit\s+-m\s+["''](minor|wip|fix|tweaks|polish|updates|changes|improvements)["'']'
    - '\bgit\s+commit\s+--?amend\b'
    - '\bnpm\s+run\s+build\b'
    - '\bnpm\s+test\b'
  promptSignals:
    phrases:
      - "let me UPDATE"
      - "let me just run an UPDATE"
      - "run an UPDATE"
      - "run an UPDATE on those rows"
      - "clean them up"
      - "run a one-off SQL"
      - "mutate the existing rows"
      - "fix up the data"
      - "let's clean these up"
      - "consolidate these duplicates"
      - "rename these values"
      - "let me hardcode"
      - "hardcode this color"
      - "hardcode the value"
      - "let's add a field"
      - "rename this column"
      - "change the type to"
      - "restructure this"
      - "split this table"
      - "drop the field"
      - "make this required"
      - "sk-"
      - "sk_live"
      - "ghp_"
      - "github_pat_"
      - "AKIA"
      - "PEM private-key headers"
      - ".env"
      - "let me hardcode"
      - "I'll just write it inline"
      - "set this to"
      - "let me catch this"
      - "wrap it in a try"
      - "handle the error"
      - "swallow the exception"
      - "let me extract this"
      - "let me split this"
      - "I'll create a component for"
      - "let me build a utility"
      - "what does this function take"
      - "interface between"
      - "minor updates"
      - "wip"
      - "fix stuff"
      - "tweaks"
      - "polish"
      - "we'll mobile-test later"
      - "let me write a test"
      - "add a test for"
      - "let me mock this"
      - "useful"
      - "p-[17px]"
      - "padding: 17px"
      - "#xxxxxx"
---

# Engineering floor checklist

Twenty rules covering the engineering floors a vibe-coded build can violate — from safety floors (secrets, schema, migration, auth) through everyday floors (config, tokens, errors, tests, accessibility). Each rule has its own specific check + response.

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
| Premature file / component / module split before reuse is real | "let me extract this" / "let me split this" without earned extraction | [single-file-check](rules/single-file-check.md) |
| System complexity threshold; friction managing single big thing | designing something complex from scratch without seams | [system-decomposition](rules/system-decomposition.md) |
| Test written against implementation, not contract | "let me mock this" / `.toHaveBeenCalled` / `*.test.*` patterns | [testing-philosophy](rules/testing-philosophy.md) |
| Inline design literals (hex, arbitrary spacing, off-scale type) | `#xxxxxx` / `p-[17px]` / `padding: 17px` / off-scale sizes | [tokens-not-values](rules/tokens-not-values.md) |
| "Useful" claimed without specificity | "this is useful" without naming for-whom / when / what-task | [useful-test](rules/useful-test.md) |

## Dispatch

Match the engineering moment to the rule. Apply. Yield.

## Suppression rules

- Spike code / one-off throwaway
- Mode is `explore`
- Already addressed this rule in current task

## What this skill never does

- Block all hardcoding (constants are real)
- Block all try/catch (legitimate uses exist)
- Demand a multi-page brief for trivial fixes
- Apply rules to non-code work
