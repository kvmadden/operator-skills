#!/usr/bin/env node
// Validates plugin structure: manifests parse, every skill has a SKILL.md with
// name/description frontmatter matching its directory, hooks.json references
// scripts that exist, and every rules/ link in a SKILL.md resolves.
import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const errors = [];
const readJson = (p) => {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { errors.push(`${p}: ${e.message}`); return null; }
};

const plugin = readJson(path.join(root, '.claude-plugin/plugin.json'));
const market = readJson(path.join(root, '.claude-plugin/marketplace.json'));
if (plugin && !plugin.name) errors.push('plugin.json: missing name');
if (plugin && !plugin.version) errors.push('plugin.json: missing version');
if (market && !Array.isArray(market.plugins)) errors.push('marketplace.json: plugins must be an array');

const skillsDir = path.join(root, 'skills');
let skills = 0, rules = 0;
for (const dir of fs.readdirSync(skillsDir)) {
  const full = path.join(skillsDir, dir);
  if (!fs.statSync(full).isDirectory()) continue;
  const file = path.join(full, 'SKILL.md');
  if (!fs.existsSync(file)) { errors.push(`${dir}: missing SKILL.md`); continue; }
  const text = fs.readFileSync(file, 'utf8');
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) { errors.push(`${dir}: no frontmatter`); continue; }
  const name = (m[1].match(/^name:\s*(.+)$/m) || [])[1]?.trim();
  if (name !== dir) errors.push(`${dir}: frontmatter name "${name}" != directory`);
  if (!/^description:\s*\S*/m.test(m[1])) errors.push(`${dir}: missing description`);
  skills++;
  for (const link of text.matchAll(/\]\((rules\/[^)]+\.md)\)/g)) {
    if (!fs.existsSync(path.join(full, link[1]))) errors.push(`${dir}: broken link ${link[1]}`);
  }
  const rdir = path.join(full, 'rules');
  if (fs.existsSync(rdir)) rules += fs.readdirSync(rdir).filter((f) => f.endsWith('.md')).length;
}

const hooks = readJson(path.join(root, 'hooks/hooks.json'));
for (const list of Object.values(hooks?.hooks || {})) {
  for (const entry of list) for (const h of entry.hooks) {
    const rel = (h.command.match(/\$\{CLAUDE_PLUGIN_ROOT\}\/([^\s"\\]+)/) || [])[1];
    if (rel && !fs.existsSync(path.join(root, rel))) errors.push(`hooks.json: missing ${rel}`);
  }
}

if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`OK: ${skills} skills, ${rules} rules, manifests and hooks valid.`);
