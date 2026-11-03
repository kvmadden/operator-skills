---
title: Migration not mutation. No bulk change to existing data without a snapshot, a transaction and a check
trigger: >-
  about to change or delete many existing rows, at the operator's request or by Claude's own plan: "run an UPDATE", "delete these rows", "clean up the data", "fix up the data", "dedupe these", "normalize these values", "backfill", "consolidate these duplicates", "rename these values", "mutate the existing rows", "transform these rows in place", "run a one-off SQL", a statement with `UPDATE`, `DELETE`, `TRUNCATE`, `MERGE` or an upsert, or an ORM bulk call such as `updateMany`, `deleteMany`, `bulk_update`, `update_all` or `delete_all`, run through psql, a database tool, an MCP server or application code
priority: high
---

## The pattern

Changing existing rows in place destroys the old values. If the change is wrong, only a backup brings them back. This covers UPDATE, DELETE, TRUNCATE, MERGE and upserts, ORM bulk calls, and statements Claude decides to run on its own, not only the ones the operator asks for.

The rule is not "never change data". It is: no bulk change without a way back and a check that it did what was intended.

## Response

**HARD STOP before running the statement.**

1. **Name the target and the scale:** which database and environment (never assume it is not production), which table, how many rows (run `SELECT count(*)` with the same condition first), and what else the change reaches: rows that `ON DELETE CASCADE` or `ON UPDATE CASCADE` will change in other tables, triggers that write elsewhere, and reports or services that read these values.
2. **Walk the steps:**
   - (1) **Fix the target set and snapshot it in the same transaction as the change.** A count or a copy taken earlier with the same `WHERE` clause can miss rows another writer changes in between. Inside one transaction: select the primary keys of the target rows and lock them (`SELECT ... FOR UPDATE` on PostgreSQL and MySQL InnoDB, or a serializable transaction), copy those rows into a backup table, then change only those keys. Copy the dependent rows that cascades or triggers will change too, or confirm a restorable backup that covers them and where it is. On MySQL, create the empty backup table before the transaction (`CREATE TABLE backup_orders_20261103 LIKE orders`), because `CREATE TABLE ... AS SELECT` commits on its own there, then `INSERT INTO backup_orders_20261103 SELECT ...` inside it. On SQL Server, `SELECT ... INTO backup_table` inside the transaction works. Keep the snapshot inside the database or an approved backup location, never in a file in the repository, a notes file or a log, because the rows can hold patient data or credentials (`phi-floor` and `secrets-walk` still apply).
   - (2) **Write it idempotent:** running it twice must not change the result again.
   - (3) **Use the transaction** where the database supports one: after the statement, check the affected row count against the number of captured keys and look at a sample, then `COMMIT` or `ROLLBACK`. Know the statement that restores the rows from the snapshot before you commit. TRUNCATE can be rolled back on PostgreSQL and SQL Server, but on MySQL and Oracle it commits at once and cannot be rolled back, so the snapshot must be complete and checked before it runs.
   - (4) **Try a small sample first**, for example five rows by primary key, and look at them.
   - (5) **Run the full set**, then re-query counts and a sample.
3. **Wait** for the operator to agree to the plan before running anything.

For one row identified by its primary key, the steps shrink to naming the row and its current value. They are still named.

## Suppression

- One row identified by its primary key, with its current value shown first
- A tested, idempotent migration script that already takes a snapshot and uses a transaction, run as written
- A disposable local or test database that the operator has named as disposable

## Override

- "backup exists at <location>" with the row count: proceed inside a transaction and check the result
- "disposable database": proceed, and say so in the summary

No override skips naming the steps. "Trust me, just run it" gets the steps in one line, then a wait.
