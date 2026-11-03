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
// Stage 2 (rule): scores the chosen skill's SKILL.md trigger table and its
// rule files' trigger fields, which the model reads after loading the skill.
// When several rules match, the precedence tiers in docs/PRECEDENCE.md decide
// before the score does, so a safety floor outranks a style rule.
//
// Matching: double-quoted phrases match whole words, case-insensitively, with
// curly quotes and apostrophes normalized, and [X], <x> or a lone X, Y or Z
// matching one to four words. Backtick spans that are not plain lowercase words
// (for example `sk-` or `AKIA`) are case-sensitive prefixes that must start at
// a word boundary. A quoted phrase inside a "Do NOT use" clause suppresses the
// skill. A skill fires at a score of 2 or more (word count of each distinct
// matched phrase, 2 per token). A tie for first place is reported as a tie and
// counts as a failure.
//
// Data status: every case file this script reads was seen while the
// descriptions were being changed, so all of it is development data. Numbers
// from it are development results, never a headline. See docs/EVALUATION.md.
//
// Usage: node tools/fire-test.mjs [--json] [plugin-root]
// Exit 1 when a case marked "gate": true fails and is not listed in that
// file's known_failures. Every other case is reported, not gated.
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
const WORD = '[\\p{L}\\p{N}_]';

// Builds a matcher for a quoted phrase: whole words, wildcards for placeholders.
export function phraseMatcher(raw) {
  const phrase = normalize(raw).trim();
  const words = phrase.split(' ').filter(Boolean);
  if (!words.length) return null;
  const parts = words.map((w) => (/^(\[[^\]]*\]|<[^>]*>|[XYZ])$/.test(w) ? '\\S+(?:\\s+\\S+){0,3}' : escapeRe(w.toLowerCase())));
  const left = /^[\p{L}\p{N}_]/u.test(phrase) ? `(?<!${WORD})` : '';
  const right = /[\p{L}\p{N}_]$/u.test(phrase) ? `(?!${WORD})` : '';
  const weight = words.length;
  return { raw, weight, re: new RegExp(`${left}${parts.join('\\s+')}${right}`, 'u'), lower: true };
}

// Builds a matcher for a backtick token: case-sensitive prefix at a word start.
export function tokenMatcher(raw) {
  const token = raw.trim();
  if (!token || /^[a-z]+(?:-[a-z]+)*$/.test(token)) return null; // plain words such as `explore`
  if (/[<>]|\.\.\./.test(token)) return null; // templates such as `<value>` or `eyJ...`
  const left = /^[\p{L}\p{N}_]/u.test(token) ? `(?<!${WORD})` : '';
  return { raw, weight: 2, re: new RegExp(`${left}${escapeRe(token)}`, 'u'), lower: false };
}

