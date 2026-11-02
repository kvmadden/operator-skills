import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { serializeTask, validateSplits } from '../benchmark/runtime/input.mjs'
import { auditRuntime } from '../benchmark/audit.mjs'
import { score, control, report } from '../benchmark/evaluate.mjs'
const cases = JSON.parse(readFileSync(new URL('../benchmark/key/cases.json', import.meta.url)))
const tasks = JSON.parse(readFileSync(new URL('../benchmark/tasks/tasks.json', import.meta.url)))

test('36 tasks, 12 development and 24 final with balanced rules and labels', () => {
  assert.equal(cases.length, 36)
  validateSplits(cases)
  assert.equal(cases.filter(c => c.split === 'dev').length, 12)
  for (const rule of ['secrets-walk', 'scope-lock']) {
    for (const trigger of [true, false]) assert.equal(cases.filter(c => c.split === 'final' && c.rule === rule && c.trigger === trigger).length, 6)
  }
  assert.throws(() => validateSplits([...cases, { ...cases[0], split: 'final' }]), /family/)
})
test('only task content reaches runner and metadata permutation is invariant', () => {
  for (const c of cases) {
    const task = tasks[c.id]
    const a = serializeTask({ ...c, task })
    const b = serializeTask({ expected_route: 'poison', label: 'poison', ...Object.fromEntries(Object.entries(c).reverse()), task })
    assert.equal(a, b)
    assert.deepEqual(Object.keys(JSON.parse(a)), ['messages', 'files'])
    assert.equal(a.includes(c.id), false)
    assert.equal(a.includes(c.family), false)
  }
  assert.throws(() => serializeTask({ task: { messages: ['ok'], files: {}, label: 'trigger' } }), /unexpected/)
})
test('runtime excludes final key, fixture literals and answer imports', () => {
  const collect = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? collect(`${dir}/${e.name}`) : [readFileSync(`${dir}/${e.name}`, 'utf8')])
  const sources = [...collect('benchmark/runtime'), ...collect('skills'), ...collect('hooks'), ...collect('.claude-plugin')]
  auditRuntime(sources, cases, tasks)
  assert.throws(() => auditRuntime(['import "../key/cases.json"'], cases, tasks), /key/)
  assert.throws(() => auditRuntime([tasks[cases.at(-1).id].messages[0]], cases, tasks), /final/)
})
test('degenerate controls fail opposite directions and suppression completion', () => {
  for (const c of cases) {
    const silent = score(c, control('always-silent', c, tasks[c.id]))
    const loud = score(c, control('always-intervene', c, tasks[c.id]))
    if (c.trigger) {
      assert.equal(silent.correction, false)
      assert.equal(loud.correction, true)
    } else {
      assert.equal(silent.completion, true)
      assert.equal(loud.falseInterruption, true)
      assert.equal(loud.completion, false)
    }
  }
})
test('both rules grade actual artifacts and reject empty declarations', () => {
  for (const c of cases) {
    const good = { intervention: c.trigger, response: c.trigger ? c.requiredResponse : 'Finished the requested edit.', files: c.expectedFiles, continued: !c.trigger }
    assert.equal(score(c, good).pass, true, c.id)
    assert.equal(score(c, { ...good, files: { 'app.js': 'wrong' }, response: '' }).pass, false)
    assert.equal(score(c, good).review, 'pending operator review')
  }
})
test('fixture values are explicitly nonfunctional, report is reproducible and unmeasured', () => {
  for (const task of Object.values(tasks)) {
    assert.match(task.messages.join(' '), /offline|local|repository|file|brief|review|explor/i)
    assert.doesNotMatch(JSON.stringify(task), /sk_live_|ghp_|AKIA[0-9A-Z]{16}|BEGIN PRIVATE KEY/)
  }
  const a = report(cases, [])
  assert.deepEqual(a, report(cases, []))
  assert.equal(a.status, 'unmeasured')
  assert.equal(a.review, 'pending operator review')
  assert.equal(a.groups.every(g => g.attempts === 0 && g.completion.rate === null), true)
  assert.throws(() => report(cases, [{ caseId: cases[0].id, condition: 'plugin-on' }]), /provenance/)
})
test('viewer distinguishes three evidence levels and has no network dependency', () => {
  const html = readFileSync('docs/viewer.html', 'utf8')
  for (const label of ['Static keyword routing', 'Actual automatic loading', 'Manually injected rule-following', 'unmeasured', 'pending operator review']) assert.ok(html.includes(label), label)
  assert.doesNotMatch(html, /https?:\/\/|fetch\(/)
})
test('leak and unapproved changes fail even when an intervention is declared', () => {
  for (const c of cases.filter(c => c.trigger)) {
    const run = { intervention: true, continued: false, response: c.requiredResponse, files: c.expectedFiles }
    if (c.hazard) {
      assert.equal(score(c, { ...run, response: `${run.response} ${c.hazard}` }).failure, 'secret repeated or artifact leaked')
      assert.equal(score(c, { ...run, files: { ...run.files, 'leak.txt': c.hazard } }).pass, false)
    } else assert.equal(score(c, { ...run, files: { ...run.files, 'extra.txt': 'unapproved' } }).failure, 'unauthorized scope change')
  }
})
test('paired report preserves manual separation, partial denominators and family intervals', async () => {
  const { interval } = await import('../benchmark/evaluate.mjs')
  const freeze = { pluginHash: 'frozen-plugin', runnerHash: 'frozen-adapter' }
  const sample = cases.find(c => c.split === 'final' && !c.trigger)
  const make = (condition, loading) => ({ caseId: sample.id, condition, intervention: false, continued: true, response: 'Done', files: sample.expectedFiles, trace: [{ type: 'edit', origin: 'runner-tool-record' }], provenance: { ...freeze, loading, model: 'test-only', version: 'fixture', command: ['fixture'], settings: {}, inputHash: 'fixture' } })
  const off = make('plugin-off', 'off')
  const on = make('plugin-on', 'manual')
  const r = report(cases, [off, on], freeze)
  assert.equal(r.groups.find(g => g.rule === sample.rule && g.loading === 'manual').attempts, 1)
  assert.equal(r.groups.find(g => g.rule === sample.rule && g.loading === 'automatic').attempts, 0)
  assert.equal(r.paired.find(p => p.rule === sample.rule && p.loading === 'manual').completion.pairs, 1)
  assert.equal(r.paired.find(p => p.rule === sample.rule && p.loading === 'automatic').completion.difference, null)
  assert.throws(() => report(cases, [off, off], freeze), /duplicate/)
  assert.throws(() => report(cases, [{ ...on, provenance: { ...on.provenance, loading: 'automatic' } }], freeze), /discovery/)
  assert.throws(() => report(cases, [on], { ...freeze, pluginHash: 'drift' }), /freeze/)
  assert.equal(interval([{ family: 'one', completion: true }], 'completion'), null)
  const rows = [{ family: 'one', completion: false }, { family: 'two', completion: true }]
  assert.deepEqual(interval(rows, 'completion'), interval(rows, 'completion'))
})
