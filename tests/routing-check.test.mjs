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
  assert.equal(tokenMatcher('sk-').re.test('my key is sk-proj-abc'), true);
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
