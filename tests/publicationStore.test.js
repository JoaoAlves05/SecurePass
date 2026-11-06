import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { installChrome, resetStorage } from './helpers/chrome.js';
installChrome();
const { publicationStore: store } = await import('../src/sync/publicationStore.js');
const binding = { accountId: 'fictional-account', vaultId: 'fictional-vault', generation: 'one' };
const packet = { vaultId: binding.vaultId, revisionId: 'revision', body: 'fictional-encrypted-packet' };
beforeEach(() => resetStorage());
test('outbox state persists uncertain I/O and binds acknowledgements to the original account', async () => {
  await store.configure(binding, true); await store.enqueue(binding, packet);
  const operation = await store.next(); await store.markSending(operation, { attempts: 1, outcome: 'unknown' });
  assert.equal((await store.next()).outcome, 'unknown');
  await store.configure({ ...binding, accountId: 'different', generation: 'two' }, true);
  assert.equal(await store.next(), null);
  await assert.rejects(store.acknowledge(operation, { verified: true, revisionId: 'revision' }), /changed or disabled/);
  await store.configure(binding, true); assert.equal((await store.next()).id, operation.id);
  await store.acknowledge(operation, { verified: true, revisionId: 'revision' }); assert.equal(await store.next(), null);
});
test('duplicate revisions are idempotent and conflicting contents leave the queued packet intact', async () => {
  await store.configure(binding, true);
  const first = await store.enqueue(binding, packet); assert.equal(await store.enqueue(binding, packet), first);
  await assert.rejects(store.enqueue(binding, { ...packet, body: 'different' }), /content conflict/);
  assert.equal((await store.next()).publication.body, packet.body);
});
test('disabled transport accepts no new work or acknowledgement, and returned snapshots cannot mutate storage', async () => {
  await store.configure(binding, true); await store.enqueue(binding, packet); const operation = await store.next();
  operation.publication.body = 'tampered'; assert.equal((await store.next()).publication.body, packet.body);
  await store.disable(); assert.equal(await store.next(), null);
  await assert.rejects(store.enqueue(binding, packet), /disabled/);
  await assert.rejects(store.markSending(operation, { attempts: 1 }), /disabled/);
});

test('resumable upload capability persists only on the original current operation', async () => {
  await store.configure(binding, true); await store.enqueue(binding, packet);
  const operation = await store.next();
  const session = { url: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&upload_id=fictional', digest: 'a'.repeat(64), total: new TextEncoder().encode(packet.body).length };
  await store.saveUploadSession(operation, session);
  assert.deepEqual((await store.next()).uploadSession, session);
  await assert.rejects(async () => store.saveUploadSession(operation, { ...session, url: 'https://attacker.invalid/?upload_id=x' }), /Invalid upload/);
  await store.disable(); await assert.rejects(store.saveUploadSession(operation, null), /disabled/);
  await store.configure(binding, true); assert.deepEqual((await store.next()).uploadSession, session);
  await store.saveUploadSession(operation, null); assert.equal((await store.next()).uploadSession, undefined);
});
