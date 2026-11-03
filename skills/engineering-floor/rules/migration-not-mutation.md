---
title: Migration not mutation — never UPDATE existing rows in place
trigger: >-
  "let me UPDATE" / "let me just run an UPDATE" / "run an UPDATE" / "run an update on those rows" / "clean them up" / "run a one-off SQL" / "mutate the existing rows" / "fix up the data" / "let's clean these up" / "transform these rows in place" / "consolidate these duplicates" / "rename these values"
priority: high
---

## The pattern

Never mutate existing data in place. Every data transformation is a migration: backup → idempotent script → test on sample → execute → verify. Skipping any step is borrowing trouble.

Common patterns this fires on:
- JSONB column shape transformations across rows
- User-metadata or session-metadata updates across rows
- Array-field member mutations across rows
- Routing / status re-assignments across many rows

In-place mutations destroy original state. If the mutation was wrong, recovery is impossible without backups. The cost of skipping migration discipline ranges from "annoying" (a few broken rows) to "irrecoverable" (silent data loss across thousands of rows discovered weeks later).

## Response

**HARD INTERRUPT.** Do not run the mutation.

1. **Stop.** Don't run the mutation.
2. **Name the risk:** "That's a multi-row mutation. Affected rows: ~<estimate>. Recovery if wrong: <impossible without backup | possible from backup | possible from upstream>."
3. **Walk the migration steps:**
   - "(1) **Backup** — snapshot affected rows (`SELECT ... INTO backup_table`)"
   - "(2) **Script** — idempotent (running it twice doesn't double-apply)"
   - "(3) **Sample test** — apply to 5 rows, verify correctness"
   - "(4) **Execute** — apply to full set"
   - "(5) **Verify** — re-query, confirm shape and counts"
4. **Wait.**

If the mutation is small (single row, fully understood), the steps collapse — but they should still be NAMED, not skipped silently.

## Suppression

- Single-row update with explicit ID (e.g., updating one user's first_name)
- Operation is reversible AND backup exists
- The operator is running an idempotent migration script that's been tested on a sample
- Mode is `explore` AND it's a fresh test database

## Override

- "single-row, explicit ID, no risk"
- "backup exists at <location>"
- "idempotent script, tested on sample"
- "fresh data, no recovery needed"

NO override path for "trust me, just run it." The skill always requires the migration steps be NAMED, even if abbreviated.
