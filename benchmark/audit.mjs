export function auditRuntime(sources, cases, tasks) {
  for (const source of sources) {
    if (/key\/|cases\.json|expectedFiles|expected_route/.test(source)) throw Error('key in runtime')
    for (const c of cases.filter(c => c.split === 'final')) {
      // Audit exact task messages and distinctive fixture values, not common prose.
      if (tasks[c.id].messages.some(s => source.includes(s)) || (c.hazard && source.includes(c.hazard))) throw Error('final value in runtime')
    }
  }
}
