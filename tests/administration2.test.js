import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { IDBObjectStore } from 'fake-indexeddb';
import { installChrome, resetStorage } from './helpers/chrome.js';
installChrome();
const vault = await import('../src/cryptoVault.js');
const admin = await import('../src/sync/administration.js');
const store = await import('../src/utils/storage.js');
const crypt = await import('../src/vault/crypto.js');
const session = await import('../src/vault/session.js');
const { readAdministration } = await import('../src/sync/administrationStore.js');
const { loadAuthorization } = await import('../src/sync/authorizationStore.js');
const { readSignedHistory } = await import('../src/sync/signedHistoryStore.js');
const { appendSignedHistory } = await import('../src/sync/signedHistoryModel.js');
const { requireAuthorityState } = await import('../src/sync/authorizationGraph.js');
const revisions = await import('../src/sync/revisionProtocol2.js');
const { publicationStore } = await import('../src/sync/publicationStore.js');
const { generateSigningKey } = await import('../src/sync/signedProtocol.js');
const PASS = 'Fictional v3 transactional master 123!';
const request = { operationId: 'bootstrap', deviceId: 'local' };
beforeEach(async () => { await vault.lockVault(); resetStorage(); });
async function setup({ enabled = true, bootstrap = true } = {}) {
  const created = await crypt.createRecord([], PASS, { version: 3 });
  await store.writeLocalVaultRecordRaw(created.record, null);
  await session.activate(created.record, [], created.bytes, session.generation(), { authenticated: true }); created.bytes.fill(0);
  const binding = { accountId: 'fictional-account', vaultId: created.record.vaultId, generation: 'generation' };
  await publicationStore.configure(binding, enabled);
  const initial = bootstrap ? await admin.bootstrapAdministration(PASS, request) : null;
  return { record: created.record, binding, initial };
}
async function enroll(head) { return admin.enrollDevice(PASS, { operationId: 'enroll', deviceId: 'second', publicKey: (await generateSigningKey()).publicKey, expectedHead: head }); }
async function verifiedPacket(record, reference) {
  const authority = await loadAuthorization(record.vaultId); const graph = requireAuthorityState(authority, { live: true }).graph;
  const history = await readSignedHistory(record.vaultId); const found = history.packets.find(packet => packet.publication.revisionId === record.revision);
  return revisions.verifySignedRevision2(found.publication.body, found.publication, { graph, reference });
}
test('explicit v3 bootstrap atomically installs protected roles and original signed content; reload replays bytes', async () => {
  const { record, initial } = await setup();
  const snapshot = await readAdministration(record.vaultId); const before = await readSignedHistory(record.vaultId);
  assert.equal(snapshot.authority.format, 2); assert.equal(snapshot.administration.version, 2);
  assert.equal(snapshot.administration.localWriter.envelope.version, 2);
  assert.equal(before.packets.length, 1); assert.equal((await verifiedPacket(record)).authorization, initial.head);
  await vault.lockVault(); await vault.unlockVault(PASS);
  assert.equal((await admin.bootstrapAdministration(PASS, request)).replayed, true);
  assert.deepEqual(await readSignedHistory(record.vaultId), before);
  assert.equal(JSON.stringify(snapshot).includes(PASS), false);
});
test('normal mutations preserve original signed ancestors even after publication acknowledgement', async () => {
  const { record } = await setup();
  const operation = await publicationStore.next();
  // Model a verified provider acknowledgement through the existing store API.
  await publicationStore.acknowledge(operation, { verified: true, revisionId: operation.publication.revisionId });
  await vault.storeCredential({ id: 'entry', site: 'https://example.com', password: 'Fictional entry' });
  const current = await store.readLocalVaultRecordRaw(); const child = await verifiedPacket(current); const [parent] = revisions.parentReferences(child);
  assert.equal(parent.revision, record.revision); assert.equal((await verifiedPacket(record, parent)).record.revision, record.revision);
  assert.equal((await readSignedHistory(record.vaultId)).packets.length, 2);
  assert.equal((await publicationStore.next()).publication.revisionId, current.revision);
});
test('enrollment anchors exact old content and commits a signed descendant under the new authority', async () => {
  const { record, initial } = await setup(); const next = await enroll(initial.head);
  const current = await store.readLocalVaultRecordRaw(); assert.notEqual(current.revision, record.revision);
  const state = await loadAuthorization(record.vaultId); assert.equal(state.hash, next.head);
  const child = await verifiedPacket(current); const [parent] = revisions.parentReferences(child);
  assert.equal(child.authorization, next.head); assert.equal((await verifiedPacket(record, parent)).authorization, initial.head);
  assert.equal(state.payload.contentAnchors[0].revision, record.revision);
  assert.equal((await vault.vaultStatus()).unlocked, true);
  assert.equal((await admin.administrationStatus()).devices.length, 2);
  assert.equal((await store.readRecoveryRecords())[0].revision, record.revision);
  assert.equal((await readAdministration(record.vaultId)).publication.operations.length, 2);
});
test('self-revocation preserves signed history/outbox, stops local publication and permits subsequent master administration', async () => {
  const { record, initial } = await setup(); const next = await enroll(initial.head);
  const before = await store.readLocalVaultRecordRaw(); const packets = await readSignedHistory(record.vaultId); const outbox = (await readAdministration(record.vaultId)).publication.operations;
  const revoked = await admin.revokeDevice(PASS, { operationId: 'self-revoke', deviceId: 'local', expectedHead: next.head });
  assert.deepEqual(await store.readLocalVaultRecordRaw(), before);
  assert.deepEqual(await readSignedHistory(record.vaultId), packets);
  const snapshot = await readAdministration(record.vaultId);
  assert.equal(snapshot.publication.enabled, false); assert.equal(snapshot.publication.administrationEnabled, true);
  assert.deepEqual(snapshot.publication.operations, outbox); assert.equal(snapshot.administration.localWriter, undefined);
  const later = await admin.enrollDevice(PASS, { operationId: 'later-enroll', deviceId: 'third', publicKey: (await generateSigningKey()).publicKey, expectedHead: revoked.head });
  assert.equal(later.devices.length, 2);
});
test('abort after signed cache write rolls back vault, authority, checkpoints and outbox together', async () => {
  const { record, initial } = await setup();
  const snapshot = await readAdministration(record.vaultId); const history = await readSignedHistory(record.vaultId); const checkpoints = await store.readRecoveryRecords();
  const original = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function(value, key) { const result = original.call(this, value, key); if (String(key).startsWith('driveSignedHistory:')) this.transaction.abort(); return result; };
  try { await assert.rejects(enroll(initial.head), /aborted|inactive/i); } finally { IDBObjectStore.prototype.put = original; }
  assert.deepEqual(await store.readLocalVaultRecordRaw(), record);
  assert.deepEqual(await readAdministration(record.vaultId), snapshot);
  assert.deepEqual(await readSignedHistory(record.vaultId), history); assert.deepEqual(await store.readRecoveryRecords(), checkpoints);
});
test('lock while signing and wrong master cannot leave a partial v3 bootstrap', async () => {
  const { record } = await setup({ bootstrap: false });
  await assert.rejects(admin.bootstrapAdministration('Fictional wrong password', request));
  const original = crypto.subtle.sign.bind(crypto.subtle); let locked = false;
  crypto.subtle.sign = async (...args) => { const result = await original(...args); if (!locked) { locked = true; await vault.lockVault(); } return result; };
  try { await assert.rejects(admin.bootstrapAdministration(PASS, request), /locked|cancelled/i); } finally { crypto.subtle.sign = original; }
  assert.equal((await readAdministration(record.vaultId)).authority, null); assert.equal((await readSignedHistory(record.vaultId)).packets.length, 0);
});
test('bootstrap refuses unsigned ancestry rather than manufacturing historical signatures', async () => {
  const { record } = await setup({ bootstrap: false });
  const active = await session.current(record); const changed = await crypt.encryptEntries(record, [], active.bytes);
  await store.writeLocalVaultRecordRaw(changed, record.revision); await session.activate(changed, [], active.bytes, active.epoch); active.bytes.fill(0);
  await assert.rejects(admin.bootstrapAdministration(PASS, request), /Unsigned ancestry/);
  assert.equal((await readAdministration(record.vaultId)).authority, null);
});
test('paused v3 administration retains signatures locally without queuing network work', async () => {
  const { record, initial } = await setup({ enabled: false }); await enroll(initial.head);
  assert.equal((await readSignedHistory(record.vaultId)).packets.length, 2);
  assert.equal((await readAdministration(record.vaultId)).publication.operations.length, 0);
});
test('signed-history capacity and same-ID substitution fail without replacing preserved branches', () => {
  const publication = { vaultId: 'fictional-vault', revisionId: 'revision', body: 'body' }; const packet = { authorization: 'a'.repeat(64), publication };
  const first = appendSignedHistory(null, packet); assert.deepEqual(appendSignedHistory(first, packet), first);
  assert.throws(() => appendSignedHistory(first, { ...packet, publication: { ...publication, body: 'replacement' } }), /substituted/);
  const full = { version: 2, packets: Array.from({ length: 128 }, (_, i) => ({ ...packet, publication: { ...publication, revisionId: `revision-${i}` } })) };
  assert.throws(() => appendSignedHistory(full, packet), /capacity/); assert.equal(full.packets.length, 128);
});
test('competing v3 administrative heads cannot overwrite the first committed successor', async () => {
  const { record, initial } = await setup();
  const device = await generateSigningKey();
  const outcomes = await Promise.allSettled(['a', 'b'].map(id => admin.enrollDevice(PASS, { operationId: id, deviceId: id, publicKey: device.publicKey, expectedHead: initial.head })));
  assert.equal(outcomes.filter(value => value.status === 'fulfilled').length, 1);
  assert.match(outcomes.find(value => value.status === 'rejected').reason.message, /head changed/);
  assert.equal((await readSignedHistory(record.vaultId)).packets.length, 2);
  assert.equal((await admin.administrationStatus()).devices.length, 2);
});
test('normal signed mutation abort cannot leave ciphertext, checkpoint or queue ahead of its history', async () => {
  const { record } = await setup(); const before = await readAdministration(record.vaultId); const history = await readSignedHistory(record.vaultId); const checkpoints = await store.readRecoveryRecords();
  const original = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function(value, key) { const result = original.call(this, value, key); if (String(key).startsWith('driveSignedHistory:')) this.transaction.abort(); return result; };
  try { await assert.rejects(vault.storeCredential({ id: 'abort', site: 'https://example.com', password: 'Fictional secret' }), /aborted|inactive/i); } finally { IDBObjectStore.prototype.put = original; }
  assert.deepEqual(await store.readLocalVaultRecordRaw(), record); assert.deepEqual(await readSignedHistory(record.vaultId), history);
  assert.deepEqual(await readAdministration(record.vaultId), before); assert.deepEqual(await store.readRecoveryRecords(), checkpoints);
});
test('damaged parent bytes cannot be converted into new signed ancestry', async () => {
  const { record } = await setup(); const before = await readAdministration(record.vaultId); const history = await readSignedHistory(record.vaultId);
  history.packets[0].publication.body = '{}';
  const db = await store.getDB(); const { DB_STORE_NAME } = await import('../src/constants.js');
  await new Promise((resolve, reject) => { const tx = db.transaction(DB_STORE_NAME, 'readwrite'); tx.objectStore(DB_STORE_NAME).put(history, `driveSignedHistory:${record.vaultId}`); tx.oncomplete = resolve; tx.onabort = tx.onerror = reject; }); db.close();
  await assert.rejects(vault.storeCredential({ id: 'forged', site: 'https://example.com', password: 'Fictional secret' }));
  assert.deepEqual(await store.readLocalVaultRecordRaw(), record); assert.deepEqual(await readAdministration(record.vaultId), before);
  assert.deepEqual(await readSignedHistory(record.vaultId), history);
});
