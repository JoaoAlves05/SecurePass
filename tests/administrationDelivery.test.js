import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { installChrome, resetStorage } from './helpers/chrome.js';
installChrome();
const vault = await import('../src/cryptoVault.js');
const admin = await import('../src/sync/administration.js');
const { readAdministration } = await import('../src/sync/administrationStore.js');
const { readLocalVaultRecordRaw } = await import('../src/utils/storage.js');
const protocol = await import('../src/sync/administrationProtocol.js');
const signatures = await import('../src/sync/signedProtocol.js');
const { createAdministrationRuntime } = await import('../src/sync/administrationRuntime.js');
const { createDriveRuntime } = await import('../src/sync/driveRuntime.js');
const { publicationStore } = await import('../src/sync/publicationStore.js');
const PASS = 'Fictional administrative delivery master 123!';
beforeEach(async () => { await vault.lockVault(); resetStorage(); });
async function setup() {
  await vault.initializeVault(PASS); const record = await readLocalVaultRecordRaw();
  const binding = { vaultId: record.vaultId, accountId: 'fictional-account', generation: 'first-generation' };
  await publicationStore.configure(binding, true);
  const first = await admin.bootstrapAdministration(PASS, { operationId: 'bootstrap', deviceId: 'first' });
  return { record, binding, first, snapshot: await readAdministration(record.vaultId) };
}
function provider() {
  const files = []; const calls = []; let lost = false; let disable = false;
  return { files, calls, loseNextReply() { lost = true; }, disableAfterUpload() { disable = true; },
    async fetchImpl(url, options) {
      calls.push({ method: options.method, url });
      if (options.method === 'POST') {
        const boundary = options.headers['Content-Type'].split('boundary=')[1]; const parts = options.body.split(`--${boundary}`);
        const metadata = JSON.parse(parts[1].split('\r\n\r\n')[1].trim()); const body = parts[2].split('\r\n\r\n')[1].slice(0, -2);
        const file = { id: `file-${files.length + 1}`, body, appProperties: metadata.appProperties }; files.push(file);
        if (disable) { disable = false; await publicationStore.disable(); }
        if (lost) { lost = false; throw new Error('Fictional network failure after provider commit'); }
        return Response.json({ id: file.id });
      }
      if (url.includes('alt=media')) { const id = new URL(url).pathname.split('/').pop(); return new Response(files.find(file => file.id === id).body); }
      return Response.json({ files: files.map(({ body, ...file }) => file) });
    }
  };
}
const runtime = (server, options = {}) => createAdministrationRuntime({ writesReviewed: () => true, assertAccount: async () => {}, getToken: async () => 'fictional-token', fetchImpl: server.fetchImpl, ...options });
test('canonical administrative publication requires an independent root and master key-pair proof', async () => {
  const f = await setup(); const trust = { vaultId: f.record.vaultId, rootFingerprint: f.snapshot.authority.rootFingerprint };
  const packet = await protocol.createAdministrationPublication(f.snapshot.authority.chain, f.snapshot.administration.envelope, trust);
  const verified = await protocol.verifyAdministrationPublication(packet.body, packet, trust); assert.equal(verified.state.hash, f.first.head);
  assert.equal(verified.state.freshness, 'unproven');
  await assert.rejects(protocol.verifyAdministrationPublication(packet.body, packet, { ...trust, expectedHead: 'f'.repeat(64) }), /checkpoint/);
  const opened = await protocol.unlockAdministrationPublication(packet.body, packet, trust, PASS); assert.equal(opened.privateKey.extractable, false);
  await assert.rejects(protocol.unlockAdministrationPublication(packet.body, packet, trust, 'Wrong fictional master'));
  await assert.rejects(protocol.verifyAdministrationPublication(packet.body, packet, { ...trust, rootFingerprint: 'f'.repeat(64) }), /Untrusted/);
  await assert.rejects(protocol.verifyAdministrationPublication(packet.body.replace('"version":1', '"version":1,"version":1'), packet, trust), /Noncanonical/);
  const tampered = JSON.parse(packet.body); tampered.administrativeKey.protectedKey.iv = Buffer.alloc(12).toString('base64');
  await assert.rejects(protocol.unlockAdministrationPublication(JSON.stringify(tampered), packet, trust, PASS));
});
test('administrative delivery uses a separate namespace and verifies exact read-back before acknowledgment', async () => {
  const f = await setup(); const server = provider();
  server.files.push({ id: 'unrelated-content', body: 'Fictional other namespace', appProperties: { vaultId: f.record.vaultId, revisionId: f.first.head } });
  const result = await runtime(server).run(); assert.equal(result.published, true);
  assert.equal(server.files.length, 2); assert.equal(server.files[1].appProperties.kind, 'authorization');
  const status = await admin.administrationStatus(); assert.equal(status.pending.length, 0); assert.equal(status.publishedCount, 1);
  const operation = (await readAdministration(f.record.vaultId)).administration.operations[0];
  assert.equal(operation.phase, 'published'); assert.equal(operation.receipt.fileIds[0], server.files[1].id); assert.equal(operation.outcome, 'verified');
});
test('lost provider response resumes the same signed bytes without creating another file', async () => {
  const f = await setup(); const server = provider(); server.loseNextReply(); let now = Date.now();
  const delivery = runtime(server, { now: () => now, random: () => 0 });
  assert.equal((await delivery.run()).pending, true); const body = server.files[0].body;
  const uncertain = (await readAdministration(f.record.vaultId)).administration.operations[0]; assert.equal(uncertain.outcome, 'unknown'); assert.equal(uncertain.phase, 'pending-publication');
  now += 100000; assert.equal((await delivery.run()).published, true);
  assert.equal(server.files.length, 1); assert.equal(server.files[0].body, body); assert.equal(server.calls.filter(value => value.method === 'POST').length, 1);
});
test('self-revocation still delivers authority while content stays suspended and its old queue is retained', async () => {
  const f = await setup(); await vault.storeCredential({ id: 'retained', site: 'https://example.com', password: 'Fictional secret' });
  const enrolled = await admin.enrollDevice(PASS, { operationId: 'enroll-second', deviceId: 'second', publicKey: (await signatures.generateSigningKey()).publicKey, expectedHead: f.first.head });
  await admin.revokeDevice(PASS, { operationId: 'revoke-first', deviceId: 'first', expectedHead: enrolled.head });
  assert.equal((await publicationStore.context()).enabled, false);
  const server = provider(); const delivery = runtime(server);
  for (let i = 0; i < 3; i++) assert.equal((await delivery.run()).published, true);
  assert.equal(server.files.length, 3); assert.equal((await admin.administrationStatus()).pending.length, 0);
  const snapshot = await readAdministration(f.record.vaultId); assert.equal(snapshot.publication.operations.length, 1); assert.equal(snapshot.publication.enabled, false);
  await publicationStore.disable(); assert.equal((await runtime(server).run()).idle, true);
});
test('disable during accepted upload keeps uncertainty and never silently transfers to another generation', async () => {
  const f = await setup(); const server = provider(); server.disableAfterUpload();
  assert.equal((await runtime(server).run()).suspended, true);
  assert.equal((await admin.administrationStatus()).pending[0].outcome, 'unknown');
  await publicationStore.configure({ ...f.binding, generation: 'different-generation' }, true);
  const calls = server.calls.length;
  await assert.rejects(runtime(server).run(), /binding|operation/i); assert.equal(server.calls.length, calls);
  await assert.rejects(admin.retryAdministrativeDelivery('Wrong fictional master', { operationId: 'bootstrap', expectedHead: f.first.head }));
  await publicationStore.configure({ ...f.binding, accountId: 'another-account', generation: 'different-generation' }, true);
  await assert.rejects(admin.retryAdministrativeDelivery(PASS, { operationId: 'bootstrap', expectedHead: f.first.head }), /another account/);
  await publicationStore.configure({ ...f.binding, generation: 'different-generation' }, true);
  await admin.retryAdministrativeDelivery(PASS, { operationId: 'bootstrap', expectedHead: f.first.head });
  assert.equal((await runtime(server).run()).published, true); assert.equal(server.files.length, 1);
});
test('worker orders authority before content and reports stale content as requiring authenticated rebase', async () => {
  const f = await setup(); await vault.storeCredential({ id: 'kept', site: 'https://example.com', password: 'Fictional secret' });
  await admin.enrollDevice(PASS, { operationId: 'enroll-second', deviceId: 'second', publicKey: (await signatures.generateSigningKey()).publicKey, expectedHead: f.first.head });
  const server = provider(); const worker = createDriveRuntime({ writesReviewed: () => true, assertAccount: async () => {}, getToken: async () => 'fictional-token', fetchImpl: server.fetchImpl });
  assert.equal((await worker.run()).administrative, true); assert.equal((await worker.run()).administrative, true);
  assert.equal((await worker.run()).rebaseRequired, true);
  assert.equal(server.files.length, 2); assert.ok(server.files.every(file => file.appProperties.kind === 'authorization'));
  assert.equal((await createAdministrationRuntime({ getToken: async () => { throw new Error('No token before review'); } }).run()).blockedByReview, true);
});
