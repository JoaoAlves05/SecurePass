import { validateImportData, validateVaultEntries, validateString, MAX_VAULT_BYTES } from '../validation.js';

const KIND = 'securepass-vault-state';
export const MAX_HISTORY_ITEMS = 20000;
const revision = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(value);
const exact = (value, names) => value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).sort().join(',') === [...names].sort().join(',');
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;

export function validatePayload(value, { requireIdentity = false } = {}) {
  if ((requireIdentity || value?.kind === KIND) && (!Array.isArray(value?.entries) || value.entries.some(entry => !entry?.id || typeof entry.createdAt !== 'string' || typeof entry.updatedAt !== 'string'))) throw new Error('Merge needs complete authenticated entry identities and dates.');
  if (value?.kind !== KIND) {
    if (value?.tombstones !== undefined || value?.provenance !== undefined) throw new Error('Unsupported vault history format.');
    return { kind: KIND, version: 1, entries: validateImportData(value).entries, tombstones: [], provenance: [] };
  }
  if (!exact(value, ['kind', 'version', 'entries', 'tombstones', 'provenance']) || value.version !== 1) throw new Error('Unsupported vault history format.');
  const entries = validateVaultEntries(value.entries);
  const live = new Set(entries.map(entry => entry.id)); const deleted = new Set();
  if (!Array.isArray(value.tombstones) || !Array.isArray(value.provenance) || value.tombstones.length > MAX_HISTORY_ITEMS || value.provenance.length > MAX_HISTORY_ITEMS) throw new Error('Vault history capacity reached. Preserve a backup before continuing.');
  const tombstones = value.tombstones.map(item => {
    if (!exact(item, ['id', 'revision']) || !revision(item.revision)) throw new Error('Invalid deletion history.');
    validateString(item.id, 64, 'deleted credential ID', true);
    if (live.has(item.id) || deleted.has(item.id)) throw new Error('Conflicting deletion history.');
    deleted.add(item.id);
    return { id: item.id, revision: item.revision };
  }).sort((a, b) => compare(a.id, b.id));
  const seen = new Set();
  const provenance = value.provenance.map(item => {
    let copy;
    if (exact(item, ['id', 'originalId', 'revisions'])) {
      validateString(item.originalId, 64, 'original credential ID', true);
      if (!Array.isArray(item.revisions) || item.revisions.length !== 2 || !item.revisions.every(revision) || item.revisions[0] >= item.revisions[1]) throw new Error('Invalid conflict-copy history.');
      copy = { id: item.id, originalId: item.originalId, revisions: [...item.revisions] };
    } else {
      if (!exact(item, ['id', 'deletedIn', 'restoredIn']) || !revision(item.deletedIn) || !revision(item.restoredIn)) throw new Error('Invalid restoration history.');
      copy = { id: item.id, deletedIn: item.deletedIn, restoredIn: item.restoredIn };
    }
    validateString(item.id, 64, 'history credential ID', true);
    const key = JSON.stringify(copy);
    if (seen.has(key)) throw new Error('Duplicate provenance history.');
    seen.add(key); return copy;
  }).sort((a, b) => compare(JSON.stringify(a), JSON.stringify(b)));
  const payload = { kind: KIND, version: 1, entries, tombstones, provenance };
  if (new TextEncoder().encode(JSON.stringify(payload)).length > MAX_VAULT_BYTES) throw new Error('Vault capacity reached including deletion history (3 MiB).');
  return payload;
}

export function createPayload(entries, history = {}) {
  entries = validateVaultEntries(entries);
  return validatePayload({ kind: KIND, version: 1, entries, tombstones: history.tombstones || [], provenance: history.provenance || [] });
}

export function advancePayload(previous, entries, nextRevision, { allowRestore = false } = {}) {
  previous = validatePayload(previous);
  entries = validateVaultEntries(entries);
  if (!revision(nextRevision)) throw new Error('Invalid mutation revision.');
  const live = new Set(entries.map(entry => entry.id));
  const tombstones = new Map(previous.tombstones.map(item => [item.id, item]));
  const provenance = [...previous.provenance];
  for (const item of previous.entries) if (!live.has(item.id)) tombstones.set(item.id, { id: item.id, revision: nextRevision });
  for (const item of entries) {
    const deleted = tombstones.get(item.id);
    if (!deleted) continue;
    if (!allowRestore) throw new Error('This credential was deleted. Restore it explicitly from Backups & recovery or import a reviewed backup.');
    provenance.push({ id: item.id, deletedIn: deleted.revision, restoredIn: nextRevision });
    tombstones.delete(item.id);
  }
  return createPayload(entries, { tombstones: [...tombstones.values()], provenance });
}

export function combinePayloadHistory(snapshots, result, nextRevision) {
  if (!revision(nextRevision)) throw new Error('Invalid merged revision.');
  const [base, local, remote] = snapshots.map(value => validatePayload(value));
  const live = new Set(result.entries.map(entry => entry.id));
  const deletions = new Map();
  for (const item of [...base.tombstones, ...local.tombstones, ...remote.tombstones]) {
    if (!deletions.has(item.id)) deletions.set(item.id, new Set());
    deletions.get(item.id).add(item.revision);
  }
  for (const id of result.deletedIds) if (!deletions.has(id)) deletions.set(id, new Set([nextRevision]));
  const provenance = [...base.provenance, ...local.provenance, ...remote.provenance, ...result.provenance];
  const restored = new Set(provenance.filter(item => item.deletedIn).map(item => JSON.stringify([item.id, item.deletedIn])));
  const tombstones = [];
  for (const [id, revisions] of deletions) {
    if (live.has(id)) {
      for (const deletedIn of revisions) {
        const key = JSON.stringify([id, deletedIn]);
        if (!restored.has(key)) { provenance.push({ id, deletedIn, restoredIn: nextRevision }); restored.add(key); }
      }
    } else tombstones.push({ id, revision: revisions.size === 1 ? [...revisions][0] : nextRevision });
  }
  const unique = new Map(provenance.map(item => [JSON.stringify(item), item]));
  return createPayload(result.entries, { tombstones, provenance: [...unique.values()] });
}
