import { validateVaultEntries } from '../validation.js';

const plans = new WeakMap();
const REVIEW_MS = 2 * 60 * 1000;
const fields = ['site', 'username', 'password', 'notes'];
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const content = entry => entry ? JSON.stringify(fields.map(key => entry[key] || '')) : null;
const equal = (a, b) => content(a) === content(b);
const canonical = entry => JSON.stringify([entry.id, ...fields.map(key => entry[key] || ''), entry.createdAt, entry.updatedAt]);
const representative = (a, b) => !a ? b : !b ? a : compare(canonical(a), canonical(b)) <= 0 ? a : b;
function snapshot(entries) {
  // Imported defaults (random IDs and today's date) cannot establish causality.
  if (!Array.isArray(entries) || entries.some(entry => !entry?.id || typeof entry.createdAt !== 'string' || typeof entry.updatedAt !== 'string')) throw new Error('Merge needs complete authenticated entry identities and dates.');
  return new Map(validateVaultEntries(entries).map(entry => [entry.id, entry]));
}
function revisions(value) {
  const names = ['vaultId', 'keyEpoch', 'base', 'local', 'remote'];
  if (!value || Object.keys(value).sort().join(',') !== [...names].sort().join(',') || names.some(key => typeof value[key] !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(value[key]))) throw new Error('A verified common base and exact vault/epoch/revisions are required.');
  return Object.fromEntries(names.map(key => [key, value[key]]));
}
function checkCurrent(guard) {
  const value = guard();
  if (value && typeof value.then === 'function') {
    Promise.resolve(value).catch(() => {});
    throw new Error('Merge context guard must be synchronous.');
  }
  if (value !== undefined && value !== true) throw new Error('Merge context changed. Review again.');
}

// The application must verify/decrypt the three snapshots and common ancestry
// before calling. This planner neither authenticates inputs nor trusts clocks.
// No handler or production Drive route currently exposes it.
export function planThreeWayMerge({ base, local, remote, identity, assertCurrent }) {
  if (typeof assertCurrent !== 'function') throw new Error('A live session/revision guard is required.');
  checkCurrent(assertCurrent);
  const pinned = revisions(identity);
  const before = snapshot(base); const left = snapshot(local); const right = snapshot(remote);
  const snapshots = [[pinned.base, before], [pinned.local, left], [pinned.remote, right]];
  const serialized = map => JSON.stringify([...map.values()].sort((a, b) => compare(a.id, b.id)).map(canonical));
  for (let a = 0; a < snapshots.length; a++) for (let b = a + 1; b < snapshots.length; b++) {
    if (snapshots[a][0] === snapshots[b][0] && serialized(snapshots[a][1]) !== serialized(snapshots[b][1])) throw new Error('Same revision has inconsistent contents.');
  }
  const entries = []; const deleted = []; const conflicts = [];
  const ids = [...new Set([...before.keys(), ...left.keys(), ...right.keys()])].sort(compare);
  for (const id of ids) {
    const original = before.get(id); const a = left.get(id); const b = right.get(id);
    let selected;
    if (equal(a, b)) selected = representative(a, b);
    else if (equal(a, original)) selected = b;
    else if (equal(b, original)) selected = a;
    else {
      conflicts.push({ id, type: !a || !b ? 'delete-edit' : original ? 'edit-edit' : 'create-create', local: a, remote: b });
      continue;
    }
    if (selected) entries.push(selected);
    else if (original) deleted.push(id);
  }
  checkCurrent(assertCurrent);
  const createdAt = Date.now();
  const plan = Object.freeze({
    identity: Object.freeze(pinned),
    automatic: entries.length,
    deleted: deleted.length,
    expiresAt: createdAt + REVIEW_MS,
    conflicts: Object.freeze(conflicts.map(({ id, type }) => Object.freeze({ id, type })))
  });
  plans.set(plan, { identity: pinned, entries, deleted, conflicts, assertCurrent, ids: new Set(ids), createdAt });
  return plan;
}

export function discardThreeWayMerge(plan) { plans.delete(plan); }

export async function resolveThreeWayMerge(plan, decisions, currentIdentity) {
  const state = plans.get(plan);
  if (!state) throw new Error('Merge review expired or was discarded.');
  checkCurrent(state.assertCurrent);
  if (Date.now() < state.createdAt || Date.now() >= plan.expiresAt) throw new Error('Merge review expired. Review again.');
  if (JSON.stringify(revisions(currentIdentity)) !== JSON.stringify(state.identity)) throw new Error('Merge revisions changed. Review again.');
  if (!decisions || typeof decisions !== 'object' || Array.isArray(decisions)) throw new Error('Explicit conflict decisions are required.');
  const choices = new Map(Object.entries(decisions));
  if (choices.size !== state.conflicts.length || state.conflicts.some(({ id }) => !choices.has(id))) throw new Error('Resolve every conflict and no unrelated entries.');
  const result = new Map(state.entries.map(entry => [entry.id, entry]));
  const deleted = new Set(state.deleted); const provenance = [];
  for (const conflict of state.conflicts) {
    const choice = choices.get(conflict.id);
    if (!['local', 'remote', 'both'].includes(choice)) throw new Error('Invalid conflict decision.');
    if (choice !== 'both') {
      const entry = conflict[choice];
      if (entry) result.set(entry.id, entry); else deleted.add(conflict.id);
      continue;
    }
    if (!conflict.local || !conflict.remote) throw new Error('Choose the surviving entry or the deletion explicitly.');
    const versions = [conflict.local, conflict.remote].sort((a, b) => compare(content(a), content(b)));
    result.set(conflict.id, versions[0]);
    // Stable content-derived copy identity makes replay and swapped delivery
    // order idempotent. Provenance is separate; never append it to user notes.
    const bytes = new TextEncoder().encode(JSON.stringify(['SecurePass:merge-copy:1', state.identity.vaultId, conflict.id, content(versions[1])]));
    const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(value => value.toString(16).padStart(2, '0')).join('');
    const id = `c-${hash.slice(0, 62)}`;
    const duplicate = result.get(id);
    if (duplicate && !equal(duplicate, versions[1]) || state.ids.has(id) && (!duplicate || state.conflicts.some(conflict => conflict.id === id))) throw new Error('Conflict copy identity collision. No merge was applied.');
    result.set(id, { ...representative(duplicate, versions[1]), id });
    provenance.push({ id, originalId: conflict.id, revisions: [state.identity.local, state.identity.remote].sort(compare) });
  }
  const entries = validateVaultEntries([...result.values()].sort((a, b) => compare(a.id, b.id)));
  const output = { entries, deletedIds: [...deleted].sort(compare), provenance };
  checkCurrent(state.assertCurrent);
  if (Date.now() < state.createdAt || Date.now() >= plan.expiresAt) throw new Error('Merge review expired. Review again.');
  if (!plans.has(plan)) throw new Error('Merge review expired or was discarded.');
  return structuredClone(output);
}
