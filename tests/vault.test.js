import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { installChrome, resetStorage, areas, failWhen } from './helpers/chrome.js';
installChrome();
const vault = await import('../src/cryptoVault.js');
const storage = await import('../src/utils/storage.js');
const crypt = await import('../src/vault/crypto.js');
const sync = await import('../src/vault/sync.js');
const settings = await import('../src/settings.js');
const PASS = 'Fictional master 123!';
const entry = (id = crypto.randomUUID()) => ({ id, site: 'https://bank.example/login', username: ' a<> user ', password: ' a<>秘密😀 b ', notes: 'two words\nnext line' });
beforeEach(async () => { await vault.lockVault(); resetStorage(); });

test('secrets survive create, save, unlock, edit, delete without modification', async () => {
  await vault.initializeVault(PASS); const original = entry('one'); await vault.storeCredential(original); await vault.lockVault();
  await assert.rejects(vault.unlockVault('wrong'));
  await vault.unlockVault(PASS); const [saved] = await vault.listCredentials();
  assert.equal(saved.password, original.password); assert.equal(saved.username, original.username); assert.equal(saved.notes, original.notes);
  assert.equal(saved.site, 'https://bank.example');
  await vault.updateCredential('one', { notes: 'another note' });
  assert.equal((await vault.listCredentials())[0].password, original.password);
  await vault.deleteCredential('one'); await vault.lockVault(); await vault.unlockVault(PASS); assert.equal((await vault.listCredentials()).length, 0);
});
test('unlock never initializes an absent vault', async () => { await assert.rejects(vault.unlockVault(PASS), /not initialized/); assert.equal(await storage.readLocalVaultRecordRaw(), null); });
test('concurrent accepted writes all survive reopening', async () => {
  await vault.initializeVault(PASS); await Promise.all(Array.from({ length: 12 }, (_, i) => vault.storeCredential(entry(`entry-${i}`))));
  await vault.lockVault(); await vault.unlockVault(PASS); assert.equal((await vault.listCredentials()).length, 12);
});
test('lock during encryption cannot reactivate a session', async () => {
  await vault.initializeVault(PASS);
  const original = crypto.subtle.encrypt.bind(crypto.subtle); let reached, release;
  const barrier = new Promise(resolve => { reached = resolve; });
  crypto.subtle.encrypt = async (...args) => { reached(); await new Promise(resolve => { release = resolve; }); return original(...args); };
  try {
    const pending = vault.storeCredential(entry()); await barrier; await vault.lockVault(); release();
    await assert.rejects(pending, /cancelled/); assert.equal((await vault.vaultStatus()).unlocked, false);
  } finally { crypto.subtle.encrypt = original; }
});
test('failure before local commit leaves visible and persisted entries unchanged', async () => {
  await vault.initializeVault(PASS);
  const original = indexedDB.open.bind(indexedDB); indexedDB.open = () => { throw new Error('Injected DB failure'); };
  await assert.rejects(vault.storeCredential(entry()), /Injected/); indexedDB.open = original;
  assert.equal((await vault.listCredentials()).length, 0); await vault.lockVault(); await vault.unlockVault(PASS); assert.equal((await vault.listCredentials()).length, 0);
});
test('session survives module reload without storing master password', async () => {
  await vault.initializeVault(PASS); await vault.storeCredential(entry());
  const fresh = await import(`../src/vault/session.js?restart=${crypto.randomUUID()}`);
  const record = await storage.readLocalVaultRecordRaw();
  assert.equal((await fresh.current(record)).entries.length, 1);
  assert.equal(JSON.stringify(areas.session).includes(PASS), false);
  await vault.lockVault(); await assert.rejects(fresh.current(record), /locked/);
});
test('session deadline is enforced even without an alarm event', async () => {
  await vault.initializeVault(PASS); await vault.lockVault();
  const record = await storage.readLocalVaultRecordRaw();
  areas.session.vaultSessionV2 = { revision: record.revision, keyEpoch: record.keyEpoch, key: 'invalid', deadline: Date.now() - 1 };
  assert.equal((await vault.vaultStatus()).unlocked, false);
});
test('master rotation keeps data and revokes biometric wrapper', async () => {
  await vault.initializeVault(PASS); await vault.storeCredential(entry()); areas.local.securepassBiometric = { enabled: true };
  await vault.changeMasterPassword(PASS, 'New fictional master 123!'); assert.equal(areas.local.securepassBiometric, undefined);
  await vault.lockVault(); await assert.rejects(vault.unlockVault(PASS)); await vault.unlockVault('New fictional master 123!'); assert.equal((await vault.listCredentials()).length, 1);
});
test('import IDs normalized, duplicates rejected and repeated backups skipped', async () => {
  await vault.initializeVault(PASS); const input = { entries: [entry('one')] };
  assert.equal(await vault.importVaultData(input), 1); assert.equal(await vault.importVaultData(input), 0);
  await assert.rejects(async () => vault.importVaultData({ entries: [entry('same'), entry('same')] }), /Duplicate/);
  assert.equal((await vault.listCredentials()).length, 1);
});
test('recovery restores prior encrypted snapshot without deleting current copy', async () => {
  await vault.initializeVault(PASS); await vault.storeCredential(entry('one')); await vault.deleteCredential('one');
  await vault.restoreRecovery(0, PASS); assert.equal((await vault.listCredentials()).length, 1);
  assert.ok((await storage.readRecoveryRecords()).length >= 2);
});
test('immutable Sync publication failure preserves previous head', async () => {
  const { record, bytes } = await crypt.createRecord([], PASS); await sync.publishGeneration(record);
  const next = await crypt.encryptEntries(record, [entry()], bytes);
  failWhen((area, payload) => area === 'sync' && Object.keys(payload).some(key => key.startsWith('sp2:head:')));
  await assert.rejects(sync.publishGeneration(next), /Injected/); failWhen(null);
  assert.deepEqual((await sync.syncHeads()).map(r => r.revision), [record.revision]);
});
test('offline sibling generations remain separate conflict heads', async () => {
  const { record, bytes } = await crypt.createRecord([], PASS); await sync.publishGeneration(record);
  const a = await crypt.encryptEntries(record, [entry('A')], bytes); const b = await crypt.encryptEntries(record, [entry('B')], bytes);
  await Promise.all([sync.publishGeneration(a), sync.publishGeneration(b)]);
  assert.deepEqual(new Set((await sync.syncHeads()).map(r => r.revision)), new Set([a.revision, b.revision]));
});
test('Sync switch invalidates old cache and requires explicit divergence resolution', async () => {
  await vault.initializeVault(PASS); await vault.storeCredential(entry('local'));
  const remote = await crypt.createRecord([entry('remote')], 'Different remote master 123!'); await sync.publishGeneration(remote.record);
  assert.equal((await vault.changeSyncMode(true)).requiresResolution, true);
  await vault.changeSyncMode(true, 'use-sync'); assert.equal((await vault.vaultStatus()).unlocked, false);
  await vault.unlockVault('Different remote master 123!'); assert.equal((await vault.listCredentials())[0].id, 'remote');
});
test('Sync errors after local commit are marked pending and data survives', async () => {
  await vault.initializeVault(PASS); await vault.changeSyncMode(true); await vault.unlockVault(PASS);
  failWhen(area => area === 'sync'); await vault.storeCredential(entry('saved-local')); failWhen(null);
  assert.equal(areas.local.syncStatus.pending, true); await vault.lockVault(); await vault.unlockVault(PASS);
  assert.equal((await vault.listCredentials())[0].id, 'saved-local'); await vault.retrySync(); assert.equal(areas.local.syncStatus.pending, false);
});
test('settings cannot bypass Sync transition', async () => { await assert.rejects(settings.saveSettings({ ...settings.DEFAULT_SETTINGS, useSync: true }), /transition/); });
test('legacy data migrates with recovery and no password normalization', async () => {
  const salt = crypto.getRandomValues(new Uint8Array(16)); const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypt.deriveMasterKey('legacy', salt); const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify({ entries: [entry('legacy')] })));
  const legacy = { salt: crypt.encodeKey(salt), iv: crypt.encodeKey(iv), ciphertext: Buffer.from(data).toString('base64'), iterations: 600000 };
  await storage.writeLocalVaultRecordRaw(legacy, null); await vault.unlockVault('legacy');
  assert.equal((await storage.readLocalVaultRecordRaw()).version, 2); assert.deepEqual((await storage.readRecoveryRecords())[0], legacy);
  assert.equal((await vault.listCredentials())[0].password, entry().password);
});

