import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { installChrome, resetStorage, areas, failWhen } from './helpers/chrome.js';
installChrome();
const vault = await import('../src/cryptoVault.js');
const storage = await import('../src/utils/storage.js');
const backup = await import('../src/vault/backupService.js');
const recovery = await import('../src/vault/recovery.js');
const settings = await import('../src/settings.js');
const crypt = await import('../src/vault/crypto.js');
const { retryPendingSync } = await import('../src/vault/retry.js');
const PASS = 'Disposable review master 123!';
const entry = (id, password = 'Disposable secret') => ({ id, site: 'https://example.com', username: 'account', password, notes: '' });
beforeEach(async () => { await vault.lockVault(); resetStorage(); });

test('repeated keep-both imports recognize an identical conflict copy', () => {
  const original = entry('original');
  const incoming = entry('original', 'Updated secret');
  const first = backup.planImport([original], [incoming]);
  const second = backup.planImport(first.entries, [incoming]);
  assert.equal(second.imported, 0);
  assert.equal(second.identical, 1);
  assert.equal(second.entries.length, 2);
});

test('replace prioritizes a stable ID over another account match', () => {
  const a = entry('a'); const b = { ...entry('b'), username: 'other' };
  const result = backup.planImport([a, b], [entry('b', 'New secret')], 'replace');
  assert.equal(result.entries.find(item => item.id === 'a').password, a.password);
  assert.equal(result.entries.find(item => item.id === 'b').password, 'New secret');
});

test('replace updates the selected ID even when a separate identical copy exists', () => {
  const result = backup.planImport([entry('a'), entry('copy', 'New secret')], [entry('a', 'New secret')], 'replace');
  assert.equal(result.imported, 1);
  assert.equal(result.entries.find(item => item.id === 'a').password, 'New secret');
});

test('an identical backup does not consume history, change revision or publish', async () => {
  await vault.initializeVault(PASS); await vault.storeCredential(entry('a'));
  const data = { entries: await vault.listCredentials() };
  const before = await storage.readLocalVaultRecordRaw(); const history = await storage.readRecoveryRecords();
  const preview = await backup.previewBackup(data);
  assert.equal((await backup.commitBackup({ data, token: preview.token })).count, 0);
  assert.deepEqual(await storage.readLocalVaultRecordRaw(), before);
  assert.deepEqual(await storage.readRecoveryRecords(), history);
});

test('expired and locked backup reviews cannot change the vault', async () => {
  await vault.initializeVault(PASS);
  const data = { entries: [entry('a')] }; let preview = await backup.previewBackup(data);
  areas.session.backupPreview.expires = Date.now() - 1;
  await assert.rejects(backup.commitBackup({ data, token: preview.token }), /expired/);
  preview = await backup.previewBackup(data); await vault.lockVault(); await vault.unlockVault(PASS);
  await assert.rejects(backup.commitBackup({ data, token: preview.token }), /cancelled|expired/);
  assert.equal((await vault.listCredentials()).length, 0);
});

test('local status and encrypted export remain available when Sync cannot be read', async () => {
  await vault.initializeVault(PASS); await vault.changeSyncMode(true); await vault.unlockVault(PASS);
  const original = chrome.storage.sync.get;
  chrome.storage.sync.get = () => { throw new Error('Remote storage unavailable'); };
  try {
    assert.equal((await vault.vaultStatus()).unlocked, true);
    const { vaultHandlers } = await import('../src/messageHandlers/vaultHandlers.js');
    assert.equal((await vaultHandlers.get('EXPORT_VAULT')({ backupPassword: 'Separate disposable password' })).encrypted, true);
  } finally { chrome.storage.sync.get = original; }
});

test('force erase validates confirmation and never needs to open the damaged database', async () => {
  await vault.initializeVault(PASS);
  const original = indexedDB.open;
  indexedDB.open = () => { throw new Error('Database cannot be opened'); };
  try {
    await assert.rejects(recovery.wipeDevice(undefined, { force: true, confirmation: 'wrong' }), /Type ERASE/);
    await recovery.wipeDevice(undefined, { force: true, confirmation: 'ERASE THIS DEVICE' });
    assert.deepEqual(areas.local, {}); assert.deepEqual(areas.session, {});
  } finally { indexedDB.open = original; }
  assert.equal(await storage.readLocalVaultRecordRaw(), null);
});

