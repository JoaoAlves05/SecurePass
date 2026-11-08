import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const profile = await mkdtemp(`${tmpdir()}/securepass-backup-lock-`);
const PASS = 'Fictional destination master 123!'; const BACKUP = 'Fictional portable backup pass 456!'; let context;
try {
  context = await chromium.launchPersistentContext(profile, { channel: 'chromium', headless: true, args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`, '--no-sandbox'] });
  let [worker] = context.serviceWorkers(); if (!worker) worker = await context.waitForEvent('serviceworker');
  const page = await context.newPage(); await page.goto(`chrome-extension://${worker.url().split('/')[2]}/popup/popup.html?manage=1#backupsSection`);
  const send = (type, data = {}) => page.evaluate(({ type, data }) => chrome.runtime.sendMessage({ type, ...data }), { type, data });
  const title = text => page.waitForFunction(text => document.querySelector('#operationDialog').open && document.querySelector('#operationTitle').textContent === text, text);
  const idle = () => page.waitForFunction(() => !document.querySelector('#managementActivity').textContent);
  await send('INITIALIZE_VAULT', { passphrase: PASS });
  await send('STORE_CREDENTIAL', { entry: { id: 'current', site: 'https://example.com', password: 'Fictional current password' } });
  const revision = (await send('VAULT_STATUS')).status.revision;
  const data = await page.evaluate(async passphrase => {
    const { encryptBackupPayload } = await import('../src/backupCrypto.js');
    return encryptBackupPayload({ entries: [{ id: 'incoming', site: 'https://incoming.example', password: 'Fictional incoming password' }] }, passphrase);
  }, BACKUP);
  await page.locator('#importVaultFile').setInputFiles({ name: 'encrypted-backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(data)) });
  await title('Unlock your backup'); await page.locator('input[name="backupPassword"]').fill(BACKUP);
  // Hold a real authenticated preview response, after the background has completed it.
  await page.evaluate(() => {
    const original = chrome.runtime.sendMessage.bind(chrome.runtime);
    globalThis.originalBackupMessage = original;
    chrome.runtime.sendMessage = (message, ...args) => {
      if (message.type !== 'PREVIEW_BACKUP') return original(message, ...args);
      return original(message, response => { globalThis.backupPreviewHeld = true; globalThis.releaseBackupPreview = () => { args.at(-1)?.(response); globalThis.backupPreviewReleased = true; }; });
    };
    globalThis.lateConfirmationOpened = false;
    document.addEventListener('vault-ui-locked', () => { globalThis.backupUiLocked = true; }, { once: true });
    const nativeShow = HTMLDialogElement.prototype.showModal;
    HTMLDialogElement.prototype.showModal = function(...args) {
      if (document.getElementById('operationTitle')?.textContent === 'Confirm import') globalThis.lateConfirmationOpened = true;
      return nativeShow.apply(this, args);
    };
  });
  await page.locator('#operationConfirm').click(); await page.waitForFunction(() => globalThis.backupPreviewHeld === true);
  assert.equal((await send('LOCK_VAULT')).ok, true);
  await page.waitForFunction(() => globalThis.backupUiLocked === true);
  assert.equal(await page.locator('#operationDialog').isVisible(), false);
  assert.equal(await page.locator('#operationFields input').count(), 0);
  await idle(); assert.equal((await send('VAULT_STATUS')).status.revision, revision);
  assert.equal((await send('VAULT_STATUS')).status.unlocked, false);
  assert.equal(await page.evaluate(async () => (await chrome.storage.session.get('backupPreview')).backupPreview), undefined);
  await page.evaluate(() => { chrome.runtime.sendMessage = originalBackupMessage; });
  assert.equal((await send('UNLOCK_VAULT', { passphrase: PASS })).ok, true);
  assert.deepEqual((await send('LIST_CREDENTIALS')).entries.map(entry => entry.id), ['current']);
  // Fresh review/import remains usable after the cancelled old flow.
  await page.locator('#importVaultFile').setInputFiles({ name: 'encrypted-backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(data)) });
  await title('Unlock your backup'); await page.locator('input[name="backupPassword"]').fill(BACKUP);
  // Flush the old real response only after a fresh dialog exists. Its cleanup
  // must not clear the new input, change controls or open the old confirmation.
  await page.evaluate(async () => { releaseBackupPreview(); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
  assert.equal(await page.evaluate(() => globalThis.lateConfirmationOpened), false, 'A locked import must never open a late confirmation');
  await title('Unlock your backup'); assert.equal(await page.locator('input[name="backupPassword"]').inputValue(), BACKUP);
  assert.equal(await page.locator('#operationConfirm').isEnabled(), true);
  await page.locator('#operationConfirm').click(); await title('Confirm import');
  await page.locator('#operationConfirm').click(); await idle();
  assert.deepEqual((await send('LIST_CREDENTIALS')).entries.map(entry => entry.id).sort(), ['current', 'incoming']);
  console.log('Backup lock Chromium passed: held real authenticated preview, background lock, no late confirmation/password fields/session preview/write, fresh unlock and import succeed.');
} finally { if (context) await context.close(); await rm(profile, { recursive: true, force: true }); }
