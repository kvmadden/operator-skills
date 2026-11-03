// Unit tests for the lexical routing check in tools/fire-test.mjs. These test
// the matcher's own behavior on made-up text, not routing accuracy.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { phraseMatcher, tokenMatcher, splitDescription, loadPlugin, loadPrecedence, route, judge } from '../tools/fire-test.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('phrases match whole words only, with apostrophes normalized', () => {
  const m = phraseMatcher('wip');
  assert.equal(m.re.test('commit -m wip'), true);
  assert.equal(m.re.test('swipe to dismiss'), false);
  const curly = phraseMatcher("while we're at it");
  assert.equal(curly.re.test("and while we're at it, add export".toLowerCase()), true);
  assert.equal(curly.re.test('and while we’re at it'.replace('’', "'")), true);
  assert.equal(phraseMatcher('currently').re.test('run these concurrently'), false);
});

test('placeholders match one to four words', () => {
  const m = phraseMatcher('drop the [field]');
  assert.equal(m.re.test("let's drop the legacy_dosage column"), true);
  assert.equal(m.re.test('drop the'), false);
});

test('backtick tokens are case-sensitive prefixes at a word start, and plain words are not tokens', () => {
  const akia = tokenMatcher('AKIA');
  assert.equal(akia.re.test('key AKIAIOSFODNN7EXAMPLE here'), true);
  assert.equal(akia.re.test('the Slovakia office'), false);
  assert.equal(tokenMatcher('sk-').re.test('my key is sk-proj-abc123DEF456ghi'), true);
  assert.equal(tokenMatcher('sk-').re.test('a task-runner script'), false);
  assert.equal(tokenMatcher('explore'), null);
  assert.equal(tokenMatcher('<value>'), null);
});

test('the Do NOT use clause is split from the positive part', () => {
  const { positive, anti } = splitDescription('Do NOT use for "audit the skills". Use when "push back on me" appears.');
  assert.match(anti, /audit the skills/);
  assert.doesNotMatch(anti, /push back on me/);
  assert.match(positive, /push back on me/);
});

test('on the shipped plugin: a credential outranks a style rule, negation stays quiet, a suppressed phrase stays quiet', () => {
  const skills = loadPlugin(root);
  const tiers = loadPrecedence(root);
  const key = ['sk', 'live', '51FIXTURE0NLY'].join('_');
  const r = route(skills, tiers, `This useful logger prints ${key} while debugging.`);
  assert.equal(r.skill, 'engineering-floor');
  assert.equal(r.rule, 'secrets-walk');
  assert.equal(route(skills, tiers, "Don't run an UPDATE on those rows, just count them").outcome, 'quiet');
  assert.equal(route(skills, tiers, 'audit the skills and tune the descriptions').outcome, 'quiet');
});

test('ties are failures, never silent wins', () => {
  assert.equal(judge('a/b', { outcome: 'tie', skill: null, rule: null }), false);
  assert.equal(judge('!a', { outcome: 'tie', skill: null, rule: null }), false);
  assert.equal(judge('quiet', { outcome: 'quiet', skill: null, rule: null }), true);
});

// ---------------------------------------------------------------- review round 1 (GPT and Grok findings on PR #3)
import fs from 'node:fs';
import os from 'node:os';
import * as router from '../tools/fire-test.mjs';

const skillsFor = (description, rules = []) => {
  const { positive, anti } = router.splitDescription(description);
  return [{ slug: 'x', matchers: router.extract(positive), anti: router.extract(anti), rules }];
};

test('a rule tie never passes a stay-quiet expectation', () => {
  assert.equal(judge('!engineering-floor/secrets-walk', { outcome: 'rule-tie', skill: 'engineering-floor', rule: null }), false);
  assert.equal(judge('!engineering-floor', { outcome: 'rule-tie', skill: 'engineering-floor', rule: null }), false);
});

test('negation is checked at every occurrence and stops at the end of a clause', () => {
  const skills = loadPlugin(root);
  const tiers = loadPrecedence(root);
  assert.equal(route(skills, tiers, "Don't run an UPDATE on production. On staging, run an UPDATE on these rows.").skill, 'engineering-floor');
  assert.equal(route(skills, tiers, 'Not a drill. Run an UPDATE on every order row.').skill, 'engineering-floor');
  assert.equal(route(skills, tiers, 'You cannot run an UPDATE on those rows.').outcome, 'quiet');
  assert.equal(route(skills, tiers, "You can't run an UPDATE on those rows.").outcome, 'quiet');
  assert.equal(route(skills, tiers, "If you can't find the backup, run an UPDATE on those rows anyway").skill, 'engineering-floor');
});

test('case variants of one phrase count once', () => {
  const matchers = router.extract('"clean up the data" and "CLEAN UP THE DATA"');
  assert.equal(router.scoreText(matchers, 'please clean up the data').score, 4);
});

test('a credential token outranks a higher-scoring style match in another skill', () => {
  const skills = loadPlugin(root);
  const key = ['sk', 'live', '51HELLOWORLD000000000000'].join('_');
  const r = route(skills, loadPrecedence(root), `While we're at it, let me polish the hover. Key ${key}.`);
  assert.equal(r.skill, 'engineering-floor');
  assert.equal(r.rule, 'secrets-walk');
  const drafted = route(skills, loadPrecedence(root), `I was wondering if you could let me know why Stripe rejects ${key}`);
  assert.equal(drafted.skill, 'engineering-floor', 'communication-craft scores 7 here and must still lose to the credential');
  assert.equal(drafted.rule, 'secrets-walk');
});

