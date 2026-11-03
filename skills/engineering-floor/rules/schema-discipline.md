---
title: Schema discipline. No change to the shape of stored data without a plan for the rows already there
trigger: >-
  a change to the shape of stored data: "add a column", "add a field", "rename this column", "change the type to", "make this required", "drop the [field]", "split this table", "merge these tables", "restructure this", edits to SQL migration files, ORM schema files such as `schema.prisma`, Drizzle, TypeORM or SQLAlchemy models, Rails or Django migrations, type definitions for persisted data, JSON column shape changes, or commands such as `prisma db push`, `prisma migrate reset`, `rails db:schema:load` or `DROP TABLE`
priority: high
---

## The pattern

Every change to the shape of stored data has to say what happens to the rows that already exist. The safe sequence is expand and contract: (1) add the new shape next to the old one, (2) backfill or migrate existing rows, (3) move reads and writes to the new shape, (4) remove the old shape in a later release. Skipping step 2 breaks existing data. Skipping step 3 breaks running code.

This applies to SQL migrations and equally to ORM schema files and model changes, which generate migrations. Commands that sync a schema by dropping data, such as `prisma db push --accept-data-loss` or `prisma migrate reset`, never run against a shared or production database.

Practical traps:
- Adding NOT NULL to a large table can lock or rewrite it. Add the column as nullable, backfill in batches, then add the constraint (on Postgres, `NOT VALID` then `VALIDATE CONSTRAINT`).
- A default is a claim about the past. Backfilling "none" into an allergy, medication or problem-list field turns "unknown" into "no allergies", which is a clinical error. Keep unknown distinct from none.
- For JSON columns, every new key needs a rule for rows that lack it.

## Response

**HARD STOP before applying the change.**

1. **Name the data:** "This changes `<table>`. Existing rows: `<count, from a query>`. Environments: `<which databases>`."
2. **Ask the migration question:** what happens to existing rows?
   - (a) backfilled with a default, and the default is named and correct for old rows
   - (b) migrated by a script, and the script is shown
   - (c) old and new shapes kept side by side for a stated period, with a named reader of each
   - (d) losing the data is acceptable, confirmed in words
3. **Check deploy order:** code that can read both shapes ships before the data changes.
4. **Wait** until the answer is named.

## Suppression

- Data that is not persisted (in-memory, session-only, cache) or a type for in-flight request data
- A migration plan the operator already named in this session
- A brand new table with no rows in any environment, confirmed by the operator

## Override

- "(d) acceptable to lose", in words
- "migration written separately", with where it lives
- "no rows yet in any environment"

No override for "we'll figure out the migration later".
