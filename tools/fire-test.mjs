#!/usr/bin/env node
// Lexical routing check for operator-skills.
//
// What this is: a lint that asks whether the text Claude Code can actually see
// points a phrase at the intended skill and rule, and stays quiet otherwise.
// What it is not: a measure of how Claude Code routes. Claude Code chooses
// skills semantically from each skill's name and description. A pass here
// shows the visible text contains the right words, nothing more.
//
// Stage 1 (skill): scores only the skill listing text Claude Code 2.1.304
// shows the model: name plus description (plus when_to_use), cut at 1,536
// characters. Nothing in metadata is read, because Claude Code does not read it.
// Stage 2 (rule): scores only the chosen skill's SKILL.md, which is what the
// model has after loading the skill: its rule table and its generated rule
// trigger table. Rule files are not read, because the model has not opened
// them yet. Precedence tiers from docs/PRECEDENCE.md decide between rules.
//
// Precedence: every tier 1 rule that matches responds, so a skill whose loaded
// text matches a tier 1 rule outranks a skill that only matches style rules,
// and the result lists every matching tier 1 rule.
//
// Matching: double-quoted phrases match whole words (letters, digits,
// underscore and hyphen count as word characters), case-insensitively, with
// curly quotes and apostrophes normalized, and [X], <x> or a lone X, Y or Z
// matching one to four words. A phrase counts once however often or in
// whatever case it appears, and only if at least one occurrence is not negated
// within its own clause (don't, do not, never, not, cannot, can't, won't,
// avoid, without, up to two words before the phrase, where a clause ends at
// . ! ? ; : or a comma). Tokens are never negated: a key in the text is
// exposed whatever the sentence around it says. Backtick spans that are not plain lowercase words (for
// example `sk_live_` or `AKIA`) are case-sensitive prefixes that must start at
// a word boundary and, when they end like a key prefix, be followed by at
// least ten key characters including a digit, so `sk_live_REPLACE_ME` does
// not count. A quoted phrase inside the "Do NOT use" sentence suppresses the
// skill's phrase score, never its tokens. A skill fires at a score of 2 or
// more. A tie for first place is reported as a tie and counts as a failure.
//
// Data status: every case file this script reads was seen while the
// descriptions were being changed, so all of it is development data. Numbers
// from it are development results, never a headline. See docs/EVALUATION.md.
//
// Usage: node tools/fire-test.mjs [--json] [plugin-root]
// Exit 1 when a case marked "gate": true fails and is not listed in that
// file's known_failures, or when a listed known failure passes. Every other
// case is reported, not gated.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

export const LISTING_CAP = 1536;
export const FIRE_THRESHOLD = 2;

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const rootArg = args.find((a) => !a.startsWith('--'));

function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!m) return { data: {}, body: text };
  return { data: YAML.parse(m[1]) ?? {}, body: text.slice(m[0].length) };
}

export function normalize(s) {
  return String(s).replace(/[‘’‛′]/g, "'").replace(/[“”‟″]/g, '"').replace(/\s+/g, ' ');
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const WORD = '[\\p{L}\\p{N}_-]';
const KEY_SUFFIX = '(?=[A-Za-z0-9_-]*[0-9])[A-Za-z0-9_-]{10,}';

// Builds a matcher for a quoted phrase: whole words, wildcards for placeholders.
export function phraseMatcher(raw) {
  const phrase = normalize(raw).trim();
  const words = phrase.split(' ').filter(Boolean);
  if (!words.length) return null;
  const parts = words.map((w) => (/^(\[[^\]]*\]|<[^>]*>|[XYZ])$/.test(w) ? '\\S+(?:\\s+\\S+){0,3}' : escapeRe(w.toLowerCase())));
  const left = /^[\p{L}\p{N}_]/u.test(phrase) ? `(?<!${WORD})` : '';
  const right = /[\p{L}\p{N}_]$/u.test(phrase) ? `(?!${WORD})` : '';
  return { key: `p:${phrase.toLowerCase()}`, raw, weight: words.length, re: new RegExp(`${left}${parts.join('\\s+')}${right}`, 'u'), lower: true, token: false };
}

