import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { IDBObjectStore } from 'fake-indexeddb';
import { installChrome, resetStorage } from './helpers/chrome.js';
installChrome();
const vault = await import('../src/cryptoVault.js');
const admin = await import('../src/sync/administration.js');
const { readAdministration } = await import('../src/sync/administrationStore.js');
const { readLocalVaultRecordRaw } = await import('../src/utils/storage.js');
const { loadAuthorization } = await import('../src/sync/authorizationStore.js');
const protocol = await import('../src/sync/signedProtocol.js');
const { publicationStore } = await import('../src/sync/publicationStore.js');
const PASS = 'Fictional administration master 123!';
const rootRequest = { operationId: 'bootstrap-operation', deviceId: 'first-device' };
beforeEach(async () => { await vault.lockVault(); resetStorage(); });
async function setup() { await vault.initializeVault(PASS); return admin.bootstrapAdministration(PASS, rootRequest); }
async function device(values = {}) { return { operationId: crypto.randomUUID(), deviceId: 'second-device', publicKey: (await protocol.generateSigningKey()).publicKey, ...values }; }
test('bootstrap persists verifiable root and protected keys atomically, without plaintext secrets', async () => {
  const result = await setup(); const record = await readLocalVaultRecordRaw(); const snapshot = await readAdministration(record.vaultId);
  assert.equal((await loadAuthorization(record.vaultId)).hash, result.head);
  assert.equal(result.phase, 'pending-publication'); assert.deepEqual(result.devices.map(d => d.id), ['first-device']);
  assert.equal(JSON.stringify(snapshot).includes(PASS), false); assert.equal(JSON.stringify(snapshot).includes('PRIVATE KEY'), false);
  assert.equal(snapshot.administration.envelope.role, 'admin'); assert.equal(snapshot.administration.localWriter.envelope.role, 'device');
  assert.equal(snapshot.administration.operations.length, 1); assert.equal((await admin.administrationStatus()).pending.length, 1);
  assert.equal(JSON.stringify(await admin.administrationStatus()).includes('protectedKey'), false);
});
test('operation replay reuses the exact signed bytes across repeated calls and rejects changed inputs', async () => {
  const first = await setup(); const record = await readLocalVaultRecordRaw(); const before = await readAdministration(record.vaultId);
  assert.equal((await admin.bootstrapAdministration(PASS, rootRequest)).replayed, true);
  const request = await device({ expectedHead: first.head }); const enrolled = await admin.enrollDevice(PASS, request);
  const stored = await readAdministration(record.vaultId);
  assert.equal((await admin.enrollDevice(PASS, request)).replayed, true);
  assert.deepEqual(await readAdministration(record.vaultId), stored);
  assert.equal(enrolled.devices.length, 2); assert.notDeepEqual(stored, before);
  await assert.rejects(admin.enrollDevice(PASS, { ...request, deviceId: 'different-device' }), /reused/);
});
test('master proof is required even with a live session; failures leave all authority untouched', async () => {
  const initial = await setup(); const record = await readLocalVaultRecordRaw(); const before = await readAdministration(record.vaultId);
  await assert.rejects(admin.enrollDevice('Fictional wrong master', await device({ expectedHead: initial.head })));
  assert.deepEqual(await readAdministration(record.vaultId), before);
  await vault.lockVault(); await assert.rejects(admin.revokeDevice(PASS, { operationId: 'revoke-locked', deviceId: 'first-device', expectedHead: initial.head }), /locked/);
  assert.deepEqual(await readAdministration(record.vaultId), before);
});
test('competing reviewed heads cannot overwrite each other and registry identities are never replaced', async () => {
  const initial = await setup(); const a = await device({ expectedHead: initial.head }); const b = await device({ deviceId: 'third-device', expectedHead: initial.head });
  const outcomes = await Promise.allSettled([admin.enrollDevice(PASS, a), admin.enrollDevice(PASS, b)]);
  assert.equal(outcomes.filter(value => value.status === 'fulfilled').length, 1);
  assert.match(outcomes.find(value => value.status === 'rejected').reason.message, /head changed/);
  const status = await admin.administrationStatus();
  await assert.rejects(admin.enrollDevice(PASS, await device({ deviceId: 'first-device', expectedHead: status.head })), /already exists/);
});
test('self revocation suspends its writer and preserves earlier queued content for authenticated rebase', async () => {
  await vault.initializeVault(PASS); const record = await readLocalVaultRecordRaw(); const binding = { accountId: 'fictional-account', vaultId: record.vaultId, generation: 'binding-generation' };
  await publicationStore.configure(binding, true); const first = await admin.bootstrapAdministration(PASS, rootRequest);
  await vault.storeCredential({ id: 'kept', site: 'https://example.com', password: 'Fictional secret' });
  const operation = await publicationStore.next(); assert.ok(operation);
  const { createDriveRuntime } = await import('../src/sync/driveRuntime.js'); let tokens = 0;
  assert.deepEqual(await createDriveRuntime({ writesReviewed: () => true, getToken: async () => { tokens++; return 'fictional-token'; } }).run(), { administrationPending: true });
  assert.equal(tokens, 0);
  const enrolled = await admin.enrollDevice(PASS, await device({ expectedHead: first.head }));
  await assert.rejects(publicationStore.assertCurrent(operation), /authorization/);
  const revoked = await admin.revokeDevice(PASS, { operationId: 'remove-this-device', deviceId: 'first-device', expectedHead: enrolled.head });
  assert.deepEqual(revoked.devices.map(value => value.id), ['second-device']);
  assert.equal((await publicationStore.context()).enabled, false); assert.equal((await publicationStore.context()).writer, null);
  const snapshot = await readAdministration(record.vaultId); assert.equal(snapshot.publication.operations.length, 1);
  assert.equal(snapshot.publication.operations[0].publication.body, operation.publication.body);
  await assert.rejects(admin.revokeDevice(PASS, { operationId: 'remove-final-device', deviceId: 'second-device', expectedHead: revoked.head }), /last authorized/);
});
test('transaction abort rolls back root, encrypted key and writer together; retry remains possible', async () => {
  await vault.initializeVault(PASS); const record = await readLocalVaultRecordRaw();
  const put = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function(value, key) { const result = put.call(this, value, key); if (String(key).startsWith('driveAdministration:')) this.transaction.abort(); return result; };
  try { await assert.rejects(admin.bootstrapAdministration(PASS, rootRequest), /aborted/); }
  finally { IDBObjectStore.prototype.put = put; }
  assert.deepEqual(await readAdministration(record.vaultId), { authority: null, administration: null, publication: null });
  assert.equal((await admin.bootstrapAdministration(PASS, rootRequest)).devices.length, 1);
});
test('lock or deadline expiry during signing prevents any administrative commit', async () => {
  await vault.initializeVault(PASS); const record = await readLocalVaultRecordRaw(); const original = crypto.subtle.sign.bind(crypto.subtle); let locked = false;
  crypto.subtle.sign = async (...args) => { const result = await original(...args); if (!locked) { locked = true; await vault.lockVault(); } return result; };
  try { await assert.rejects(admin.bootstrapAdministration(PASS, rootRequest), /cancelled|locked/i); }
  finally { crypto.subtle.sign = original; }
  assert.equal((await readAdministration(record.vaultId)).authority, null);
  await vault.unlockVault(PASS);
  const clock = Date.now;
  crypto.subtle.sign = async (...args) => { const result = await original(...args); Date.now = () => clock() + 24 * 60 * 60 * 1000; return result; };
  try { await assert.rejects(admin.bootstrapAdministration(PASS, rootRequest), /locked/i); }
  finally { Date.now = clock; crypto.subtle.sign = original; }
  assert.equal((await readAdministration(record.vaultId)).authority, null);
});
test('unknown/malformed device keys and operation identities cannot modify the chain', async () => {
  const initial = await setup(); const record = await readLocalVaultRecordRaw(); const before = await readAdministration(record.vaultId);
  await assert.rejects(admin.enrollDevice(PASS, { operationId: 'bad-key', deviceId: 'second', publicKey: 'invalid', expectedHead: initial.head }));
  await assert.rejects(admin.enrollDevice(PASS, { operationId: 'bad id with spaces', deviceId: 'second', publicKey: 'invalid', expectedHead: initial.head }));
  assert.deepEqual(await readAdministration(record.vaultId), before);
});
