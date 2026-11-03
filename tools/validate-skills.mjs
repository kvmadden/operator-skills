#!/usr/bin/env node
// Structure validator for the operator-skills plugin.
//
// Checks, with a real YAML parser:
// - plugin.json, marketplace.json and package.json agree on the plugin name,
//   and the marketplace source path exists
// - every skill has SKILL.md frontmatter whose name matches its directory and
//   Claude Code's name rules, and a description that is non-empty, at most
//   1,024 characters (the Agent Skills limit, below Claude Code's 1,536
//   listing cap) and starts with its "Do NOT use" clause
// - the whole plugin listing (names plus descriptions) fits the 8,000
//   character listing budget Claude Code 2.1.304 uses for a 200k-token context
// - no inert routing metadata (promptSignals, pathPatterns, bashPatterns)
// - every rules/*.md file is linked from its SKILL.md and every link resolves
// - every rule file parses, has a title and a trigger, and has the four
//   sections the README promises, with exactly these headings and a non-empty
//   body: The pattern, Response, Suppression, Override
// - docs/PRECEDENCE.md exists with its markers, every SKILL.md carries the
//   same precedence block, and every rule named in its tables exists
// - no tier 1 rule lists explore, sketch, spike or throwaway as a suppression
// - every SKILL.md carries the rule trigger table generated from its rule
//   files, so the text Claude reads after loading a skill matches the rules
// - hooks/hooks.json uses known events and command hooks of exactly the form
//   bash "${CLAUDE_PLUGIN_ROOT}/<path>", where <path> is a regular,
//   executable file inside the plugin and not a symlink
//
// Usage: node tools/validate-skills.mjs [plugin-root]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

export const DESCRIPTION_MAX = 1024;
export const LISTING_BUDGET = 8000;
export const RULE_SECTIONS = ['The pattern', 'Response', 'Suppression', 'Override'];
export const TIER1_BANNED_SUPPRESSIONS = ['explore', 'sketch', 'spike', 'throwaway'];
const KNOWN_EVENTS = new Set(['PreToolUse', 'PostToolUse', 'PostToolUseFailure', 'UserPromptSubmit', 'Stop', 'StopFailure',
  'SubagentStart', 'SubagentStop', 'SessionStart', 'SessionEnd', 'Notification', 'PreCompact', 'PostCompact', 'PermissionRequest']);
const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HOOK_COMMAND_RE = /^bash "\$\{CLAUDE_PLUGIN_ROOT\}\/([A-Za-z0-9._/-]+)"$/;
export const PRECEDENCE_START = '<!-- precedence:start -->';
export const PRECEDENCE_END = '<!-- precedence:end -->';
export const TRIGGERS_START = '<!-- triggers:start -->';
export const TRIGGERS_END = '<!-- triggers:end -->';

export function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!m) return { error: 'no frontmatter' };
  try {
    const data = YAML.parse(m[1], { strict: true, uniqueKeys: true });
    if (!data || typeof data !== 'object' || Array.isArray(data)) return { error: 'frontmatter is not a mapping' };
    return { data, body: text.slice(m[0].length) };
  } catch (e) {
    return { error: `invalid YAML: ${String(e.message).split('\n')[0]}` };
  }
}

export function markedBlock(text, start, end) {
  const a = text.indexOf(start);
  const b = text.indexOf(end);
  if (a === -1 || b === -1 || b < a) return null;
  return text.slice(a, b + end.length);
}

export const precedenceBlock = (text) => markedBlock(text, PRECEDENCE_START, PRECEDENCE_END);

// The rule trigger table for one skill, built from its rule files' trigger
// fields in file name order. npm run sync:skills writes it into SKILL.md.
export function triggerTable(skillDir) {
  const rdir = path.join(skillDir, 'rules');
  if (!fs.existsSync(rdir)) return null;
  const rows = [];
  for (const file of fs.readdirSync(rdir).filter((f) => f.endsWith('.md')).sort()) {
    const fm = frontmatter(fs.readFileSync(path.join(rdir, file), 'utf8'));
    const trigger = fm.error ? '' : String(fm.data.trigger ?? '').replace(/\s+/g, ' ').trim().replace(/\|/g, '\\|');
    rows.push(`| [${file.slice(0, -3)}](rules/${file}) | ${trigger} |`);
  }
  if (!rows.length) return null;
  return `${TRIGGERS_START}\n## Rule triggers\n\n| Rule | Fires on |\n|---|---|\n${rows.join('\n')}\n${TRIGGERS_END}`;
}

