import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { installChrome, resetStorage, areas, failWhen } from './helpers/chrome.js';
installChrome();
const vault = await import('../src/cryptoVault.js');
const storage = await import('../src/utils/storage.js');
const cryptoVault = await import('../src/vault/crypto.js');
const sync = await import('../src/vault/sync.js');
const settings = await import('../src/settings.js');
const recovery = await import('../src/vault/recovery.js');
const backup = await import('../src/vault/backupService.js');
const { encryptBackupPayload } = await import('../src/backupCrypto.js');
const { utilHandlers } = await import('../src/messageHandlers/utilHandlers.js');
const { vaultHandlers } = await import('../src/messageHandlers/vaultHandlers.js');
const PASS = 'Disposable local master 123!';
const REMOTE = 'Different remote master 123!';
const entry = (id, notes = '') => ({ id, site: 'https://example.com', username: id, password: `disposable ${id}`, notes });
beforeEach(async () => { await vault.lockVault(); resetStorage(); });

test('SC04/05: wrong remote password does not replace, publish or create a local vault', async () => {
  const remote = await cryptoVault.createRecord([entry('remote')], REMOTE); await sync.publishGeneration(remote.record);
  const before = structuredClone(areas.sync);
  await assert.rejects(vault.changeSyncMode(true, 'use-sync', 'wrong'));
  assert.equal(await storage.readLocalVaultRecordRaw(), null); assert.deepEqual(areas.sync, before);
  await vault.initializeVault(PASS); const revision = (await storage.readLocalVaultRecordRaw()).revision;
  await assert.rejects(vault.resolveSyncGeneration(remote.record.revision, 'wrong', false));
  assert.equal((await storage.readLocalVaultRecordRaw()).revision, revision); assert.deepEqual(areas.sync, before);
});
test('SC10/23/34: merge keeps destination password, 4096-char notes, unselected head and repeated-entry identity', async () => {
  await vault.initializeVault(PASS); await vault.changeSyncMode(true); await vault.unlockVault(PASS);
  await vault.storeCredential(entry('same'));
  const a = await cryptoVault.createRecord([{ ...entry('same', 'n'.repeat(4096)), password: 'remote value' }], REMOTE);
  const b = await cryptoVault.createRecord([entry('unselected')], REMOTE);
  await sync.publishGeneration(a.record); await sync.publishGeneration(b.record);
  await vault.resolveSyncGeneration(a.record.revision, REMOTE, true);
  await vault.unlockVault(PASS); const entries = await vault.listCredentials();
  assert.equal(entries.length, 2); assert.equal(entries.find(e => e.password === 'remote value').notes.length, 4096);
  const heads = await sync.syncHeads(); assert.equal(heads.length, 2); assert.ok(heads.some(head => head.revision === b.record.revision));
  assert.equal(areas.local.syncRecovery.length, 1);
  await assert.rejects(vault.unlockVault(REMOTE));
});
test('SC32: local download and off-mode merge never publish remotely', async () => {
  await vault.initializeVault(PASS); await vault.storeCredential(entry('local'));
  const remote = await cryptoVault.createRecord([entry('remote')], REMOTE); await sync.publishGeneration(remote.record);
  const before = structuredClone(areas.sync);
  await vault.resolveSyncGeneration(remote.record.revision, REMOTE, true);
  assert.deepEqual(areas.sync, before); await vault.unlockVault(PASS);
  assert.equal((await vault.listCredentials()).length, 2);
  await vault.resolveSyncGeneration(remote.record.revision, REMOTE, false);
  assert.deepEqual(areas.sync, before); assert.equal((await settings.loadSettings()).useSync, false);
  await vault.unlockVault(REMOTE); assert.equal((await vault.listCredentials()).length, 1);
  await assert.rejects(vault.retrySync(), /Sync is off/); await assert.rejects(vault.compactSync(), /Sync is off/);
});
test('SC07/30: off-mode status avoids remote reads; manual scan separates incomplete and valid versions', async () => {
  const remote = await cryptoVault.createRecord([], REMOTE); await sync.publishGeneration(remote.record);
  areas.sync['sp2:head:broken'] = { id: 'broken', chunks: 1, parents: [] };
  const original = chrome.storage.sync.get; let reads = 0;
  chrome.storage.sync.get = (...args) => { reads++; return original(...args); };
  try {
    const local = await vault.getSyncStatus(); assert.equal(reads, 0); assert.equal(local.remoteInspected, false);
    const remoteStatus = await vault.getSyncStatus({ inspectRemote: true }); assert.equal(remoteStatus.heads.length, 1); assert.equal(remoteStatus.issues.length, 1);
    await assert.rejects(sync.syncHeads(), /incomplete/);
  } finally { chrome.storage.sync.get = original; }
});
test('SC28: publication repairs missing chunks and rejects same-ID different contents', async () => {
  const { record } = await cryptoVault.createRecord([], PASS); await sync.publishGeneration(record);
  delete areas.sync[`sp2:${record.revision}:0`]; await sync.publishGeneration(record);
  assert.equal((await sync.syncHeads())[0].revision, record.revision);
  areas.sync[`sp2:head:${record.revision}`].digest = 'modified';
  await assert.rejects(sync.publishGeneration(record), /different contents/);
});
test('SC35: per-item quota is rejected before writing any chunks', async () => {
  const { record } = await cryptoVault.createRecord([], PASS, { parents: Array.from({ length: 256 }, () => crypto.randomUUID()) });
  await assert.rejects(sync.publishGeneration(record), /per-item limit/); assert.deepEqual(areas.sync, {});
});
test('SC29: encrypted outbox survives lost status metadata and is atomically committed with the local record', async () => {
  await vault.initializeVault(PASS); await vault.changeSyncMode(true); await vault.unlockVault(PASS);
  failWhen(area => area === 'sync'); await vault.storeCredential(entry('pending')); failWhen(null);
  const raw = await storage.readLocalVaultRecordRaw(); assert.equal((await storage.readSyncOutbox()).revision, raw.revision);
  delete areas.local.syncStatus;
  assert.equal((await vault.getSyncStatus()).pending, true); await vault.retrySync(); assert.equal(await storage.readSyncOutbox(), null);
});
test('SC48/49: preference patches cannot change mode and concurrent mode transitions preserve both operations', async () => {
  await vault.initializeVault(PASS);
  await Promise.all([settings.patchSettings({ theme: 'dark' }), vault.changeSyncMode(true)]);
  assert.equal((await settings.loadSettings()).theme, 'dark'); assert.equal((await settings.loadSettings()).useSync, true);
  await assert.rejects(settings.patchSettings({ useSync: false }), /Invalid preference/);
  const state = await settings.loadSettingsState(); await settings.patchSettings({ minLength: 20 }, state.revision);
  await assert.rejects(settings.patchSettings({ theme: 'light' }, state.revision), /changed in another window/);
  areas.local.settings.vaultTimeout = 'broken'; assert.equal((await settings.loadSettings()).vaultTimeout, 15);
  assert.ok((await settings.loadSettingsState()).repaired.includes('vaultTimeout'));
});
test('SC45: lowering timeout immediately expires an already idle session', async () => {
  await vault.initializeVault(PASS);
  areas.session.vaultSessionV2.lastActivity = Date.now() - 2 * 60000;
  await utilHandlers.get('SAVE_SETTINGS')({ patch: { vaultTimeout: 1 } });
  assert.equal((await vault.vaultStatus()).unlocked, false);
});
test('SC36/37: encrypted backup creates a fresh local vault only after valid source and new master password', async () => {
  const file = await encryptBackupPayload({ entries: [entry('restored', 'exact <> 秘密')] }, 'Separate backup password');
  await assert.rejects(backup.previewBackup(file, 'wrong'));
  assert.equal(await storage.readLocalVaultRecordRaw(), null);
  const preview = await backup.previewBackup(file, 'Separate backup password'); assert.equal(preview.destinationExists, false);
  await backup.commitBackup({ data: file, backupPassword: 'Separate backup password', token: preview.token, newMasterPassword: PASS });
  await vault.lockVault(); await vault.unlockVault(PASS); assert.equal((await vault.listCredentials())[0].notes, 'exact <> 秘密');
  await assert.rejects(vault.unlockVault('Separate backup password'));
});
test('SC38: preview reports real conflicts; a changed destination or source invalidates the commit', async () => {
  await vault.initializeVault(PASS); await vault.storeCredential(entry('same'));
  const data = { entries: [{ ...entry('same'), password: 'different' }, entry('new')] };
  const preview = await backup.previewBackup(data, undefined, 'keep-both'); assert.equal(preview.conflicts, 1); assert.equal(preview.new, 1); assert.equal(preview.imported, 2);
  await vault.storeCredential(entry('intervening'));
  await assert.rejects(backup.commitBackup({ data, token: preview.token }), /Vault changed/);
  const second = await backup.previewBackup(data);
  await assert.rejects(backup.commitBackup({ data: { entries: [entry('tampered')] }, token: second.token }), /Backup changed/);
  assert.equal((await vault.listCredentials()).length, 2);
});
test('SC23/35: keep-both import preserves full-length notes and leaves master key unchanged', async () => {
  await vault.initializeVault(PASS); await vault.storeCredential(entry('same'));
  const data = { entries: [{ ...entry('same', 'x'.repeat(4096)), password: 'new value' }] };
  const preview = await backup.previewBackup(data, undefined, 'keep-both');
  await backup.commitBackup({ data, token: preview.token }); await vault.lockVault(); await vault.unlockVault(PASS);
  assert.equal((await vault.listCredentials()).length, 2); assert.equal((await vault.listCredentials()).find(e => e.password === 'new value').notes.length, 4096);
});
test('SC39: stable snapshot IDs survive history reordering', async () => {
  await vault.initializeVault(PASS); await vault.storeCredential(entry('a')); await vault.storeCredential(entry('b'));
  const selected = (await vault.recoveryStatus())[0]; await vault.storeCredential(entry('c'));
  await vault.restoreRecovery(selected.id, PASS); assert.deepEqual((await vault.listCredentials()).map(e => e.id), ['a']);
  assert.equal((await settings.loadSettings()).useSync, false);
});
test('SC40: a snapshot export is independently importable and uses a stable ID', async () => {
  await vault.initializeVault(PASS); await vault.storeCredential(entry('a'));
  const { snapshots } = await vaultHandlers.get('RECOVERY_ARCHIVE_STATUS')();
  const { data } = await vaultHandlers.get('EXPORT_RECOVERY_SNAPSHOT')({ id: snapshots[0].id });
  assert.equal(data.snapshots.length, 1); assert.equal(data.sync.length, 0); assert.ok(JSON.stringify(data).length < 16 * 1024 * 1024);
});
test('SC41: force erase works with unavailable remote and damaged local data; confirmation is mandatory', async () => {
  await vault.initializeVault(PASS);
  const record = await storage.readLocalVaultRecordRaw(); await storage.writeLocalVaultRecordRaw({ ...record, data: { ...record.data, ciphertext: 'invalid' } }, record.revision);
  areas.local.settings = { ...settings.DEFAULT_SETTINGS, useSync: true, migratedSettings: true };
  areas.sync['sp2:head:broken'] = { id: 'broken', chunks: 1, parents: [] };
  const remote = structuredClone(areas.sync);
  await assert.rejects(recovery.wipeDevice(undefined, { force: true, confirmation: 'wrong' }), /Type ERASE/);
  assert.ok(await storage.readLocalVaultRecordRaw());
  await recovery.wipeDevice(undefined, { force: true, confirmation: 'ERASE THIS DEVICE' });
  assert.deepEqual(areas.local, {}); assert.deepEqual(areas.sync, remote); assert.equal(await storage.readLocalVaultRecordRaw(), null);
});

