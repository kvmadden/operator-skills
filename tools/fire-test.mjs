#!/usr/bin/env node
/**
 * Synthetic fire test — static-analysis regression test for the plugin's
 * dispatch logic.
 *
 * For each trigger phrase in tests/fire-test-phrases.json:
 *   1. Score every umbrella's description + promptSignals against the phrase
 *   2. Pick the highest-scoring umbrella as the predicted dispatch
 *   3. Within that umbrella, score every rule's trigger field
 *   4. Pick the highest-scoring rule as the predicted rule
 *   5. Compare predicted vs expected; report PASS / FAIL
 *
 * Also enforces regression-pin tests: phrases that must NOT dispatch to a
 * specific umbrella (e.g., "audit the skills" must never route to
 * claude-quality-watch).
 *
 * Run:  node tools/fire-test.mjs
 *       (from the plugin root, OR pass plugin root as arg)
 *
 * Exit code 0 = all pass, 1 = any failure (suitable for CI / pre-commit hooks)
 */

import fs from 'node:fs';
import path from 'node:path';

const PLUGIN_ROOT = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(process.cwd());
const TEST_FILE = path.join(PLUGIN_ROOT, 'tests', 'fire-test-phrases.json');
const SKILLS_DIR = path.join(PLUGIN_ROOT, 'skills');

if (!fs.existsSync(TEST_FILE)) {
  console.error(`✗ Test file not found: ${TEST_FILE}`);
  process.exit(2);
}
if (!fs.existsSync(SKILLS_DIR)) {
  console.error(`✗ Skills dir not found: ${SKILLS_DIR}`);
  process.exit(2);
}

// ────────────────────────────────────────────────────────────────────────────
// Frontmatter parsing (YAML-ish; tuned for our SKILL.md / rule shape)
// ────────────────────────────────────────────────────────────────────────────

function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const raw = match[1];
  const fm = { _raw: raw };

  // description field (often multi-line via | or > literal block)
  const descMatch = raw.match(/^description:\s*\|?\s*\n([\s\S]*?)(?=\n[a-z_][a-z_]*:|\n---|$)/m);
  if (descMatch) {
    fm.description = descMatch[1]
      .split('\n')
      .map((l) => l.replace(/^  /, ''))
      .join(' ')
      .trim();
  } else {
    const singleLine = raw.match(/^description:\s*(.+)$/m);
    if (singleLine) fm.description = singleLine[1].trim();
  }

  // name
  const nameMatch = raw.match(/^name:\s*(.+)$/m);
  if (nameMatch) fm.name = nameMatch[1].trim();

  // title (rule files)
  const titleMatch = raw.match(/^title:\s*(.+)$/m);
  if (titleMatch) fm.title = titleMatch[1].trim();

  // trigger (rule files)
  const triggerMatch = raw.match(/^trigger:\s*([\s\S]+?)(?=\n[a-z_][a-z_]*:|\n---|$)/m);
  if (triggerMatch) {
    fm.trigger = triggerMatch[1].replace(/\s+/g, ' ').trim();
  }

  // metadata.promptSignals.phrases (array of strings)
  const phrasesMatch = raw.match(/promptSignals:\s*\n\s+phrases:\s*\n([\s\S]+?)(?=\n[a-z_]|$)/);
  if (phrasesMatch) {
    const phrases = [];
    for (const line of phrasesMatch[1].split('\n')) {
      const m = line.match(/^\s*-\s*"?([^"]+?)"?\s*$/);
      if (m) phrases.push(m[1]);
    }
    fm.promptPhrases = phrases;
  } else {
    fm.promptPhrases = [];
  }

  return fm;
}

// ────────────────────────────────────────────────────────────────────────────
// Load plugin state
// ────────────────────────────────────────────────────────────────────────────

const umbrellas = [];

