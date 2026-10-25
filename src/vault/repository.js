import { readLocalVaultRecordRaw, writeLocalVaultRecordRaw, getStorage, setStorage, recordRevision, readSyncOutbox, acknowledgeSync } from '../utils/storage.js';
import { loadSettings } from '../settings.js';
import { syncHeads, publishGeneration, inspectSync } from './sync.js';
export async function loadRecord() {
  const local = await readLocalVaultRecordRaw();
  if (local) return local;
  if ((await loadSettings()).useSync) {
    // Discovery cannot authenticate a first-device download or create an empty vault.
    const heads = await syncHeads();
    if (heads.length) throw new Error('A remote vault exists. Choose and unlock it in Settings before using it on this device.');
  }
  return null;
}
export async function publishLocalRecord(record) {
  if (!(await loadSettings()).useSync) throw new Error('Sync is off. No remote changes were made.');
  try {
    await publishGeneration(record);
    await acknowledgeSync(record.revision);
    await setStorage('local', { syncStatus: { pending: false, revision: record.revision } });
  } catch (error) {
    await setStorage('local', { syncStatus: { pending: true, revision: record.revision, error: error.message } });
  }
}
export async function commitRecord(record, expected) {
  const enabled = (await loadSettings()).useSync;
  await writeLocalVaultRecordRaw(record, expected, { pendingSync: enabled });
  if (enabled) await publishLocalRecord(record);
}
export async function assertCurrent(record) {
  if (recordRevision(await readLocalVaultRecordRaw()) !== recordRevision(record)) throw new Error('The vault changed. Unlock again.');
  if ((await loadSettings()).useSync) {
    const heads = await syncHeads();
    const incompatible = heads.filter(head => head.revision !== record.revision && !record.parents?.includes(head.revision));
    if (incompatible.length) throw new Error('Sync changed on another device. Resolve or download the new version in settings before editing.');
  }
}
export async function getSyncStatus({ inspectRemote = false } = {}) {
  const local = await readLocalVaultRecordRaw();
  const enabled = (await loadSettings()).useSync;
  const remoteInspected = enabled || inspectRemote;
  const remote = remoteInspected ? await inspectSync() : { heads: [], issues: [] };
  const stored = await getStorage('local', ['syncStatus', 'syncRecovery', 'localRestorePending']);
  const outbox = await readSyncOutbox();
  const pending = Boolean(outbox && outbox.revision === local?.revision);
  return {
    pending, error: pending ? stored.syncStatus?.error : undefined,
    localRevision: local?.revision, initialized: Boolean(local), remoteInspected,
    heads: remote.heads.map(r => ({ revision: r.revision || 'legacy', vaultId: r.vaultId, updatedAt: r.updatedAt, current: recordRevision(r) === recordRevision(local) })),
    enabled, issues: remote.issues, bytesUsed: remote.bytesUsed, itemCount: remote.itemCount,
    recoveryArchiveCount: (stored.syncRecovery || []).length,
    restorePending: Boolean(stored.localRestorePending),
    drive: { available: false, reason: 'Google OAuth and the signed-device protocol are not configured. Local vault and backups are available.' }
  };
}
