// The only agent input door. Never send the envelope or evaluator to a runner.
export function serializeTask({ task }) {
  if (!task || Object.keys(task).sort().join(',') !== 'files,messages') throw Error('unexpected task fields')
  if (!Array.isArray(task.messages) || !task.messages.every(s => typeof s === 'string')) throw Error('unexpected messages')
  if (!task.files || Array.isArray(task.files) || typeof task.files !== 'object') throw Error('unexpected files')
  const files = {}
  for (const path of Object.keys(task.files).sort()) {
    if (!/^[a-zA-Z0-9_-]+\.[a-z]+$/.test(path) || typeof task.files[path] !== 'string') throw Error('unexpected file')
    files[path] = task.files[path]
  }
  return JSON.stringify({ messages: task.messages, files })
}
export function validateSplits(cases) {
  const families = new Map()
  for (const c of cases) {
    if (families.has(c.family) && families.get(c.family) !== c.split) throw Error('family crosses splits')
    families.set(c.family, c.split)
  }
}
