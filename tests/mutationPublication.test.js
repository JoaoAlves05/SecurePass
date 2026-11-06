import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { IDBObjectStore } from 'fake-indexeddb';
import { installChrome, resetStorage } from './helpers/chrome.js';
installChrome();
const vault = await import('../src/cryptoVault.js');
const storage = await import('../src/utils/storage.js');
const protocol = await import('../src/sync/signedProtocol.js');
const { createDeviceKey } = await import('../src/sync/signingKeyProtection.js');
const { pinAuthorization, advanceAuthorization } = await import('../src/sync/authorizationStore.js');
const { installLocalWriter, prepareMutationPublication } = await import('../src/sync/mutationPublication.js');
const { publicationStore: store } = await import('../src/sync/publicationStore.js');
const { encryptEntries } = await import('../src/vault/crypto.js');
const { createDriveRuntime } = await import('../src/sync/driveRuntime.js');
const PASS = 'Fictional automatic signing master 123!';
beforeEach(async () => { await vault.lockVault(); resetStorage(); });
async function fixture() {
  await vault.initializeVault(PASS); const active = await vault.requireVault();
  const admin = await protocol.generateSigningKey(); const writer = await createDeviceKey(active.bytes, active.record);
  const genesis = await protocol.createAuthorization({ kind: 'securepass-authorization', version: 1, vaultId: active.record.vaultId, keyEpoch: active.record.keyEpoch, revision: crypto.randomUUID(), previous: null, adminKey: admin.publicKey, devices: [{ id: 'writer', publicKey: writer.envelope.publicKey }] }, admin.privateKey);
  const auth = await pinAuthorization([genesis], { vaultId: active.record.vaultId, rootFingerprint: await protocol.signingKeyFingerprint(admin.publicKey) });
  const binding = { accountId: 'account', vaultId: active.record.vaultId, generation: 'generation' };
  await store.configure(binding, true); await installLocalWriter(binding, 'writer', writer.envelope);
  return { active, admin, writer, genesis, auth, binding };
}
test('ordinary create/update/delete prepare signed packets atomically without explicit publication options', async () => {
  const { auth } = await fixture();
  const entry = await vault.storeCredential({ site: 'https://example.com', username: 'fictional', password: 'fictional password' });
  const first = await store.next();
  const verified = await protocol.verifySignedPublication(first.publication.body, first.publication, auth);
  assert.equal(verified.record.revision, (await storage.readLocalVaultRecordRaw()).revision);
  await store.acknowledge(first, { verified: true, revisionId: first.publication.revisionId });
  await vault.updateCredential(entry.id, { password: 'updated fictional password' });
  const second = await store.next();
  await protocol.verifySignedPublication(second.publication.body, second.publication, auth);
  await store.acknowledge(second, { verified: true, revisionId: second.publication.revisionId });
  await vault.deleteCredential(entry.id);
  assert.ok(await store.next()); assert.equal((await vault.listCredentials()).length, 0);
  assert.equal(await storage.readSyncOutbox(), null);
});
test('outbox failure rolls back the ordinary mutation and retains the prior session contents', async () => {
  const { active } = await fixture(); const put = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function(value, key) { const request = put.call(this, value, key); if (key === 'drivePublicationState') this.transaction.abort(); return request; };
  try { await assert.rejects(vault.storeCredential({ site: 'https://example.com', password: 'fictional' })); }
  finally { IDBObjectStore.prototype.put = put; }
  assert.deepEqual(await storage.readLocalVaultRecordRaw(), active.record);
  assert.equal((await vault.listCredentials()).length, 0); assert.equal(await store.next(), null);
});
test('changed authorization rejects ordinary writes until the writer is reauthorized', async () => {
  const { active, genesis, auth, admin } = await fixture();
  const other = await protocol.generateSigningKey();
  const next = await protocol.createAuthorization({ ...genesis.payload, revision: crypto.randomUUID(), previous: auth.hash, devices: [{ id: 'other', publicKey: other.publicKey }] }, admin.privateKey);
  await advanceAuthorization(active.record.vaultId, [genesis, next]);
  await assert.rejects(vault.storeCredential({ site: 'https://example.com', password: 'fictional' }), /not authorized/);
  assert.deepEqual(await storage.readLocalVaultRecordRaw(), active.record);
});
test('locking after signature preparation rejects the transaction and keeps queued work unchanged', async () => {
  const { active } = await fixture(); const record = await encryptEntries(active.record, [], active.bytes);
  const prepared = await prepareMutationPublication(record, active.record.revision);
  await vault.lockVault();
  await assert.rejects(storage.writeLocalVaultRecordRaw(record, active.record.revision, { drivePublication: prepared.packet, validateCommit: prepared.assertSession }), /locked/);
  assert.deepEqual(await storage.readLocalVaultRecordRaw(), active.record); assert.equal(await store.next(), null);
});
test('lock between asynchronous transaction reads aborts the vault, history and signed queue together', async () => {
  const { active } = await fixture(); const get = IDBObjectStore.prototype.get; let lock;
  IDBObjectStore.prototype.get = function(key) {
    const request = get.call(this, key);
    if (key === 'recovery' && this.transaction.mode === 'readwrite') request.addEventListener('success', () => { lock = vault.lockVault(); }, { once: true });
    return request;
  };
  try { await assert.rejects(vault.storeCredential({ site: 'https://example.com', password: 'fictional' }), /locked/); }
  finally { IDBObjectStore.prototype.get = get; await lock; }
  assert.deepEqual(await storage.readLocalVaultRecordRaw(), active.record);
  assert.equal((await storage.readRecoveryRecords()).length, 0); assert.equal(await store.next(), null);
});
test('local restore atomically suspends Drive while retaining the old revision queue', async () => {
  await fixture();
  await vault.storeCredential({ site: 'https://example.com', password: 'fictional' });
  const queued = await store.next(); const [checkpoint] = await storage.readRecoveryRecords();
  await vault.restoreRecovery(checkpoint.revision, PASS);
  assert.equal((await store.context()).enabled, false); assert.equal(await store.next(), null);
  assert.equal((await vault.listCredentials()).length, 0);
  await store.configure(queued.binding, true); assert.equal((await store.next()).id, queued.id);
});
test('master rotation on a connected prototype cannot silently publish an unauthorized epoch', async () => {
  const { active } = await fixture();
  await assert.rejects(vault.changeMasterPassword(PASS, 'Fictional replacement password 123!'), /administrative transition/);
  assert.deepEqual(await storage.readLocalVaultRecordRaw(), active.record);
});
test('the encrypted writer survives lock/unlock without storing its private key in session state', async () => {
  const { auth } = await fixture();
  await vault.lockVault(); await vault.unlockVault(PASS);
  await vault.storeCredential({ site: 'https://example.com', password: 'fictional' });
  const operation = await store.next();
  assert.equal((await protocol.verifySignedPublication(operation.publication.body, operation.publication, auth)).author, 'writer');
  const writer = (await store.context()).writer;
  assert.deepEqual(Object.keys(writer).sort(), ['author', 'envelope']);
  assert.equal(writer.envelope.role, 'device'); assert.ok(writer.envelope.protectedKey.ciphertext);
});
test('enabling Drive after a local-only preparation aborts the unsigned commit', async () => {
  await vault.initializeVault(PASS); const active = await vault.requireVault();
  const record = await encryptEntries(active.record, [], active.bytes);
  const prepared = await prepareMutationPublication(record, active.record.revision);
  assert.equal(prepared.binding, null);
  await store.configure({ vaultId: record.vaultId, accountId: 'account', generation: 'new-binding' }, true);
  await assert.rejects(storage.writeLocalVaultRecordRaw(record, active.record.revision, { expectedDriveBinding: prepared.binding }), /binding changed/);
  assert.deepEqual(await storage.readLocalVaultRecordRaw(), active.record);
});
test('default worker runtime never performs I/O before independent protocol review', async () => {
  let calls = 0;
  const runtime = createDriveRuntime({ getToken: async () => { calls++; return 'token'; } });
  assert.deepEqual(await runtime.run(), { blockedByReview: true }); assert.equal(calls, 0);
});
test('reviewed test runtime publishes normal mutations with current signatures through the durable coordinator', async () => {
  await fixture(); await vault.storeCredential({ site: 'https://example.com', password: 'fictional' });
  const files = []; let uploads = 0;
  const runtime = createDriveRuntime({ writesReviewed: () => true, getToken: async () => 'fictional-token', assertAccount: async () => {}, fetchImpl: async (url, options) => {
    if (options.method === 'POST') {
      uploads++; const boundary = options.headers['Content-Type'].split('boundary=')[1];
      const media = options.body.split(`--${boundary}`)[2].split('\r\n\r\n')[1].slice(0, -2);
      const parsed = JSON.parse(media);
      files.push({ id: 'file', body: media, appProperties: { vaultId: parsed.payload.record.vaultId, revisionId: parsed.payload.record.revision } });
      return Response.json({ id: 'file' });
    }
    return url.includes('alt=media') ? new Response(files[0].body) : Response.json({ files });
  } });
  const results = await Promise.all([runtime.run(), runtime.run()]);
  assert.equal(results[0].published, true); assert.equal(uploads, 1); assert.equal(await store.next(), null);
});
