import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { IDBObjectStore } from 'fake-indexeddb';
import { installChrome, resetStorage } from './helpers/chrome.js';
installChrome();
const vault = await import('../src/cryptoVault.js');
const crypt = await import('../src/vault/crypto.js');
const session = await import('../src/vault/session.js');
const { readLocalVaultRecordRaw, writeLocalVaultRecordRaw, readRecoveryRecords } = await import('../src/utils/storage.js');
const protocol = await import('../src/sync/signedProtocol.js');
const { createDeviceKey } = await import('../src/sync/signingKeyProtection.js');
const { pinAuthorization, advanceAuthorization } = await import('../src/sync/authorizationStore.js');
const { installLocalWriter } = await import('../src/sync/mutationPublication.js');
const { publicationStore: store } = await import('../src/sync/publicationStore.js');
const { planDriveMerge } = await import('../src/vault/driveMerge.js');
const { applyAuthenticatedMerge } = await import('../src/vault/mergeService.js');
const { planThreeWayMerge, resolveThreeWayPayload } = await import('../src/vault/threeWayMerge.js');
const { createPayload, combinePayloadHistory, MAX_HISTORY_ITEMS } = await import('../src/vault/payload.js');
const PASS = 'Fictional merge commit master password 123!';
const entry = (id, password = 'fictional') => ({ id, site: 'https://example.com', username: id, password, notes: 'x'.repeat(4096), createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' });
beforeEach(async () => { await vault.lockVault(); resetStorage(); });
async function setup() {
  const { record: base, bytes } = await crypt.createRecord([entry('a'), entry('b')], PASS);
  await writeLocalVaultRecordRaw(base, null);
  const localEntries = [entry('a', 'alpha')];
  const local = await crypt.encryptEntries(base, localEntries, bytes);
  const remote = await crypt.encryptEntries(base, [entry('a', 'beta'), entry('b'), entry('c')], bytes);
  const unselected = await crypt.encryptEntries(base, [entry('unselected')], bytes);
  await writeLocalVaultRecordRaw(local, base.revision);
  await session.activate(local, localEntries, bytes, session.generation(), { authenticated: true });
  const active = await vault.requireVault();
  const admin = await protocol.generateSigningKey(); const device = await createDeviceKey(bytes, local);
  const genesis = await protocol.createAuthorization({ kind: 'securepass-authorization', version: 1, vaultId: base.vaultId, keyEpoch: base.keyEpoch, revision: 'auth', previous: null, adminKey: admin.publicKey, devices: [{ id: 'writer', publicKey: device.envelope.publicKey }] }, admin.privateKey);
  const authorization = await pinAuthorization([genesis], { vaultId: base.vaultId, rootFingerprint: await protocol.signingKeyFingerprint(admin.publicKey) });
  const binding = { accountId: 'fictional-account', vaultId: base.vaultId, generation: 'one' };
  await store.configure(binding, true); await installLocalWriter(binding, 'writer', device.envelope);
  const packets = await Promise.all([base, local, remote, unselected].map(async record => ({ body: await protocol.createSignedRevision(record, 'writer', device.privateKey, authorization), publication: { vaultId: base.vaultId, revisionId: record.revision } })));
  const files = packets.map((packet, i) => ({ id: `file-${i}`, appProperties: { ...packet.publication } }));
  const reader = { list: async () => files, download: async (binding, id) => packets[Number(id.slice(5))].body };
  const assertCurrent = () => { session.assertGeneration(active.epoch); if (active.deadline <= Date.now()) throw new Error('Vault is locked'); };
  const plan = await planDriveMerge({ reader, binding, local: local.revision, remote: remote.revision, authorization, bytes, assertCurrent });
  return { base, bytes, local, remote, unselected, active, plan, binding, admin, device, genesis, authorization };
}
test('authenticated merge atomically persists entries, tombstones, copy provenance, checkpoint and signed outbox', async () => {
  const f = await setup();
  const result = await applyAuthenticatedMerge(f.plan, { a: 'both' });
  const record = await readLocalVaultRecordRaw(); const payload = await crypt.decryptPayloadWithKey(record, f.bytes);
  assert.equal(result.revision, record.revision); assert.equal(result.count, 3);
  assert.deepEqual(record.parents, [f.local.revision, f.remote.revision].sort());
  assert.equal(record.parents.includes(f.unselected.revision), false);
  assert.deepEqual(payload.tombstones, [{ id: 'b', revision: f.local.revision }]);
  assert.equal(payload.provenance.length, 1); assert.equal(payload.provenance[0].originalId, 'a');
  assert.deepEqual(payload.provenance[0].revisions, [f.local.revision, f.remote.revision].sort());
  assert.equal(payload.entries.every(e => e.notes === 'x'.repeat(4096)), true);
  assert.equal((await readRecoveryRecords())[0].revision, f.local.revision);
  const operation = await store.next();
  assert.deepEqual((await protocol.verifySignedPublication(operation.publication.body, operation.publication, f.authorization)).record, record);
  await vault.lockVault(); await vault.unlockVault(PASS);
  assert.deepEqual((await crypt.decryptRecord(record, PASS)).provenance, payload.provenance);
  const stable = await readLocalVaultRecordRaw(); await assert.rejects(applyAuthenticatedMerge(f.plan, { a: 'both' }));
  assert.deepEqual(await readLocalVaultRecordRaw(), stable);
});
test('missing decisions and forged or unverified plans cannot change the vault', async () => {
  const f = await setup(); const history = await readRecoveryRecords();
  await assert.rejects(applyAuthenticatedMerge(f.plan, {}), /every conflict/);
  await assert.rejects(applyAuthenticatedMerge(structuredClone(f.plan), { a: 'both' }), /authenticated merge/);
  const plain = planThreeWayMerge({ base: [], local: [], remote: [], identity: f.plan.identity, assertCurrent: () => {} });
  await assert.rejects(applyAuthenticatedMerge(plain, {}), /authenticated merge/);
  assert.deepEqual(await readLocalVaultRecordRaw(), f.local); assert.deepEqual(await readRecoveryRecords(), history); assert.equal(await store.next(), null);
});
test('changed local revision, account binding, authorization or lock invalidate a review', async () => {
  for (const change of ['revision', 'binding', 'authorization', 'lock']) {
    await vault.lockVault(); resetStorage(); const f = await setup();
    if (change === 'revision') await vault.storeCredential(entry('newer'));
    if (change === 'binding') await store.configure({ ...f.binding, generation: 'different' }, true);
    if (change === 'authorization') {
      const next = await protocol.createAuthorization({ ...f.genesis.payload, revision: 'next-auth', previous: f.authorization.hash }, f.admin.privateKey);
      await advanceAuthorization(f.local.vaultId, [f.genesis, next]);
    }
    if (change === 'lock') await vault.lockVault();
    const before = await readLocalVaultRecordRaw();
    await assert.rejects(applyAuthenticatedMerge(f.plan, { a: 'both' }));
    assert.deepEqual(await readLocalVaultRecordRaw(), before);
  }
});
test('binding and authorization changes during encryption cannot re-sign the merge under the new context', async () => {
  for (const change of ['binding', 'authorization']) {
    await vault.lockVault(); resetStorage();
    const f = await setup(); const original = crypto.subtle.encrypt; let switched = false;
    crypto.subtle.encrypt = async (...args) => {
      if (!switched) {
        switched = true;
        if (change === 'binding') {
          const next = { ...f.binding, generation: 'new-generation' };
          await store.configure(next, true); await installLocalWriter(next, 'writer', f.device.envelope);
        } else {
          const next = await protocol.createAuthorization({ ...f.genesis.payload, revision: 'changed-auth', previous: f.authorization.hash }, f.admin.privateKey);
          await advanceAuthorization(f.local.vaultId, [f.genesis, next]);
        }
      }
      return original.apply(crypto.subtle, args);
    };
    try {
      await assert.rejects(applyAuthenticatedMerge(f.plan, { a: 'both' }), /binding or authorization changed/);
      assert.deepEqual(await readLocalVaultRecordRaw(), f.local); assert.equal(await store.next(), null);
    } finally { crypto.subtle.encrypt = original; }
  }
});
test('a transaction abort preserves live state/checkpoints/outbox and allows a guarded retry', async () => {
  const f = await setup(); const before = await readRecoveryRecords(); const original = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function(value, key) { const request = original.call(this, value, key); if (key === 'drivePublicationState') this.transaction.abort(); return request; };
  try { await assert.rejects(applyAuthenticatedMerge(f.plan, { a: 'both' })); }
  finally { IDBObjectStore.prototype.put = original; }
  assert.deepEqual(await readLocalVaultRecordRaw(), f.local); assert.deepEqual(await readRecoveryRecords(), before); assert.equal(await store.next(), null);
  assert.deepEqual((await vault.listCredentials()).map(e => e.password), ['alpha']);
  await applyAuthenticatedMerge(f.plan, { a: 'both' }); assert.notEqual((await readLocalVaultRecordRaw()).revision, f.local.revision);
});
test('combined history enforces metadata limits and distinguishes observed restores from stale recreation', async () => {
  const tombstones = Array.from({ length: MAX_HISTORY_ITEMS }, (_, i) => ({ id: `deleted-${i}`, revision: 'deleted' }));
  const empty = createPayload([]); const left = createPayload([], { tombstones }); const right = createPayload([], { tombstones: [{ id: 'extra', revision: 'remote-delete' }] });
  assert.throws(() => combinePayloadHistory([empty, left, right], { entries: [], deletedIds: [], provenance: [] }, 'merge'), /history capacity/);
  const identity = { vaultId: 'vault', keyEpoch: 'epoch', base: 'base', local: 'left', remote: 'right' };
  const base = createPayload([], { tombstones: [{ id: 'a', revision: 'deleted' }] });
  const restored = createPayload([entry('a')], { provenance: [{ id: 'a', deletedIn: 'deleted', restoredIn: 'left' }] });
  const p = planThreeWayMerge({ base: [], local: restored.entries, remote: [], identity, assertCurrent: () => {}, history: [base, restored, base] });
  assert.deepEqual(p.conflicts, []);
  assert.equal((await resolveThreeWayPayload(p, {}, identity, 'merged')).entries[0].id, 'a');
  assert.throws(() => planThreeWayMerge({ base: [], local: [], remote: [], identity: { ...identity, remote: 'left' }, assertCurrent: () => {}, history: [empty, left, empty] }), /inconsistent/);
  const dropped = planThreeWayMerge({ base: [], local: [entry('a')], remote: [], identity, assertCurrent: () => {}, history: [base, empty, empty] });
  assert.deepEqual(dropped.conflicts, [{ id: 'a', type: 'delete-edit' }]);
  const retained = combinePayloadHistory([base, empty, empty], { entries: [], deletedIds: [], provenance: [] }, 'merged');
  assert.deepEqual(retained.tombstones, base.tombstones);
  const original = crypto.subtle.digest; crypto.subtle.digest = async () => new Uint8Array(32).buffer;
  try {
    const history = { tombstones: [{ id: `c-${'0'.repeat(62)}`, revision: 'deleted-copy' }] };
    const p = planThreeWayMerge({ base: [entry('a')], local: [entry('a', 'alpha')], remote: [entry('a', 'beta')], identity, assertCurrent: () => {}, history: [history, history, history] });
    await assert.rejects(resolveThreeWayPayload(p, { a: 'both' }, identity, 'merged'), /identity collision/);
  } finally { crypto.subtle.digest = original; }
});
