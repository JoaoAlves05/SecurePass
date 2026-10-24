import { withVaultOperation } from './queue.js';
import { loadRecord } from './repository.js';
import { createRecord, decryptRecord, validateRecord } from './crypto.js';
import { validateMaster } from '../validation.js';
import { loadSettings, saveSettings } from '../settings.js';
import { writeLocalVaultRecordRaw, recordRevision, removeStorage, clearStorage, deleteIndexedDb } from '../utils/storage.js';
import * as session from './session.js';

export function restoreExternalRecord(record, passphrase) {
  return withVaultOperation(async epoch => {
    validateRecord(record); validateMaster(passphrase);
    const data = await decryptRecord(record, passphrase);
    const current = await loadRecord();
    const next = await createRecord(data.entries, passphrase, { vaultId: record.vaultId });
    session.assertGeneration(epoch);
    await saveSettings({ ...await loadSettings(), useSync: false }, { allowSyncChange: true });
    await writeLocalVaultRecordRaw(next.record, recordRevision(current));
    await removeStorage('local', 'securepassBiometric');
    await session.activate(next.record, data.entries, next.bytes, epoch);
  });
}

export function wipeDevice(passphrase) {
  return withVaultOperation(async epoch => {
    const record = await loadRecord();
    if (record) await decryptRecord(record, validateMaster(passphrase));
    session.assertGeneration(epoch);
    await session.revokeSession();
    // Remote copies intentionally remain. Device erasure must not delete other devices' data.
    await deleteIndexedDb('SecurePassDB');
    await clearStorage('local');
    await clearStorage('session');
  });
}
