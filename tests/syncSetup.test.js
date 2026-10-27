import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { installChrome, resetStorage, areas } from './helpers/chrome.js';
import { IDBObjectStore } from 'fake-indexeddb';
installChrome();
const vault = await import('../src/cryptoVault.js');
const cryptoVault = await import('../src/vault/crypto.js');
const storage = await import('../src/utils/storage.js');
const sync = await import('../src/vault/sync.js');
const service = await import('../src/vault/syncService.js');
const settings = await import('../src/settings.js');
const diagnostics = await import('../src/syncDiagnostics.js');
const { retryPendingSync } = await import('../src/vault/retry.js');
const PASS = 'Fictional setup master 123!';
const REMOTE = 'Fictional remote master 123!';
const entry = id => ({ id, site: 'https://fictional.example', username: id, password: 'Fictional test value', notes: '' });
beforeEach(async () => { await vault.lockVault(); resetStorage(); });

test('setup check is read-only and activation rejects changed remote heads', async () => {
  await vault.initializeVault(PASS); await vault.storeCredential(entry('local'));
  const before = structuredClone(areas.sync); const local = await storage.readLocalVaultRecordRaw();
  const check = await service.checkSyncSetup();
  assert.equal(check.status.capacity.fits, true); assert.equal(check.currentCount, 1);
  assert.deepEqual(areas.sync, before); assert.equal((await settings.loadSettings()).useSync, false);
  const remote = await cryptoVault.createRecord([entry('remote')], REMOTE); await sync.publishGeneration(remote.record);
  await assert.rejects(vault.changeSyncMode(true, 'keep-local', undefined, { expectedRevision: check.expectedRevision, expectedHeads: check.expectedHeads }), /copies changed/);
  assert.equal((await settings.loadSettings()).useSync, false); assert.deepEqual(await storage.readLocalVaultRecordRaw(), local);
});
test('setup refuses a vault that fits once but cannot fit a subsequent version', async () => {
  await vault.initializeVault(PASS);
  await vault.overwriteVaultEntries(Array.from({ length: 13 }, (_, index) => ({ ...entry(`large-${index}`), notes: 'x'.repeat(3000) })));
  const local = await storage.readLocalVaultRecordRaw();
  const check = await service.checkSyncSetup();
  assert.equal(check.status.capacity.canPublish, false); assert.equal(check.status.capacity.fits, false);
  await assert.rejects(vault.changeSyncMode(true), /another complete version/);
  assert.deepEqual(areas.sync, {}); assert.equal((await settings.loadSettings()).useSync, false);
  assert.deepEqual(await storage.readLocalVaultRecordRaw(), local);
});
test('vault growth beyond the two-version budget stays local and does not loop automatic retries', async () => {
  await vault.initializeVault(PASS); await vault.changeSyncMode(true); await vault.unlockVault(PASS);
  const before = structuredClone(areas.sync);
  await vault.overwriteVaultEntries(Array.from({ length: 13 }, (_, index) => ({ ...entry(`grown-${index}`), notes: 'x'.repeat(3000) })));
  const status = await vault.getSyncStatus();
  assert.equal(status.pending, true); assert.equal(status.errorCode, 'capacity'); assert.equal(status.capacity.canPublish, false);
  assert.deepEqual(areas.sync, before); assert.equal((await vault.listCredentials()).length, 13);
  const original = chrome.storage.sync.get; let reads = 0;
  chrome.storage.sync.get = (...args) => { reads++; return original(...args); };
  try { await retryPendingSync(); assert.equal(reads, 0); }
  finally { chrome.storage.sync.get = original; }
});
test('a failed first setup transaction does not enable sending or publish anything', async () => {
  await vault.initializeVault(PASS); const local = await storage.readLocalVaultRecordRaw();
  const original = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function (...args) {
    const request = original.apply(this, args);
    if (args[1] === 'securepassVault') request.addEventListener('success', () => this.transaction.abort());
    return request;
  };
  try { await assert.rejects(vault.changeSyncMode(true), /aborted/); }
  finally { IDBObjectStore.prototype.put = original; }
  assert.equal((await settings.loadSettings()).useSync, false); assert.deepEqual(areas.sync, {});
  assert.deepEqual(await storage.readLocalVaultRecordRaw(), local); assert.equal(await storage.readSyncOutbox(), null);
});
test('valid selected restore succeeds alongside incomplete remote copy without remote changes', async () => {
  await vault.initializeVault(PASS); await vault.storeCredential(entry('local'));
  const remote = await cryptoVault.createRecord([entry('remote')], REMOTE); await sync.publishGeneration(remote.record);
  areas.sync['sp2:head:incomplete'] = { id: 'incomplete', chunks: 1, parents: [] };
  const before = structuredClone(areas.sync);
  const preview = await service.previewSyncGeneration(remote.record.revision, REMOTE, false, 'owner');
  assert.equal(preview.removed, 1); assert.equal(preview.incoming, 1);
  await service.resolveSyncGeneration(remote.record.revision, REMOTE, false, preview.expectedRevision, { token: preview.token, owner: 'owner' });
  await vault.unlockVault(PASS);
  assert.deepEqual((await vault.listCredentials()).map(item => item.id), ['remote']);
  assert.deepEqual(areas.sync, before); assert.equal((await settings.loadSettings()).useSync, false);
  assert.equal((await storage.readRecoveryRecords()).length > 0, true);
});
test('remote review binds owner, mode, source contents, destination and session, and is single-use', async () => {
  await vault.initializeVault(PASS); await vault.storeCredential(entry('local'));
  const remote = await cryptoVault.createRecord([entry('remote')], REMOTE); await sync.publishGeneration(remote.record);
  let preview = await service.previewSyncGeneration(remote.record.revision, REMOTE, false, 'owner');
  assert.equal(JSON.stringify(areas.session).includes(REMOTE), false);
  await assert.rejects(service.resolveSyncGeneration(remote.record.revision, REMOTE, false, preview.expectedRevision, { token: preview.token, owner: 'other' }), /review expired/);
  await assert.rejects(service.resolveSyncGeneration(remote.record.revision, REMOTE, true, preview.expectedRevision, { token: preview.token, owner: 'owner' }), /review expired/);
  await vault.storeCredential(entry('changed'));
  await assert.rejects(service.resolveSyncGeneration(remote.record.revision, REMOTE, false, undefined, { token: preview.token, owner: 'owner' }), /review expired/);
  preview = await service.previewSyncGeneration(remote.record.revision, REMOTE, false, 'owner');
  await vault.lockVault(); await vault.unlockVault(PASS);
  await assert.rejects(service.resolveSyncGeneration(remote.record.revision, REMOTE, false, undefined, { token: preview.token, owner: 'owner' }), /cancelled/);
  preview = await service.previewSyncGeneration(remote.record.revision, REMOTE, false, 'owner');
  await service.resolveSyncGeneration(remote.record.revision, REMOTE, false, preview.expectedRevision, { token: preview.token, owner: 'owner' });
  await vault.unlockVault(PASS);
  await assert.rejects(service.resolveSyncGeneration(remote.record.revision, REMOTE, false, undefined, { token: preview.token, owner: 'owner' }), /review expired/);
});
test('remote review expires and detects same-revision source replacement', async () => {
  await vault.initializeVault(PASS);
  const remote = await cryptoVault.createRecord([entry('remote')], REMOTE); await sync.publishGeneration(remote.record);
  let preview = await service.previewSyncGeneration(remote.record.revision, REMOTE, false, 'owner');
  areas.session[`syncPreview:${preview.token}`].expiresAt = Date.now() - 1;
  await assert.rejects(service.resolveSyncGeneration(remote.record.revision, REMOTE, false, undefined, { token: preview.token, owner: 'owner' }), /review expired/);
  preview = await service.previewSyncGeneration(remote.record.revision, REMOTE, false, 'owner');
  const originalNow = Date.now; const rollback = areas.session[`syncPreview:${preview.token}`].createdAt - 1;
  Date.now = () => rollback;
  try { await assert.rejects(service.resolveSyncGeneration(remote.record.revision, REMOTE, false, undefined, { token: preview.token, owner: 'owner' }), /review expired/); }
  finally { Date.now = originalNow; }
  const altered = { ...remote.record, updatedAt: new Date(Date.now() + 1000).toISOString() };
  const snapshot = Object.fromEntries(Object.entries(areas.sync).filter(([key]) => !key.includes(remote.record.revision)));
  areas.sync = snapshot; await sync.publishGeneration(altered);
  await assert.rejects(service.resolveSyncGeneration(remote.record.revision, REMOTE, false, undefined, { token: preview.token, owner: 'owner' }), /review expired/);
  assert.equal((await vault.listCredentials()).length, 0);
});
test('manual history cleanup works while sending is off and preserves heads and in-flight data', async () => {
  await vault.initializeVault(PASS); await vault.changeSyncMode(true); await vault.unlockVault(PASS);
  await vault.storeCredential(entry('one')); await vault.changeSyncMode(false);
  const heads = (await sync.syncHeads()).map(record => record.revision);
  areas.sync['sp2:unfinished:0'] = 'temporary';
  await assert.rejects(vault.compactSync(), /Sync is off/);
  assert.ok((await service.compactSync({ manual: true })).removed > 0);
  assert.deepEqual((await sync.syncHeads()).map(record => record.revision), heads);
  assert.equal(areas.sync['sp2:unfinished:0'], 'temporary'); assert.equal((await settings.loadSettings()).useSync, false);
});
test('older copies stay active until explicitly archived and adopted, then cleanup can retire their exact contents', async () => {
  await vault.initializeVault(PASS);
  const legacy = { salt: cryptoVault.encodeKey(new Uint8Array(16)), iv: cryptoVault.encodeKey(new Uint8Array(12)), ciphertext: cryptoVault.encodeKey(new Uint8Array(16)), iterations: 600000 };
  areas.sync.securepassVault_manifest = { chunks: 1 }; areas.sync.securepassVault_chunk_0 = JSON.stringify(legacy);
  await service.compactSync({ manual: true });
  assert.ok(areas.sync.securepassVault_manifest);
  const check = await service.checkSyncSetup(); assert.equal(check.divergent, 1);
  await vault.changeSyncMode(true, 'keep-local', undefined, { expectedRevision: check.expectedRevision, expectedHeads: check.expectedHeads });
  assert.equal((await sync.syncHeads()).length, 1); assert.equal((await sync.syncHeads())[0].version, 2);
  assert.deepEqual(areas.local.syncRecovery[0], legacy);
  await service.compactSync(); assert.equal(areas.sync.securepassVault_manifest, undefined);
  assert.equal((await sync.syncHeads()).length, 1);
});
test('device test rejects same-profile and mismatched receipts; confirms a different installation', async () => {
  const started = await diagnostics.startDeviceTest(); const request = structuredClone(areas.sync['sp:device-test']);
  await assert.rejects(diagnostics.inspectDeviceTest(), /different profile/);
  areas.sync['sp:device-receipt'] = { version: 1, id: request.id, source: request.source, receiver: request.source, revision: null, digest: null, receivedAt: Date.now() };
  assert.equal((await diagnostics.deviceTestStatus()).state, 'waiting');
  areas.sync['sp:device-receipt'].receiver = crypto.randomUUID(); areas.sync['sp:device-receipt'].id = crypto.randomUUID();
  assert.equal((await diagnostics.deviceTestStatus()).state, 'waiting');
  const sourceLocal = structuredClone(areas.local); areas.local = {};
  const received = await diagnostics.inspectDeviceTest(); assert.equal(received.code, started.code);
  await diagnostics.confirmDeviceTest(received.id);
  areas.local = sourceLocal;
  assert.equal((await diagnostics.deviceTestStatus()).state, 'confirmed');
  assert.equal(areas.local.syncDeviceReceipt.revision, null);
});
test('device receipt requires the tested vault version and ignores expired or replaced tests', async () => {
  await vault.initializeVault(PASS); await vault.changeSyncMode(true);
  await diagnostics.startDeviceTest(); const sourceLocal = structuredClone(areas.local); const sourceRemote = structuredClone(areas.sync);
  areas.local = {}; const request = areas.sync['sp:device-test'];
  const manifest = Object.keys(areas.sync).find(key => key.startsWith('sp2:head:')); delete areas.sync[manifest];
  await assert.rejects(diagnostics.inspectDeviceTest(), /not arrived completely/);
  areas.sync = sourceRemote;
  const received = await diagnostics.inspectDeviceTest(); await diagnostics.confirmDeviceTest(received.id);
  areas.local = sourceLocal;
  const confirmed = await diagnostics.deviceTestStatus(); assert.equal(confirmed.state, 'confirmed'); assert.equal(confirmed.receipt.revision, request.revision);
  await diagnostics.startDeviceTest(); const originalNow = Date.now; const later = originalNow() + 5 * 60000;
  Date.now = () => later;
  try { assert.equal((await diagnostics.deviceTestStatus()).state, 'expired'); await assert.rejects(diagnostics.inspectDeviceTest(), /No active test/); }
  finally { Date.now = originalNow; }
});
