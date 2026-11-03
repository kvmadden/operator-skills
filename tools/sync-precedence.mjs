#!/usr/bin/env node
// Copies the precedence block from docs/PRECEDENCE.md into every SKILL.md,
// replacing an existing copy or adding one before the trigger catalogue.
// Usage: node tools/sync-precedence.mjs [--check]
import fs from 'node:fs';
import path from 'node:path';
const PRECEDENCE_START = '<!-- precedence:start -->';
const PRECEDENCE_END = '<!-- precedence:end -->';
function precedenceBlock(text) {
  const a = text.indexOf(PRECEDENCE_START);
  const b = text.indexOf(PRECEDENCE_END);
  if (a === -1 || b === -1 || b < a) return null;
  return text.slice(a, b + PRECEDENCE_END.length);
}

const root = process.cwd();
const canonical = precedenceBlock(fs.readFileSync(path.join(root, 'docs', 'PRECEDENCE.md'), 'utf8'));
if (!canonical) {
  console.error('docs/PRECEDENCE.md has no precedence block');
  process.exit(1);
}
const check = process.argv.includes('--check');
let stale = 0;
for (const dir of fs.readdirSync(path.join(root, 'skills')).sort()) {
  const file = path.join(root, 'skills', dir, 'SKILL.md');
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  const current = precedenceBlock(text);
  let next;
  if (current) next = text.replace(current, canonical);
  else if (text.includes('\n## Trigger catalogue')) next = text.replace('\n## Trigger catalogue', `\n${canonical}\n\n## Trigger catalogue`);
  else next = `${text.trimEnd()}\n\n${canonical}\n`;
  if (next !== text) {
    stale++;
    if (!check) fs.writeFileSync(file, next);
  }
}
if (check && stale) {
  console.error(`${stale} SKILL.md file(s) out of sync with docs/PRECEDENCE.md. Run npm run sync:precedence.`);
  process.exit(1);
}
console.log(check ? 'precedence copies in sync' : `updated ${stale} SKILL.md file(s); marker ${PRECEDENCE_START}`);
