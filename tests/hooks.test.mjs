import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
const hook = resolve('hooks/check-worktree-orphans-on-stop.sh')
const recordHook = resolve('hooks/subagent-stop.sh')
test('existing hooks on temporary repositories and synthetic records only', () => {
  const root = mkdtempSync(join(tmpdir(), 'operator-hooks-'))
  const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] })
  const run = cwd => execFileSync('bash', [hook], { cwd, encoding: 'utf8' })
  try {
    assert.equal(run(root), '')
    git(root, 'init', '-b', 'main')
    git(root, 'config', 'user.name', 'Synthetic Fixture')
    git(root, 'config', 'user.email', 'fixture@example.invalid')
    writeFileSync(join(root, 'file.txt'), 'first\n')
    git(root, 'add', '.')
    git(root, 'commit', '-m', 'Synthetic initial commit')
    assert.equal(run(root), '')
    const worktree = join(root, '.claude/worktrees/fixture')
    git(root, 'worktree', 'add', '-b', 'fixture', worktree)
    assert.equal(run(worktree), '')
    writeFileSync(join(worktree, 'file.txt'), 'second\n')
    git(worktree, 'add', 'file.txt')
    git(worktree, 'commit', '-m', 'Synthetic change')
    assert.match(run(worktree), /unmerged commits/)
    assert.equal(run(root), '')
    execFileSync('bash', [recordHook], { cwd: root, env: { ...process.env, CLAUDE_PROJECT_DIR: root }, input: JSON.stringify({ session_id: 'synthetic-session', tool_input: { subagent_type: 'fixture', description: 'Offline "quoted" check' }, tool_response: { content: [{ type: 'text', text: 'Updated title.txt\nSynthetic only' }] } }) })
    const row = JSON.parse(readFileSync(join(root, '.claude/agent-activity.jsonl'), 'utf8'))
    assert.equal(row.agent, 'fixture')
    assert.equal(row.session_id, 'synthetic-session')
    assert.equal(row.description, 'Offline "quoted" check')
    assert.equal(typeof row.ts, 'string')
    assert.equal(row.project, root)
    assert.equal(row.duration_seconds, 0)
    assert.ok(Array.isArray(row.files_touched))
    git(root, 'worktree', 'remove', worktree)
  } finally { rmSync(root, { recursive: true, force: true }) }
})
