import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { installChrome, resetStorage, areas } from './helpers/chrome.js';
import { IDBObjectStore } from 'fake-indexeddb';
installChrome();
const vault = await import('../src/cryptoVault.js');
const history = await import('../src/vault/checkpoints.js');
const storage = await import('../src/utils/storage.js');
const crypt = await import('../src/vault/crypto.js');
const { loadSettings } = await import('../src/settings.js');
const { restoreExternalRecord } = await import('../src/vault/recovery.js');
const { authorizeMessage } = await import('../src/security/messages.js');
const PASS = 'Disposable current master 123!';
const NEXT = 'Disposable replacement master 456!';
const OLD = 'Disposable older master 789!';
const OWNER = 'preview-owner';
const entry = (id, password = `Fictional ${id} secret`) => ({ id, site: `https://${id}.example`, username: id, password, notes: `Private note ${id}` });
const firstId = async () => (await history.checkpointStatus())[0].id;
beforeEach(async () => { await vault.lockVault(); resetStorage(); await vault.initializeVault(PASS); });

test('only the three most recent local content states are retained', async () => {
  for (const id of ['a', 'b', 'c', 'd', 'e']) await vault.storeCredential(entry(id));
  const records = await storage.readRecoveryRecords();
  assert.equal(records.length, 3);
  const counts = [];
  for (const record of records) counts.push((await crypt.decryptRecord(record, PASS)).entries.length);
  assert.deepEqual(counts, [4, 3, 2]);
  assert.equal(JSON.stringify(records).includes('Private note'), false);
});

test('rotation atomically re-protects existing checkpoints without adding a state', async () => {
  await vault.storeCredential(entry('a')); await vault.storeCredential(entry('b'));
  const before = await storage.readRecoveryRecords();
  await vault.changeMasterPassword(PASS, NEXT);
  const after = await storage.readRecoveryRecords();
  assert.deepEqual(after.map(record => record.revision), before.map(record => record.revision));
  assert.deepEqual(after.map(record => record.updatedAt), before.map(record => record.updatedAt));
  for (let index = 0; index < after.length; index++) {
    assert.deepEqual((await crypt.decryptRecord(after[index], NEXT)).entries, (await crypt.decryptRecord(before[index], PASS)).entries);
    await assert.rejects(crypt.decryptRecord(after[index], PASS));
  }
  const preview = await history.previewCheckpoint(after[0].revision, 'vault', OWNER);
  await history.recoverCheckpoint(preview.token, undefined, OWNER);
  await vault.lockVault(); await vault.unlockVault(NEXT);
  assert.deepEqual((await vault.listCredentials()).map(item => item.id), ['a']);
  await assert.rejects(vault.unlockVault(PASS));
});

test('saving unchanged entry contents and changing Sync metadata do not consume checkpoints', async () => {
  await vault.storeCredential(entry('a'));
  const before = await storage.readRecoveryRecords(); const revision = (await vault.vaultStatus()).revision;
  await vault.updateCredential('a', { password: entry('a').password });
  assert.equal((await vault.vaultStatus()).revision, revision);
  assert.deepEqual(await storage.readRecoveryRecords(), before);
  await vault.changeSyncMode(true); await vault.unlockVault(PASS);
  assert.deepEqual(await storage.readRecoveryRecords(), before);
});

test('an aborted rotation preserves both the live vault and all checkpoint encryption', async () => {
  await vault.storeCredential(entry('a'));
  const before = await storage.readLocalVaultRecordRaw(); const checkpoints = await storage.readRecoveryRecords();
  const original = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function (...args) {
    const request = original.apply(this, args);
    if (args[1] === 'securepassVault') request.addEventListener('success', () => this.transaction.abort());
    return request;
  };
  try { await assert.rejects(vault.changeMasterPassword(PASS, NEXT), /aborted/); }
  finally { IDBObjectStore.prototype.put = original; }
  assert.deepEqual(await storage.readLocalVaultRecordRaw(), before);
  assert.deepEqual(await storage.readRecoveryRecords(), checkpoints);
  await vault.lockVault(); await vault.unlockVault(PASS);
});

