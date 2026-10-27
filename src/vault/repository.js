import { readLocalVaultRecordRaw, writeLocalVaultRecordRaw, getStorage, setStorage, recordRevision, readSyncOutbox, acknowledgeSync } from '../utils/storage.js';
import { loadSettings } from '../settings.js';
import { syncHeads, publishGeneration, inspectSync, publicationCapacity } from './sync.js';
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
    await setStorage('local', { syncStatus: { pending: true, revision: record.revision, storingAt: Date.now() } });
    await publishGeneration(record);
    await acknowledgeSync(record.revision);
    await setStorage('local', { syncStatus: { pending: false, revision: record.revision, storedAt: Date.now() } });
  } catch (error) {
    await setStorage('local', { syncStatus: { pending: true, revision: record.revision, error: error.message, errorCode: error.code || 'storage' } });
  }
}
export async function commitRecord(record, expected, options = {}) {
  const enabled = (await loadSettings()).useSync;
  await writeLocalVaultRecordRaw(record, expected, { ...options, pendingSync: enabled });
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
export async function getSyncStatus({ inspectRemote = false, localOnly = false } = {}) {
  const local = await readLocalVaultRecordRaw();
  const enabled = (await loadSettings()).useSync;
  const remoteInspected = !localOnly && (enabled || inspectRemote);
  let remote = { heads: [], issues: [] }; let remoteError; let capacity;
  if (remoteInspected) {
    try {
      const snapshot = await getStorage('sync', null); remote = await inspectSync(snapshot);
      if (local?.version === 2) capacity = await publicationCapacity(local, snapshot);
    }
    catch (error) { remoteError = error.message; }
  }
  const stored = await getStorage('local', ['syncStatus', 'syncRecovery', 'localRestorePending', 'syncSetupComplete', 'syncDeviceReceipt']);
  const outbox = await readSyncOutbox();
  const pending = Boolean(outbox && outbox.revision === local?.revision);
  return {
    pending, error: pending ? stored.syncStatus?.error : undefined, errorCode: pending ? stored.syncStatus?.errorCode : undefined,
    storing: pending && stored.syncStatus?.revision === local?.revision && Number.isFinite(stored.syncStatus?.storingAt) && Date.now() - stored.syncStatus.storingAt >= 0 && Date.now() - stored.syncStatus.storingAt < 30000,
    storedAt: stored.syncStatus?.revision === local?.revision ? stored.syncStatus?.storedAt : undefined,
    setupComplete: enabled || Boolean(stored.syncSetupComplete), capacity, receipt: stored.syncDeviceReceipt,
    localRevision: local?.revision, initialized: Boolean(local), remoteInspected,
    heads: remote.heads.map(r => ({ revision: r.revision || 'legacy', vaultId: r.vaultId, updatedAt: r.updatedAt, current: recordRevision(r) === recordRevision(local) })),
    enabled, remoteError, issues: remote.issues, bytesUsed: remote.bytesUsed, itemCount: remote.itemCount,
    recoveryArchiveCount: (stored.syncRecovery || []).length,
    restorePending: Boolean(stored.localRestorePending),
    drive: { available: false, reason: 'Google OAuth and the signed-device protocol are not configured. Local vault and backups are available.' }
  };
}
