// Contract tests for the two shipped hooks, run against temporary git
// repositories and the Claude Code 2.1.304 payload fixtures. Paths are compared
// after realpath so the tests behave the same on macOS (/var -> /private/var)
// and Linux. Credential-shaped and patient-shaped strings are built at runtime
// from fragments so no such literal appears in the repository.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SUBAGENT = path.join(root, 'hooks', 'subagent-stop.sh');
const STOP = path.join(root, 'hooks', 'check-worktree-orphans-on-stop.sh');
const FIXTURES = path.join(root, 'tests', 'fixtures', 'hooks', 'claude-code-2.1.304');
const fixture = (name) => JSON.parse(fs.readFileSync(path.join(FIXTURES, name), 'utf8'));

const GIT_ENV = { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1' };
const isRoot = typeof process.getuid === 'function' && process.getuid() === 0;

function tmp(prefix = 'opsk-') {
  return fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
}

function runHook(script, input, { cwd, env = {}, pathOverride } = {}) {
  const home = tmp('opsk-home-');
  const result = spawnSync('bash', [script], {
    cwd: cwd ?? home,
    input: typeof input === 'string' ? input : JSON.stringify(input),
    env: {
      PATH: pathOverride ?? process.env.PATH,
      HOME: home,
      GIT_CONFIG_GLOBAL: '/dev/null',
      GIT_CONFIG_NOSYSTEM: '1',
      ...env,
    },
    encoding: 'utf8',
  });
  return { code: result.status, out: result.stdout, err: result.stderr, home };
}

function git(cwd, ...args) {
  return execFileSync('git', ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid',
    '-c', 'commit.gpgsign=false', ...args], { cwd, encoding: 'utf8', env: GIT_ENV, stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function commitFile(dir, file, content, message) {
  fs.writeFileSync(path.join(dir, file), content);
  git(dir, 'add', file);
  git(dir, 'commit', '-q', '-m', message);
}

function repoWithWorktree({ base = tmp(), defaultBranch = 'main', branch = 'feature', detached = false } = {}) {
  const repo = path.join(base, 'repo');
  fs.mkdirSync(repo, { recursive: true });
  git(repo, 'init', '-q', '-b', defaultBranch);
  commitFile(repo, 'a.txt', 'a\n', 'initial');
  const wt = path.join(repo, '.claude', 'worktrees', 'w1');
  if (detached) git(repo, 'worktree', 'add', '-q', '--detach', wt);
  else git(repo, 'worktree', 'add', '-q', '-b', branch, wt);
  return { base, repo, wt: fs.realpathSync(wt) };
}

function stopPayload(wt, extra = {}) {
  return { ...fixture('stop.json'), cwd: wt, session_id: 'session-one', ...extra };
}

function parseOne(out) {
  const text = out.trim();
  assert.ok(text.startsWith('{') && text.endsWith('}'), `expected one JSON object, got: ${text}`);
  return JSON.parse(text);
}

// A PATH directory with the tools the hooks need, minus jq.
function pathWithoutJq() {
  const dir = tmp('opsk-bin-');
  for (const tool of ['bash', 'git', 'cat', 'date', 'mkdir', 'wc', 'mv', 'tr', 'cut', 'sort', 'comm', 'chmod']) {
    const found = execFileSync('bash', ['-c', `command -v ${tool}`], { encoding: 'utf8' }).trim();
    fs.symlinkSync(found, path.join(dir, tool));
  }
  return dir;
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}

// ---------------------------------------------------------------- SubagentStop

test('SubagentStop: records metadata from the 2.1.304 payload, outside the project, mode 600', () => {
  const project = tmp();
  const state = path.join(tmp(), 'state');
  const r = runHook(SUBAGENT, { ...fixture('subagent-stop.json'), cwd: project }, { env: { OPERATOR_SKILLS_STATE_DIR: state } });
  assert.equal(r.code, 0);
  assert.equal(r.out, '');
  const log = path.join(state, 'agent-activity.jsonl');
  const lines = fs.readFileSync(log, 'utf8').trim().split('\n');
  assert.equal(lines.length, 1);
  const row = JSON.parse(lines[0]);
  assert.equal(row.event, 'SubagentStop');
  assert.equal(row.agent_id, 'a3f9c2e1b7d4');
  assert.equal(row.agent_type, 'general-purpose');
  assert.equal(row.session_id, '0f6d1c3e-4b8a-4c2d-9e1f-5a7b3c9d2e10');
  assert.equal(row.project, project);
  assert.equal(row.last_message_chars, fixture('subagent-stop.json').last_assistant_message.length);
  assert.equal('last_assistant_message' in row, false);
  assert.equal(fs.statSync(log).mode & 0o777, 0o600);
  assert.equal(fs.existsSync(path.join(project, '.claude')), false, 'nothing is written into the project tree');
});

test('SubagentStop: default location is under XDG_STATE_HOME, then HOME/.local/state', () => {
  const xdg = tmp();
  const r1 = runHook(SUBAGENT, fixture('subagent-stop.json'), { env: { XDG_STATE_HOME: xdg } });
  assert.equal(r1.code, 0);
  assert.ok(fs.existsSync(path.join(xdg, 'operator-skills', 'agent-activity.jsonl')));
  const r2 = runHook(SUBAGENT, fixture('subagent-stop.json'));
  assert.equal(r2.code, 0);
  assert.ok(fs.existsSync(path.join(r2.home, '.local', 'state', 'operator-skills', 'agent-activity.jsonl')));
});

test('SubagentStop: reply text is never stored, so credential-shaped and patient-shaped strings stay out of the log', () => {
  const state = path.join(tmp(), 'state');
  const liveKey = ['sk', 'live', '51FIXTURE0NLY0000000000000'].join('_');
  const dbUrl = 'postgres' + '://admin:' + 'Fixture' + 'Pass1@db.internal:5432/ehr';
  const mrn = 'MRN ' + '00' + '4218';
  const message = `Found ${liveKey} and ${dbUrl} in config for Test Patient Alpha, ${mrn}, DOB 1952-04-03.`;
  const r = runHook(SUBAGENT, { ...fixture('subagent-stop.json'), last_assistant_message: message }, { env: { OPERATOR_SKILLS_STATE_DIR: state } });
  assert.equal(r.code, 0);
  const whole = fs.readFileSync(path.join(state, 'agent-activity.jsonl'), 'utf8');
  for (const fragment of [liveKey, dbUrl, mrn, 'Test Patient Alpha', '1952-04-03', 'Found']) {
    assert.equal(whole.includes(fragment), false, `log must not contain: ${fragment}`);
  }
  assert.equal(JSON.parse(whole).last_message_chars, message.length);
});

test('SubagentStop: a reply that names no file still gives one valid JSON line (the case PR #1 fixed)', () => {
  const state = path.join(tmp(), 'state');
  const r = runHook(SUBAGENT, { ...fixture('subagent-stop.json'), last_assistant_message: 'Looks fine overall. No changes made.' },
    { env: { OPERATOR_SKILLS_STATE_DIR: state } });
  assert.equal(r.code, 0);
  const lines = fs.readFileSync(path.join(state, 'agent-activity.jsonl'), 'utf8').trim().split('\n');
  assert.equal(lines.length, 1);
  assert.doesNotThrow(() => JSON.parse(lines[0]));
});

test('SubagentStop: malformed input, an empty payload and a payload without agent fields record nothing and exit 0', () => {
  const state = path.join(tmp(), 'state');
  for (const input of ['not json {', '', JSON.stringify({ session_id: 's', tool_input: { subagent_type: 'old-shape' } }), '[1,2]']) {
    const r = runHook(SUBAGENT, input, { env: { OPERATOR_SKILLS_STATE_DIR: state } });
    assert.equal(r.code, 0);
    assert.equal(r.out, '');
  }
  assert.equal(fs.existsSync(path.join(state, 'agent-activity.jsonl')), false);
});

test('SubagentStop: the off switch records nothing', () => {
  const state = path.join(tmp(), 'state');
  const r = runHook(SUBAGENT, fixture('subagent-stop.json'), { env: { OPERATOR_SKILLS_STATE_DIR: state, OPERATOR_SKILLS_ACTIVITY_LOG: 'off' } });
  assert.equal(r.code, 0);
  assert.equal(fs.existsSync(state), false);
});

test('SubagentStop: without jq it exits 0 silently and records nothing', () => {
  const state = path.join(tmp(), 'state');
  const r = runHook(SUBAGENT, fixture('subagent-stop.json'), { env: { OPERATOR_SKILLS_STATE_DIR: state }, pathOverride: pathWithoutJq() });
  assert.equal(r.code, 0);
  assert.equal(r.out, '');
  assert.equal(fs.existsSync(path.join(state, 'agent-activity.jsonl')), false);
});

test('SubagentStop: an unwritable state directory still exits 0', { skip: isRoot ? 'root ignores directory permissions' : false }, () => {
  const parent = tmp();
  fs.chmodSync(parent, 0o500);
  try {
    const r = runHook(SUBAGENT, fixture('subagent-stop.json'), { env: { OPERATOR_SKILLS_STATE_DIR: path.join(parent, 'state') } });
    assert.equal(r.code, 0);
    assert.equal(r.out, '');
  } finally {
    fs.chmodSync(parent, 0o700);
  }
});

test('SubagentStop: rotates the log past 1 MiB and keeps one previous file', () => {
  const state = path.join(tmp(), 'state');
  fs.mkdirSync(state, { recursive: true });
  const log = path.join(state, 'agent-activity.jsonl');
  fs.writeFileSync(log, 'x'.repeat(1_100_000));
  const r = runHook(SUBAGENT, fixture('subagent-stop.json'), { env: { OPERATOR_SKILLS_STATE_DIR: state } });
  assert.equal(r.code, 0);
  assert.equal(fs.statSync(`${log}.1`).size, 1_100_000);
  assert.equal(fs.readFileSync(log, 'utf8').trim().split('\n').length, 1);
});

// ---------------------------------------------------------------- Stop (worktree check)

function stopRun(wt, { state = path.join(tmp(), 'state'), payload, cwd, pathOverride } = {}) {
  return runHook(STOP, payload ?? stopPayload(wt), { cwd, env: { OPERATOR_SKILLS_STATE_DIR: state }, pathOverride });
}

test('Stop: silent outside git, in the main checkout and in a clean worktree with nothing ahead', () => {
  const plain = tmp();
  assert.equal(stopRun(plain).out, '');
  const { repo, wt } = repoWithWorktree();
  commitFile(repo, 'b.txt', 'b\n', 'main moves on');
  assert.equal(stopRun(repo).out, '', 'main checkout is not a linked worktree');
  assert.equal(stopRun(wt).out, '', 'linked worktree with nothing ahead');
});

test('Stop: one commit ahead gives one systemMessage JSON object, exit 0', () => {
  const { wt } = repoWithWorktree();
  commitFile(wt, 'b.txt', 'b\n', 'Add b');
  const r = stopRun(wt);
  assert.equal(r.code, 0);
  const msg = parseOne(r.out).systemMessage;
  assert.match(msg, /Branch: feature/);
  assert.match(msg, /Commits not found in main: 1 \(newest: Add b\)/);
  assert.match(msg, new RegExp(`Worktree: ${wt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
});

test('Stop: warns once per session and HEAD, then again after a new commit', () => {
  const { wt } = repoWithWorktree();
  const state = path.join(tmp(), 'state');
  commitFile(wt, 'b.txt', 'b\n', 'Add b');
  assert.notEqual(stopRun(wt, { state }).out, '');
  assert.equal(stopRun(wt, { state }).out, '', 'same session, same HEAD');
  commitFile(wt, 'c.txt', 'c\n', 'Add c');
  assert.match(parseOne(stopRun(wt, { state }).out).systemMessage, /Commits not found in main: 2/);
});

test('Stop: a squash-merged branch is not reported', () => {
  const { repo, wt } = repoWithWorktree();
  commitFile(wt, 'b.txt', 'b\n', 'Add b');
  commitFile(wt, 'c.txt', 'c\n', 'Add c');
  git(repo, 'merge', '--squash', 'feature');
  git(repo, 'commit', '-q', '-m', 'Squash feature');
  assert.equal(stopRun(wt).out, '');
});

test('Stop: a cherry-picked or rebased commit is not reported', () => {
  const { repo, wt } = repoWithWorktree();
  commitFile(wt, 'b.txt', 'b\n', 'Add b');
  git(repo, 'cherry-pick', git(wt, 'rev-parse', 'HEAD'));
  assert.equal(stopRun(wt).out, '');
});

test('Stop: commits already in origin/main are not reported when local main is stale', () => {
  const { repo, wt } = repoWithWorktree();
  commitFile(wt, 'b.txt', 'b\n', 'Add b');
  git(repo, 'update-ref', 'refs/remotes/origin/main', git(wt, 'rev-parse', 'HEAD'));
  git(repo, 'symbolic-ref', 'refs/remotes/origin/HEAD', 'refs/remotes/origin/main');
  assert.equal(stopRun(wt).out, '');
});

test('Stop: detached HEAD names the commit and suggests a branch, never a delete', () => {
  const { wt } = repoWithWorktree({ detached: true });
  commitFile(wt, 'b.txt', 'b\n', 'Detached work');
  const msg = parseOne(stopRun(wt).out).systemMessage;
  assert.match(msg, new RegExp(`Detached HEAD at ${git(wt, 'rev-parse', '--short', 'HEAD')}`));
  assert.doesNotMatch(msg, /git branch -D|git merge|worktree remove/);
});

test('Stop: uses the trunk default branch and reports unknown merge state when none is found', () => {
  const trunk = repoWithWorktree({ defaultBranch: 'trunk' });
  commitFile(trunk.wt, 'b.txt', 'b\n', 'Add b');
  assert.match(parseOne(stopRun(trunk.wt).out).systemMessage, /Commits not found in trunk: 1/);
  const odd = repoWithWorktree({ defaultBranch: 'work' });
  commitFile(odd.wt, 'b.txt', 'b\n', 'Add b');
  const msg = parseOne(stopRun(odd.wt).out).systemMessage;
  assert.match(msg, /Merge state: unknown/);
  assert.match(msg, /Needs review/);
  assert.doesNotMatch(msg, /Commits not found/);
});

test('Stop: hostile path, branch name and commit subject produce valid JSON and execute nothing', () => {
  const base = path.join(tmp(), 'my repo');
  fs.mkdirSync(base);
  const { wt } = repoWithWorktree({ base, branch: 'fix;touch${IFS}PWNED' });
  commitFile(wt, 'b.txt', 'b\n', 'subject $(touch PWNED_SUBJECT) `touch PWNED_BT` "quoted" back\\slash');
  const r = stopRun(wt, { cwd: base });
  assert.equal(r.code, 0);
  const msg = parseOne(r.out).systemMessage;
  assert.match(msg, /Branch: fix;touch\$\{IFS\}PWNED/);
  assert.doesNotMatch(msg, /git branch -D|git merge|cd \$\(/);
  assert.deepEqual(walk(path.dirname(base)).filter((f) => path.basename(f).startsWith('PWNED')), []);
});

test('Stop: uncommitted changes alone are reported with a count', () => {
  const { wt } = repoWithWorktree();
  fs.writeFileSync(path.join(wt, 'a.txt'), 'changed\n');
  const msg = parseOne(stopRun(wt).out).systemMessage;
  assert.match(msg, /Uncommitted changes: 1 paths/);
  assert.doesNotMatch(msg, /Commits not found/);
});

test('Stop: stop_hook_active true stays silent, and the payload cwd wins over the process cwd', () => {
  const { wt } = repoWithWorktree();
  commitFile(wt, 'b.txt', 'b\n', 'Add b');
  assert.equal(stopRun(wt, { payload: stopPayload(wt, { stop_hook_active: true }) }).out, '');
  const elsewhere = tmp();
  assert.match(parseOne(stopRun(wt, { cwd: elsewhere }).out).systemMessage, /Commits not found in main: 1/);
});

test('Stop: without jq the warning is still one valid JSON object with escaped text', () => {
  const { wt } = repoWithWorktree();
  commitFile(wt, 'b.txt', 'b\n', 'Say "hi" and use a back\\slash\ttab');
  // Without jq the hook cannot read the payload, so it falls back to the process cwd.
  const r = stopRun(wt, { cwd: wt, pathOverride: pathWithoutJq() });
  assert.equal(r.code, 0);
  const msg = parseOne(r.out).systemMessage;
  assert.match(msg, /Say "hi" and use a back\\slash/);
});
