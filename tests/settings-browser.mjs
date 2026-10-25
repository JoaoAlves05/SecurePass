import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdtemp, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const profile = await mkdtemp(`${tmpdir()}/securepass-settings-`);
const PASS = 'Fictional settings master 123!';
const BACKUP = 'Fictional backup secret 123!';
const errors = []; let context;
async function send(page, type, data = {}) {
  const result = await page.evaluate(({ type, data }) => chrome.runtime.sendMessage({ type, ...data }), { type, data });
  assert.equal(result.ok, true, `${type}: ${result.error}`); return result;
}
async function fill(page, name, value) { await page.locator(`#operationDialog [name="${name}"]`).fill(value); }
async function submit(page) { await page.locator('#operationConfirm').click(); }
async function title(page, text) { await page.waitForFunction(text => document.querySelector('#operationDialog').open && document.querySelector('#operationTitle').textContent === text, text); }
async function upload(page, data) { await page.locator('#importVaultFile').setInputFiles({ name: 'fictional-backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(data)) }); }
try {
  context = await chromium.launchPersistentContext(profile, { channel: 'chromium', headless: true, args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`, '--no-sandbox'] });
  const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
  let [worker] = context.serviceWorkers(); if (!worker) worker = await context.waitForEvent('serviceworker');
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.goto(`chrome-extension://${worker.url().split('/')[2]}/popup/popup.html?manage=1`);
  await page.waitForFunction(() => document.querySelector('#settingsPanel').getAttribute('aria-hidden') === 'false');
  assert.equal(await page.getByRole('button', { name: 'Connect Google Drive' }).isDisabled(), true);
  assert.equal((await send(page, 'VAULT_STATUS')).status.initialized, false);
  await page.keyboard.press('Escape'); assert.equal(await page.locator('#settingsPanel').getAttribute('aria-hidden'), 'false');
  const makeBackup = password => page.evaluate(async ({ password, BACKUP }) => {
    const { encryptBackupPayload } = await import('../src/backupCrypto.js');
    return encryptBackupPayload({ entries: [{ id: 'same', site: 'https://fictional.example', username: 'fictional', password, notes: 'x'.repeat(4096) }] }, BACKUP);
  }, { password, BACKUP });
  const data = await makeBackup('First fictional credential');
  await upload(page, data); await title(page, 'Unlock your backup');
  await fill(page, 'backupPassword', 'wrong'); await submit(page); await page.locator('#operationError').waitFor({ state: 'visible' });
  assert.equal((await send(page, 'VAULT_STATUS')).status.initialized, false);
  assert.equal(await page.locator('#operationDialog [name="backupPassword"]').inputValue(), '');
  await fill(page, 'backupPassword', BACKUP); await submit(page); await title(page, 'Create a vault from backup');
  await fill(page, 'masterPassword', PASS); await fill(page, 'confirmation', 'different'); await submit(page);
  assert.match(await page.locator('#operationError').textContent(), /do not match/);
  assert.equal((await send(page, 'VAULT_STATUS')).status.initialized, false);
  await fill(page, 'masterPassword', PASS); await fill(page, 'confirmation', PASS); await submit(page);
  await page.waitForFunction(() => !document.querySelector('#operationDialog').open && document.querySelector('#managementActivity').textContent === '');
  assert.equal((await send(page, 'LIST_CREDENTIALS')).entries.length, 1);
  const modified = await makeBackup('Second fictional credential');
  await upload(page, modified); await title(page, 'Unlock your backup'); await fill(page, 'backupPassword', BACKUP); await submit(page); await title(page, 'Confirm import');
  assert.match(await page.locator('#operationDescription').textContent(), /1 conflicting/);
  await send(page, 'STORE_CREDENTIAL', { entry: { id: 'intervening', site: 'https://fictional.example', username: 'other', password: 'Other fictional secret' } });
  await submit(page); await page.locator('#operationError').waitFor({ state: 'visible' }); assert.match(await page.locator('#operationError').textContent(), /Vault changed/);
  await page.keyboard.press('Escape'); await page.waitForFunction(() => !document.querySelector('#operationDialog').open && !document.querySelector('#managementActivity').textContent);
  await upload(page, modified); await title(page, 'Unlock your backup'); await fill(page, 'backupPassword', BACKUP); await submit(page); await title(page, 'Confirm import'); await submit(page);
  await page.waitForFunction(() => !document.querySelector('#operationDialog').open && !document.querySelector('#managementActivity').textContent);
  const entries = (await send(page, 'LIST_CREDENTIALS')).entries; assert.equal(entries.length, 3); assert.equal(entries.find(e => e.password === 'Second fictional credential').notes.length, 4096);
  await send(page, 'SET_SYNC_MODE_SAFE', { targetUseSync: true }); await send(page, 'UNLOCK_VAULT', { passphrase: PASS });
  const selected = (await send(page, 'RECOVERY_STATUS')).snapshots[0];
  await page.locator('#restoreRecovery').click(); await title(page, 'Choose a local snapshot');
  await page.locator('#operationDialog [name="id"]').selectOption(selected.id); await submit(page); await title(page, 'Restore snapshot locally');
  await fill(page, 'password', 'wrong'); await submit(page); await page.locator('#operationError').waitFor({ state: 'visible' });
  await fill(page, 'password', PASS); await submit(page);
  await page.waitForFunction(() => !document.querySelector('#operationDialog').open && !document.querySelector('#syncToggle').checked && document.querySelector('#syncStatus').textContent.startsWith('Sync is off.'));
  assert.equal((await send(page, 'LOAD_SETTINGS')).settings.useSync, false);
  assert.equal(await page.locator('#retrySync').isDisabled(), true);
  await mkdir(new URL('../docs/screenshots/', import.meta.url), { recursive: true });
  await page.evaluate(() => { document.body.dataset.theme = 'light'; document.querySelector('.settings-scroll-container').scrollTop = 0; });
  await page.screenshot({ path: fileURLToPath(new URL('../docs/screenshots/settings-management-light.png', import.meta.url)) });
  await page.evaluate(() => document.body.dataset.theme = 'dark');
  await page.screenshot({ path: fileURLToPath(new URL('../docs/screenshots/settings-management-dark.png', import.meta.url)) });
  await page.locator('#wipeDevice').click(); await title(page, 'Erase only this device');
  await page.locator('#operationDialog [name="mode"]').selectOption('force'); await fill(page, 'confirmation', 'wrong'); await submit(page);
  await page.locator('#operationError').waitFor({ state: 'visible' }); assert.match(await page.locator('#operationError').textContent(), /Type ERASE THIS DEVICE/);
  await page.screenshot({ path: fileURLToPath(new URL('../docs/screenshots/settings-erasure-review.png', import.meta.url)) });
  await page.locator('#operationCancel').click();
  await page.waitForFunction(() => !document.querySelector('#operationDialog').open && !document.querySelector('#managementActivity').textContent);
  assert.equal((await send(page, 'VAULT_STATUS')).status.initialized, true);
  await page.locator('#wipeDevice').click(); await title(page, 'Erase only this device');
  await page.locator('#operationDialog [name="mode"]').selectOption('force'); await fill(page, 'confirmation', 'ERASE THIS DEVICE'); await submit(page);
  await page.waitForFunction(() => document.querySelector('#managementVaultAction')?.textContent === 'Create local vault');
  assert.equal((await send(page, 'VAULT_STATUS')).status.initialized, false);
  await page.locator('#managementVaultAction').click(); await title(page, 'Create a local vault');
  await fill(page, 'password', PASS); await fill(page, 'confirmation', 'Different fictional master'); await submit(page);
  await page.locator('#operationError').waitFor({ state: 'visible' }); assert.equal((await send(page, 'VAULT_STATUS')).status.initialized, false);
  await fill(page, 'password', PASS); await fill(page, 'confirmation', PASS); await submit(page);
  await page.waitForFunction(() => !document.querySelector('#operationDialog').open && !document.querySelector('#managementActivity').textContent);
  assert.equal((await send(page, 'VAULT_STATUS')).status.unlocked, true);
  await page.setViewportSize({ width: 400, height: 650 }); await page.goto(page.url().split('?')[0]); await page.locator('#openSettings').click();
  await page.waitForFunction(() => document.querySelector('#settingsPanel').getAttribute('aria-hidden') === 'false');
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.settings-surface')).opacity === '1');
  await page.screenshot({ path: fileURLToPath(new URL('../docs/screenshots/settings-popup.png', import.meta.url)) });
  assert.deepEqual(errors, []);
  console.log('Settings browser journeys passed: fresh-profile restore, wrong passwords, confirmation mismatch, preview conflicts, stale destination, local recovery/Sync state, erasure guard/cancel and popup/management layouts.');
} finally { await context?.close(); await rm(profile, { recursive: true, force: true }); }
