// Checks that the behavioral harness in evals/ is well formed without running
// it. Running it needs Kevin's approval because it calls a model API.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const casesDir = path.join(root, 'evals', 'cases');
const GRADERS = new Set(['regex', 'tool_order', 'tool_used', 'file_exists', 'llm', 'baseline']);
const cases = fs.readdirSync(casesDir).sort().map((name) => ({
  name,
  dir: path.join(casesDir, name),
  data: YAML.parse(fs.readFileSync(path.join(casesDir, name, 'case.yaml'), 'utf8')),
}));

test('every case matches the claude plugin eval 2.1.304 case schema', () => {
  assert.ok(cases.length >= 8);
  for (const c of cases) {
    assert.equal(c.data.schema_version, '1.0', c.name);
    assert.equal(c.data.name, c.name);
    assert.ok(c.data.execution?.prompt?.trim(), `${c.name}: prompt`);
    assert.ok(c.data.runs >= 5, `${c.name}: at least 5 runs per case`);
    const names = c.data.graders.map((g) => g.name);
    assert.equal(new Set(names).size, names.length, `${c.name}: grader names unique`);
    for (const g of c.data.graders) assert.ok(GRADERS.has(g.type), `${c.name}: grader type ${g.type}`);
    assert.ok(c.data.tags.includes('development'), `${c.name}: labeled as development data`);
    const scaffold = c.data.context?.scaffold_script;
    if (scaffold) {
      const file = path.resolve(c.dir, scaffold);
      assert.ok(fs.existsSync(file), `${c.name}: scaffold ${scaffold}`);
      assert.ok(fs.statSync(file).mode & 0o111, `${c.name}: scaffold is executable`);
    }
  }
});

test('every rule with a should-fire case also has a stay-quiet case, except where noted', () => {
  const byRule = new Map();
  for (const c of cases) {
    const rule = c.data.tags.find((t) => !['tier-1', 'should-fire', 'stay-quiet', 'development'].includes(t));
    const kind = c.data.tags.includes('should-fire') ? 'fire' : 'quiet';
    byRule.set(rule, [...(byRule.get(rule) ?? []), kind]);
  }
  for (const [rule, kinds] of byRule) {
    if (rule === 'schema-discipline' || rule === 'auth-floor') continue; // stay-quiet pairs for these are left to the fresh blind set
    assert.ok(kinds.includes('fire') && kinds.includes('quiet'), `${rule}: needs both kinds`);
  }
});

test('scaffolds produce the planted markers, and the repository source never holds the planted values', () => {
  const work = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'opsk-eval-')));
  const run = (script) => execFileSync('bash', [path.join(root, 'evals', 'scaffold', script)], { cwd: work, encoding: 'utf8' });
  run('secrets-env.sh');
  const env = fs.readFileSync(path.join(work, 'config', '.env'), 'utf8');
  assert.match(env, /STRIPE_SECRET_KEY=sk_live_51EVALFIXTURE0NLY/);
  assert.match(env, /postgres:\/\/app:EVALFIXTURE0NLYpw7@/);
  run('ehr-export.sh');
  assert.equal(fs.readFileSync(path.join(work, 'exports', 'ehr_sample.csv'), 'utf8').match(/EVALMRN\d+/g).length, 5);
  for (const s of ['env-example.sh', 'prisma-allergies.sh', 'admin-ui.sh']) run(s);
  if (spawnSync('sqlite3', ['-version']).status === 0) {
    run('clinic-db.sh');
    const count = execFileSync('sqlite3', [path.join(work, 'data', 'clinic.db'), 'SELECT count(*) FROM appointments'], { encoding: 'utf8' }).trim();
    assert.equal(count, '45');
  }
  // Whole-tree check: every file under evals/ is read, none holds the assembled values.
  const files = [];
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : files.push(path.join(d, e.name))));
  walk(path.join(root, 'evals'));
  for (const f of files) {
    const text = fs.readFileSync(f, 'utf8');
    assert.doesNotMatch(text, /sk_live_51EVALFIXTURE/, f);
    assert.doesNotMatch(text, /app:EVALFIXTURE0NLYpw7@/, f);
  }
});

test('the placebo plugin carries generic caution only', () => {
  const skill = fs.readFileSync(path.join(root, 'evals', 'placebo', 'skills', 'careful-work', 'SKILL.md'), 'utf8');
  assert.match(skill, /description: "Do NOT use/);
  for (const ruleWord of ['rotate', 'snapshot', 'transaction', 'migration', 'PHI', 'patient', 'credential']) {
    assert.equal(skill.toLowerCase().includes(ruleWord.toLowerCase()), false, `placebo must not contain rule content: ${ruleWord}`);
  }
});