// Builds a matcher for a backtick token: case-sensitive prefix at a word start.
export function tokenMatcher(raw) {
  const token = raw.trim();
  if (!token || /^[a-z]+(?:-[a-z]+)*$/.test(token)) return null; // plain words such as `explore`
  if (/[<>]|\.\.\./.test(token)) return null; // templates such as `<value>` or `eyJ...`
  const left = /^[\p{L}\p{N}_]/u.test(token) ? `(?<!${WORD})` : '';
  const keyPrefix = /^[A-Za-z][A-Za-z0-9_-]*$/.test(token) && !token.endsWith('-----');
  const suffix = keyPrefix ? KEY_SUFFIX : '';
  return { key: `t:${token}`, raw, weight: 2, re: new RegExp(`${left}${escapeRe(token)}${suffix}`, 'u'), lower: false, token: true };
}

export function extract(text) {
  const t = normalize(text).replace(/\\\|/g, '|');
  const quoted = [...t.matchAll(/"([^"]{2,120})"/g)].map((m) => phraseMatcher(m[1])).filter(Boolean);
  const tokens = [...t.matchAll(/`([^`]{2,60})`/g)].map((m) => tokenMatcher(m[1])).filter(Boolean);
  return [...quoted, ...tokens];
}

// Splits a description into its "Do NOT use" sentence and the rest.
export function splitDescription(listing) {
  const t = normalize(listing);
  const m = t.match(/\bdo not use\b[\s\S]*?(?:\.(?=\s|$)|$)/i);
  if (!m) return { positive: t, anti: '' };
  return { positive: t.slice(0, m.index) + t.slice(m.index + m[0].length), anti: m[0] };
}

const NEGATION = /(?:^|\s)(?:don't|dont|do not|never|not|cannot|can't|can not|won't|wont|avoid|without)(?:\s+\S+){0,2}\s*$/;

function negated(text, index) {
  const before = text.slice(0, index);
  const clauseStart = Math.max(before.lastIndexOf('. '), before.lastIndexOf('! '), before.lastIndexOf('? '),
    before.lastIndexOf('; '), before.lastIndexOf(': '), before.lastIndexOf(', '), before.lastIndexOf('\n'));
  return NEGATION.test(before.slice(clauseStart + 1));
}

// Scores a phrase against matchers. Each matcher counts once, if any of its
// occurrences is not negated (tokens are never treated as negated).
export function scoreText(matchers, phrase) {
  const lower = normalize(phrase).toLowerCase();
  const exact = normalize(phrase);
  const hits = new Map();
  for (const m of matchers) {
    if (hits.has(m.key)) continue;
    const text = m.lower ? lower : exact;
    for (const found of text.matchAll(new RegExp(m.re.source, 'gu'))) {
      if (m.token || !negated(text, found.index)) {
        hits.set(m.key, { weight: m.weight, token: m.token });
        break;
      }
    }
  }
  const values = [...hits.values()];
  return {
    score: values.reduce((a, b) => a + b.weight, 0),
    tokenScore: values.filter((v) => v.token).reduce((a, b) => a + b.weight, 0),
    hits: [...hits.keys()],
  };
}

export function loadPrecedence(root) {
  const file = path.join(root, 'docs', 'PRECEDENCE.md');
  const tiers = new Map();
  if (!fs.existsSync(file)) return tiers;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\|\s*(\d+)\s*\|/);
    if (!m) continue;
    for (const slug of line.matchAll(/`([a-zA-Z0-9-]+)`/g)) if (!tiers.has(slug[1])) tiers.set(slug[1], Number(m[1]));
  }
  return tiers;
}

export function loadPlugin(root) {
  const plugin = JSON.parse(fs.readFileSync(path.join(root, '.claude-plugin', 'plugin.json'), 'utf8'));
  const skills = [];
  for (const dir of fs.readdirSync(path.join(root, 'skills')).sort()) {
    const file = path.join(root, 'skills', dir, 'SKILL.md');
    if (!fs.existsSync(file)) continue;
    const { data, body } = frontmatter(fs.readFileSync(file, 'utf8'));
    let listing = data.when_to_use ? `${data.description} - ${data.when_to_use}` : String(data.description ?? '');
    if (listing.length > LISTING_CAP) listing = `${listing.slice(0, LISTING_CAP - 1)}…`;
    const { positive, anti } = splitDescription(listing);
    const rules = [];
    const linked = [...new Set([...body.matchAll(/\]\(rules\/([^)]+)\.md\)/g)].map((m) => m[1]))];
    for (const slug of linked.sort()) {
      const rows = body.split('\n').filter((l) => l.startsWith('|') && l.includes(`(rules/${slug}.md)`)).join(' ');
      rules.push({ slug, matchers: extract(rows) });
    }
    skills.push({ slug: dir, name: `${plugin.name}:${dir}`, matchers: extract(positive), anti: extract(anti), rules });
  }
  return skills;
}

function pickRule(skill, tiers, phrase) {
  const rules = skill.rules.map((r) => ({ r, ...scoreText(r.matchers, phrase), tier: tiers.get(r.slug) ?? 9 }))
    .filter((x) => x.score > 0)
    .sort((a, b) => a.tier - b.tier || b.score - a.score || a.r.slug.localeCompare(b.r.slug));
  const tier1 = rules.filter((x) => x.tier === 1).map((x) => x.r.slug);
  if (!rules.length) return { rule: null, tie: false, tier1 };
  if (rules.length > 1 && rules[1].tier === rules[0].tier && rules[1].score === rules[0].score && rules[0].tier !== 1) {
    return { rule: null, tie: true, tier1, ruleTop: rules.slice(0, 2).map((x) => x.r.slug) };
  }
  return { rule: rules[0].r.slug, tie: false, tier1 };
}

export function route(skills, tiers, phrase) {
  const scored = skills.map((s) => {
    const blocked = scoreText(s.anti, phrase).hits.length > 0;
    const own = scoreText(s.matchers, phrase);
    const score = blocked ? own.tokenScore : own.score;
    return { s, score, picked: score >= FIRE_THRESHOLD ? pickRule(s, tiers, phrase) : null };
  }).filter((x) => x.score >= FIRE_THRESHOLD)
    .sort((a, b) => (b.picked.tier1.length > 0) - (a.picked.tier1.length > 0) || b.score - a.score || a.s.slug.localeCompare(b.s.slug));
  if (!scored.length) return { outcome: 'quiet', skill: null, rule: null, tier1: [], top: [] };
  const top = scored.map((x) => `${x.s.slug}=${x.score}`).slice(0, 3);
  const tier1 = [...new Set(scored.flatMap((x) => x.picked.tier1))];
  const first = scored[0];
  const second = scored[1];
  if (second && second.score === first.score && (second.picked.tier1.length > 0) === (first.picked.tier1.length > 0)) {
    return { outcome: 'tie', skill: null, rule: null, tier1, top };
  }
  if (first.picked.tie) return { outcome: 'rule-tie', skill: first.s.slug, rule: null, tier1, top, ruleTop: first.picked.ruleTop };
  return { outcome: 'fired', skill: first.s.slug, rule: first.picked.rule, tier1, top };
}

// expect: "quiet", "skill", "skill/rule", "!skill" or "!skill/rule".
// A tie of either kind fails every expectation. A tier 1 rule passes when it
// is the chosen rule or any other tier 1 rule that responds in the same turn.
export function judge(expect, result) {
  if (result.outcome === 'tie' || result.outcome === 'rule-tie') return false;
  const got = result.skill ? `${result.skill}/${result.rule ?? '(no rule)'}` : result.outcome;
  if (expect === 'quiet') return result.outcome === 'quiet';
  if (expect.startsWith('!')) {
    const not = expect.slice(1);
    if (not.includes('/')) {
      const [skill, rule] = not.split('/');
      return got !== not && !(result.skill === skill && (result.tier1 ?? []).includes(rule));
    }
    return result.skill !== not;
  }
  if (result.outcome !== 'fired') return false;
  if (!expect.includes('/')) return result.skill === expect;
  const [skill, rule] = expect.split('/');
  return got === expect || (result.skill === skill && (result.tier1 ?? []).includes(rule));
}

// known_failures entries are {id, reason}. A bare id, an id that is not a
// case, and a listed case that now passes are all errors, so the list
// cannot quietly hide a gated case or go stale.
export function loadCases(file) {
  const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
  const name = path.basename(file);
  const cases = (doc.cases ?? doc.phrases ?? []).map((c) => ({
    id: c.id,
    phrase: c.phrase,
    expect: c.expect ?? (c.expected_rule ? `${c.expected_umbrella}/${c.expected_rule}` : c.expected_umbrella),
    gate: Boolean(c.gate),
  }));
  const ids = new Set(cases.map((c) => c.id));
  const known = new Map();
  for (const k of doc.known_failures ?? []) {
    if (!k || typeof k !== 'object' || typeof k.id !== 'string' || !String(k.reason ?? '').trim()) {
      throw new Error(`${name}: every known failure needs an id and a reason, got ${JSON.stringify(k)}`);
    }
    if (!ids.has(k.id)) throw new Error(`${name}: known failure ${k.id} is not a case in this file`);
    known.set(k.id, String(k.reason).trim());
  }
  return { name, status: doc.data_status ?? 'development', known, cases };
}

function main() {
  const root = rootArg ? path.resolve(rootArg) : process.cwd();
  const skills = loadPlugin(root);
  const tiers = loadPrecedence(root);
  const files = [path.join(root, 'tests', 'fire-test-phrases.json'),
    ...fs.readdirSync(path.join(root, 'tests', 'routing')).filter((f) => f.endsWith('.json')).sort().map((f) => path.join(root, 'tests', 'routing', f))];
  const report = [];
  let gateFailures = 0;
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const set = loadCases(file);
    const rows = set.cases.map((c) => {
      const result = route(skills, tiers, c.phrase);
      const pass = judge(c.expect, result);
      const knownFailure = set.known.has(c.id);
      const stale = knownFailure && pass;
      if ((c.gate && !pass && !knownFailure) || stale) gateFailures++;
      return { ...c, pass, knownFailure, stale, reason: set.known.get(c.id), outcome: result.outcome, got: result.skill ? `${result.skill}/${result.rule ?? '(no rule)'}` : result.outcome, top: result.top };
    });
    const quietCases = rows.filter((r) => r.expect === 'quiet' || r.expect.startsWith('!'));
    const fireCases = rows.filter((r) => !(r.expect === 'quiet' || r.expect.startsWith('!')));
    report.push({
      file: set.name, status: set.status,
      fire: { pass: fireCases.filter((r) => r.pass).length, total: fireCases.length },
      stayQuiet: { pass: quietCases.filter((r) => r.pass).length, total: quietCases.length },
      ties: rows.filter((r) => r.outcome === 'tie' || r.outcome === 'rule-tie').length,
      gated: { failing: rows.filter((r) => (r.gate && !r.pass && !r.knownFailure) || r.stale).length, knownFailures: rows.filter((r) => !r.pass && r.knownFailure).length, total: rows.filter((r) => r.gate).length },
      rows,
    });
  }
  if (asJson) {
    console.log(JSON.stringify({ threshold: FIRE_THRESHOLD, listingCap: LISTING_CAP, report }, null, 2));
  } else {
    console.log('Lexical routing check. Development data only: every set below was seen while descriptions changed.');
    console.log('A pass means the visible text contains the intended words. It does not show how Claude Code routes.\n');
    for (const r of report) {
      console.log(`${r.file} (${r.status}): should fire ${r.fire.pass}/${r.fire.total}, should stay quiet ${r.stayQuiet.pass}/${r.stayQuiet.total}, ties ${r.ties}, gated failures ${r.gated.failing} of ${r.gated.total} gated (known failures ${r.gated.knownFailures})`);
      for (const row of r.rows.filter((x) => !x.pass || x.stale)) {
        if (row.stale) { console.log(`  STALE ${row.id}: listed as a known failure but passes. Remove it from known_failures.`); continue; }
        console.log(`  ${row.knownFailure ? 'KNOWN' : row.gate ? 'GATE ' : 'info '} ${row.id}: expected ${row.expect}, got ${row.got}${row.top.length ? ` [${row.top.join(' ')}]` : ''}`);
        if (row.knownFailure) console.log(`        reason: ${row.reason}`);
      }
    }
  }
  if (gateFailures) {
    console.error(`\n${gateFailures} gated case(s) failed. Fix the description or trigger text in general terms, not for the case.`);
    process.exit(1);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
