// Content checks for rule text that review found wrong or unsafe. Each one
// reads the whole rule file, so a pass is a claim about the full text.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const section = (text, name) => (text.split(new RegExp(`^## ${name}\\s*$`, 'm'))[1] ?? '').split(/^## /m)[0];
const rule = (skill, slug) => read(`skills/${skill}/rules/${slug}.md`);

test('precedence: every matching tier 1 floor responds in the same turn, and solo-run logging and debrief are not tier 1', () => {
  const doc = read('docs/PRECEDENCE.md');
  const tier1 = doc.split('\n').find((l) => /^\|\s*1\s*\|/.test(l));
  assert.match(doc, /every tier 1 rule that matches responds in the same turn/i);
  assert.match(doc, /one correction per turn applies to tiers 2 to 4/i);
  assert.doesNotMatch(tier1, /solo-run-log|solo-run-debrief/);
  assert.match(tier1, /solo-run-checklist/);
  assert.match(tier1, /solo-run-contract/);
});

test('auth-floor has no sketch or throwaway bypass', () => {
  assert.doesNotMatch(section(rule('engineering-floor', 'auth-floor'), 'Suppression'), /sketch|throwaway|explore/i);
});

test('phi-floor does not present replaced identifiers as de-identification', () => {
  const text = rule('engineering-floor', 'phi-floor');
  assert.doesNotMatch(text, /every identifier replaced/);
  assert.match(text, /generated/i);
  assert.match(text, /approved de-identification/i);
  assert.match(text, /Expert Determination/);
});

test('accessibility-floor states the WCAG 2.2 spacing test both ways and 2.4.11 correctly', () => {
  const text = rule('engineering-floor', 'accessibility-floor');
  assert.match(text, /circle of another undersized target/i);
  assert.match(text, /not entirely hidden/i);
});

test('schema-discipline qualifies the PostgreSQL NOT NULL steps by version', () => {
  const text = rule('engineering-floor', 'schema-discipline');
  assert.match(text, /PostgreSQL 18/);
  assert.match(text, /CHECK \(\w+ IS NOT NULL\) NOT VALID/);
  assert.match(text, /SET NOT NULL/);
});

test('migration-not-mutation snapshots the rows actually changed, in the same transaction', () => {
  const text = rule('engineering-floor', 'migration-not-mutation');
  assert.match(text, /same transaction/i);
  assert.match(text, /primary keys/i);
  assert.match(text, /cascade/i);
  assert.match(text, /trigger/i);
  assert.match(text, /TRUNCATE[^\n]*MySQL/);
});

test('secrets-walk names a private key header, searches history by prefix, and lists the missing prefixes', () => {
  const text = rule('engineering-floor', 'secrets-walk');
  const trigger = text.split('\n---')[0];
  assert.match(trigger, /`PRIVATE KEY-----`/);
  assert.doesNotMatch(trigger, /`-----BEGIN`/);
  for (const prefix of ['rk_test_', 'ghu_', 'ghr_', 'whsec_', 'sk-admin-']) assert.match(trigger, new RegExp(prefix));
  assert.doesNotMatch(text, /`git log -p -S/, 'the history search must not print every copy of the value');
  assert.match(text, /git log --all --oneline --name-only -S/);
  assert.match(text, /prefix of the value/i);
});

test('solo-run-log checks solo-run mode before writing and limits the five-minute rule to cadence logs', () => {
  const steps = section(rule('solo-run', 'solo-run-log'), 'Response');
  const verify = steps.indexOf('Verify mode is solo-run');
  const stops = steps.indexOf('Stop conditions come first');
  assert.ok(verify >= 0 && stops > verify, 'the mode check comes before any write');
  assert.match(steps, /If <5 min, suppress cadence logs only/);
});

test('no SKILL.md still carries the old trigger catalogue', () => {
  for (const dir of fs.readdirSync(path.join(root, 'skills'))) {
    assert.doesNotMatch(read(`skills/${dir}/SKILL.md`), /^## Trigger catalogue/m, dir);
  }
});