export function extract(text) {
  const t = normalize(text);
  const quoted = [...t.matchAll(/"([^"]{2,120})"/g)].map((m) => phraseMatcher(m[1])).filter(Boolean);
  const tokens = [...t.matchAll(/`([^`]{2,60})`/g)].map((m) => tokenMatcher(m[1])).filter(Boolean);
  return [...quoted, ...tokens];
}

// Splits a description into its "Do NOT use" clause and the rest.
export function splitDescription(listing) {
  const t = normalize(listing);
  const start = t.search(/\bdo not use\b/i);
  if (start === -1) return { positive: t, anti: '' };
  const after = t.slice(start);
  const end = after.slice(10).search(/\buse (?:this skill )?when\b/i);
  const anti = end === -1 ? after : after.slice(0, end + 10);
  return { positive: t.slice(0, start) + (end === -1 ? '' : after.slice(end + 10)), anti };
}

function matchAll(matchers, phrase) {
  const lower = normalize(phrase).toLowerCase();
  const exact = normalize(phrase);
  const hits = new Map();
  for (const m of matchers) {
    if (m.re.test(m.lower ? lower : exact)) hits.set(m.raw, m.weight);
  }
  return { score: [...hits.values()].reduce((a, b) => a + b, 0), hits: [...hits.keys()] };
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
    const { positive, anti } = splitDescription(`${plugin.name}:${dir} ${listing}`);
    const rules = [];
    const rulesDir = path.join(root, 'skills', dir, 'rules');
    for (const f of fs.existsSync(rulesDir) ? fs.readdirSync(rulesDir).sort() : []) {
      if (!f.endsWith('.md')) continue;
      const slug = f.slice(0, -3);
      const r = frontmatter(fs.readFileSync(path.join(rulesDir, f), 'utf8')).data;
      const tableRows = body.split('\n').filter((l) => l.startsWith('|') && l.includes(`(rules/${f})`)).join(' ');
      rules.push({ slug, matchers: extract(`${r.trigger ?? ''} ${tableRows}`) });
    }
    skills.push({ slug: dir, matchers: extract(positive), anti: extract(anti), rules });
  }
  return skills;
}

export function route(skills, tiers, phrase) {
  const scored = skills.map((s) => {
    const blocked = matchAll(s.anti, phrase);
    const { score, hits } = matchAll(s.matchers, phrase);
    return { s, score: blocked.hits.length ? 0 : score, hits, blocked: blocked.hits };
  }).filter((x) => x.score >= FIRE_THRESHOLD).sort((a, b) => b.score - a.score || a.s.slug.localeCompare(b.s.slug));
  if (!scored.length) return { outcome: 'quiet', skill: null, rule: null, top: [] };
  const top = scored.map((x) => `${x.s.slug}=${x.score}`).slice(0, 3);
  if (scored.length > 1 && scored[1].score === scored[0].score) return { outcome: 'tie', skill: null, rule: null, top };
  const skill = scored[0].s;
  const rules = skill.rules.map((r) => ({ r, ...matchAll(r.matchers, phrase), tier: tiers.get(r.slug) ?? 9 }))
    .filter((x) => x.score > 0)
    .sort((a, b) => a.tier - b.tier || b.score - a.score || a.r.slug.localeCompare(b.r.slug));
  if (!rules.length) return { outcome: 'fired', skill: skill.slug, rule: null, top };
  if (rules.length > 1 && rules[1].tier === rules[0].tier && rules[1].score === rules[0].score) {
    return { outcome: 'rule-tie', skill: skill.slug, rule: null, top, ruleTop: rules.slice(0, 2).map((x) => x.r.slug) };
  }
  return { outcome: 'fired', skill: skill.slug, rule: rules[0].r.slug, top };
}

// expect: "quiet", "skill", "skill/rule", "!skill" or "!skill/rule".
export function judge(expect, result) {
  const got = result.skill ? `${result.skill}/${result.rule ?? '(no rule)'}` : result.outcome;
  if (expect === 'quiet') return result.outcome === 'quiet';
  if (expect.startsWith('!')) {
    const not = expect.slice(1);
    if (result.outcome === 'tie') return false;
    return not.includes('/') ? got !== not : result.skill !== not;
  }
  if (result.outcome !== 'fired') return false;
  return expect.includes('/') ? got === expect : result.skill === expect;
}

function loadCases(file) {
  const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
  const cases = (doc.cases ?? doc.phrases ?? []).map((c) => ({
    id: c.id,
    phrase: c.phrase,
    expect: c.expect ?? (c.expected_rule ? `${c.expected_umbrella}/${c.expected_rule}` : c.expected_umbrella),
    gate: Boolean(c.gate),
  }));
  return { name: path.basename(file), status: doc.data_status ?? 'development', known: new Set(doc.known_failures ?? []), cases };
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
      if (c.gate && !pass && !knownFailure) gateFailures++;
      return { ...c, pass, knownFailure, outcome: result.outcome, got: result.skill ? `${result.skill}/${result.rule ?? '(no rule)'}` : result.outcome, top: result.top };
    });
    const quietCases = rows.filter((r) => r.expect === 'quiet' || r.expect.startsWith('!'));
    const fireCases = rows.filter((r) => !(r.expect === 'quiet' || r.expect.startsWith('!')));
    report.push({
      file: set.name, status: set.status,
      fire: { pass: fireCases.filter((r) => r.pass).length, total: fireCases.length },
      stayQuiet: { pass: quietCases.filter((r) => r.pass).length, total: quietCases.length },
      ties: rows.filter((r) => r.outcome === 'tie' || r.outcome === 'rule-tie').length,
      gated: { failing: rows.filter((r) => r.gate && !r.pass && !r.knownFailure).length, knownFailures: rows.filter((r) => r.gate && !r.pass && r.knownFailure).length, total: rows.filter((r) => r.gate).length },
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
      for (const row of r.rows.filter((x) => !x.pass)) {
        console.log(`  ${row.gate ? (row.knownFailure ? 'KNOWN' : 'GATE ') : 'info '} ${row.id}: expected ${row.expect}, got ${row.got}${row.top.length ? ` [${row.top.join(' ')}]` : ''}`);
      }
    }
  }
  if (gateFailures) {
    console.error(`\n${gateFailures} gated stay-quiet case(s) fired. Fix the description or trigger text in general terms, not for the case.`);
    process.exit(1);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
