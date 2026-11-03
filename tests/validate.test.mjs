// Negative fixtures for tools/validate-skills.mjs: each broken plugin must be
// rejected with a specific message, and the real plugin must pass.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validate } from '../tools/validate-skills.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const BLOCK = '<!-- precedence:start -->\n| 1 | `one` | stop |\n<!-- precedence:end -->';
const TRIGGERS = '<!-- triggers:start -->\n## Rule triggers\n\n| Rule | Fires on |\n|---|---|\n| [one](rules/one.md) | "an example phrase" / something else |\n<!-- triggers:end -->';

const GOOD_RULE = `---
title: Example rule
trigger: >-
  "an example phrase" / something else
priority: medium
---

## The pattern

Text.

## Response

1. Do the thing.

## Suppression

- Never.

## Override

- "skip"
`;

function plugin(mutate = (files) => files) {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'opsk-val-')));
  const files = {
    '.claude-plugin/plugin.json': JSON.stringify({ name: 'demo-plugin', version: '0.1.0' }),
    '.claude-plugin/marketplace.json': JSON.stringify({ name: 'demo-market', plugins: [{ name: 'demo-plugin', source: './' }] }),
    'package.json': JSON.stringify({ name: 'demo-plugin' }),
    'docs/PRECEDENCE.md': `# P\n${BLOCK}\n`,
    'skills/alpha/SKILL.md': `---\nname: alpha\ndescription: Do NOT use for anything trivial. Use when an example phrase appears.\n---\n\n| Pattern | Rule |\n|---|---|\n| x | [one](rules/one.md) |\n\n${BLOCK}\n\n${TRIGGERS}\n`,
    'skills/alpha/rules/one.md': GOOD_RULE,
    'hooks/hooks.json': JSON.stringify({ hooks: { Stop: [{ hooks: [{ type: 'command', command: 'bash "${CLAUDE_PLUGIN_ROOT}/hooks/stop.sh"' }] }] } }),
    'hooks/stop.sh': '#!/usr/bin/env bash\nexit 0\n',
  };
  const final = mutate({ ...files });
  for (const [rel, content] of Object.entries(final)) {
    if (content === null) continue;
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), content);
  }
  if (final['hooks/stop.sh'] !== null && fs.existsSync(path.join(dir, 'hooks/stop.sh'))) fs.chmodSync(path.join(dir, 'hooks/stop.sh'), 0o755);
  return dir;
}

const errorsFor = (mutate) => validate(plugin(mutate)).errors.join('\n');

test('a minimal well-formed plugin passes', () => {
  assert.deepEqual(validate(plugin()).errors, []);
});

test('the shipped plugin passes', () => {
  assert.deepEqual(validate(root).errors, []);
});

test('empty, overlong and suppression-last descriptions are rejected', () => {
  assert.match(errorsFor((f) => ({ ...f, 'skills/alpha/SKILL.md': f['skills/alpha/SKILL.md'].replace(/description: .*\n/, 'description:\n') })), /description missing or empty/);
  assert.match(errorsFor((f) => ({ ...f, 'skills/alpha/SKILL.md': f['skills/alpha/SKILL.md'].replace(/description: .*\n/, `description: Do NOT use ${'x'.repeat(1100)}\n`) })), /over 1024/);
  assert.match(errorsFor((f) => ({ ...f, 'skills/alpha/SKILL.md': f['skills/alpha/SKILL.md'].replace('Do NOT use for anything trivial. Use when', 'Use when') })), /must start with its "Do NOT use" clause/);
});

test('inert routing metadata is rejected', () => {
  const withSignals = (f) => ({ ...f, 'skills/alpha/SKILL.md': f['skills/alpha/SKILL.md'].replace('---\n\n|', 'metadata:\n  promptSignals:\n    phrases:\n      - "x"\n---\n\n|') });
  assert.match(errorsFor(withSignals), /metadata\.promptSignals is not read/);
});

test('orphan rules, broken links, invalid YAML and missing sections are rejected', () => {
  assert.match(errorsFor((f) => ({ ...f, 'skills/alpha/rules/two.md': GOOD_RULE })), /two\.md: not linked/);
  assert.match(errorsFor((f) => ({ ...f, 'skills/alpha/SKILL.md': f['skills/alpha/SKILL.md'] + '| y | [gone](rules/gone.md) |\n' })), /broken link rules\/gone\.md/);
  assert.match(errorsFor((f) => ({ ...f, 'skills/alpha/rules/one.md': GOOD_RULE.replace('trigger: >-\n  "an example phrase" / something else', 'trigger: "an example phrase" / something else') })), /invalid YAML/);
  assert.match(errorsFor((f) => ({ ...f, 'skills/alpha/rules/one.md': GOOD_RULE.replace('## Override\n\n- "skip"\n', '') })), /missing "## Override" section/);
  assert.match(errorsFor((f) => ({ ...f, 'skills/alpha/rules/one.md': GOOD_RULE.replace('trigger: >-\n  "an example phrase" / something else\n', '') })), /trigger missing/);
});

