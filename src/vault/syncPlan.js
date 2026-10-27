const equal = (a, b) => ['site', 'username', 'password', 'notes'].every(key => (a[key] || '') === (b[key] || ''));
export function planSyncMerge(current, incoming) {
  const entries = structuredClone(current);
  let added = 0; let conflicts = 0; let identical = 0;
  for (const item of incoming) {
    if (entries.some(entry => equal(entry, item))) { identical++; continue; }
    const previous = entries.find(entry => entry.id === item.id || (entry.site === item.site && entry.username === item.username));
    entries.push(previous ? { ...item, id: crypto.randomUUID() } : item);
    if (previous) conflicts++; else added++;
  }
  return { entries, added, conflicts, identical };
}
export function compareSyncContents(current, incoming) {
  const plan = planSyncMerge(current, incoming);
  return {
    current: current.length, incoming: incoming.length,
    removed: current.filter(entry => !incoming.some(item => equal(entry, item))).length,
    added: plan.added, conflicts: plan.conflicts, identical: plan.identical
  };
}
