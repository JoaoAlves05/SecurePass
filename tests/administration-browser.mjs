import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const profile = await mkdtemp(`${tmpdir()}/securepass-administration-`); let context;
try {
  context = await chromium.launchPersistentContext(profile, { channel: 'chromium', headless: true, args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`, '--no-sandbox'] });
  let [worker] = context.serviceWorkers(); if (!worker) worker = await context.waitForEvent('serviceworker');
  const page = await context.newPage(); await page.goto(`chrome-extension://${worker.url().split('/')[2]}/popup/popup.html`);
  const first = await page.evaluate(async () => {
    const vault = await import('../src/cryptoVault.js'); const service = await import('../src/sync/administration.js');
    const { readAdministration } = await import('../src/sync/administrationStore.js'); const { readLocalVaultRecordRaw } = await import('../src/utils/storage.js');
    const protocol = await import('../src/sync/signedProtocol.js'); const { publicationStore } = await import('../src/sync/publicationStore.js');
    const passphrase = 'Fictional browser administration master 123!'; await vault.initializeVault(passphrase);
    const record = await readLocalVaultRecordRaw(); const original = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function(value, key) { const result = original.call(this, value, key); if (String(key).startsWith('driveAdministration:')) this.transaction.abort(); return result; };
    let aborted = false;
    try { await service.bootstrapAdministration(passphrase, { operationId: 'first-operation', deviceId: 'first-device' }); }
    catch { aborted = true; }
    finally { IDBObjectStore.prototype.put = original; }
    const rolledBack = (await readAdministration(record.vaultId)).authority === null;
    await publicationStore.configure({ vaultId: record.vaultId, accountId: 'fictional-browser-account', generation: 'fixture-generation' }, true);
    const boot = await service.bootstrapAdministration(passphrase, { operationId: 'first-operation', deviceId: 'first-device' });
    await vault.storeCredential({ id: 'preserved', site: 'https://example.com', password: 'Fictional preserved password' });
    const request = { operationId: 'enroll-second', deviceId: 'second-device', publicKey: (await protocol.generateSigningKey()).publicKey, expectedHead: boot.head };
    const enrolled = await service.enrollDevice(passphrase, request); const snapshot = await readAdministration(record.vaultId);
    await chrome.storage.session.set({ administrationBrowserRequest: request });
    return { aborted, rolledBack, head: enrolled.head, signature: snapshot.administration.operations.at(-1).signed.signature, devices: enrolled.devices.length, vaultId: record.vaultId };
  });
  assert.equal(first.aborted, true); assert.equal(first.rolledBack, true); assert.equal(first.devices, 2);
  await page.reload();
  const second = await page.evaluate(async () => {
    const service = await import('../src/sync/administration.js'); const { readAdministration } = await import('../src/sync/administrationStore.js'); const { publicationStore } = await import('../src/sync/publicationStore.js');
    const request = (await chrome.storage.session.get('administrationBrowserRequest')).administrationBrowserRequest;
    const passphrase = 'Fictional browser administration master 123!';
    const repeated = await service.enrollDevice(passphrase, request); const before = await readAdministration(repeated.vaultId);
    let wrong = false; try { await service.revokeDevice('Wrong fictional browser password', { operationId: 'wrong-password', deviceId: 'first-device', expectedHead: repeated.head }); } catch { wrong = true; }
    const unchanged = JSON.stringify(await readAdministration(repeated.vaultId)) === JSON.stringify(before);
    const revoked = await service.revokeDevice(passphrase, { operationId: 'revoke-first', deviceId: 'first-device', expectedHead: repeated.head });
    const after = await readAdministration(repeated.vaultId);
    return { replayed: repeated.replayed, signature: before.administration.operations.at(-1).signed.signature, wrong, unchanged, devices: revoked.devices.map(device => device.id), context: await publicationStore.context(), retained: after.publication.operations.length };
  });
  assert.equal(second.replayed, true); assert.equal(second.signature, first.signature); assert.equal(second.wrong, true); assert.equal(second.unchanged, true);
  assert.deepEqual(second.devices, ['second-device']); assert.equal(second.context.enabled, false); assert.equal(second.context.writer, null); assert.equal(second.retained, 1);
  console.log('Administrative Chromium passed: real WebCrypto/IndexedDB atomic abort/retry, protected bootstrap, enrollment, page-reload exact signed replay, wrong-master isolation, self-revocation and retained content outbox.');
} finally { if (context) await context.close(); await rm(profile, { recursive: true, force: true }); }