test('interrupted local recovery finishes without publishing or leaving Sync permanently suppressed', async () => {
  await vault.initializeVault(PASS); await vault.changeSyncMode(true); await vault.unlockVault(PASS);
  const before = await storage.readLocalVaultRecordRaw(); const remote = structuredClone(areas.sync);
  const restored = await crypt.createRecord([entry('restored')], PASS);
  failWhen((area, items) => area === 'local' && Boolean(items.settings));
  await assert.rejects(recovery.restoreExternalRecord(restored.record, PASS, before.revision), /Injected/);
  failWhen(null);
  assert.ok(areas.local.localRestorePending);
  await retryPendingSync();
  assert.equal(areas.local.localRestorePending, undefined);
  assert.equal((await settings.loadSettings()).useSync, false);
  assert.deepEqual(areas.sync, remote);
  await vault.unlockVault(PASS); assert.equal((await vault.listCredentials())[0].id, 'restored');
  await vault.changeSyncMode(true, 'keep-local');
  assert.equal((await settings.loadSettings()).useSync, true);
});

test('enabling automatic publication requires an existing local or selected remote vault', async () => {
  await assert.rejects(vault.changeSyncMode(true), /vault/i);
  assert.equal((await settings.loadSettings()).useSync, false);
});

test('remote inspection failures preserve local archive status and recovery history', async () => {
  await vault.initializeVault(PASS); await vault.changeSyncMode(true); await vault.unlockVault(PASS);
  areas.local.syncRecovery = [await storage.readLocalVaultRecordRaw()];
  const original = chrome.storage.sync.get;
  chrome.storage.sync.get = () => { throw new Error('Remote storage unavailable'); };
  try {
    const status = await vault.getSyncStatus();
    assert.equal(status.recoveryArchiveCount, 1);
    assert.match(status.remoteError, /unavailable/);
    assert.deepEqual(status.heads, []);
    const { vaultHandlers } = await import('../src/messageHandlers/vaultHandlers.js');
    assert.ok((await vaultHandlers.get('RECOVERY_ARCHIVE_STATUS')()).snapshots.length);
    await vault.clearSyncArchive(PASS);
    assert.equal(areas.local.syncRecovery, undefined);
  } finally { chrome.storage.sync.get = original; }
});

test('backup import refuses an unresolved remote branch before writing locally', async () => {
  const { publishGeneration } = await import('../src/vault/sync.js');
  await vault.initializeVault(PASS); await vault.changeSyncMode(true); await vault.unlockVault(PASS);
  const before = await storage.readLocalVaultRecordRaw();
  const remote = await crypt.createRecord([], PASS); await publishGeneration(remote.record);
  const data = { entries: [entry('imported')] }; const preview = await backup.previewBackup(data);
  const remoteBefore = structuredClone(areas.sync);
  await assert.rejects(backup.commitBackup({ data, token: preview.token }), /Sync changed/);
  assert.deepEqual(await storage.readLocalVaultRecordRaw(), before);
  assert.deepEqual(areas.sync, remoteBefore);
});

test('invalid import policies, duplicate IDs and capacity overflow leave local data unchanged', async () => {
  const { MAX_ENTRIES, MAX_VAULT_BYTES } = await import('../src/validation.js');
  await vault.initializeVault(PASS); const before = await storage.readLocalVaultRecordRaw();
  await assert.rejects(backup.previewBackup({ entries: [entry('a')] }, undefined, 'invalid'), /policy/);
  await assert.rejects(backup.previewBackup({ entries: [entry('a'), entry('a')] }), /Duplicate/);
  const many = Array.from({ length: MAX_ENTRIES }, (_, i) => ({ ...entry(String(i)), username: String(i) }));
  assert.equal(backup.planImport([], many).entries.length, MAX_ENTRIES);
  assert.throws(() => backup.planImport([entry('existing')], many), /entries/);
  const large = Array.from({ length: 800 }, (_, i) => ({ ...entry(String(i)), username: String(i), notes: 'x'.repeat(4096) }));
  assert.ok(new TextEncoder().encode(JSON.stringify(large)).length > MAX_VAULT_BYTES);
  await assert.rejects(backup.previewBackup({ entries: large }), /capacity/);
  assert.deepEqual(await storage.readLocalVaultRecordRaw(), before);
});

test('recovery rejects a wrong historical password and a changed destination without side effects', async () => {
  await vault.initializeVault(PASS); await vault.storeCredential(entry('a'));
  const snapshot = (await vault.recoveryStatus())[0];
  const before = await storage.readLocalVaultRecordRaw(); const history = await storage.readRecoveryRecords();
  await assert.rejects(vault.restoreRecovery(snapshot.id, 'wrong', before.revision));
  await assert.rejects(vault.restoreRecovery(snapshot.id, PASS, 'outdated'), /changed/);
  assert.deepEqual(await storage.readLocalVaultRecordRaw(), before);
  assert.deepEqual(await storage.readRecoveryRecords(), history);
  assert.equal(areas.local.localRestorePending, undefined);
});

