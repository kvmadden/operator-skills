// Surface-cue check for the paired authored variants. This does not run an agent.
import { readFileSync, writeFileSync } from 'node:fs'
import { hash } from './evaluate.mjs'
const cases = JSON.parse(readFileSync(new URL('./key/cases.json', import.meta.url)))
const tasks = JSON.parse(readFileSync(new URL('./tasks/tasks.json', import.meta.url)))
const mask = text => text.replace(/OFFLINE_ONLY_[a-f0-9]+|<KEY>|sk-fake/g, '<VALUE>')
const window = c => mask(tasks[c.id].messages.join('\n'))
const features = text => [text.length, text.split(/\s+/).length, (text.match(/[".,!?]/g) ?? []).length, (text.match(/[A-Z]/g) ?? []).length]
const dev = cases.filter(c => c.split === 'dev')
const final = cases.filter(c => c.split === 'final')
// Fixed nearest-centroid classifier, fit on development families only.
const vectors = dev.map(c => features(window(c)))
const means = [0, 1, 2, 3].map(i => vectors.reduce((n, v) => n + v[i], 0) / vectors.length)
const scales = means.map((m, i) => Math.sqrt(vectors.reduce((n, v) => n + (v[i] - m) ** 2, 0) / vectors.length) || 1)
const normalized = c => features(window(c)).map((v, i) => (v - means[i]) / scales[i])
const centroid = label => {
  const rows = dev.filter(c => !c.trigger === label).map(normalized)
  return means.map((_, i) => rows.reduce((n, r) => n + r[i], 0) / rows.length)
}
const centers = [centroid(false), centroid(true)]
const predictions = final.map(c => {
  const v = normalized(c)
  const distances = centers.map(center => center.reduce((n, x, i) => n + (v[i] - x) ** 2, 0))
  return { id: c.id, edited: !c.trigger, prediction: distances[1] < distances[0] }
})
const audit = { status: 'draft, pending blind edit review', method: 'Four surface features with masked fixture values. Nearest centroid fitted only on dev families. Original trigger prompts versus paired edited suppression prompts.', limitation: 'Semantic differences are intentional. This small cue check cannot establish indistinguishability or natural task validity.', accuracy: { numerator: predictions.filter(r => r.edited === r.prediction).length, denominator: final.length }, predictions }
const ordered = [...final].sort((a, b) => hash(a.id + ':edit-review-v1').localeCompare(hash(b.id + ':edit-review-v1')))
const selected = [true, false].flatMap(trigger => ordered.filter(c => c.trigger === trigger).slice(0, 10)).sort((a, b) => hash(a.id + ':blind-order-v1').localeCompare(hash(b.id + ':blind-order-v1')))
const sheet = '# Blind edit review\n\nDraft, pending Kevin operator review. Twenty masked prompt windows, ten original and ten paired edits in fixed shuffled order. Guess edited or untouched and give a reason before opening the mapping. No review has occurred. This is separate from outcome review.\n\n' + selected.map(c => `## ${hash(c.id + ':window-v1').slice(0, 12)}\n\n${window(c)}\n\nGuess:\nReason:\nReviewer and date:\n`).join('\n')
const outputs = { 'benchmark/reviews/variant-classifier.json': JSON.stringify(audit, null, 2) + '\n', 'benchmark/reviews/blind-edit-sheet.md': sheet, 'benchmark/key/edit-review-map.json': JSON.stringify(selected.map(c => ({ token: hash(c.id + ':window-v1').slice(0, 12), id: c.id, edited: !c.trigger })), null, 2) + '\n' }
for (const [path, text] of Object.entries(outputs)) {
  if (process.argv.includes('--check')) {
    if (readFileSync(path, 'utf8') !== text) throw Error(`stale variant audit: ${path}`)
  } else writeFileSync(path, text)
}
console.log(JSON.stringify({ surfaceClassifier: audit.accuracy, review: audit.status }))