test('older-password checkpoints block rotation until explicitly migrated', async () => {
  const older = await crypt.createRecord([entry('older')], OLD);
  const active = await storage.readLocalVaultRecordRaw();
  await storage.writeLocalVaultRecordRaw(active, active.revision, { historyOnly: true, recoveryRecords: [older.record] });
  assert.equal((await history.checkpointStatus())[0].needsPassword, true);
  await assert.rejects(vault.changeMasterPassword(PASS, NEXT), /older checkpoint/);
  assert.deepEqual(await storage.readLocalVaultRecordRaw(), active);
  await assert.rejects(history.unlockCheckpoint(older.record.revision, 'wrong', active.revision));
  await history.unlockCheckpoint(older.record.revision, OLD, active.revision);
  assert.equal((await history.checkpointStatus())[0].count, 1);
  await vault.changeMasterPassword(PASS, NEXT);
  const migrated = (await storage.readRecoveryRecords())[0];
  assert.equal((await crypt.decryptRecord(migrated, NEXT)).entries[0].id, 'older');
  await assert.rejects(crypt.decryptRecord(migrated, OLD));
});

test('full restore retains the current password, key and biometric setup; current contents remain recoverable', async () => {
  await vault.storeCredential(entry('a')); await vault.storeCredential(entry('b'));
  const before = await storage.readLocalVaultRecordRaw();
  areas.local.securepassBiometric = { version: 2, keyEpoch: before.keyEpoch };
  const selected = await firstId();
  const preview = await history.previewCheckpoint(selected, 'vault', OWNER);
  await history.recoverCheckpoint(preview.token, undefined, OWNER);
  const after = await storage.readLocalVaultRecordRaw();
  assert.equal(after.keyEpoch, before.keyEpoch);
  assert.deepEqual(after.wrappedKey, before.wrappedKey);
  assert.equal(areas.local.securepassBiometric.keyEpoch, before.keyEpoch);
  assert.equal((await crypt.decryptRecord((await storage.readRecoveryRecords())[0], PASS)).entries.length, 2);
  assert.equal((await loadSettings()).useSync, false);
});

test('external recovery contents do not replace an existing vault password', async () => {
  const external = await crypt.createRecord([entry('older')], OLD);
  await restoreExternalRecord(external.record, OLD, (await vault.vaultStatus()).revision);
  await vault.lockVault(); await vault.unlockVault(PASS);
  assert.equal((await vault.listCredentials())[0].id, 'older');
  await assert.rejects(vault.unlockVault(OLD));
});

test('restoring a remote historical version also preserves the active local password', async () => {
  const { publishGeneration } = await import('../src/vault/sync.js');
  const external = await crypt.createRecord([entry('remote')], OLD);
  await publishGeneration(external.record);
  await vault.resolveSyncGeneration(external.record.revision, OLD, false, (await vault.vaultStatus()).revision);
  await vault.lockVault(); await vault.unlockVault(PASS);
  assert.equal((await vault.listCredentials())[0].id, 'remote');
  await assert.rejects(vault.unlockVault(OLD));
});

test('single-entry recovery leaves unrelated newer entries, password and Sync setting intact', async () => {
  await vault.storeCredential(entry('a')); await vault.storeCredential(entry('b'));
  await vault.deleteCredential('a');
  const point = await firstId();
  await vault.updateCredential('b', { password: 'New unrelated secret' });
  await vault.changeSyncMode(true); await vault.unlockVault(PASS);
  const preview = await history.previewCheckpoint(point, 'entry', OWNER);
  assert.equal(preview.missing, 1);
  assert.equal(JSON.stringify(preview).includes('Fictional a secret'), false);
  assert.equal(JSON.stringify(preview).includes('Private note'), false);
  await history.recoverCheckpoint(preview.token, 'a', OWNER);
  const entries = await vault.listCredentials();
  assert.equal(entries.find(item => item.id === 'a').password, entry('a').password);
  assert.equal(entries.find(item => item.id === 'b').password, 'New unrelated secret');
  assert.equal((await loadSettings()).useSync, true);
});

test('previews reject another owner, replay and destination changes', async () => {
  await vault.storeCredential(entry('a'));
  let preview = await history.previewCheckpoint(await firstId(), 'vault', OWNER);
  await assert.rejects(history.recoverCheckpoint(preview.token, undefined, 'other'), /Review/);
  await history.recoverCheckpoint(preview.token, undefined, OWNER);
  await assert.rejects(history.recoverCheckpoint(preview.token, undefined, OWNER), /Review/);
  preview = await history.previewCheckpoint(await firstId(), 'vault', OWNER);
  await vault.storeCredential(entry('b'));
  await assert.rejects(history.recoverCheckpoint(preview.token, undefined, OWNER), /vault changed/);
});

