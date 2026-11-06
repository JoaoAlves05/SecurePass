import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const profile = await mkdtemp(`${tmpdir()}/securepass-drive-commit-`);
let context;
try {
  context = await chromium.launchPersistentContext(profile, { channel: 'chromium', headless: true, args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`, '--no-sandbox'] });
  let [worker] = context.serviceWorkers(); if (!worker) worker = await context.waitForEvent('serviceworker');
  const page = await context.newPage();
  await page.goto(`chrome-extension://${worker.url().split('/')[2]}/popup/popup.html`);
  const result = await page.evaluate(async () => {
    const vault = await import('../src/cryptoVault.js');
    const { encryptEntries } = await import('../src/vault/crypto.js');
    const { commitRecord } = await import('../src/vault/repository.js');
    const storage = await import('../src/utils/storage.js');
    const { publicationStore } = await import('../src/sync/publicationStore.js');
    await vault.initializeVault('Fictional browser drive master 123!');
    const state = await vault.requireVault();
    const binding = { accountId: 'fictional-account', vaultId: state.record.vaultId, generation: 'one' };
    await publicationStore.configure(binding, true);
    const next = await encryptEntries(state.record, [], state.bytes);
    const publication = record => ({ binding, publication: { vaultId: record.vaultId, revisionId: record.revision, body: JSON.stringify(record) } });
    await commitRecord(next, state.record.revision, { drivePublication: publication(next) });
    const queued = await publicationStore.next();
    const history = await storage.readRecoveryRecords();
    const failed = await encryptEntries(next, [], state.bytes);
    const original = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function(value, key) {
      const request = original.call(this, value, key);
      if (key === 'drivePublicationState') this.transaction.abort();
      return request;
    };
    let rejected = false;
    try { await commitRecord(failed, next.revision, { drivePublication: publication(failed) }); }
    catch { rejected = true; }
    finally { IDBObjectStore.prototype.put = original; }
    return {
      committed: (await storage.readLocalVaultRecordRaw()).revision === next.revision,
      queued: queued.publication.revisionId === next.revision,
      checkpoint: history[0].revision === state.record.revision,
      rejected, unchangedHistory: JSON.stringify(history) === JSON.stringify(await storage.readRecoveryRecords()),
      unchangedQueue: (await publicationStore.next()).id === queued.id
    };
  });
  assert.deepEqual(result, { committed: true, queued: true, checkpoint: true, rejected: true, unchangedHistory: true, unchangedQueue: true });
  const automatic = await page.evaluate(async () => {
    const vault = await import('../src/cryptoVault.js');
    const storage = await import('../src/utils/storage.js');
    const protocol = await import('../src/sync/signedProtocol.js');
    const { createDeviceKey } = await import('../src/sync/signingKeyProtection.js');
    const { pinAuthorization } = await import('../src/sync/authorizationStore.js');
    const { installLocalWriter } = await import('../src/sync/mutationPublication.js');
    const { publicationStore: store } = await import('../src/sync/publicationStore.js');
    await vault.lockVault(); await storage.deleteIndexedDb('SecurePassDB');
    await vault.initializeVault('Fictional automatic browser master 123!');
    const active = await vault.requireVault();
    const admin = await protocol.generateSigningKey(); const writer = await createDeviceKey(active.bytes, active.record);
    const genesis = await protocol.createAuthorization({ kind: 'securepass-authorization', version: 1, vaultId: active.record.vaultId, keyEpoch: active.record.keyEpoch, revision: crypto.randomUUID(), previous: null, adminKey: admin.publicKey, devices: [{ id: 'browser-writer', publicKey: writer.envelope.publicKey }] }, admin.privateKey);
    const authorization = await pinAuthorization([genesis], { vaultId: active.record.vaultId, rootFingerprint: await protocol.signingKeyFingerprint(admin.publicKey) });
    const binding = { accountId: 'fictional-account', vaultId: active.record.vaultId, generation: 'automatic' };
    await store.configure(binding, true); await installLocalWriter(binding, 'browser-writer', writer.envelope);
    const entry = await vault.storeCredential({ site: 'https://example.com', password: 'fictional' });
    const created = await store.next();
    await protocol.verifySignedPublication(created.publication.body, created.publication, authorization);
    await store.acknowledge(created, { verified: true, revisionId: created.publication.revisionId });
    await vault.updateCredential(entry.id, { password: 'fictional replacement' });
    const updated = await store.next();
    const verified = await protocol.verifySignedPublication(updated.publication.body, updated.publication, authorization);
    await store.acknowledge(updated, { verified: true, revisionId: updated.publication.revisionId });
    await vault.deleteCredential(entry.id);
    const deleted = await store.next();
    await protocol.verifySignedPublication(deleted.publication.body, deleted.publication, authorization);
    return { ancestry: verified.record.parents.includes(created.publication.revisionId), empty: (await vault.listCredentials()).length === 0, queued: deleted.publication.revisionId === (await storage.readLocalVaultRecordRaw()).revision, noLegacy: await storage.readSyncOutbox() === null };
  });
  assert.deepEqual(automatic, { ancestry: true, empty: true, queued: true, noLegacy: true });
  console.log('Real IndexedDB/WebCrypto Drive commit passed: atomic rollback and automatic signed create/update/delete through normal vault mutations. Internal enrollment fixture; no Google transport used.');
} finally {
  if (context) await context.close();
  await rm(profile, { recursive: true, force: true });
}
