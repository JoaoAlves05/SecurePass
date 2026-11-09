import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { installChrome, resetStorage } from './helpers/chrome.js';
installChrome();
const vault = await import('../src/cryptoVault.js'); const crypt = await import('../src/vault/crypto.js'); const session = await import('../src/vault/session.js');
const admin = await import('../src/sync/administration.js'); const storage = await import('../src/utils/storage.js');
const { DB_STORE_NAME } = await import('../src/constants.js');
const { readAdministration } = await import('../src/sync/administrationStore.js');
const { createAdministrationDeliveryStore } = await import('../src/sync/administrationDeliveryStore.js');
const protocol = await import('../src/sync/administrationProtocol.js'); const protocol2 = await import('../src/sync/administrationProtocol2.js');
const protection = await import('../src/sync/vaultProtection.js');
const { publicationStore } = await import('../src/sync/publicationStore.js');
const { createAdministrationRuntime } = await import('../src/sync/administrationRuntime.js'); const { createDriveRuntime } = await import('../src/sync/driveRuntime.js');
const signatures = await import('../src/sync/signedProtocol.js'); const signingProtection = await import('../src/sync/signingKeyProtection.js');
const auth = await import('../src/sync/authorizationGraph.js'); const revisions = await import('../src/sync/revisionProtocol2.js');
const kits = await import('../src/sync/recoveryKit.js'); const history = await import('../src/sync/keyHistory.js');
const PASS = 'Fictional protocol2 delivery master 123!';
beforeEach(async () => { await vault.lockVault(); resetStorage(); });
async function setup() {
  const created = await crypt.createRecord([], PASS, { version: 3 });
  await storage.writeLocalVaultRecordRaw(created.record, null); await session.activate(created.record, [], created.bytes, session.generation(), { authenticated: true }); created.bytes.fill(0);
  const binding = { vaultId: created.record.vaultId, accountId: 'fictional-account', generation: 'generation' }; await publicationStore.configure(binding, true);
  const first = await admin.bootstrapAdministration(PASS, { operationId: 'bootstrap', deviceId: 'first' }); const snapshot = await readAdministration(created.record.vaultId);
  return { record: created.record, binding, first, snapshot, trust: { vaultId: created.record.vaultId, rootFingerprint: snapshot.authority.rootFingerprint } };
}
function provider({ onPost, lostReply = false } = {}) {
  const files = []; let posts = 0; let lost = lostReply;
  return { files, get posts() { return posts; }, async fetchImpl(url, options) {
    if (options.method === 'POST') {
      posts++; const boundary = options.headers['Content-Type'].split('boundary=')[1]; const parts = options.body.split(`--${boundary}`);
      const metadata = JSON.parse(parts[1].split('\r\n\r\n')[1].trim()); const body = parts[2].split('\r\n\r\n')[1].slice(0, -2);
      const file = { id: `file-${files.length + 1}`, body, appProperties: metadata.appProperties }; files.push(file);
      await onPost?.();
      if (lost) { lost = false; throw new Error('Fictional lost reply after commit'); }
      return Response.json({ id: file.id });
    }
    if (url.includes('alt=media')) return new Response(files.find(file => file.id === new URL(url).pathname.split('/').pop()).body);
    return Response.json({ files: files.map(({ body, ...file }) => file) });
  } };
}
const runtime = (server, options = {}) => createAdministrationRuntime({ writesReviewed: () => true, assertAccount: async () => {}, getToken: async () => 'fictional-token', fetchImpl: server.fetchImpl, ...options });
async function rawWrite(key, value) {
  const db = await storage.getDB(); await new Promise((resolve, reject) => { const tx = db.transaction(DB_STORE_NAME, 'readwrite'); tx.objectStore(DB_STORE_NAME).put(value, key); tx.oncomplete = resolve; tx.onabort = tx.onerror = reject; }); db.close();
}
async function enroll(f) { return admin.enrollDevice(PASS, { operationId: 'enroll', deviceId: 'second', publicKey: (await signatures.generateSigningKey()).publicKey, expectedHead: f.first.head }); }
test('v2 administrative packet binds master protection independently of content ciphertext and proves both private roles', async () => {
  const f = await setup(); const packet = await createAdministrationDeliveryStore(f.binding).next();
  const verified = await protocol.verifyAdministrationPublication(packet.publication.body, packet.publication, f.trust);
  assert.equal(verified.state.hash, f.first.head); assert.equal(verified.state.freshness, 'unproven');
  assert.equal(packet.protocol, 2); assert.equal(packet.chain.length, 1);
  assert.equal(packet.publication.body.includes(f.record.data.ciphertext), false);
  const value = protection.vaultProtectionFromRecord(f.record);
  const tuple = ['SecurePass:protection:1', f.record.vaultId, f.record.keyEpoch, [f.record.kdf.name, f.record.kdf.iterations, f.record.kdf.salt], [f.record.wrappedKey.iv, f.record.wrappedKey.ciphertext]];
  assert.equal(await protection.vaultProtectionDigest(value), createHash('sha256').update(JSON.stringify(tuple)).digest('hex'));
  const opened = await protocol.unlockAdministrationPublication(packet.publication.body, packet.publication, f.trust, PASS);
  try { assert.deepEqual(await crypt.decryptWithKey(f.record, opened.bytes), []); assert.equal(opened.privateKey.extractable, false); } finally { opened.bytes.fill(0); }
  await assert.rejects(protocol.unlockAdministrationPublication(packet.publication.body, packet.publication, f.trust, 'Wrong fictional password'));
});
test('untrusted roots, false checkpoints, substituted protection and noncanonical fields fail', async () => {
  const f = await setup(); const { publication } = await createAdministrationDeliveryStore(f.binding).next();
  await assert.rejects(protocol.verifyAdministrationPublication(publication.body, publication, { ...f.trust, rootFingerprint: 'f'.repeat(64) }), /root|trust/i);
  await assert.rejects(protocol.verifyAdministrationPublication(publication.body, publication, { ...f.trust, expectedHead: 'f'.repeat(64) }), /checkpoint|head/i);
  for (const change of [value => { value.material.vaultProtection.kdf.salt = crypt.encodeKey(crypto.getRandomValues(new Uint8Array(16))); }, value => { value.material.vaultProtection.keyEpoch = 'another'; }, value => { value.material.extra = true; }, value => { value.material.keyHistory = {}; }, value => { value.head = 'f'.repeat(64); }]) {
    const value = JSON.parse(publication.body); change(value);
    await assert.rejects(protocol.verifyAdministrationPublication(JSON.stringify(value), publication, f.trust));
  }
  await assert.rejects(protocol.verifyAdministrationPublication(publication.body.replace('"version":2', '"version":2,"version":2'), publication, f.trust), /Noncanonical/);
});
test('failed administrative private-key proof clears an already opened content root', async () => {
  const f = await setup(); const { publication } = await createAdministrationDeliveryStore(f.binding).next(); const value = JSON.parse(publication.body);
  value.administrativeKey.protectedKey.iv = crypt.encodeKey(new Uint8Array(12));
  const decrypt = crypto.subtle.decrypt.bind(crypto.subtle); let opened;
  crypto.subtle.decrypt = async (...args) => { const result = await decrypt(...args); if (result.byteLength === 32) opened = result; return result; };
  try { await assert.rejects(protocol.unlockAdministrationPublication(JSON.stringify(value), publication, f.trust, PASS)); } finally { crypto.subtle.decrypt = decrypt; }
  assert.ok(opened); assert.ok(new Uint8Array(opened).every(byte => byte === 0));
});
test('material creation/verification snapshots caller objects before asynchronous work', async () => {
  const f = await setup(); const material = structuredClone(f.snapshot.administration.operations[0].material); const trust = { ...f.trust };
  const task = protocol2.createAdministrationPublication2(f.snapshot.authority.chain, f.snapshot.administration.envelope, material, trust);
  material.vaultProtection.keyEpoch = 'retargeted'; trust.rootFingerprint = 'f'.repeat(64);
  const packet = await task; assert.equal((await protocol.verifyAdministrationPublication(packet.body, packet, f.trust)).state.hash, f.first.head);
});
test('lost v2 provider response reuses exact bytes and only then acknowledges', async () => {
  const f = await setup(); const server = provider({ lostReply: true }); let now = Date.now(); const worker = runtime(server, { now: () => now, random: () => 0 });
  assert.equal((await worker.run()).pending, true); const body = server.files[0].body;
  assert.equal((await admin.administrationStatus()).pending[0].outcome, 'unknown'); now += 100000;
  assert.equal((await worker.run()).published, true); assert.equal(server.posts, 1); assert.equal(server.files[0].body, body);
  assert.equal((await admin.administrationStatus()).pending.length, 0); assert.equal(server.files[0].appProperties.kind, 'authorization');
});
test('authority changing during accepted upload prevents ack; exact old intent resumes against the new graph', async () => {
  const f = await setup(); let changed = false; const server = provider({ onPost: async () => { if (!changed) { changed = true; await enroll(f); } } });
  let now = Date.now(); const worker = runtime(server, { now: () => now, random: () => 0 });
  assert.equal((await worker.run()).suspended, true); assert.equal((await admin.administrationStatus()).publishedCount, 0); assert.equal((await admin.administrationStatus()).pending[0].outcome, 'unknown'); now += 100000;
  assert.equal((await worker.run()).published, true); assert.equal(server.posts, 1); assert.equal((await admin.administrationStatus()).publishedCount, 1);
});
test('complete v2 authority is delivered before content; content read-back uses protocol-v2 signatures', async () => {
  const f = await setup(); await vault.storeCredential({ id: 'one', site: 'https://example.com', password: 'Fictional secret' }); const server = provider();
  const worker = createDriveRuntime({ writesReviewed: () => true, assertAccount: async () => {}, getToken: async () => 'fictional-token', fetchImpl: server.fetchImpl });
  assert.equal((await worker.run()).administrative, true);
  assert.equal((await worker.run()).published, true); assert.equal((await worker.run()).published, true);
  assert.equal(server.files.length, 3); assert.equal(server.files[0].appProperties.kind, 'authorization');
  assert.ok(server.files.slice(1).every(file => JSON.parse(file.body).payload.version === 2));
  assert.equal((await worker.run()).idle, true); assert.equal((await readAdministration(f.record.vaultId)).publication.operations.length, 0);
});
test('reverse stored DAG order still yields exact ancestor subsets and preserves stale content for rebase', async () => {
  const f = await setup(); await enroll(f); const snapshot = await readAdministration(f.record.vaultId); snapshot.authority.chain.reverse();
  await rawWrite(`driveAuthorization:${f.record.vaultId}`, snapshot.authority);
  const queue = createAdministrationDeliveryStore(f.binding); const first = await queue.next(); assert.equal(first.chain.length, 1);
  const server = provider(); const worker = createDriveRuntime({ writesReviewed: () => true, assertAccount: async () => {}, getToken: async () => 'fictional-token', fetchImpl: server.fetchImpl });
  assert.equal((await worker.run()).administrative, true); assert.equal((await queue.next()).chain.length, 2);
  assert.equal((await worker.run()).administrative, true); assert.equal((await worker.run()).rebaseRequired, true);
  assert.equal(server.files.length, 2); assert.equal((await readAdministration(f.record.vaultId)).publication.operations.length, 2);
});
test('kit and historical envelopes survive canonical administrative serialization and master opening', async () => {
  const f = await setup(); const graph = await auth.verifyAuthorityGraph(f.snapshot.authority.chain, { ...f.trust, expectedHead: f.first.head }); const state = auth.authorityState(graph);
  const proof = await crypt.decryptRecord(f.record, PASS); const kit = await kits.createRecoveryKit(f.record, proof.bytes, state);
  const oldAdmin = await signingProtection.unlockAdministrativeKey(f.snapshot.administration.envelope, PASS, f.record);
  const enrolled = await auth.createAuthorityState({ ...state.payload, revision: 'kit', parents: [state.hash], reason: 'recovery-set', recovery: kit.policy }, [{ parent: state.hash, role: 'admin', privateKey: oldAdmin }]);
  const kitHead = await auth.authorityDigest(enrolled.payload); const kitState = auth.authorityState(await auth.verifyAuthorityGraph([...f.snapshot.authority.chain, enrolled], f.trust));
  const next = await crypt.createRecord([], PASS + ' rotated', { version: 3, vaultId: f.record.vaultId }); const nextAdmin = await signingProtection.createAdministrativeKey(PASS + ' rotated', next.record);
  const historical = await history.createKeyHistory([{ keyEpoch: f.record.keyEpoch, bytes: proof.bytes }], next.bytes, next.record);
  const rewrapped = await kits.rewrapRecoveryRoot(kit.material, next.record, next.bytes, kitState);
  const rotated = await auth.createAuthorityState({ ...kitState.payload, revision: 'rotation', parents: [kitHead], reason: 'rotate', keyEpoch: next.record.keyEpoch, adminKey: nextAdmin.envelope.publicKey, protectionDigest: await revisions.protectionDigest(next.record), keyHistoryDigest: await history.keyHistoryDigest(historical), recovery: rewrapped.policy }, [{ parent: kitHead, role: 'admin', privateKey: oldAdmin }]);
  const packet = await protocol2.createAdministrationPublication2([...f.snapshot.authority.chain, enrolled, rotated], nextAdmin.envelope, { vaultProtection: protection.vaultProtectionFromRecord(next.record), keyHistory: historical, recovery: rewrapped.material }, f.trust);
  const opened = await protocol.unlockAdministrationPublication(packet.body, packet, f.trust, PASS + ' rotated');
  const recovered = await kits.openRecoveryKit(kit.code, opened.material.recovery, next.record, opened.state); const old = await history.openKeyHistory(opened.material.keyHistory, recovered.bytes, opened.state);
  try { assert.deepEqual(old[0].bytes, proof.bytes); assert.deepEqual(opened.bytes, next.bytes); } finally { old.forEach(value => value.bytes.fill(0)); recovered.bytes.fill(0); opened.bytes.fill(0); next.bytes.fill(0); proof.bytes.fill(0); }
});
test('an earlier prototype intent without material is preserved and refused before I/O', async () => {
  const f = await setup(); const snapshot = await readAdministration(f.record.vaultId); delete snapshot.administration.operations[0].material;
  await rawWrite(`driveAdministration:${f.record.vaultId}`, snapshot.administration); const server = provider();
  await assert.rejects(runtime(server).run(), /material is missing/); assert.equal(server.posts, 0);
  assert.deepEqual((await readAdministration(f.record.vaultId)).administration, snapshot.administration);
});
test('canonical v2 wire preserves both administrative parents of a jointly resolved fork', async () => {
  const f = await setup(); const root = f.snapshot.authority.chain[0]; const old = await signingProtection.unlockAdministrativeKey(f.snapshot.administration.envelope, PASS, f.record);
  const a = await signatures.generateSigningKey(); const b = await signatures.generateSigningKey();
  const branchA = await auth.createAuthorityState({ ...root.payload, revision: 'branch-a', parents: [f.first.head], reason: 'rotate', keyEpoch: 'epoch-a', adminKey: a.publicKey, protectionDigest: 'a'.repeat(64) }, [{ parent: f.first.head, role: 'admin', privateKey: old }]);
  const branchB = await auth.createAuthorityState({ ...root.payload, revision: 'branch-b', parents: [f.first.head], reason: 'rotate', keyEpoch: 'epoch-b', adminKey: b.publicKey, protectionDigest: 'b'.repeat(64) }, [{ parent: f.first.head, role: 'admin', privateKey: old }]);
  const next = await crypt.createRecord([], PASS + ' joined', { version: 3, vaultId: f.record.vaultId }); const nextAdmin = await signingProtection.createAdministrativeKey(PASS + ' joined', next.record);
  const parents = [{ hash: await auth.authorityDigest(branchA.payload), privateKey: a.privateKey }, { hash: await auth.authorityDigest(branchB.payload), privateKey: b.privateKey }].sort((x, y) => x.hash < y.hash ? -1 : 1);
  const resolved = await auth.createAuthorityState({ ...root.payload, revision: 'resolution', parents: parents.map(value => value.hash), reason: 'resolve', keyEpoch: next.record.keyEpoch, adminKey: nextAdmin.envelope.publicKey, protectionDigest: await revisions.protectionDigest(next.record) }, parents.map(value => ({ parent: value.hash, role: 'admin', privateKey: value.privateKey })));
  const packet = await protocol2.createAdministrationPublication2([resolved, branchB, root, branchA], nextAdmin.envelope, { vaultProtection: protection.vaultProtectionFromRecord(next.record), keyHistory: null, recovery: null }, f.trust);
  const verified = await protocol.verifyAdministrationPublication(packet.body, packet, { ...f.trust, checkpoint: f.first.head });
  assert.equal(verified.chain.length, 4); assert.equal(verified.state.payload.parents.length, 2);
  assert.equal(verified.state.hash, await auth.authorityDigest(resolved.payload)); next.bytes.fill(0);
});