test('manifest name mismatches and a missing marketplace source are rejected', () => {
  assert.match(errorsFor((f) => ({ ...f, 'package.json': JSON.stringify({ name: 'other' }) })), /package\.json: name "other"/);
  assert.match(errorsFor((f) => ({ ...f, '.claude-plugin/marketplace.json': JSON.stringify({ plugins: [{ name: 'wrong', source: './nope' }] }) })), /entry name "wrong"[\s\S]*source \.\/nope does not exist/);
});

test('bad hooks.json entries are reported, not thrown', () => {
  assert.match(errorsFor((f) => ({ ...f, 'hooks/hooks.json': JSON.stringify({ hooks: { Stop: [{ matcher: '' }] } }) })), /entry has no hooks array/);
  assert.match(errorsFor((f) => ({ ...f, 'hooks/hooks.json': JSON.stringify({ hooks: { Stop: [{ hooks: [{ type: 'prompt', prompt: 'x' }] }] } }) })), /must be type "command"/);
  assert.match(errorsFor((f) => ({ ...f, 'hooks/hooks.json': JSON.stringify({ hooks: { Stop: [{ hooks: [{ type: 'command', command: 'bash ./hooks/stop.sh' }] }] } }) })), /does not use \$\{CLAUDE_PLUGIN_ROOT\}/);
  assert.match(errorsFor((f) => ({ ...f, 'hooks/stop.sh': null })), /missing hooks\/stop\.sh/);
  assert.match(errorsFor((f) => ({ ...f, 'hooks/hooks.json': JSON.stringify({ hooks: { Stopp: [] } }) })), /unknown event Stopp/);
});

test('a precedence copy that drifts, a missing canonical file and unknown rule names are rejected', () => {
  assert.match(errorsFor((f) => ({ ...f, 'skills/alpha/SKILL.md': f['skills/alpha/SKILL.md'].replace('`one` | stop', '`one` | go') })), /differs from docs\/PRECEDENCE\.md/);
  assert.match(errorsFor((f) => ({ ...f, 'docs/PRECEDENCE.md': null })), /docs\/PRECEDENCE\.md: missing/);
  const ghost = (f) => ({ ...f, 'docs/PRECEDENCE.md': `# P\n${BLOCK.replace('stop |', 'stop |\n| owner | `ghost` |')}\n` });
  assert.match(errorsFor(ghost), /names unknown rule ghost/);
});

test('hook commands must be exactly bash plus one quoted file inside the plugin', () => {
  const cmd = (command) => (f) => ({ ...f, 'hooks/hooks.json': JSON.stringify({ hooks: { Stop: [{ hooks: [{ type: 'command', command }] }] } }) });
  assert.match(errorsFor(cmd('bash "${CLAUDE_PLUGIN_ROOT}/hooks/stop.sh"; curl example.invalid')), /unsupported command/);
  assert.match(errorsFor(cmd('bash "${CLAUDE_PLUGIN_ROOT}/../outside.sh"')), /outside the plugin/);
  const outside = path.join(fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'opsk-out-'))), 'evil.sh');
  fs.writeFileSync(outside, '#!/bin/sh\nexit 0\n', { mode: 0o755 });
  const dir = plugin(cmd('bash "${CLAUDE_PLUGIN_ROOT}/hooks/link.sh"'));
  fs.symlinkSync(outside, path.join(dir, 'hooks', 'link.sh'));
  assert.match(validate(dir).errors.join('\n'), /outside the plugin|symlink/);
});

test('a tier 1 rule may not be suppressed by explore, sketch, spike or throwaway', () => {
  const sketchy = (f) => ({ ...f, 'skills/alpha/rules/one.md': GOOD_RULE.replace('- Never.', '- A throwaway sketch the operator marked as such') });
  assert.match(errorsFor(sketchy), /tier 1 rule .*suppressed by/);
});

test('section headings must match exactly and sections must not be empty', () => {
  assert.match(errorsFor((f) => ({ ...f, 'skills/alpha/rules/one.md': GOOD_RULE.replace('## The pattern\n', '## The pattern library\n') })), /missing "## The pattern" section/);
  assert.match(errorsFor((f) => ({ ...f, 'skills/alpha/rules/one.md': GOOD_RULE.replace('- Never.\n', '') })), /"## Suppression" section is empty/);
});

test('the generated rule trigger table must match the rule files', () => {
  assert.match(errorsFor((f) => ({ ...f, 'skills/alpha/SKILL.md': f['skills/alpha/SKILL.md'].replace('| "an example phrase" / something else |', '| "a stale phrase" |') })), /rule trigger table is out of date/);
});
