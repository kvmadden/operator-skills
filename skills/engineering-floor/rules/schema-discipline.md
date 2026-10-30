---
title: Schema discipline — no shape change without a migration plan
trigger: "let's add a field" / "rename this column" / "change the type to" / "restructure this" / "split this table" / "merge these" / "drop the [field]" / "make this required" / edits to `*.sql` migration files / type definitions for persisted data / JSONB shape changes
priority: high
---

## The pattern

Never change the shape of persisted data without naming what happens to existing data. Every shape change is a 3-step plan: (1) add the new shape alongside the old, (2) backfill / migrate, (3) remove the old shape. Skipping step 2 means existing data breaks.

This applies to live tables in your application databases and any persisted state.

Schema mistakes in production corrupt data that can't be re-derived from upstream sources. The cost of a shape-change-without-migration ranges from "annoying" (a few broken rows) to "irrecoverable" (silent data loss across thousands of rows for weeks before discovery). The 30 seconds to answer the migration question is overwhelmingly worth it.

For JSONB / flexible-shape patterns specifically: any new top-level key needs to handle existing rows that don't have it (default to undefined, code reads with optional chaining).

## Response

**HARD INTERRUPT.** No "we'll figure migration out later."

1. **Stop.** Don't apply the schema change.
2. **Name the data:** "That changes shape of `<table>`. Existing rows: `<estimated count>`."
3. **Ask the migration question:**
   "What happens to existing rows on this change?
   - **(a) Backfilled with default** — name the default
   - **(b) Migrated via SQL** — what's the SQL?
   - **(c) Old shape preserved alongside new** — for how long, and who reads which?
   - **(d) Data is acceptable to lose** — confirm explicitly"
4. **Wait.** Do not apply until the answer is named.

## Suppression

- The data is ephemeral (in-memory, session-only, cache)
- The "schema" is just a TypeScript type for in-flight data, not persisted
- The operator already named the migration plan in this session
- Mode is `explore` AND no real data exists yet

## Override

- "(d) acceptable to lose" — log + yield (explicit data loss confirmation)
- "I know — migration written separately"
- "this is fresh data, no rows yet"

NO override path for "trust me." The skill always requires the migration question be answered, even if the answer is "data is acceptable to lose."