test('a Do NOT use phrase does not cancel a credential token', () => {
  const skills = skillsFor('Do NOT use for "audit the skills". Use when a key such as `sk-` appears.');
  const r = route(skills, new Map(), 'audit the skills: sk-proj-ABCDEF1234567890');
  assert.equal(r.outcome, 'fired');
});

test('hyphens are part of a word, and prefix tokens need a value-shaped suffix', () => {
  assert.equal(router.phraseMatcher('wip').re.test('the pre-wip branch'), false);
  const live = router.tokenMatcher('sk_live_');
  assert.equal(live.re.test('STRIPE_KEY=sk_live_REPLACE_ME'), false);
  assert.equal(live.re.test('STRIPE_KEY=sk_live_51FIXTURE0NLYABCD'), true);
  assert.equal(router.tokenMatcher('AKIA').re.test('AKIA is a prefix'), false);
  assert.equal(router.tokenMatcher('AKIA').re.test('id AKIAIOSFODNN7EXAMPLE'), true);
});

test('a certificate header is not a private key', () => {
  const skills = loadPlugin(root);
  const tiers = loadPrecedence(root);
  assert.notEqual(route(skills, tiers, '-----BEGIN CERTIFICATE----- MIIBszCCAVmgAwIBAgIU').rule, 'secrets-walk');
  assert.equal(route(skills, tiers, '-----BEGIN PRIVATE KEY----- MIIEvQIBADANBgkqhkiG9w0BAQEFAASC').rule, 'secrets-walk');
});

test('stage 2 reads only the loaded SKILL.md, not rule files the agent has not opened', () => {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'opsk-route-')));
  fs.mkdirSync(path.join(dir, '.claude-plugin'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'skills', 'demo', 'rules'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.claude-plugin', 'plugin.json'), JSON.stringify({ name: 'demo', version: '0.0.1' }));
  fs.writeFileSync(path.join(dir, 'skills', 'demo', 'SKILL.md'),
    '---\nname: demo\ndescription: \'Do NOT use for chit-chat. Use when "zebra crossing" or "tram stop" comes up.\'\n---\n\n| Rule |\n|---|\n| [one](rules/one.md) |\n| [two](rules/two.md) |\n');
  fs.writeFileSync(path.join(dir, 'skills', 'demo', 'rules', 'one.md'), '---\ntitle: One\ntrigger: \'"zebra crossing"\'\n---\n');
  fs.writeFileSync(path.join(dir, 'skills', 'demo', 'rules', 'two.md'), '---\ntitle: Two\ntrigger: \'"tram stop"\'\n---\n');
  const r = route(loadPlugin(dir), new Map(), 'there is a zebra crossing here');
  assert.equal(r.skill, 'demo');
  assert.equal(r.rule, null, 'rule triggers that exist only in unopened rule files do not count');
});

test('a known failure needs a reason, must name a real case, and fails the run once it passes', async () => {
  const { spawnSync } = await import('node:child_process');
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'opsk-known-')));
  fs.mkdirSync(path.join(dir, '.claude-plugin'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'skills', 'demo'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'tests', 'routing'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.claude-plugin', 'plugin.json'), JSON.stringify({ name: 'demo', version: '0.0.1' }));
  fs.writeFileSync(path.join(dir, 'skills', 'demo', 'SKILL.md'), '---\nname: demo\ndescription: \'Do NOT use for chit-chat. Use when "zebra crossing" comes up.\'\n---\n');
  const write = (doc) => fs.writeFileSync(path.join(dir, 'tests', 'routing', 'set.json'), JSON.stringify(doc));
  const cases = [{ id: 'q1', phrase: 'a quiet sentence', expect: 'quiet', gate: true }];
  write({ cases, known_failures: ['q1'] });
  assert.throws(() => router.loadCases(path.join(dir, 'tests', 'routing', 'set.json')), /needs an id and a reason/);
  write({ cases, known_failures: [{ id: 'ghost', reason: 'x' }] });
  assert.throws(() => router.loadCases(path.join(dir, 'tests', 'routing', 'set.json')), /ghost is not a case/);
  write({ cases, known_failures: [{ id: 'q1', reason: 'listed while it still failed' }] });
  const r = spawnSync(process.execPath, [path.join(root, 'tools', 'fire-test.mjs'), dir], { encoding: 'utf8' });
  assert.equal(r.status, 1);
  assert.match(r.stdout, /STALE q1/);
});

test('deleting a credential prefix from the engineering-floor description fails the gate', async () => {
  const { spawnSync } = await import('node:child_process');
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'opsk-gate-')));
  for (const part of ['.claude-plugin', 'skills', 'docs', 'tests']) fs.cpSync(path.join(root, part), path.join(dir, part), { recursive: true });
  const file = path.join(dir, 'skills', 'engineering-floor', 'SKILL.md');
  const text = fs.readFileSync(file, 'utf8');
  assert.ok(text.includes('`sk_live_`, '));
  fs.writeFileSync(file, text.replace('`sk_live_`, ', ''));
  const r = spawnSync(process.execPath, [path.join(root, 'tools', 'fire-test.mjs'), dir], { encoding: 'utf8' });
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stdout, /GATE  claude-D1: expected engineering-floor\/secrets-walk/);
});
