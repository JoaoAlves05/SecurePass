import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const profile = await mkdtemp(`${tmpdir()}/securepass-administration-v2-`); let context;
try {
  context = await chromium.launchPersistentContext(profile, { channel: 'chromium', headless: true, args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`, '--no-sandbox'] });
  let [worker] = context.serviceWorkers(); if (!worker) worker = await context.waitForEvent('serviceworker');
  const page = await context.newPage(); await page.goto(`chrome-extension://${worker.url().split('/')[2]}/popup/popup.html`);
  const first = await page.evaluate(async () => {
    const vault = await import('../src/cryptoVault.js'); const admin = await import('../src/sync/administration.js'); const crypt = await import('../src/vault/crypto.js'); const session = await import('../src/vault/session.js');
    const storage = await import('../src/utils/storage.js'); const { readAdministration } = await import('../src/sync/administrationStore.js'); const { readSignedHistory } = await import('../src/sync/signedHistoryStore.js'); const { publicationStore } = await import('../src/sync/publicationStore.js'); const { generateSigningKey } = await import('../src/sync/signedProtocol.js');
    const pass = 'Fictional transactional browser master 123!'; const created = await crypt.createRecord([], pass, { version: 3 });
    await storage.writeLocalVaultRecordRaw(created.record, null); await session.activate(created.record, [], created.bytes, session.generation(), { authenticated: true }); created.bytes.fill(0);
    await publicationStore.configure({ vaultId: created.record.vaultId, accountId: 'fictional-account', generation: 'generation' }, true);
    const original = IDBObjectStore.prototype.put; let aborted = false;
    IDBObjectStore.prototype.put = function(value, key) { const result = original.call(this, value, key); if (String(key).startsWith('driveSignedHistory:')) this.transaction.abort(); return result; };
    try { await admin.bootstrapAdministration(pass, { operationId: 'bootstrap', deviceId: 'local' }); } catch { aborted = true; } finally { IDBObjectStore.prototype.put = original; }
    const rollback = (await readAdministration(created.record.vaultId)).authority === null && !(await readSignedHistory(created.record.vaultId)).packets.length;
    const boot = await admin.bootstrapAdministration(pass, { operationId: 'bootstrap', deviceId: 'local' });
    const operation = await publicationStore.next(); await publicationStore.acknowledge(operation, { verified: true, revisionId: operation.publication.revisionId });
    await vault.storeCredential({ id: 'one', site: 'https://example.com', password: 'Fictional first secret' });
    const request = { operationId: 'enroll', deviceId: 'second', publicKey: (await generateSigningKey()).publicKey, expectedHead: boot.head };
    const enrolled = await admin.enrollDevice(pass, request); const snapshot = await readAdministration(created.record.vaultId); const record = await storage.readLocalVaultRecordRaw();
    await chrome.storage.session.set({ administration2BrowserRequest: request });
    return { aborted, rollback, head: enrolled.head, revision: record.revision, body: (await readSignedHistory(record.vaultId)).packets.at(-1).publication.body, signed: JSON.stringify(snapshot.administration.operations.at(-1).signed), cacheSize: (await readSignedHistory(record.vaultId)).packets.length };
  });
  assert.equal(first.aborted, true); assert.equal(first.rollback, true); assert.equal(first.cacheSize, 3);
  await page.reload();
  const second = await page.evaluate(async () => {
    const vault = await import('../src/cryptoVault.js'); const admin = await import('../src/sync/administration.js'); const storage = await import('../src/utils/storage.js'); const { readAdministration } = await import('../src/sync/administrationStore.js'); const { readSignedHistory } = await import('../src/sync/signedHistoryStore.js');
    const { loadAuthorization } = await import('../src/sync/authorizationStore.js'); const { requireAuthorityState } = await import('../src/sync/authorizationGraph.js'); const revisions = await import('../src/sync/revisionProtocol2.js');
    const pass = 'Fictional transactional browser master 123!'; const request = (await chrome.storage.session.get('administration2BrowserRequest')).administration2BrowserRequest;
    const replay = await admin.enrollDevice(pass, request); const record = await storage.readLocalVaultRecordRaw(); const history = await readSignedHistory(record.vaultId); const before = await readAdministration(record.vaultId);
    const state = await loadAuthorization(record.vaultId); const graph = requireAuthorityState(state, { live: true }).graph;
    const current = history.packets.at(-1); const verified = await revisions.verifySignedRevision2(current.publication.body, current.publication, { graph });
    const [parent] = revisions.parentReferences(verified); const previous = history.packets.find(packet => packet.publication.revisionId === parent.revision);
    const verifiedParent = await revisions.verifySignedRevision2(previous.publication.body, previous.publication, { graph, reference: parent });
    const [root] = revisions.parentReferences(verifiedParent); const first = history.packets.find(packet => packet.publication.revisionId === root.revision);
    await revisions.verifySignedRevision2(first.publication.body, first.publication, { graph, reference: root });
    await vault.storeCredential({ id: 'two', site: 'https://example.com', password: 'Fictional second secret' });
    const latest = await storage.readLocalVaultRecordRaw(); const preserved = await readSignedHistory(record.vaultId);
    const original = IDBObjectStore.prototype.put; let aborted = false;
    IDBObjectStore.prototype.put = function(value, key) { const result = original.call(this, value, key); if (String(key).startsWith('driveSignedHistory:')) this.transaction.abort(); return result; };
    try { await vault.storeCredential({ id: 'abort', site: 'https://example.com', password: 'Fictional aborted secret' }); } catch { aborted = true; } finally { IDBObjectStore.prototype.put = original; }
    const rollback = JSON.stringify(await storage.readLocalVaultRecordRaw()) === JSON.stringify(latest) && JSON.stringify(await readSignedHistory(record.vaultId)) === JSON.stringify(preserved);
    const outbox = (await readAdministration(record.vaultId)).publication.operations;
    await admin.revokeDevice(pass, { operationId: 'self-revoke', deviceId: 'local', expectedHead: replay.head });
    const after = await readAdministration(record.vaultId);
    return { replayed: replay.replayed, head: replay.head, body: current.publication.body, signed: JSON.stringify(before.administration.operations.at(-1).signed), revision: record.revision, aborted, rollback, retained: JSON.stringify(after.publication.operations) === JSON.stringify(outbox), contentEnabled: after.publication.enabled, adminEnabled: after.publication.administrationEnabled, writer: after.administration.localWriter || null, cacheSize: (await readSignedHistory(record.vaultId)).packets.length };
  });
  assert.equal(second.replayed, true); assert.equal(second.head, first.head); assert.equal(second.revision, first.revision); assert.equal(second.signed, first.signed); assert.equal(second.body, first.body);
  assert.equal(second.aborted, true); assert.equal(second.rollback, true); assert.equal(second.retained, true); assert.equal(second.contentEnabled, false); assert.equal(second.adminEnabled, true); assert.equal(second.writer, null); assert.equal(second.cacheSize, 4);
  console.log('Administration-v2 Chromium passed: actual WebCrypto/IndexedDB bootstrap abort/retry, original signed cache, modeled queue acknowledgement, normal mutations, authenticated cross-authority ancestry, reload exact replay, mutation rollback and self-revocation with preserved queue. Internal local transactions; no provider delivery.');
} finally { if (context) await context.close(); await rm(profile, { recursive: true, force: true }); }
