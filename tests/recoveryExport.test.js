import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { installChrome, resetStorage, areas } from './helpers/chrome.js';
installChrome();
const vault = await import('../src/cryptoVault.js');
const storage = await import('../src/utils/storage.js');
const { createRecord, decryptRecord } = await import('../src/vault/crypto.js');
const { vaultHandlers } = await import('../src/messageHandlers/vaultHandlers.js');
const { authorizeMessage } = await import('../src/security/messages.js');
const preview = () => vaultHandlers.get('PREVIEW_RECOVERY_EXPORT')();
const exported = data => vaultHandlers.get('EXPORT_RECOVERY_SNAPSHOT')(data);
const PASS = 'Fictional export batch master 123!';
beforeEach(async () => { await vault.lockVault(); resetStorage(); });
test('batch inventory holds metadata only and every source-scoped file is independently decryptable', async () => {
  await vault.initializeVault(PASS); await vault.storeCredential({ id: 'one', site: 'https://example.com', password: 'Fictional secret' });
  const local = (await storage.readRecoveryRecords())[0];
  areas.local.syncRecovery = [local];
  const before = structuredClone(areas.local); const inventory = await preview();
  assert.equal(inventory.snapshots.length, 2); assert.equal(inventory.issues.length, 0);
  assert.equal(inventory.snapshots[0].id, inventory.snapshots[1].id);
  assert.notEqual(inventory.snapshots[0].source, inventory.snapshots[1].source);
  assert.equal(JSON.stringify(inventory).includes('ciphertext'), false);
  for (const selected of inventory.snapshots) {
    const { data } = await exported(selected);
    assert.equal(data.snapshots.length, 1); assert.deepEqual(data.sync, []);
    assert.deepEqual((await decryptRecord(data.snapshots[0], PASS)).entries, []);
    assert.equal(new TextEncoder().encode(JSON.stringify(data)).length, selected.bytes);
  }
  assert.deepEqual(areas.local, before);
});
test('same-ID replacement and removal after preview fail rather than exporting another version', async () => {
  const created = await createRecord([], PASS); areas.local.syncRecovery = [created.record];
  const selected = (await preview()).snapshots[0];
  areas.local.syncRecovery[0] = { ...created.record, updatedAt: '2026-10-01T00:00:00Z' };
  await assert.rejects(exported(selected), /changed after review/);
  areas.local.syncRecovery = [];
  await assert.rejects(exported(selected), /no longer available/);
});
test('invalid envelopes and oversized outputs are identified without silently exporting them', async () => {
  const created = await createRecord([], PASS);
  areas.local.syncRecovery = [{ ...created.record, data: { ...created.record.data, ciphertext: 'broken' } }, { ...created.record, padding: 'x'.repeat(16 * 1024 * 1024) }, created.record];
  const inventory = await preview(); assert.equal(inventory.issues.length, 2); assert.equal(inventory.snapshots.length, 1);
  assert.match(inventory.issues[1].error, /16 MiB/);
  areas.local.syncRecovery = [areas.local.syncRecovery[1]];
  await assert.rejects(exported({ id: created.record.revision, source: 'Archived Sync' }), /16 MiB/);
});
test('duplicate IDs, excessive counts, invalid source/digest/identity reject with no storage effects', async () => {
  const created = await createRecord([], PASS); areas.local.syncRecovery = [created.record, created.record];
  assert.equal((await preview()).issues.length, 2); assert.equal((await preview()).snapshots.length, 0);
  await assert.rejects(exported({ id: created.record.revision, source: 'Archived Sync' }), /duplicate identity/);
  areas.local.syncRecovery = Array(101).fill(created.record);
  await assert.rejects(preview(), /100 versions/);
  for (const input of [{ id: 'valid', source: 'Remote' }, { id: {}, source: 'Local' }, { id: 'valid', digest: 'bad' }]) await assert.rejects(exported(input), /Invalid recovery/);
});
test('batch routes are management-only, including authentication and selector exclusions', () => {
  for (const type of ['PREVIEW_RECOVERY_EXPORT', 'EXPORT_RECOVERY_SNAPSHOT']) {
    for (const path of ['auth/auth.html', 'selector/selector.html']) assert.throws(() => authorizeMessage({ type }, { id: chrome.runtime.id, url: `chrome-extension://${chrome.runtime.id}/${path}` }), /Forbidden/);
    assert.throws(() => authorizeMessage({ type }, { id: chrome.runtime.id, url: 'https://example.com', origin: 'https://example.com', tab: { id: 1 } }), /Forbidden/);
  }
});
