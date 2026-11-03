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
//   sections the README promises: The pattern, Response, Suppression, Override
// - every SKILL.md carries the same precedence block as docs/PRECEDENCE.md,
//   and every rule slug named in the tier table exists
// - hooks/hooks.json uses known events, command hooks only, and points at
//   executable files under ${CLAUDE_PLUGIN_ROOT}
//
// Usage: node tools/validate-skills.mjs [plugin-root]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

export const DESCRIPTION_MAX = 1024;
export const LISTING_BUDGET = 8000;
export const RULE_SECTIONS = ['The pattern', 'Response', 'Suppression', 'Override'];
const KNOWN_EVENTS = new Set(['PreToolUse', 'PostToolUse', 'PostToolUseFailure', 'UserPromptSubmit', 'Stop', 'StopFailure',
  'SubagentStart', 'SubagentStop', 'SessionStart', 'SessionEnd', 'Notification', 'PreCompact', 'PostCompact', 'PermissionRequest']);
const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const PRECEDENCE_START = '<!-- precedence:start -->';
export const PRECEDENCE_END = '<!-- precedence:end -->';

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

export function precedenceBlock(text) {
  const a = text.indexOf(PRECEDENCE_START);
  const b = text.indexOf(PRECEDENCE_END);
  if (a === -1 || b === -1 || b < a) return null;
  return text.slice(a, b + PRECEDENCE_END.length);
}

export function validate(root) {
  const errors = [];
  const stats = { skills: 0, rules: 0, listingChars: 0, precedenceCopies: 0 };
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
  if (fs.existsSync(precedencePath)) {
    canonicalPrecedence = precedenceBlock(fs.readFileSync(precedencePath, 'utf8'));
    if (!canonicalPrecedence) errors.push('docs/PRECEDENCE.md: precedence markers missing');
  }

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
      if (!block) errors.push(`${dir}/SKILL.md: precedence block missing (run npm run sync:precedence)`);
      else if (block !== canonicalPrecedence) errors.push(`${dir}/SKILL.md: precedence block differs from docs/PRECEDENCE.md (run npm run sync:precedence)`);
      else stats.precedenceCopies++;
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
      ruleSlugs.add(ruleFile.slice(0, -3));
      const rel = `rules/${ruleFile}`;
      if (!linked.has(rel)) errors.push(`${dir}/${rel}: not linked from SKILL.md (orphan rule)`);
      const rtext = fs.readFileSync(path.join(rdir, ruleFile), 'utf8');
      const rfm = frontmatter(rtext);
      if (rfm.error) { errors.push(`${dir}/${rel}: ${rfm.error}`); continue; }
      if (typeof rfm.data.title !== 'string' || !rfm.data.title.trim()) errors.push(`${dir}/${rel}: title missing`);
      if (typeof rfm.data.trigger !== 'string' || !rfm.data.trigger.trim()) errors.push(`${dir}/${rel}: trigger missing`);
      if (rfm.data.priority !== undefined && !['high', 'medium', 'low'].includes(rfm.data.priority)) errors.push(`${dir}/${rel}: priority must be high, medium or low`);
      const headings = [...rfm.body.matchAll(/^##\s+(.+?)\s*$/gm)].map((h) => h[1]);
      for (const section of RULE_SECTIONS) {
        if (!headings.some((h) => h === section || h.startsWith(`${section} `) || h.startsWith(`${section}(`))) errors.push(`${dir}/${rel}: missing "## ${section}" section`);
      }
    }
  }
  if (stats.listingChars > LISTING_BUDGET) errors.push(`plugin listing is about ${stats.listingChars} characters, over the ${LISTING_BUDGET} budget`);
  if (canonicalPrecedence) {
    for (const line of canonicalPrecedence.split('\n').filter((l) => /^\|\s*\d+\s*\|/.test(l))) {
      for (const slug of line.matchAll(/`([a-zA-Z0-9-]+)`/g)) {
        if (!ruleSlugs.has(slug[1])) errors.push(`docs/PRECEDENCE.md: tier table names unknown rule ${slug[1]}`);
      }
    }
  }

  const hooksPath = path.join(root, 'hooks', 'hooks.json');
  if (fs.existsSync(hooksPath)) {
    const hooks = readJson('hooks/hooks.json');
    const events = hooks?.hooks;
    if (!events || typeof events !== 'object' || Array.isArray(events)) errors.push('hooks.json: "hooks" must be an object');
    else for (const [event, list] of Object.entries(events)) {
      if (!KNOWN_EVENTS.has(event)) errors.push(`hooks.json: unknown event ${event}`);
      if (!Array.isArray(list)) { errors.push(`hooks.json: ${event} must be an array`); continue; }
      for (const entry of list) {
        if (!entry || !Array.isArray(entry.hooks)) { errors.push(`hooks.json: ${event} entry has no hooks array`); continue; }
        for (const h of entry.hooks) {
          if (h?.type !== 'command' || typeof h.command !== 'string') { errors.push(`hooks.json: ${event} hook must be type "command" with a command string`); continue; }
          const rel = (h.command.match(/\$\{CLAUDE_PLUGIN_ROOT\}\/([^\s"'\\]+)/) || [])[1];
          if (!rel) { errors.push(`hooks.json: ${event} command does not use \${CLAUDE_PLUGIN_ROOT}`); continue; }
          const target = path.join(root, rel);
          if (!fs.existsSync(target)) errors.push(`hooks.json: missing ${rel}`);
          else if ((fs.statSync(target).mode & 0o111) === 0) errors.push(`hooks.json: ${rel} is not executable`);
        }
      }
    }
  }
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
    + `${stats.precedenceCopies} precedence copies in sync, hooks valid, listing about ${stats.listingChars} of ${LISTING_BUDGET} characters.`);
}
