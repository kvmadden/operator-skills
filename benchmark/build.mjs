import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve, relative } from 'node:path'
import { hash, report, score, control } from './evaluate.mjs'
import { serializeTask, validateSplits } from './runtime/input.mjs'
const root = fileURLToPath(new URL('../', import.meta.url))
process.chdir(root)
const emit = (path, text) => {
  if (process.argv.includes('--check')) {
    if (readFileSync(path, 'utf8') !== text) throw Error(`stale generated artifact: ${path}`)
  } else writeFileSync(path, text)
}
const read = path => JSON.parse(readFileSync(path, 'utf8'))
const cases = read('benchmark/key/cases.json')
const tasks = read('benchmark/tasks/tasks.json')
const walk = dir => readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap(e => e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`])
const digest = paths => hash(paths.sort().map(path => `${path}\n${hash(readFileSync(path))}`).join('\n'))
validateSplits(cases)
const freeze = {
  version: 1,
  pluginHash: digest([...walk('skills'), ...walk('hooks'), ...walk('.claude-plugin')]),
  runnerHash: digest(walk('benchmark/runtime')),
  evaluatorHash: digest(['benchmark/evaluate.mjs', 'benchmark/audit.mjs']),
  rubricHash: digest(['benchmark/rubric.json']),
  corpusHash: digest(['benchmark/tasks/tasks.json', 'benchmark/key/cases.json']),
  runnerStatus: 'No authorized isolated zero-cost runner configuration established. No agent calls made.',
  runnerMeaning: 'runnerHash freezes the input adapter only. Actual runner binary, model and settings must be separately recorded before any trial.'
}
if (process.argv.includes('--freeze')) writeFileSync('benchmark/freeze.json', JSON.stringify(freeze, null, 2) + '\n')
const frozen = read('benchmark/freeze.json')
for (const field of ['pluginHash', 'runnerHash', 'evaluatorHash', 'rubricHash', 'corpusHash']) if (frozen[field] !== freeze[field]) throw Error(`freeze mismatch: ${field}`)
const runs = read('benchmark/results/runs.json')
for (const run of runs) if (run.provenance.inputHash !== hash(serializeTask({ task: tasks[run.caseId] }))) throw Error('input provenance mismatch')
const output = report(cases, runs, frozen)
output.controls = ['always-silent', 'always-intervene'].map(kind => ({ kind, evidence: 'Deliberate metric control, not agent output', rows: cases.map(c => ({ id: c.id, rule: c.rule, trigger: c.trigger, ...score(c, control(kind, c, tasks[c.id])) })) }))
output.freeze = frozen
emit('benchmark/results/report.json', JSON.stringify(output, null, 2) + '\n')
// A single embedded payload supports file://, with no server or network.
const payload = JSON.stringify({ report: output, cases, tasks, runs }).replaceAll('<', '\\u003c')
const template = readFileSync('benchmark/viewer.template.html', 'utf8')
emit('docs/viewer.html', template.replace('/* PAYLOAD */', `const data = ${payload}`))
// Blind packet has no condition, rule name, label, split or expected output.
const packet = runs.map(run => ({ token: hash(`${run.caseId}:${run.condition}:${run.provenance.loading}`).slice(0, 16), task: tasks[run.caseId], response: run.response, files: run.files }))
emit('benchmark/reviews/blind-packet.json', JSON.stringify(packet, null, 2) + '\n')
console.log(JSON.stringify({ status: output.status, tasks: cases.length, actualRuns: runs.length, viewer: relative(root, resolve('docs/viewer.html')) }))
