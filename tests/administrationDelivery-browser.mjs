import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const profile = await mkdtemp(`${tmpdir()}/securepass-administrative-delivery-`); let context;
try {
  context = await chromium.launchPersistentContext(profile, { channel: 'chromium', headless: true, args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`, '--no-sandbox'] });
  let [worker] = context.serviceWorkers(); if (!worker) worker = await context.waitForEvent('serviceworker');
  const page = await context.newPage(); await page.goto(`chrome-extension://${worker.url().split('/')[2]}/popup/popup.html`);
  await page.evaluate(async () => {
    const vault = await import('../src/cryptoVault.js'); const admin = await import('../src/sync/administration.js'); const { publicationStore } = await import('../src/sync/publicationStore.js');
    const { readLocalVaultRecordRaw } = await import('../src/utils/storage.js'); const { generateSigningKey } = await import('../src/sync/signedProtocol.js');
    const passphrase = 'Fictional administrative delivery browser 123!'; await vault.initializeVault(passphrase); const record = await readLocalVaultRecordRaw();
    await publicationStore.configure({ vaultId: record.vaultId, accountId: 'fictional-account', generation: 'fictional-generation' }, true);
    const first = await admin.bootstrapAdministration(passphrase, { operationId: 'bootstrap', deviceId: 'first' });
    await vault.storeCredential({ id: 'preserved', site: 'https://example.com', password: 'Fictional preserved secret' });
    const second = await admin.enrollDevice(passphrase, { operationId: 'enroll-second', deviceId: 'second', publicKey: (await generateSigningKey()).publicKey, expectedHead: first.head });
    await admin.revokeDevice(passphrase, { operationId: 'revoke-first', deviceId: 'first', expectedHead: second.head });
  });
  async function deliver(loseReply) {
    return page.evaluate(async loseReply => {
      const { createAdministrationRuntime } = await import('../src/sync/administrationRuntime.js'); const { administrationStatus } = await import('../src/sync/administration.js');
      const { readAdministration } = await import('../src/sync/administrationStore.js'); const { publicationStore } = await import('../src/sync/publicationStore.js');
      const server = (await chrome.storage.session.get('administrationDeliveryServer')).administrationDeliveryServer || { files: [], uploads: 0 };
      server.clock = (server.clock || Date.now()) + 100000;
      await chrome.storage.session.set({ administrationDeliveryServer: server });
      const runtime = createAdministrationRuntime({ writesReviewed: () => true, now: () => server.clock, getToken: async () => 'fictional-provider-token', assertAccount: async () => {}, fetchImpl: async (url, options) => {
        if (options.method === 'POST') {
          const boundary = options.headers['Content-Type'].split('boundary=')[1]; const parts = options.body.split(`--${boundary}`);
          const metadata = JSON.parse(parts[1].split('\r\n\r\n')[1].trim()); const body = parts[2].split('\r\n\r\n')[1].slice(0, -2);
          const file = { id: `file-${++server.uploads}`, appProperties: metadata.appProperties, body }; server.files.push(file);
          await chrome.storage.session.set({ administrationDeliveryServer: server });
          if (loseReply) throw new Error('Fictional lost response after accepted upload');
          return Response.json({ id: file.id });
        }
        if (url.includes('alt=media')) return new Response(server.files.find(file => file.id === new URL(url).pathname.split('/').pop()).body);
        return Response.json({ files: server.files.map(({ body, ...file }) => file) });
      } });
      const result = await runtime.run(); const status = await administrationStatus();
      const context = await publicationStore.context(); const snapshot = await readAdministration(context.binding.vaultId);
      return { result, pending: status.pending, published: status.publishedCount, uploads: server.uploads, namespaces: server.files.map(file => file.appProperties.kind), retained: snapshot.publication.operations.length, contentEnabled: context.enabled };
    }, loseReply);
  }
  const first = await deliver(true); assert.equal(first.result.pending, true); assert.equal(first.uploads, 1); assert.equal(first.pending[0].outcome, 'unknown');
  await page.reload();
  // The same accepted upload is discovered after reload, not uploaded again.
  const resumed = await deliver(false); assert.equal(resumed.result.published, true); assert.equal(resumed.uploads, 1);
  const enrolled = await deliver(false); assert.equal(enrolled.result.published, true); assert.equal(enrolled.uploads, 2);
  const revoked = await deliver(false); assert.equal(revoked.result.published, true); assert.equal(revoked.uploads, 3); assert.equal(revoked.pending.length, 0); assert.equal(revoked.published, 3);
  assert.equal(revoked.contentEnabled, false); assert.equal(revoked.retained, 1); assert.deepEqual(revoked.namespaces, ['authorization', 'authorization', 'authorization']);
  console.log('Administrative delivery Chromium passed: real WebCrypto/IndexedDB, emulated provider accepted upload/lost response, page-reload exact reuse, verified authority order, self-revocation delivery and suspended retained content.');
} finally { if (context) await context.close(); await rm(profile, { recursive: true, force: true }); }
