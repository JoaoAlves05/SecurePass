import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { installChrome, resetStorage, areas } from './helpers/chrome.js';
installChrome();
const vault = await import('../src/cryptoVault.js');
const { createDriveReviewService } = await import('../src/vault/driveReview.js');
const { readLocalVaultRecordRaw } = await import('../src/utils/storage.js');
const { publicationStore: store } = await import('../src/sync/publicationStore.js');
const { authorizeMessage } = await import('../src/security/messages.js');
const { driveHandlers } = await import('../src/messageHandlers/driveHandlers.js');
const { setup } = await import('./helpers/mergeFixture.js');
const { createSignedRevision } = await import('../src/sync/signedProtocol.js');
let services;
beforeEach(async () => {
  await vault.lockVault(); resetStorage(); services = [];
  chrome.runtime.getManifest = () => ({ permissions: ['identity'], oauth2: { client_id: '123456-fictional.apps.googleusercontent.com', scopes: ['https://www.googleapis.com/auth/drive.appdata'] } });
  chrome.identity = { getAuthToken: async () => ({ token: 'fictional' }) };
});
afterEach(() => { for (const service of services) service.clear(); });
async function fixture() {
  const f = await setup();
  areas.local.googleDriveConnection = { state: 'connected', accountId: f.binding.accountId, generation: f.binding.generation };
  const service = createDriveReviewService({ makeReader: async () => f.reader }); services.push(service);
  return { ...f, service };
}
test('owned inspection/preview/decisions expose no passwords and commit the reviewed revision once', async () => {
  const f = await fixture(); const owner = 'first-document';
  assert.deepEqual(await f.service.status(), { available: true });
  const inspection = await f.service.inspect(owner, crypto.randomUUID());
  assert.deepEqual(new Set(inspection.copies.map(copy => copy.revision)), new Set([f.remote.revision, f.unselected.revision]));
  assert.equal(inspection.issues, 0);
  const token = crypto.randomUUID(); const preview = await f.service.preview(f.remote.revision, owner, token);
  assert.equal(preview.conflicts.length, 1); assert.equal(preview.conflicts[0].passwordChanged, true);
  assert.equal(JSON.stringify(preview).includes('alpha'), false); assert.equal(JSON.stringify(preview).includes('beta'), false);
  assert.equal(JSON.stringify(areas.session).includes('alpha'), false);
  await assert.rejects(f.service.commit(token, 'different-document', { a: 'both' }), /another management/);
  f.service.cancel(token, 'different-document');
  await assert.rejects(f.service.commit(token, owner, {}), /every conflict/);
  const committed = await f.service.commit(token, owner, { a: 'both' });
  assert.notEqual(committed.revision, f.local.revision);
  await assert.rejects(f.service.commit(token, owner, { a: 'both' }), /expired/);
});
test('cancellation during a blocked preview prevents further downloads and returns no review', async () => {
  const f = await fixture(); let entered; let release; let calls = 0;
  const started = new Promise(resolve => { entered = resolve; }); const gate = new Promise(resolve => { release = resolve; });
  f.reader.list = async () => { entered(); await gate; return f.files; };
  f.reader.download = async () => { calls++; return f.packets[0].body; };
  const token = crypto.randomUUID(); const pending = f.service.preview(f.remote.revision, 'owner', token);
  await started;
  let timer; const responsive = await Promise.race([vault.keepAlive().then(() => true), new Promise(resolve => { timer = setTimeout(() => resolve(false), 1000); })]); clearTimeout(timer);
  f.service.cancel(token, 'owner'); release();
  await assert.rejects(pending, { name: 'AbortError' }); assert.equal(calls, 0);
  assert.equal(responsive, true, 'Network preparation must not hold the vault operation lock.');
  assert.deepEqual(await readLocalVaultRecordRaw(), f.local);
});
test('an unpublished signed local head is loaded from the outbox rather than requiring a remote copy', async () => {
  const f = await fixture(); await vault.storeCredential({ id: 'pending', site: 'https://example.com', password: 'fictional pending password' });
  const pending = await store.next(); assert.ok(pending);
  const inspected = await f.service.inspect('owner', crypto.randomUUID());
  assert.equal(inspected.copies.some(copy => copy.revision === f.local.revision), false);
  const token = crypto.randomUUID(); const preview = await f.service.preview(f.remote.revision, 'owner', token);
  assert.equal(preview.conflicts.length, 1);
  await f.service.commit(token, 'owner', { a: 'both' });
  assert.equal((await vault.listCredentials()).some(entry => entry.id === 'pending'), true);
});
test('cancelling a review during encryption is rechecked before the atomic commit', async () => {
  const f = await fixture(); const token = crypto.randomUUID(); await f.service.preview(f.remote.revision, 'owner', token);
  const original = crypto.subtle.encrypt; let cancelled = false;
  crypto.subtle.encrypt = async (...args) => { if (!cancelled) { cancelled = true; f.service.cancel(token, 'owner'); } return original.apply(crypto.subtle, args); };
  try { await assert.rejects(f.service.commit(token, 'owner', { a: 'both' }), /expired|discarded|abort/i); }
  finally { crypto.subtle.encrypt = original; }
  assert.deepEqual(await readLocalVaultRecordRaw(), f.local); assert.equal(await store.next(), null);
});
test('bad signatures quarantine their logical revision without hiding unrelated verified copies', async () => {
  const f = await fixture();
  const original = f.reader.download;
  f.reader.download = async (binding, id) => id === 'file-2' ? 'untrusted provider data' : original(binding, id);
  const inspection = await f.service.inspect('owner', crypto.randomUUID());
  assert.equal(inspection.issues, 1); assert.equal(inspection.copies.some(copy => copy.revision === f.unselected.revision), true);
  assert.equal(inspection.copies.some(copy => copy.revision === f.remote.revision), false);
  assert.deepEqual(await readLocalVaultRecordRaw(), f.local);
  const cyclic = await createSignedRevision({ ...f.remote, parents: [f.remote.revision] }, 'writer', f.device.privateKey, f.authorization);
  f.reader.download = async (binding, id) => id === 'file-2' ? cyclic : original(binding, id);
  const repeated = await f.service.inspect('owner', crypto.randomUUID());
  assert.equal(repeated.issues, 1); assert.equal(repeated.copies.some(copy => copy.revision === f.remote.revision), false);
});
test('review count and expiry are bounded, including rollback of the wall clock', async () => {
  const f = await fixture(); let release;
  const gate = new Promise(resolve => { release = resolve; }); f.reader.list = async () => { await gate; return f.files; };
  const pending = Array.from({ length: 8 }, (_, i) => f.service.preview(f.remote.revision, `owner-${i}`, crypto.randomUUID()));
  pending.forEach(promise => promise.catch(() => {}));
  await assert.rejects(f.service.preview(f.remote.revision, 'extra-owner', crypto.randomUUID()), /Too many/);
  f.service.clear(); release(); await Promise.allSettled(pending);
  f.reader.list = async () => f.files;
  const original = Date.now; let time = original(); Date.now = () => time;
  try {
    const token = crypto.randomUUID(); const preview = await f.service.preview(f.remote.revision, 'owner', token);
    time = preview.expiresAt;
    await assert.rejects(f.service.commit(token, 'owner', { a: 'both' }), /expired/);
    time = original(); const next = crypto.randomUUID(); await f.service.preview(f.remote.revision, 'owner', next); time--;
    await assert.rejects(f.service.commit(next, 'owner', { a: 'both' }), /expired/);
  } finally { Date.now = original; }
});
test('lock, changed account and replacement preview invalidate older reviews', async () => {
  const f = await fixture(); const first = crypto.randomUUID();
  await f.service.preview(f.remote.revision, 'owner', first);
  const second = crypto.randomUUID(); await f.service.preview(f.remote.revision, 'owner', second);
  await assert.rejects(f.service.commit(first, 'owner', { a: 'both' }), /expired/);
  areas.local.googleDriveConnection.generation = 'different';
  await assert.rejects(f.service.preview(f.remote.revision, 'owner', crypto.randomUUID()), /binding-changed/);
  await assert.rejects(f.service.commit(second, 'owner', { a: 'both' }), /expired/);
  areas.local.googleDriveConnection.generation = f.binding.generation;
  const third = crypto.randomUUID(); await f.service.preview(f.remote.revision, 'owner', third);
  await vault.lockVault();
  await assert.rejects(f.service.commit(third, 'owner', { a: 'both' }), /locked|cancelled/i);
});
test('content/auth/selector contexts cannot call management Drive review routes', async () => {
  for (const type of ['DRIVE_REVIEW_STATUS', 'DRIVE_REVIEW_INSPECT', 'DRIVE_REVIEW_PREVIEW', 'DRIVE_REVIEW_COMMIT', 'DRIVE_REVIEW_CANCEL']) {
    for (const url of ['https://example.com/', chrome.runtime.getURL('auth/auth.html'), chrome.runtime.getURL('selector/selector.html')]) {
      assert.throws(() => authorizeMessage({ type }, { id: chrome.runtime.id, url, origin: new URL(url).origin }), /Forbidden/);
    }
  }
  await assert.rejects(driveHandlers.get('DRIVE_REVIEW_PREVIEW')({ clientId: crypto.randomUUID(), revision: 'remote', token: crypto.randomUUID() }, { id: chrome.runtime.id, url: 'https://example.com/' }), /trusted management/);
});
