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
  console.log('Real IndexedDB Drive commit passed: atomic vault/checkpoint/outbox and full rollback on queue failure. No Google transport used.');
} finally {
  if (context) await context.close();
  await rm(profile, { recursive: true, force: true });
}