test('expired, locked, cancelled and modified-source previews cannot recover', async () => {
  await vault.storeCredential(entry('a'));
  let preview = await history.previewCheckpoint(await firstId(), 'vault', OWNER);
  areas.session[`checkpointPreview:${preview.token}`].expires = Date.now() - 1;
  await assert.rejects(history.recoverCheckpoint(preview.token, undefined, OWNER), /expired/);
  preview = await history.previewCheckpoint(await firstId(), 'vault', OWNER);
  await vault.lockVault(); await vault.unlockVault(PASS);
  await assert.rejects(history.recoverCheckpoint(preview.token, undefined, OWNER), /expired/);
  preview = await history.previewCheckpoint(await firstId(), 'vault', OWNER);
  await history.clearCheckpointPreviews(OWNER, preview.token);
  await assert.rejects(history.recoverCheckpoint(preview.token, undefined, OWNER), /Review/);
  preview = await history.previewCheckpoint(await firstId(), 'vault', OWNER);
  const active = await storage.readLocalVaultRecordRaw(); const records = await storage.readRecoveryRecords();
  records[0].updatedAt = '2000-01-01T00:00:00.000Z';
  await storage.writeLocalVaultRecordRaw(active, active.revision, { historyOnly: true, recoveryRecords: records });
  await assert.rejects(history.recoverCheckpoint(preview.token, undefined, OWNER), /Checkpoint changed/);
});

test('concurrent commits consume a recovery preview only once', async () => {
  await vault.storeCredential(entry('a'));
  const preview = await history.previewCheckpoint(await firstId(), 'vault', OWNER);
  const results = await Promise.allSettled([1, 2].map(() => history.recoverCheckpoint(preview.token, undefined, OWNER)));
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
});

test('locked checkpoint metadata contains no entry counts, differences or account names', async () => {
  await vault.storeCredential(entry('a')); await vault.storeCredential(entry('b'));
  await vault.lockVault();
  const result = await history.checkpointStatus();
  assert.equal(result[0].locked, true);
  for (const key of ['count', 'missing', 'changed', 'newer', 'examples']) assert.equal(result[0][key], undefined);
  assert.equal(JSON.stringify(result).includes('a.example'), false);
});

test('history deletion requires the current password and preserves live vault, archives and outbox', async () => {
  await vault.storeCredential(entry('a')); const before = await storage.readLocalVaultRecordRaw();
  areas.local.syncRecovery = [{ marker: 'unrelated encrypted archive' }];
  await assert.rejects(history.removeCheckpoints('wrong', before.revision));
  await assert.rejects(history.removeCheckpoints(PASS, 'stale'), /Vault changed/);
  await history.removeCheckpoints(PASS, before.revision);
  assert.deepEqual(await storage.readRecoveryRecords(), []);
  assert.deepEqual(await storage.readLocalVaultRecordRaw(), before);
  assert.equal(areas.local.syncRecovery.length, 1);
  await vault.storeCredential(entry('b'));
  assert.equal((await storage.readRecoveryRecords()).length, 1);
});

test('checkpoint messages are inaccessible to content and auth pages', () => {
  for (const path of ['https://example.com', chrome.runtime.getURL('auth/auth.html')]) {
    for (const type of ['PREVIEW_CHECKPOINT', 'RECOVER_CHECKPOINT', 'UNLOCK_CHECKPOINT', 'REMOVE_CHECKPOINTS', 'CANCEL_CHECKPOINT_PREVIEW']) {
      assert.throws(() => authorizeMessage({ type }, { id: chrome.runtime.id, url: path }), /Forbidden/);
    }
  }
});

test('local and archived copies with the same ID export their own password protection', async () => {
  await vault.storeCredential(entry('a'));
  areas.local.syncRecovery = await storage.readRecoveryRecords();
  const id = areas.local.syncRecovery[0].revision;
  await vault.changeMasterPassword(PASS, NEXT);
  const { vaultHandlers } = await import('../src/messageHandlers/vaultHandlers.js');
  const local = await vaultHandlers.get('EXPORT_RECOVERY_SNAPSHOT')({ id, source: 'Local' });
  const archived = await vaultHandlers.get('EXPORT_RECOVERY_SNAPSHOT')({ id, source: 'Archived Sync' });
  await crypt.decryptRecord(local.data.snapshots[0], NEXT);
  await crypt.decryptRecord(archived.data.snapshots[0], PASS);
  await assert.rejects(crypt.decryptRecord(local.data.snapshots[0], PASS));
  await assert.rejects(crypt.decryptRecord(archived.data.snapshots[0], NEXT));
  await history.removeCheckpoints(NEXT, (await vault.vaultStatus()).revision);
  await assert.rejects(vaultHandlers.get('EXPORT_RECOVERY_SNAPSHOT')({ id, source: 'Local' }), /no longer available/);
  const retainedArchive = await vaultHandlers.get('EXPORT_RECOVERY_SNAPSHOT')({ id, source: 'Archived Sync' });
  await crypt.decryptRecord(retainedArchive.data.snapshots[0], PASS);
});
