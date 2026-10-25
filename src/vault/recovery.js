import { withVaultOperation } from './queue.js';
import { createRecord, decryptRecord, validateRecord } from './crypto.js';
import { validateMaster } from '../validation.js';
import { loadSettings, saveSettings } from '../settings.js';
import { writeLocalVaultRecordRaw, readLocalVaultRecordRaw, recordRevision, removeStorage, clearStorage, deleteIndexedDb, setStorage } from '../utils/storage.js';
import { clearHibpCache } from '../hibp.js';
import * as session from './session.js';
export async function commitLocalRecovery(next, entries, expectedRecord, epoch) {
  session.assertGeneration(epoch);
  // This durable safety marker suppresses publication even if a later storage write fails.
  await setStorage('local', { localRestorePending: { revision: next.record.revision } });
  await writeLocalVaultRecordRaw(next.record, recordRevision(expectedRecord));
  await saveSettings({ ...await loadSettings(), useSync: false }, { allowSyncChange: true });
  await removeStorage('local', ['securepassBiometric', 'localRestorePending', 'syncStatus']);
  await session.activate(next.record, entries, next.bytes, epoch);
}
export function restoreExternalRecord(record, passphrase, expectedRevision) {
  return withVaultOperation(async epoch => {
    validateRecord(record); validateMaster(passphrase);
    const data = await decryptRecord(record, passphrase);
    const current = await readLocalVaultRecordRaw();
    if (expectedRevision !== undefined && recordRevision(current) !== expectedRevision) throw new Error('Vault changed. Review the restore again.');
    if (current) await session.current(current);
    const next = await createRecord(data.entries, passphrase, { vaultId: record.vaultId });
    await commitLocalRecovery(next, data.entries, current, epoch);
  });
}
export function wipeDevice(passphrase, { force = false, confirmation } = {}) {
  return withVaultOperation(async epoch => {
    const record = await readLocalVaultRecordRaw();
    if (force) {
      if (confirmation !== 'ERASE THIS DEVICE') throw new Error('Type ERASE THIS DEVICE to erase local data without unlocking.');
    } else if (record) await decryptRecord(record, validateMaster(passphrase));
    session.assertGeneration(epoch);
    await session.revokeSession();
    await clearHibpCache();
    await chrome.runtime.sendMessage({ target: 'offscreen', type: 'CLEAR_OWNED' }).catch(() => {});
    await deleteIndexedDb('SecurePassDB');
    await clearStorage('local');
    await clearStorage('session');
  });
}
