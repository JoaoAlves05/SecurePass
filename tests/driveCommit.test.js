import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { IDBObjectStore } from 'fake-indexeddb';
import { installChrome, resetStorage } from './helpers/chrome.js';
installChrome();
const vault = await import('../src/cryptoVault.js');
const { encryptEntries } = await import('../src/vault/crypto.js');
const storage = await import('../src/utils/storage.js');
const { commitRecord } = await import('../src/vault/repository.js');
const { publicationStore: store } = await import('../src/sync/publicationStore.js');
const PASS = 'Fictional atomic drive master 123!';
beforeEach(async () => { await vault.lockVault(); resetStorage(); });
async function fixture() {
  await vault.initializeVault(PASS);
  const state = await vault.requireVault();
  const record = await encryptEntries(state.record, [], state.bytes);
  const binding = { accountId: 'fictional-account', vaultId: record.vaultId, generation: 'one' };
  await store.configure(binding, true);
  return { before: state.record, record, drivePublication: { binding, publication: { vaultId: record.vaultId, revisionId: record.revision, body: JSON.stringify(record) } } };
}
test('vault, checkpoint and account-bound Drive operation commit in one transaction', async () => {
  const { before, record, drivePublication } = await fixture();
  await commitRecord(record, before.revision, { drivePublication });
  assert.equal((await storage.readLocalVaultRecordRaw()).revision, record.revision);
  assert.equal((await storage.readRecoveryRecords())[0].revision, before.revision);
  assert.equal((await store.next()).publication.revisionId, record.revision);
  assert.equal(await storage.readSyncOutbox(), null);
});
test('a changed binding aborts the vault and checkpoint write alongside its outbox', async () => {
  const { before, record, drivePublication } = await fixture();
  const previousHistory = await storage.readRecoveryRecords();
  await store.configure({ ...drivePublication.binding, generation: 'two' }, true);
  await assert.rejects(storage.writeLocalVaultRecordRaw(record, before.revision, { drivePublication }), /binding changed/);
  assert.deepEqual(await storage.readLocalVaultRecordRaw(), before);
  assert.deepEqual(await storage.readRecoveryRecords(), previousHistory);
  assert.equal(await store.next(), null);
});
test('outbox failure after successful record put rolls back every write', async () => {
  const { before, record, drivePublication } = await fixture();
  const original = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function(value, key) {
    const request = original.call(this, value, key);
    if (key === 'drivePublicationState') this.transaction.abort();
    return request;
  };
  try { await assert.rejects(storage.writeLocalVaultRecordRaw(record, before.revision, { drivePublication }), /aborted/i); }
  finally { IDBObjectStore.prototype.put = original; }
  assert.deepEqual(await storage.readLocalVaultRecordRaw(), before); assert.equal(await store.next(), null);
});
test('a packet for another revision or simultaneous legacy publication is refused before commit', async () => {
  const { before, record, drivePublication } = await fixture();
  await assert.rejects(storage.writeLocalVaultRecordRaw(record, before.revision, { drivePublication, pendingSync: true }), /cannot use legacy/);
  await assert.rejects(storage.writeLocalVaultRecordRaw(record, before.revision, { drivePublication: { ...drivePublication, publication: { ...drivePublication.publication, revisionId: 'other' } } }), /must match/);
  assert.deepEqual(await storage.readLocalVaultRecordRaw(), before);
});
