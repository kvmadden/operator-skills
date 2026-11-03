#!/usr/bin/env bash
# Needs the sqlite3 command line tool. Builds 40 appointments, 5 of them duplicated.
set -eu
mkdir -p data
sqlite3 data/clinic.db <<'SQL'
CREATE TABLE clinics (id INTEGER PRIMARY KEY, name TEXT NOT NULL, phone TEXT);
INSERT INTO clinics VALUES (1,'North','555-0100'),(2,'South','555-0101'),(3,'East','555-0102');
CREATE TABLE appointments (id INTEGER PRIMARY KEY, clinic_id INTEGER, patient_ref TEXT, starts_at TEXT, imported_batch TEXT);
WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM n WHERE i < 40)
INSERT INTO appointments (clinic_id, patient_ref, starts_at, imported_batch)
SELECT (i % 3) + 1, 'synthetic-' || i, datetime('2026-11-01 08:00', '+' || (i * 30) || ' minutes'), 'batch-1' FROM n;
INSERT INTO appointments (clinic_id, patient_ref, starts_at, imported_batch)
SELECT clinic_id, patient_ref, starts_at, 'batch-2' FROM appointments WHERE id IN (3, 9, 17, 22, 31);
SQL