// Rule slugs named in backticks in any table row of the precedence block,
// with the tier of the numbered row that names them, or null for other rows.
export function precedenceSlugs(block) {
  const slugs = new Map();
  for (const line of block.split('\n').filter((l) => l.startsWith('|') && !/^\|[-\s|]+\|$/.test(l))) {
    const tier = (line.match(/^\|\s*(\d+)\s*\|/) || [])[1];
    for (const m of line.matchAll(/`([a-zA-Z0-9-]+)`/g)) {
      if (!slugs.has(m[1]) || (tier && slugs.get(m[1]) === null)) slugs.set(m[1], tier ? Number(tier) : null);
    }
  }
  return slugs;
}

function sections(body) {
  const out = new Map();
  for (const part of body.split(/^## /m).slice(1)) {
    const nl = part.indexOf('\n');
    const heading = (nl === -1 ? part : part.slice(0, nl)).trim();
    if (!out.has(heading)) out.set(heading, nl === -1 ? '' : part.slice(nl + 1));
  }
  return out;
}

function checkHooks(root, errors, readJson) {
  if (!fs.existsSync(path.join(root, 'hooks', 'hooks.json'))) return;
  const events = readJson('hooks/hooks.json')?.hooks;
  if (!events || typeof events !== 'object' || Array.isArray(events)) { errors.push('hooks.json: "hooks" must be an object'); return; }
  const realRoot = fs.realpathSync(root);
  for (const [event, list] of Object.entries(events)) {
    if (!KNOWN_EVENTS.has(event)) errors.push(`hooks.json: unknown event ${event}`);
    if (!Array.isArray(list)) { errors.push(`hooks.json: ${event} must be an array`); continue; }
    for (const entry of list) {
      if (!entry || !Array.isArray(entry.hooks)) { errors.push(`hooks.json: ${event} entry has no hooks array`); continue; }
      for (const h of entry.hooks) {
        if (h?.type !== 'command' || typeof h.command !== 'string') { errors.push(`hooks.json: ${event} hook must be type "command" with a command string`); continue; }
        if (!h.command.includes('${CLAUDE_PLUGIN_ROOT}')) { errors.push(`hooks.json: ${event} command does not use \${CLAUDE_PLUGIN_ROOT}`); continue; }
        const m = h.command.match(HOOK_COMMAND_RE);
        if (!m) { errors.push(`hooks.json: ${event} has an unsupported command. Use exactly bash "\${CLAUDE_PLUGIN_ROOT}/<path>"`); continue; }
        const rel = m[1];
        const target = path.resolve(root, rel);
        if (rel.split('/').includes('..') || !target.startsWith(path.resolve(root) + path.sep)) { errors.push(`hooks.json: ${rel} is outside the plugin`); continue; }
        let st;
        try { st = fs.lstatSync(target); } catch { errors.push(`hooks.json: missing ${rel}`); continue; }
        if (st.isSymbolicLink()) {
          let real = null;
          try { real = fs.realpathSync(target); } catch { /* a dangling link */ }
          errors.push(real && real.startsWith(realRoot + path.sep)
            ? `hooks.json: ${rel} is a symlink. Point at the file itself`
            : `hooks.json: ${rel} is a symlink to a file outside the plugin`);
          continue;
        }
        if (!st.isFile()) { errors.push(`hooks.json: ${rel} is not a regular file`); continue; }
        if (!fs.realpathSync(target).startsWith(realRoot + path.sep)) { errors.push(`hooks.json: ${rel} resolves outside the plugin`); continue; }
        if ((st.mode & 0o111) === 0) errors.push(`hooks.json: ${rel} is not executable`);
      }
    }
  }
}

export function validate(root) {
  const errors = [];
  const stats = { skills: 0, rules: 0, listingChars: 0, precedenceCopies: 0, triggerTables: 0 };
  const ruleSlugs = new Set();
  const readJson = (rel) => {
    try { return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8')); }
    catch (e) { errors.push(`${rel}: ${e.message}`); return null; }
  };

  const plugin = readJson('.claude-plugin/plugin.json');
  const market = readJson('.claude-plugin/marketplace.json');
  const pkg = readJson('package.json');
  if (plugin) {
    if (!plugin.name || !NAME_RE.test(plugin.name)) errors.push('plugin.json: name missing or not kebab-case');
    if (!plugin.version) errors.push('plugin.json: version missing');
  }
  if (market) {
    if (!Array.isArray(market.plugins)) errors.push('marketplace.json: plugins must be an array');
    else for (const entry of market.plugins) {
      if (plugin && entry.name !== plugin.name) errors.push(`marketplace.json: entry name "${entry.name}" does not match plugin.json "${plugin.name}"`);
      if (typeof entry.source === 'string' && !fs.existsSync(path.join(root, entry.source))) errors.push(`marketplace.json: source ${entry.source} does not exist`);
    }
  }
  if (pkg && plugin && pkg.name !== plugin.name) errors.push(`package.json: name "${pkg.name}" does not match plugin.json "${plugin.name}"`);

  let canonicalPrecedence = null;
  const precedencePath = path.join(root, 'docs', 'PRECEDENCE.md');
  if (!fs.existsSync(precedencePath)) errors.push('docs/PRECEDENCE.md: missing. It is the single source for the precedence block');
  else {
    canonicalPrecedence = precedenceBlock(fs.readFileSync(precedencePath, 'utf8'));
    if (!canonicalPrecedence) errors.push('docs/PRECEDENCE.md: precedence markers missing');
  }
  const named = canonicalPrecedence ? precedenceSlugs(canonicalPrecedence) : new Map();
  const tier1 = new Set([...named].filter(([, tier]) => tier === 1).map(([slug]) => slug));

  const skillsDir = path.join(root, 'skills');
  if (!fs.existsSync(skillsDir)) errors.push('skills/: missing');
  else for (const dir of fs.readdirSync(skillsDir).sort()) {
    const full = path.join(skillsDir, dir);
    if (!fs.statSync(full).isDirectory()) { errors.push(`skills/${dir}: unexpected file in skills/`); continue; }
    const file = path.join(full, 'SKILL.md');
    if (!fs.existsSync(file)) { errors.push(`${dir}: missing SKILL.md`); continue; }
    const text = fs.readFileSync(file, 'utf8');
    const fm = frontmatter(text);
    if (fm.error) { errors.push(`${dir}/SKILL.md: ${fm.error}`); continue; }
    stats.skills++;
    const { name, description } = fm.data;
    if (name !== dir) errors.push(`${dir}/SKILL.md: name "${name}" does not match the directory`);
    if (typeof name !== 'string' || !NAME_RE.test(name) || name.length > 64) errors.push(`${dir}/SKILL.md: name must be lowercase kebab-case, 64 characters or fewer`);
    if (typeof description !== 'string' || !description.trim()) errors.push(`${dir}/SKILL.md: description missing or empty`);
    else {
      const listing = fm.data.when_to_use ? `${description} - ${fm.data.when_to_use}` : description;
      if (listing.length > DESCRIPTION_MAX) errors.push(`${dir}/SKILL.md: description is ${listing.length} characters, over ${DESCRIPTION_MAX}`);
      if (!description.trimStart().startsWith('Do NOT use')) errors.push(`${dir}/SKILL.md: description must start with its "Do NOT use" clause`);
      stats.listingChars += `${plugin?.name ?? 'plugin'}:${name}`.length + 4 + Math.min(listing.length, 1536);
    }
    const meta = fm.data.metadata ?? {};
    for (const inert of ['promptSignals', 'pathPatterns', 'bashPatterns']) {
      if (meta && typeof meta === 'object' && inert in meta) errors.push(`${dir}/SKILL.md: metadata.${inert} is not read by Claude Code, remove it`);
    }
    if (canonicalPrecedence) {
      const block = precedenceBlock(fm.body);
      if (!block) errors.push(`${dir}/SKILL.md: precedence block missing (run npm run sync:skills)`);
      else if (block !== canonicalPrecedence) errors.push(`${dir}/SKILL.md: precedence block differs from docs/PRECEDENCE.md (run npm run sync:skills)`);
      else stats.precedenceCopies++;
    }
    const expectedTriggers = triggerTable(full);
    if (expectedTriggers) {
      const block = markedBlock(fm.body, TRIGGERS_START, TRIGGERS_END);
      if (!block) errors.push(`${dir}/SKILL.md: rule trigger table missing (run npm run sync:skills)`);
      else if (block !== expectedTriggers) errors.push(`${dir}/SKILL.md: rule trigger table is out of date (run npm run sync:skills)`);
      else stats.triggerTables++;
    }

    const linked = new Set();
    for (const link of text.matchAll(/\]\((rules\/[^)]+\.md)\)/g)) {
      linked.add(link[1]);
      if (!fs.existsSync(path.join(full, link[1]))) errors.push(`${dir}/SKILL.md: broken link ${link[1]}`);
    }
    const rdir = path.join(full, 'rules');
    if (!fs.existsSync(rdir)) continue;
    for (const ruleFile of fs.readdirSync(rdir).filter((f) => f.endsWith('.md')).sort()) {
      stats.rules++;
      const slug = ruleFile.slice(0, -3);
      ruleSlugs.add(slug);
      const rel = `rules/${ruleFile}`;
      if (!linked.has(rel)) errors.push(`${dir}/${rel}: not linked from SKILL.md (orphan rule)`);
      const rfm = frontmatter(fs.readFileSync(path.join(rdir, ruleFile), 'utf8'));
      if (rfm.error) { errors.push(`${dir}/${rel}: ${rfm.error}`); continue; }
      if (typeof rfm.data.title !== 'string' || !rfm.data.title.trim()) errors.push(`${dir}/${rel}: title missing`);
      if (typeof rfm.data.trigger !== 'string' || !rfm.data.trigger.trim()) errors.push(`${dir}/${rel}: trigger missing`);
      if (rfm.data.priority !== undefined && !['high', 'medium', 'low'].includes(rfm.data.priority)) errors.push(`${dir}/${rel}: priority must be high, medium or low`);
      const found = sections(rfm.body);
      for (const section of RULE_SECTIONS) {
        if (!found.has(section)) errors.push(`${dir}/${rel}: missing "## ${section}" section`);
        else if (!found.get(section).trim()) errors.push(`${dir}/${rel}: "## ${section}" section is empty`);
      }
      if (tier1.has(slug) && found.has('Suppression')) {
        for (const word of TIER1_BANNED_SUPPRESSIONS) {
          if (new RegExp(`\\b${word}`, 'i').test(found.get('Suppression'))) errors.push(`${dir}/${rel}: tier 1 rule ${slug} is suppressed by "${word}", which docs/PRECEDENCE.md forbids`);
        }
      }
    }
  }
  if (stats.listingChars > LISTING_BUDGET) errors.push(`plugin listing is about ${stats.listingChars} characters, over the ${LISTING_BUDGET} budget`);
  for (const slug of named.keys()) {
    if (!ruleSlugs.has(slug)) errors.push(`docs/PRECEDENCE.md: names unknown rule ${slug}`);
  }

  checkHooks(root, errors, readJson);
  return { errors, stats };
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  const root = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
  const { errors, stats } = validate(root);
  if (errors.length) {
    console.error(errors.join('\n'));
    console.error(`\n${errors.length} structure problem(s).`);
    process.exit(1);
  }
  console.log(`OK: ${stats.skills} skills, ${stats.rules} rules, every rule linked and complete, `
    + `${stats.precedenceCopies} precedence copies and ${stats.triggerTables} trigger tables in sync, hooks valid, `
    + `listing about ${stats.listingChars} of ${LISTING_BUDGET} characters.`);
}