for (const slug of fs.readdirSync(SKILLS_DIR)) {
  const skillMd = path.join(SKILLS_DIR, slug, 'SKILL.md');
  if (!fs.existsSync(skillMd)) continue;

  const content = fs.readFileSync(skillMd, 'utf-8');
  const fm = extractFrontmatter(content);

  const rules = [];
  const rulesDir = path.join(SKILLS_DIR, slug, 'rules');
  if (fs.existsSync(rulesDir)) {
    for (const ruleFile of fs.readdirSync(rulesDir)) {
      if (!ruleFile.endsWith('.md')) continue;
      const ruleContent = fs.readFileSync(path.join(rulesDir, ruleFile), 'utf-8');
      const ruleFm = extractFrontmatter(ruleContent);
      rules.push({
        slug: path.basename(ruleFile, '.md'),
        title: ruleFm.title || '',
        trigger: ruleFm.trigger || '',
      });
    }
  }

  umbrellas.push({
    slug,
    description: fm.description || '',
    promptPhrases: fm.promptPhrases || [],
    rules,
  });
}

console.log(`Loaded ${umbrellas.length} top-level skills.\n`);

// ────────────────────────────────────────────────────────────────────────────
// Scoring
// ────────────────────────────────────────────────────────────────────────────

function scoreUmbrellaForPhrase(testPhrase, umbrella) {
  const phrase = testPhrase.toLowerCase();
  let score = 0;
  const matchedSignals = [];
  const matchedAntiSignals = [];

  // 1) Exact-match against promptSignals.phrases (high weight)
  for (const sig of umbrella.promptPhrases) {
    if (sig && phrase.includes(sig.toLowerCase())) {
      score += 10;
      matchedSignals.push(sig);
    }
  }

  // 2) Substring matches against the description text (medium weight)
  //    But ONLY before any "Do NOT use" — text after that is anti-trigger.
  const desc = umbrella.description.toLowerCase();
  const doNotUseIdx = desc.indexOf('do not use');
  const triggerSpan = doNotUseIdx > -1 ? desc.substring(0, doNotUseIdx) : desc;
  const antiTriggerSpan = doNotUseIdx > -1 ? desc.substring(doNotUseIdx) : '';

  // Find quoted phrases in description that match
  const quotedPhrases = [...triggerSpan.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  for (const q of quotedPhrases) {
    if (q.length > 3 && phrase.includes(q.toLowerCase())) {
      score += 8;
      matchedSignals.push(q);
    }
  }

  // 3) Anti-trigger PENALTY — phrases in "Do NOT use for X" reduce score
  const antiQuoted = [...antiTriggerSpan.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  for (const aq of antiQuoted) {
    if (aq.length > 3 && phrase.includes(aq.toLowerCase())) {
      score -= 15;
      matchedAntiSignals.push(aq);
    }
  }

  return { score, matchedSignals, matchedAntiSignals };
}

function scoreRuleForPhrase(testPhrase, rule) {
  if (!rule.trigger) return 0;
  const phrase = testPhrase.toLowerCase();
  const trigger = rule.trigger.toLowerCase();

  // Score by quoted phrase + slash-split parts
  let score = 0;
  const quoted = [...trigger.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  for (const q of quoted) {
    if (q.length > 3 && phrase.includes(q.toLowerCase())) score += 5;
  }

  // Also try slash-separated alternatives
  const parts = trigger.split(/[\/,;]+/);
  for (const p of parts) {
    const clean = p.replace(/["']/g, '').trim();
    if (clean.length > 3 && phrase.includes(clean.toLowerCase())) {
      score += 3;
    }
  }

  return score;
}

function predictDispatch(testPhrase) {
  const scored = umbrellas
    .map((u) => ({
      umbrella: u,
      ...scoreUmbrellaForPhrase(testPhrase, u),
    }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return {
      predicted_umbrella: null,
      predicted_umbrella_score: 0,
      predicted_rule: null,
      predicted_rule_score: 0,
      top_3: [],
      matched_signals: [],
      matched_anti_signals: [],
    };
  }

  const top = scored[0];
  const rulesScored = top.umbrella.rules
    .map((r) => ({ rule: r, score: scoreRuleForPhrase(testPhrase, r) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return {
    predicted_umbrella: top.umbrella.slug,
    predicted_umbrella_score: top.score,
    predicted_rule: rulesScored[0]?.rule.slug || null,
    predicted_rule_score: rulesScored[0]?.score || 0,
    top_3: scored.slice(0, 3).map((s) => ({ slug: s.umbrella.slug, score: s.score })),
    matched_signals: top.matchedSignals,
    matched_anti_signals: top.matchedAntiSignals,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Run tests
// ────────────────────────────────────────────────────────────────────────────

const tests = JSON.parse(fs.readFileSync(TEST_FILE, 'utf-8'));
console.log(`═══ Fire Test ═══\n`);
console.log(`Loaded ${tests.phrases.length} dispatch tests + ${(tests.regressions || []).length} regression pins.\n`);

let passed = 0;
let failed = 0;
const failures = [];

for (const test of tests.phrases) {
  const pred = predictDispatch(test.phrase);
  const umbrellaMatch = pred.predicted_umbrella === test.expected_umbrella;
  const ruleMatch = pred.predicted_rule === test.expected_rule;

  if (umbrellaMatch && ruleMatch) {
    passed++;
    console.log(`✓ PASS  [${test.id}]`);
    console.log(`   "${test.phrase.substring(0, 70)}${test.phrase.length > 70 ? '…' : ''}"`);
    console.log(`   → ${pred.predicted_umbrella} / ${pred.predicted_rule}`);
  } else {
    failed++;
    failures.push({ test, pred });
    console.log(`✗ FAIL  [${test.id}]`);
    console.log(`   Phrase:    "${test.phrase.substring(0, 70)}${test.phrase.length > 70 ? '…' : ''}"`);
    console.log(`   Expected:  ${test.expected_umbrella} / ${test.expected_rule}`);
    console.log(`   Predicted: ${pred.predicted_umbrella || 'NONE'} / ${pred.predicted_rule || 'NONE'}`);
    if (pred.top_3) {
      console.log(`   Top 3:     ${pred.top_3.map((t) => `${t.slug}=${t.score}`).join(', ')}`);
    }
    if (pred.matched_signals.length > 0) {
      console.log(`   Matched signals: ${pred.matched_signals.join(', ')}`);
    }
    if (test.notes) console.log(`   Notes: ${test.notes}`);
  }
  console.log('');
}

// Regression pins
let regressionsPassed = 0;
let regressionsFailed = 0;
if (tests.regressions) {
  console.log(`═══ Regression pins ═══\n`);
  for (const reg of tests.regressions) {
    const pred = predictDispatch(reg.phrase);
    const violates = (reg.must_NOT_dispatch_to || []).includes(pred.predicted_umbrella);
    const meetsRequired = !reg.must_dispatch_to || pred.predicted_umbrella === reg.must_dispatch_to;

    if (!violates && meetsRequired) {
      regressionsPassed++;
      console.log(`✓ PIN HELD  [${reg.id}]`);
      console.log(`   Predicted: ${pred.predicted_umbrella} (not in forbidden list)`);
    } else {
      regressionsFailed++;
      console.log(`✗ PIN BROKEN  [${reg.id}]`);
      console.log(`   Phrase: "${reg.phrase}"`);
      console.log(`   Must NOT dispatch to: ${(reg.must_NOT_dispatch_to || []).join(', ')}`);
      if (reg.must_dispatch_to) {
        console.log(`   Must dispatch to: ${reg.must_dispatch_to}`);
      }
      console.log(`   Predicted: ${pred.predicted_umbrella || 'NONE'}`);
      if (reg.notes) console.log(`   Notes: ${reg.notes}`);
    }
    console.log('');
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Summary
// ────────────────────────────────────────────────────────────────────────────

console.log(`═══ Summary ═══`);
console.log(`Dispatch tests:    ${passed}/${passed + failed} passed`);
if (tests.regressions) {
  console.log(`Regression pins:   ${regressionsPassed}/${regressionsPassed + regressionsFailed} held`);
}

const totalFailed = failed + regressionsFailed;
if (totalFailed === 0) {
  console.log(`\n✓ ALL TESTS PASSED — plugin dispatch logic intact.`);
  process.exit(0);
} else {
  console.log(`\n✗ ${totalFailed} test(s) FAILED — investigate before shipping.`);
  console.log(`\nHint: failures often mean a recent edit broke trigger coverage.`);
  console.log(`      Check the failing umbrellas' description + promptSignals.phrases.`);
  process.exit(1);
}
