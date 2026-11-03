#!/usr/bin/env node
// Writes the two generated parts of every SKILL.md:
// - the precedence block, copied from docs/PRECEDENCE.md
// - the rule trigger table, built from each rule file's trigger field. It
//   replaces the old "## Trigger catalogue" section where one is left.
// The validator fails when either part drifts, so run this after editing
// docs/PRECEDENCE.md or any rule trigger.
// Usage: node tools/sync-skills.mjs [--check] [plugin-root]
import fs from 'node:fs';
import path from 'node:path';
import { precedenceBlock, markedBlock, triggerTable, TRIGGERS_START, TRIGGERS_END } from './validate-skills.mjs';

const check = process.argv.includes('--check');
const rootArg = process.argv.slice(2).find((a) => !a.startsWith('--'));
const root = rootArg ? path.resolve(rootArg) : process.cwd();

const canonical = precedenceBlock(fs.readFileSync(path.join(root, 'docs', 'PRECEDENCE.md'), 'utf8'));
if (!canonical) {
  console.error('docs/PRECEDENCE.md has no precedence block');
  process.exit(1);
}

let stale = 0;
for (const dir of fs.readdirSync(path.join(root, 'skills')).sort()) {
  const file = path.join(root, 'skills', dir, 'SKILL.md');
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  let next = text;

  const current = precedenceBlock(next);
  next = current ? next.replace(current, () => canonical) : `${next.trimEnd()}\n\n${canonical}\n`;

  const table = triggerTable(path.join(root, 'skills', dir));
  const oldTable = markedBlock(next, TRIGGERS_START, TRIGGERS_END);
  const catalogue = next.indexOf('\n## Trigger catalogue');
  if (catalogue !== -1) next = `${next.slice(0, catalogue).trimEnd()}\n`;
  if (oldTable && next.includes(oldTable)) next = table ? next.replace(oldTable, () => table) : next.replace(oldTable, '');
  else if (table) next = `${next.trimEnd()}\n\n${table}\n`;

  if (next !== text) {
    stale++;
    if (!check) fs.writeFileSync(file, next);
  }
}
if (check && stale) {
  console.error(`${stale} SKILL.md file(s) out of sync. Run npm run sync:skills.`);
  process.exit(1);
}
console.log(check ? 'every SKILL.md is in sync' : `updated ${stale} SKILL.md file(s)`);