test('a failed recovery transaction preserves the old vault and reconciles with publication disabled', async () => {
  await vault.initializeVault(PASS); await vault.changeSyncMode(true); await vault.unlockVault(PASS);
  const before = await storage.readLocalVaultRecordRaw(); const remoteBefore = structuredClone(areas.sync);
  const restored = await crypt.createRecord([entry('restored')], PASS);
  const { IDBObjectStore } = await import('fake-indexeddb'); const original = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function (...args) {
    const request = original.apply(this, args);
    if (args[1] === 'securepassVault') request.addEventListener('success', () => this.transaction.abort());
    return request;
  };
  try { await assert.rejects(recovery.restoreExternalRecord(restored.record, PASS, before.revision), /aborted/); }
  finally { IDBObjectStore.prototype.put = original; }
  await retryPendingSync();
  assert.deepEqual(await storage.readLocalVaultRecordRaw(), before);
  assert.equal((await settings.loadSettings()).useSync, false);
  assert.equal(areas.local.localRestorePending, undefined);
  assert.deepEqual(areas.sync, remoteBefore);
});

test('blocked erasure keeps publication disabled and requires explicit retry', async () => {
  await vault.initializeVault(PASS); await vault.changeSyncMode(true); await vault.unlockVault(PASS);
  const remoteBefore = structuredClone(areas.sync);
  const original = indexedDB.deleteDatabase;
  indexedDB.deleteDatabase = () => { throw new Error('Database deletion blocked'); };
  try { await assert.rejects(recovery.wipeDevice(undefined, { force: true, confirmation: 'ERASE THIS DEVICE' }), /blocked/); }
  finally { indexedDB.deleteDatabase = original; }
  assert.equal((await settings.loadSettings()).useSync, false);
  await assert.rejects(retryPendingSync(), /erasure was interrupted/);
  await assert.rejects(vault.changeSyncMode(true), /erasure was interrupted/);
  assert.deepEqual(areas.sync, remoteBefore);
  await recovery.wipeDevice(undefined, { force: true, confirmation: 'ERASE THIS DEVICE' });
  assert.equal(await storage.readLocalVaultRecordRaw(), null);
  assert.deepEqual(areas.local, {});
});

test('a device with archives but no current vault still requires explicit erase confirmation', async () => {
  areas.local.syncRecovery = [(await crypt.createRecord([entry('a')], PASS)).record];
  await assert.rejects(recovery.wipeDevice(), /erase without unlocking/);
  assert.equal(areas.local.syncRecovery.length, 1);
});

test('a fresh profile can explicitly select one of multiple remote heads without retiring the others', async () => {
  const { publishGeneration, syncHeads } = await import('../src/vault/sync.js');
  const a = await crypt.createRecord([entry('a')], PASS); const b = await crypt.createRecord([entry('b')], PASS);
  await publishGeneration(a.record); await publishGeneration(b.record);
  await assert.rejects(vault.changeSyncMode(true, 'use-sync', PASS, { revision: 'missing', expectedRevision: null }), /changed|ambiguous/);
  assert.equal(await storage.readLocalVaultRecordRaw(), null);
  await vault.changeSyncMode(true, 'use-sync', PASS, { revision: b.record.revision, expectedRevision: null });
  await vault.unlockVault(PASS);
  assert.equal((await vault.listCredentials())[0].id, 'b');
  assert.equal((await syncHeads()).length, 2);
});

test('overlapping automatic retries publish a pending revision only once', async () => {
  await vault.initializeVault(PASS); await vault.changeSyncMode(true); await vault.unlockVault(PASS);
  failWhen(area => area === 'sync'); await vault.storeCredential(entry('pending')); failWhen(null);
  const original = chrome.storage.sync.set; let publications = 0;
  chrome.storage.sync.set = (items, callback) => {
    if (Object.keys(items).some(key => key.startsWith('sp2:head:'))) publications++;
    return original(items, callback);
  };
  try { await Promise.all([retryPendingSync(), retryPendingSync(), retryPendingSync()]); }
  finally { chrome.storage.sync.set = original; }
  assert.equal(publications, 1);
  assert.equal(await storage.readSyncOutbox(), null);
});