test('Sync compaction retains heads and does not erase an in-flight generation', async () => {
  await vault.initializeVault(PASS); await vault.changeSyncMode(true); await vault.unlockVault(PASS);
  await vault.storeCredential(entry('one'));
  areas.sync['sp2:upload-in-progress:0'] = 'unpublished';
  const before = (await sync.syncHeads()).map(r => r.revision);
  await vault.compactSync();
  assert.deepEqual((await sync.syncHeads()).map(r => r.revision), before);
  assert.equal(areas.sync['sp2:upload-in-progress:0'], 'unpublished');
});
test('Sync can be disabled when a remote generation is incomplete', async () => {
  await vault.initializeVault(PASS); await vault.changeSyncMode(true);
  const key = Object.keys(areas.sync).find(k => /^sp2:[^:]+:0$/.test(k)); delete areas.sync[key];
  await assert.rejects(sync.syncHeads(), /incomplete/);
  await vault.changeSyncMode(false); assert.equal((await settings.loadSettings()).useSync, false);
});
test('merging remote conflicts preserves both distinct versions of the same ID', async () => {
  await vault.initializeVault(PASS); await vault.storeCredential({ ...entry('same'), password: 'local-value' });
  const remote = await crypt.createRecord([{ ...entry('same'), site: 'https://bank.example', password: 'remote-value' }], 'Remote fictional master 123!');
  await sync.publishGeneration(remote.record);
  await vault.resolveSyncGeneration(remote.record.revision, 'Remote fictional master 123!', true);
  await vault.unlockVault('Remote fictional master 123!');
  const entries = await vault.listCredentials(); assert.equal(entries.length, 2); assert.equal(new Set(entries.map(e => e.id)).size, 2);
  assert.deepEqual(new Set(entries.map(e => e.password)), new Set(['local-value', 'remote-value']));
});

