import * as vault from '../cryptoVault.js';
import { createVaultBackup, validateMaster, validateBackupPassword, validateString, validateEntry, validateImportData } from '../validation.js';
import { decryptBackupPayload, encryptBackupPayload, isEncryptedBackupEnvelope } from '../backupCrypto.js';
import { restoreExternalRecord, wipeDevice } from '../vault/recovery.js';
import { readRecoveryRecords, getStorage, snapshotId } from '../utils/storage.js';

import { previewBackup, commitBackup } from '../vault/backupService.js';
import { masterAuthorizationOwner, cancelMasterAuthorization } from '../vault/masterAuthorization.js';
import { withVaultLock } from '../vault/queue.js';
import { checkpointStatus, unlockCheckpoint, previewCheckpoint, recoverCheckpoint, removeCheckpoints, clearCheckpointPreviews } from '../vault/checkpoints.js';

export const vaultHandlers = new Map([
  ['VAULT_STATUS', async () => withVaultLock(async () => ({ status: await vault.vaultStatus() }))],
  ['INITIALIZE_VAULT', async m => ({ created: await vault.initializeVault(validateMaster(m.passphrase, true)) })],
  ['UNLOCK_VAULT', async m => ({ data: await vault.unlockVault(validateMaster(m.passphrase)) })],
  ['LOCK_VAULT', async () => { await vault.lockVault(); return {}; }],
  ['LIST_CREDENTIALS', async () => withVaultLock(async () => ({ ...await vault.vaultStatus(), entries: await vault.listCredentials() }))],
  ['STORE_CREDENTIAL', async m => ({ entry: await vault.storeCredential(validateEntry(m.entry)) })],
  ['UPDATE_CREDENTIAL', async m => ({ entry: await vault.updateCredential(validateString(m.id, 64, 'id', true), validateEntry(m.updates, true)) })],
  ['DELETE_CREDENTIAL', async m => { await vault.deleteCredential(validateString(m.id, 64, 'id', true)); return {}; }],
  ['KEEP_ALIVE', async () => ({ alive: await vault.keepAlive() })],
  ['AUTHORIZE_MASTER_PASSWORD', async (m, s) => {
    const owner = masterAuthorizationOwner(m, s);
    const { authorization, expiresAt } = await vault.unlockVault(validateMaster(m.passphrase), owner);
    return { authorization, expiresAt };
  }],
  ['CANCEL_MASTER_PASSWORD', async (m, s) => {
    const owner = masterAuthorizationOwner(m, s);
    if (typeof m.authorization !== 'string' || m.authorization.length > 64) throw new Error('Invalid authorization.');
    await withVaultLock(() => cancelMasterAuthorization(owner, m.authorization));
    return {};
  }],
  ['CHANGE_MASTER_PASSWORD', async (m, s) => {
    await vault.changeMasterPasswordAuthorized(m.authorization, validateMaster(m.newPassphrase, true), masterAuthorizationOwner(m, s));
    return {};
  }],
  ['EXPORT_VAULT', async m => {
    const state = await vault.requireVault();
    const data = await encryptBackupPayload(createVaultBackup(state.entries), validateBackupPassword(m.backupPassword, true));
    vault.assertVaultGeneration(state.epoch);
    return { data, encrypted: true };
  }],
  ['PREVIEW_BACKUP', async m => previewBackup(m.data, m.backupPassword, m.strategy)],
  ['COMMIT_BACKUP', commitBackup],
  ['EXPORT_RECOVERY_SNAPSHOT', async m => {
    if (m.source !== undefined && !['Local', 'Archived Sync'].includes(m.source)) throw new Error('Invalid recovery source.');
    const records = m.source === 'Archived Sync'
      ? ((await getStorage('local', 'syncRecovery')).syncRecovery || [])
      : m.source === 'Local' ? await readRecoveryRecords()
        : [...await readRecoveryRecords(), ...((await getStorage('local', 'syncRecovery')).syncRecovery || [])];
    for (const record of records) if (await snapshotId(record) === m.id) return { data: { kind: 'securepass-encrypted-recovery', version: 1, snapshots: [record], sync: [] } };
    throw new Error('Snapshot no longer available. Refresh the history.');
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
    await vault.clearVaultEntries(m.passphrase, m.expectedRevision);
    return {};
  }],
  ['WIPE_DEVICE', async m => { await wipeDevice(m.passphrase, { force: m.force === true, confirmation: m.confirmation }); return {}; }],
  ['IMPORT_RECOVERY', async m => { await restoreExternalRecord(m.record, m.passphrase, m.expectedRevision); return {}; }],
  ['RECOVERY_ARCHIVE_STATUS', async () => {
    const local = await checkpointStatus(); const archive = (await getStorage('local', 'syncRecovery')).syncRecovery || [];
    return { snapshots: [...local, ...await Promise.all(archive.map(async record => ({ id: await snapshotId(record), revision: record.revision, updatedAt: record.updatedAt, source: 'Archived Sync' })))] };
  }],
  ['UNLOCK_CHECKPOINT', async m => unlockCheckpoint(validateString(m.id, 80, 'checkpoint', true), validateMaster(m.passphrase), m.expectedRevision)],
  ['PREVIEW_CHECKPOINT', async (m, s) => previewCheckpoint(validateString(m.id, 80, 'checkpoint', true), m.mode, masterAuthorizationOwner(m, s))],
  ['RECOVER_CHECKPOINT', async (m, s) => recoverCheckpoint(m.token, m.entryId, masterAuthorizationOwner(m, s))],
  ['REMOVE_CHECKPOINTS', async m => { await removeCheckpoints(validateMaster(m.passphrase), m.expectedRevision, m.id === undefined ? undefined : validateString(m.id, 80, 'checkpoint', true)); return {}; }],
  ['CANCEL_CHECKPOINT_PREVIEW', async (m, s) => {
    const owner = masterAuthorizationOwner(m, s);
    await withVaultLock(() => clearCheckpointPreviews(owner, validateString(m.token, 64, 'preview', true)));
    return {};
  }],
  ['RECOVERY_STATUS', async () => ({ snapshots: await vault.recoveryStatus() })],
  ['RESTORE_RECOVERY', async m => { await vault.restoreRecovery(m.id ?? m.index, m.passphrase, m.expectedRevision); return {}; }],
  ['EXPORT_RECOVERY', async () => ({ data: { kind: 'securepass-encrypted-recovery', version: 1, snapshots: await readRecoveryRecords(), sync: (await getStorage('local', 'syncRecovery')).syncRecovery || [] } })]
]);
