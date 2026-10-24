import { readLocalVaultRecordRaw, writeLocalVaultRecordRaw, getStorage, setStorage, recordRevision } from '../utils/storage.js';
import { loadSettings } from '../settings.js';
import { syncHeads, publishGeneration } from './sync.js';

export async function loadRecord() {
  const local = await readLocalVaultRecordRaw();
  if (local) return local;
  if ((await loadSettings()).useSync) {
    const heads = await syncHeads();
    if (heads.length > 1) throw new Error('Multiple Sync vaults found. Resolve the conflict in settings.');
    if (heads.length) {
      await writeLocalVaultRecordRaw(heads[0], null);
      return heads[0];
    }
  }
  return null;
}

export async function commitRecord(record, expected) {
  await writeLocalVaultRecordRaw(record, expected);
  if ((await loadSettings()).useSync) {
    // Local commit is authoritative. Publication errors are explicit pending work, never false rollback.
    try {
      await publishGeneration(record);
      await setStorage('local', { syncStatus: { pending: false } });
    } catch (error) {
      await setStorage('local', { syncStatus: { pending: true, error: error.message } });
    }
  }
}

export async function assertCurrent(record) {
  if (recordRevision(await readLocalVaultRecordRaw()) !== recordRevision(record)) throw new Error('The vault changed. Unlock again.');
  if ((await loadSettings()).useSync) {
    const heads = await syncHeads();
    const incompatible = heads.filter(head => head.revision !== record.revision && !record.parents?.includes(head.revision));
    if (incompatible.length) throw new Error('Sync changed on another device. Resolve or download the new version in settings before editing.');
  }
}

export async function getSyncStatus() {
  const local = await readLocalVaultRecordRaw();
  const heads = await syncHeads();
  const state = (await getStorage('local', 'syncStatus')).syncStatus || {};
  return { ...state, localRevision: local?.revision, heads: heads.map(r => ({ revision: r.revision || 'legacy', vaultId: r.vaultId, updatedAt: r.updatedAt, current: recordRevision(r) === recordRevision(local) })), enabled: (await loadSettings()).useSync };
}