test('SC29/31/32: restart retry uses durable outbox with backoff and stays idle when Sync is off', async () => {
  const { retryPendingSync } = await import('../src/vault/retry.js');
  await vault.initializeVault(PASS); await vault.changeSyncMode(true); await vault.unlockVault(PASS);
  failWhen(area => area === 'sync'); await vault.storeCredential(entry('deferred'));
  await retryPendingSync(1000000); assert.equal(areas.local.syncRetryState.attempts, 1);
  await retryPendingSync(1000001); assert.equal(areas.local.syncRetryState.attempts, 1);
  failWhen(null); await retryPendingSync(1060001); assert.equal(await storage.readSyncOutbox(), null);
  await vault.changeSyncMode(false);
  const remote = structuredClone(areas.sync); await retryPendingSync(2000000); assert.deepEqual(areas.sync, remote);
});

test('SC29: transaction abort rolls back both encrypted revision and publication outbox', async () => {
  await vault.initializeVault(PASS); await vault.changeSyncMode(true); await vault.unlockVault(PASS);
  const before = await storage.readLocalVaultRecordRaw();
  const { IDBObjectStore } = await import('fake-indexeddb'); const original = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function (...args) {
    const request = original.apply(this, args);
    if (args[1] === 'securepassVault') request.addEventListener('success', () => this.transaction.abort());
    return request;
  };
  try { await assert.rejects(vault.storeCredential(entry('aborted')), /aborted/); }
  finally { IDBObjectStore.prototype.put = original; }
  assert.equal((await storage.readLocalVaultRecordRaw()).revision, before.revision);
  assert.equal(await storage.readSyncOutbox(), null);
  assert.equal((await vault.listCredentials()).length, 0);
});
