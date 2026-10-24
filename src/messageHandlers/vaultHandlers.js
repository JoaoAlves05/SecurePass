import * as vault from '../cryptoVault.js';
import { createVaultBackup, validateMaster, validateString, validateEntry, validateImportData } from '../validation.js';
import { decryptBackupPayload, encryptBackupPayload, isEncryptedBackupEnvelope } from '../backupCrypto.js';
import { restoreExternalRecord, wipeDevice } from '../vault/recovery.js';
import { readRecoveryRecords, getStorage } from '../utils/storage.js';

export const vaultHandlers = new Map([
  ['VAULT_STATUS', async () => ({ status: await vault.vaultStatus() })],
  ['INITIALIZE_VAULT', async m => ({ created: await vault.initializeVault(validateMaster(m.passphrase, true)) })],
  ['UNLOCK_VAULT', async m => ({ data: await vault.unlockVault(validateMaster(m.passphrase)) })],
  ['LOCK_VAULT', async () => { await vault.lockVault(); return {}; }],
  ['LIST_CREDENTIALS', async () => ({ ...await vault.vaultStatus(), entries: await vault.listCredentials() })],
  ['STORE_CREDENTIAL', async m => ({ entry: await vault.storeCredential(validateEntry(m.entry)) })],
  ['UPDATE_CREDENTIAL', async m => ({ entry: await vault.updateCredential(validateString(m.id, 64, 'id', true), validateEntry(m.updates, true)) })],
  ['DELETE_CREDENTIAL', async m => { await vault.deleteCredential(validateString(m.id, 64, 'id', true)); return {}; }],
  ['KEEP_ALIVE', async () => ({ alive: await vault.keepAlive() })],
  ['CHANGE_MASTER_PASSWORD', async m => { await vault.changeMasterPassword(validateMaster(m.oldPassphrase), validateMaster(m.newPassphrase, true)); return {}; }],
  ['EXPORT_VAULT', async m => {
    const state = await vault.requireVault();
    const data = await encryptBackupPayload(createVaultBackup(state.entries), validateMaster(m.backupPassword, true));
    vault.assertVaultGeneration(state.epoch);
    return { data, encrypted: true };
  }],
  ['IMPORT_VAULT', async m => {
    const state = await vault.requireVault();
    let source = m.data;
    if (isEncryptedBackupEnvelope(source)) source = await decryptBackupPayload(source, validateMaster(m.backupPassword));
    const clean = validateImportData(source);
    vault.assertVaultGeneration(state.epoch);
    if (m.preview) return { count: clean.entries.length };
    return { count: await vault.importVaultData(clean, undefined, m.strategy || 'skip') };
  }],
  ['CLEAR_VAULT_ENTRIES', async m => {
    await vault.unlockVault(validateMaster(m.passphrase));
    await vault.overwriteVaultEntries([]);
    return {};
  }],
  ['WIPE_DEVICE', async m => { await wipeDevice(m.passphrase); return {}; }],
  ['IMPORT_RECOVERY', async m => { await restoreExternalRecord(m.record, m.passphrase); return {}; }],
  ['RECOVERY_STATUS', async () => ({ snapshots: await vault.recoveryStatus() })],
  ['RESTORE_RECOVERY', async m => { await vault.restoreRecovery(m.index, m.passphrase); return {}; }],
  ['EXPORT_RECOVERY', async () => ({ data: { kind: 'securepass-encrypted-recovery', version: 1, snapshots: await readRecoveryRecords(), sync: (await getStorage('local', 'syncRecovery')).syncRecovery || [] } })]
]);
