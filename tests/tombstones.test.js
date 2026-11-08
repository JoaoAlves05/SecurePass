import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { installChrome, resetStorage } from './helpers/chrome.js';
installChrome();
const vault = await import('../src/cryptoVault.js');
const crypt = await import('../src/vault/crypto.js');
const { createPayload, validatePayload, advancePayload, MAX_HISTORY_ITEMS } = await import('../src/vault/payload.js');
const { validateImportData, MAX_VAULT_BYTES } = await import('../src/validation.js');
const { readLocalVaultRecordRaw, readRecoveryRecords, writeLocalVaultRecordRaw } = await import('../src/utils/storage.js');
const { fixture } = await import('./helpers/signedHistory.js');
const { planAuthenticatedMerge } = await import('../src/vault/authenticatedMerge.js');
const { resolveThreeWayPayload } = await import('../src/vault/threeWayMerge.js');
const PASS = 'Fictional history preservation master 123!';
const NEXT = 'Fictional replacement history master 456!';
const entry = id => ({ id, site: 'https://example.com', username: id, password: 'fictional password', notes: '', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' });
beforeEach(async () => { await vault.lockVault(); resetStorage(); });
test('delete and clear persist encrypted tombstones across lock, unlock and unrelated edits', async () => {
  await vault.initializeVault(PASS); await vault.storeCredential(entry('a')); await vault.storeCredential(entry('b'));
  await vault.deleteCredential('a');
  const deleted = await readLocalVaultRecordRaw();
  assert.deepEqual((await crypt.decryptRecord(deleted, PASS)).tombstones, [{ id: 'a', revision: deleted.revision }]);
  await vault.lockVault(); await vault.unlockVault(PASS);
  await vault.updateCredential('b', { password: 'changed fictional password' });
  let state = await vault.requireVault();
  assert.deepEqual((await crypt.decryptPayloadWithKey(state.record, state.bytes)).tombstones, [{ id: 'a', revision: deleted.revision }]);
  await vault.clearVaultEntries(PASS, state.record.revision);
  state = await vault.requireVault();
  const payload = await crypt.decryptPayloadWithKey(state.record, state.bytes);
  assert.equal(payload.entries.length, 0); assert.deepEqual(payload.tombstones.map(item => item.id), ['a', 'b']);
  assert.equal(JSON.stringify(state.record).includes('fictional password'), false);
});
test('normal recreation is refused without changing vault/history; explicit import records restoration provenance', async () => {
  await vault.initializeVault(PASS); await vault.storeCredential(entry('a')); await vault.deleteCredential('a');
  const before = await readLocalVaultRecordRaw(); const history = await readRecoveryRecords();
  await assert.rejects(vault.storeCredential(entry('a')), /deleted.*Restore/);
  assert.deepEqual(await readLocalVaultRecordRaw(), before); assert.deepEqual(await readRecoveryRecords(), history);
  await vault.importVaultData({ entries: [entry('a')] }, undefined, 'replace');
  const state = await vault.requireVault(); const payload = await crypt.decryptPayloadWithKey(state.record, state.bytes);
  assert.deepEqual(payload.tombstones, []);
  assert.deepEqual(payload.provenance, [{ id: 'a', deletedIn: before.revision, restoredIn: state.record.revision }]);
  await vault.deleteCredential('a');
  const again = await vault.requireVault(); const data = await crypt.decryptPayloadWithKey(again.record, again.bytes);
  assert.deepEqual(data.tombstones, [{ id: 'a', revision: again.record.revision }]); assert.equal(data.provenance.length, 1);
});
test('master rotation preserves live and retained checkpoint history under the new key', async () => {
  await vault.initializeVault(PASS); await vault.storeCredential(entry('a')); await vault.deleteCredential('a'); await vault.storeCredential(entry('b'));
  const before = await readLocalVaultRecordRaw(); const checkpoints = await readRecoveryRecords();
  const oldPayload = await crypt.decryptRecord(before, PASS);
  await vault.changeMasterPassword(PASS, NEXT);
  const after = await readLocalVaultRecordRaw(); const payload = await crypt.decryptRecord(after, NEXT);
  assert.deepEqual(payload.tombstones, oldPayload.tombstones); assert.deepEqual(payload.provenance, oldPayload.provenance);
  const history = await readRecoveryRecords();
  for (let i = 0; i < history.length; i++) {
    assert.deepEqual((await crypt.decryptRecord(history[i], NEXT)).tombstones, (await crypt.decryptRecord(checkpoints[i], PASS)).tombstones);
    await assert.rejects(crypt.decryptRecord(history[i], PASS));
  }
});
test('old payload is read without writes and migrates on mutation; old clients refuse the new kind', async () => {
  const { record, bytes } = await crypt.createRecord([entry('a')], PASS);
  const key = await crypto.subtle.importKey('raw', bytes, 'AES-GCM', false, ['encrypt']);
  const context = r => JSON.stringify({ version: 2, vaultId: r.vaultId, revision: r.revision, parents: r.parents, keyEpoch: r.keyEpoch });
  record.data = await crypt.seal({ entries: [entry('a')] }, key, context(record));
  const original = structuredClone(record);
  assert.deepEqual((await crypt.decryptRecord(record, PASS)).tombstones, []); assert.deepEqual(record, original);
  const next = await crypt.encryptEntries(record, [], bytes);
  const payload = await crypt.decryptPayloadWithKey(next, bytes);
  assert.equal(payload.kind, 'securepass-vault-state'); assert.equal(payload.tombstones[0].id, 'a');
  assert.throws(() => validateImportData(payload), /Unsupported backup kind/);
  await assert.rejects(crypt.decryptPayloadWithKey({ ...next, parents: [] }, bytes));
});
test('history validation rejects collisions, missing identities, unknown schema, duplicates and exact capacity overflow', () => {
  const payload = createPayload([entry('a')]);
  assert.throws(() => validatePayload({ ...payload, tombstones: [{ id: 'a', revision: 'delete' }] }), /Conflicting/);
  assert.throws(() => validatePayload({ ...payload, version: 2 }), /Unsupported/);
  assert.throws(() => validatePayload({ ...payload, extra: true }), /Unsupported/);
  const missing = { ...entry('a') }; delete missing.id;
  assert.throws(() => validatePayload({ ...payload, entries: [missing] }), /complete authenticated/);
  const tombstones = Array.from({ length: MAX_HISTORY_ITEMS }, (_, i) => ({ id: `entry-${i}`, revision: 'deleted' }));
  assert.equal(createPayload([], { tombstones }).tombstones.length, MAX_HISTORY_ITEMS);
  assert.throws(() => createPayload([], { tombstones: [...tombstones, { id: 'extra', revision: 'deleted' }] }), /history capacity/);
  assert.throws(() => createPayload([], { tombstones: [tombstones[0], tombstones[0]] }), /Conflicting/);
  const restored = { id: 'a', deletedIn: 'deleted', restoredIn: 'restored' };
  assert.throws(() => createPayload([], { provenance: [restored, restored] }), /Duplicate/);
  const large = Array.from({ length: 700 }, (_, i) => ({ ...entry(`large-${i}`), notes: 'x'.repeat(4096) }));
  const base = createPayload(large); const spare = MAX_VAULT_BYTES - new TextEncoder().encode(JSON.stringify(base)).length;
  const history = Array.from({ length: Math.ceil(spare / 60) + 1 }, (_, i) => ({ id: `deleted-${i}`, revision: 'x'.repeat(64) }));
  assert.throws(() => createPayload(large, { tombstones: history }), /including deletion history/);
  assert.deepEqual(advancePayload(payload, [], 'deleted').tombstones, [{ id: 'a', revision: 'deleted' }]);
});
test('a signed tombstone prevents a stale entry from becoming a new credential against an empty base', async () => {
  const f = await fixture();
  const key = await crypto.subtle.importKey('raw', f.bytes, 'AES-GCM', false, ['encrypt']);
  const base = { ...f.root, revision: 'empty-base', parents: [] };
  const left = { ...base, revision: 'deleted-head', parents: [base.revision] };
  const right = { ...base, revision: 'stale-head', parents: [base.revision] };
  for (const [record, payload] of [[base, createPayload([])], [left, createPayload([], { tombstones: [{ id: 'a', revision: 'observed-deletion' }] })], [right, createPayload([entry('a')])]]) {
    record.data = await crypt.seal(payload, key, JSON.stringify({ version: 2, vaultId: record.vaultId, revision: record.revision, parents: record.parents, keyEpoch: record.keyEpoch }));
  }
  const packets = await Promise.all([base, left, right].map(f.packet));
  const plan = await planAuthenticatedMerge({ ...f.options, packets, local: left.revision, remote: right.revision });
  assert.deepEqual(plan.conflicts, [{ id: 'a', type: 'delete-edit' }]);
  await assert.rejects(resolveThreeWayPayload(plan, {}, plan.identity, 'merged'), /every conflict/);
  const removed = await resolveThreeWayPayload(plan, { a: 'local' }, plan.identity, 'merged');
  assert.deepEqual(removed.tombstones, [{ id: 'a', revision: 'observed-deletion' }]);
  const restored = await resolveThreeWayPayload(plan, { a: 'remote' }, plan.identity, 'merged');
  assert.deepEqual(restored.provenance, [{ id: 'a', deletedIn: 'observed-deletion', restoredIn: 'merged' }]);
});
test('deletion-history overflow aborts the live mutation without truncation or checkpoint changes', async () => {
  const tombstones = Array.from({ length: MAX_HISTORY_ITEMS }, (_, i) => ({ id: `deleted-${i}`, revision: 'deleted' }));
  const { record } = await crypt.createRecord([entry('last')], PASS, { history: { tombstones } });
  await writeLocalVaultRecordRaw(record, null);
  await vault.unlockVault(PASS);
  const checkpoints = await readRecoveryRecords();
  await assert.rejects(vault.deleteCredential('last'), /history capacity/);
  assert.deepEqual(await readLocalVaultRecordRaw(), record);
  assert.deepEqual(await readRecoveryRecords(), checkpoints);
  assert.equal((await vault.listCredentials())[0].id, 'last');
});