test('a fresh profile can select and unlock the first remote Sync vault', async () => {
  const remote = await crypt.createRecord([{ ...entry('remote-first'), site: 'https://bank.example' }], PASS); await sync.publishGeneration(remote.record);
  assert.equal(await storage.readLocalVaultRecordRaw(), null);
  assert.equal((await vault.changeSyncMode(true)).requiresResolution, false);
  await vault.unlockVault(PASS); assert.equal((await vault.listCredentials())[0].id, 'remote-first');
});

test('a transaction abort after a put never publishes a successful mutation', async () => {
  await vault.initializeVault(PASS);
  const { IDBObjectStore } = await import('fake-indexeddb');
  const original = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function (...args) {
    const result = original.apply(this, args);
    if (args[1] === 'securepassVault') result.addEventListener('success', () => this.transaction.abort());
    return result;
  };
  try { await assert.rejects(vault.storeCredential(entry('must-not-commit')), /aborted/); }
  finally { IDBObjectStore.prototype.put = original; }
  assert.equal((await vault.listCredentials()).length, 0);
  await vault.lockVault(); await vault.unlockVault(PASS); assert.equal((await vault.listCredentials()).length, 0);
});

test('compaction follows transitive ancestry without resurrecting old heads', async () => {
  const { record, bytes } = await crypt.createRecord([], PASS);
  await storage.writeLocalVaultRecordRaw(record, null); await sync.publishGeneration(record);
  const middle = await crypt.encryptEntries(record, [], bytes); await sync.publishGeneration(middle);
  // A bounded history can carry only the immediate parent. The published parent retains its ancestry.
  const head = await crypt.encryptEntries(middle, [], bytes, [middle.revision]); await sync.publishGeneration(head);
  await storage.writeLocalVaultRecordRaw(head, record.revision);
  await vault.compactSync();
  assert.deepEqual((await sync.syncHeads()).map(r => r.revision), [head.revision]);
  assert.equal(areas.sync[`sp2:head:${record.revision}`], undefined);
});
