import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const profile = await mkdtemp(`${tmpdir()}/securepass-merge-commit-`);
let context;
try {
  context = await chromium.launchPersistentContext(profile, { channel: 'chromium', headless: true, args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`, '--no-sandbox'] });
  let [worker] = context.serviceWorkers(); if (!worker) worker = await context.waitForEvent('serviceworker');
  const page = await context.newPage(); await page.goto(`chrome-extension://${worker.url().split('/')[2]}/popup/popup.html`);
  const result = await page.evaluate(async () => {
    const crypt = await import('../src/vault/crypto.js');
    const storage = await import('../src/utils/storage.js');
    const session = await import('../src/vault/session.js');
    const protocol = await import('../src/sync/signedProtocol.js');
    const { createDeviceKey } = await import('../src/sync/signingKeyProtection.js');
    const { pinAuthorization } = await import('../src/sync/authorizationStore.js');
    const { installLocalWriter } = await import('../src/sync/mutationPublication.js');
    const { publicationStore: store } = await import('../src/sync/publicationStore.js');
    const { planDriveMerge } = await import('../src/vault/driveMerge.js');
    const { applyAuthenticatedMerge } = await import('../src/vault/mergeService.js');
    const entry = (id, password = 'fictional') => ({ id, site: 'https://example.com', username: id, password, notes: 'x'.repeat(4096), createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' });
    const { record: base, bytes } = await crypt.createRecord([entry('a'), entry('b')], 'Fictional browser merge master 123!');
    await storage.writeLocalVaultRecordRaw(base, null);
    const local = await crypt.encryptEntries(base, [entry('a', 'alpha')], bytes);
    const remote = await crypt.encryptEntries(base, [entry('a', 'beta'), entry('b')], bytes);
    await storage.writeLocalVaultRecordRaw(local, base.revision);
    await session.activate(local, [entry('a', 'alpha')], bytes, session.generation(), { authenticated: true });
    const admin = await protocol.generateSigningKey(); const writer = await createDeviceKey(bytes, local);
    const genesis = await protocol.createAuthorization({ kind: 'securepass-authorization', version: 1, vaultId: base.vaultId, keyEpoch: base.keyEpoch, revision: 'auth', previous: null, adminKey: admin.publicKey, devices: [{ id: 'writer', publicKey: writer.envelope.publicKey }] }, admin.privateKey);
    const authorization = await pinAuthorization([genesis], { vaultId: base.vaultId, rootFingerprint: await protocol.signingKeyFingerprint(admin.publicKey) });
    const binding = { accountId: 'fictional-account', vaultId: base.vaultId, generation: 'one' };
    await store.configure(binding, true); await installLocalWriter(binding, 'writer', writer.envelope);
    const packets = await Promise.all([base, local, remote].map(async record => ({ body: await protocol.createSignedRevision(record, 'writer', writer.privateKey, authorization), publication: { vaultId: record.vaultId, revisionId: record.revision } })));
    const files = packets.map((packet, i) => ({ id: `file-${i}`, appProperties: { ...packet.publication } }));
    const reader = { list: async () => files, download: async (binding, id) => packets[Number(id.slice(5))].body };
    const epoch = session.generation();
    const plan = await planDriveMerge({ reader, binding, local: local.revision, remote: remote.revision, authorization, bytes, assertCurrent: () => session.assertGeneration(epoch) });
    const before = await storage.readRecoveryRecords();
    const original = IDBObjectStore.prototype.put; let aborted = false;
    IDBObjectStore.prototype.put = function(value, key) { const request = original.call(this, value, key); if (key === 'drivePublicationState') this.transaction.abort(); return request; };
    try { await applyAuthenticatedMerge(plan, { a: 'both' }); } catch { aborted = true; }
    finally { IDBObjectStore.prototype.put = original; }
    const rollback = (await storage.readLocalVaultRecordRaw()).revision === local.revision && JSON.stringify(before) === JSON.stringify(await storage.readRecoveryRecords()) && await store.next() === null;
    await applyAuthenticatedMerge(plan, { a: 'both' });
    const operation = await store.next();
    const { record } = await protocol.verifySignedPublication(operation.publication.body, operation.publication, authorization);
    const payload = await crypt.decryptPayloadWithKey(record, bytes);
    let replay = false; try { await applyAuthenticatedMerge(plan, { a: 'both' }); } catch { replay = true; }
    return { aborted, rollback, entries: payload.entries.length, tombstone: payload.tombstones.length === 1 && payload.tombstones[0].id === 'b', copy: payload.provenance.length === 1 && payload.provenance[0].originalId === 'a', notes: payload.entries.every(item => item.notes === 'x'.repeat(4096)), parents: record.parents.length === 2 && record.parents.includes(local.revision) && record.parents.includes(remote.revision), checkpoint: (await storage.readRecoveryRecords())[0].revision === local.revision, replay };
  });
  assert.deepEqual(result, { aborted: true, rollback: true, entries: 2, tombstone: true, copy: true, notes: true, parents: true, checkpoint: true, replay: true });
  console.log('Chromium authenticated merge commit passed: signed history, explicit keep-both, persistent tombstone/provenance, atomic rollback/retry, selected parents and replay rejection. No production route or cloud writes enabled.');
} finally { if (context) await context.close(); await rm(profile, { recursive: true, force: true }); }
