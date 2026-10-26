import { withVaultOperation } from './queue.js';
import { createRecord, decryptRecord, encryptEntries, validateRecord } from './crypto.js';
import { validateMaster } from '../validation.js';
import { loadSettings, saveSettings } from '../settings.js';
import { writeLocalVaultRecordRaw, readLocalVaultRecordRaw, recordRevision, getStorage, removeStorage, clearStorage, deleteIndexedDb, setStorage } from '../utils/storage.js';
import { clearHibpCache } from '../hibp.js';
import * as session from './session.js';
// Caller holds the shared operation lock. This is safe to repeat after a worker restart.
export async function finishLocalRecovery() {
  const pending = (await getStorage('local', 'localRestorePending')).localRestorePending;
  if (!pending) return;
  if (pending.operation === 'erase') throw new Error('Local erasure was interrupted. Repeat Delete local SecurePass data to finish.');
  await saveSettings({ ...await loadSettings(), useSync: false }, { allowSyncChange: true });
  await removeStorage('local', [...(pending.preserveBiometric ? [] : ['securepassBiometric']), 'syncStatus', 'syncRetryState']);
  // Keep publication suppressed until every cleanup step has completed.
  await removeStorage('local', 'localRestorePending');
}
export function reconcileLocalRecovery() {
  return withVaultOperation(() => finishLocalRecovery());
}
export async function commitLocalRecovery(next, entries, expectedRecord, epoch) {
  session.assertGeneration(epoch);
  // This durable safety marker suppresses publication even if a later storage write fails.
  await setStorage('local', { localRestorePending: { revision: next.record.revision, preserveBiometric: Boolean(expectedRecord && expectedRecord.keyEpoch === next.record.keyEpoch) } });
  session.assertGeneration(epoch);
  await writeLocalVaultRecordRaw(next.record, recordRevision(expectedRecord));
  await finishLocalRecovery();
  await session.activate(next.record, entries, next.bytes, epoch);
}
export function restoreExternalRecord(record, passphrase, expectedRevision) {
  return withVaultOperation(async epoch => {
    validateRecord(record); validateMaster(passphrase);
    const data = await decryptRecord(record, passphrase);
    const current = await readLocalVaultRecordRaw();
    if (expectedRevision !== undefined && recordRevision(current) !== expectedRevision) throw new Error('Vault changed. Review the restore again.');
    const active = current ? await session.current(current) : null;
    const next = active
      ? { record: await encryptEntries(active.record, data.entries, active.bytes), bytes: active.bytes }
      : await createRecord(data.entries, passphrase, { vaultId: record.vaultId });
    await commitLocalRecovery(next, data.entries, current, epoch);
  });
}
export function wipeDevice(passphrase, { force = false, confirmation } = {}) {
  return withVaultOperation(async epoch => {
    if (force) {
      if (confirmation !== 'ERASE THIS DEVICE') throw new Error('Type ERASE THIS DEVICE to erase local data without unlocking.');
    } else {
      const record = await readLocalVaultRecordRaw();
      if (record) await decryptRecord(record, validateMaster(passphrase));
      else throw new Error('No current vault can verify this password. Choose erase without unlocking and type ERASE THIS DEVICE.');
    }
    session.assertGeneration(epoch);
    // A failed deletion must not allow remaining preferences to reconnect a remote vault.
    await setStorage('local', { localRestorePending: { operation: 'erase' } });
    await session.revokeSession();
    await clearHibpCache();
    await chrome.runtime.sendMessage({ target: 'offscreen', type: 'CLEAR_OWNED' }).catch(() => {});
    await deleteIndexedDb('SecurePassDB');
    await clearStorage('local');
    await clearStorage('session');
  });
}
