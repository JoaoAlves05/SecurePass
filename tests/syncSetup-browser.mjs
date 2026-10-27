// Real Chromium profiles with explicitly emulated transport, never a Google account.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdtemp, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const output = fileURLToPath(new URL('../docs/screenshots/sync-setup/', import.meta.url));
const PASS = 'Fictional guided sync master 123!';
const contexts = []; const directories = []; const errors = [];
async function profile() {
  const directory = await mkdtemp(`${tmpdir()}/securepass-sync-setup-`); directories.push(directory);
  const context = await chromium.launchPersistentContext(directory, { channel: 'chromium', headless: true, args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`, '--no-sandbox'] }); contexts.push(context);
  let [worker] = context.serviceWorkers(); if (!worker) worker = await context.waitForEvent('serviceworker');
  const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.goto(`chrome-extension://${worker.url().split('/')[2]}/popup/popup.html?manage=1#advancedSection`);
  await page.locator('#advancedSection:visible').waitFor();
  return { page, context, worker };
}
async function send(page, type, data = {}) {
  const response = await page.evaluate(({ type, data }) => chrome.runtime.sendMessage({ type, ...data }), { type, data });
  assert.equal(response.ok, true, `${type}: ${response.error}`); return response;
}
async function idle(page) { await page.waitForFunction(() => !document.querySelector('#managementActivity').textContent); }
async function title(page, text) { await page.waitForFunction(text => document.querySelector('#operationDialog').open && document.querySelector('#operationTitle').textContent === text, text); }
async function transport(from, to) { const data = await from.evaluate(() => chrome.storage.sync.get(null)); await to.evaluate(data => chrome.storage.sync.set(data), data); }
async function openSetup(page) { await page.locator('#configureSync').click(); await page.locator('#checkSyncSetup').click(); }
async function unlock(page) { await page.locator('#unlockSetupPassword').fill(PASS); await page.locator('#unlockSetupForm [type="submit"]').click(); }
async function shot(page, name) {
  await page.waitForFunction(() => !document.querySelector('#toast').classList.contains('visible'));
  await page.screenshot({ path: `${output}/${name}.png`, animations: 'disabled' });
}
const entry = id => ({ id, site: 'https://fictional.example', username: id, password: `Fictional ${id}`, notes: '' });
try {
  await mkdir(output, { recursive: true });
  const a = await profile(); const b = await profile();
  assert.equal(await a.page.locator('#syncSendingControl').isVisible(), false);
  assert.equal((await a.page.locator('#advancedSection').textContent()).includes('Legacy automatic publication'), false);
  await send(a.page, 'INITIALIZE_VAULT', { passphrase: PASS }); await send(a.page, 'STORE_CREDENTIAL', { entry: entry('shared') });
  const original = await a.page.evaluate(() => chrome.storage.sync.get(null));
  await a.page.locator('#configureSync').click();
  const chromeSettings = a.context.waitForEvent('page'); await a.page.locator('#openChromeSyncSettings').click();
  const settingsPage = await chromeSettings; await settingsPage.waitForURL('chrome://settings/syncSetup'); await settingsPage.close();
  await a.page.locator('#cancelSyncSetup').click();
  assert.deepEqual(await a.page.evaluate(() => chrome.storage.sync.get(null)), original);
  await send(a.page, 'LOCK_VAULT'); await openSetup(a.page); await unlock(a.page);
  await a.page.locator('#enableSyncSending').waitFor({ state: 'visible' }); await idle(a.page);
  assert.deepEqual(await a.page.evaluate(() => chrome.storage.sync.get(null)), original);
  assert.equal((await send(a.page, 'LOAD_SETTINGS')).settings.useSync, false);
  await shot(a.page, 'setup-light');
  await a.page.locator('#enableSyncSending').click(); await title(a.page, 'Enable automatic sending');
  await a.page.locator('#operationCancel').click(); await idle(a.page);
  assert.equal((await send(a.page, 'LOAD_SETTINGS')).settings.useSync, false);
  await a.page.locator('#enableSyncSending').click(); await title(a.page, 'Enable automatic sending'); await a.page.locator('#operationConfirm').click();
  await a.page.waitForFunction(() => document.querySelector('#syncToggle').checked && !document.querySelector('#operationDialog').open); await idle(a.page);
  assert.match(await a.page.locator('#syncStatus').textContent(), /Version saved in Chrome storage.*not yet confirmed/);
  assert.equal((await send(a.page, 'VAULT_STATUS')).status.unlocked, false);
  await transport(a.page, b.page);
  await b.page.evaluate(() => chrome.storage.sync.set({ 'sp2:head:incomplete': { id: 'incomplete', chunks: 1, parents: [] } }));
  await b.page.locator('#refreshSync').click(); await idle(b.page);
  assert.equal(await b.page.locator('#downloadSync').isEnabled(), true); assert.equal(await b.page.locator('#mergeSync').isEnabled(), false);
  await b.page.locator('#downloadSync').click(); await title(b.page, 'Unlock Chrome Sync copy');
  await b.page.locator('#operation-password').fill(PASS); await b.page.locator('#operationConfirm').click(); await title(b.page, 'Restore this version locally');
  assert.equal(await b.page.locator('#operationDialog input[type="password"]').count(), 0);
  assert.match(await b.page.locator('#operationSummary').textContent(), /Selected copy1 entry/);
  await b.page.locator('#operationCancel').click(); await idle(b.page);
  assert.equal((await send(b.page, 'VAULT_STATUS')).status.initialized, false);
  await b.page.locator('#downloadSync').click(); await title(b.page, 'Unlock Chrome Sync copy');
  await b.page.locator('#operation-password').fill(PASS); await b.page.locator('#operationConfirm').click(); await title(b.page, 'Restore this version locally'); await b.page.locator('#operationConfirm').click();
  await b.page.waitForFunction(() => !document.querySelector('#operationDialog').open); await idle(b.page);
  await send(b.page, 'UNLOCK_VAULT', { passphrase: PASS });
  assert.deepEqual((await send(b.page, 'LIST_CREDENTIALS')).entries.map(item => item.id), ['shared']);
  assert.equal((await send(b.page, 'LOAD_SETTINGS')).settings.useSync, false);
  assert.ok(await b.page.evaluate(async () => (await chrome.storage.sync.get(null))['sp2:head:incomplete']));
  await b.page.evaluate(() => chrome.storage.sync.remove('sp2:head:incomplete'));
  await a.page.locator('#showSyncDeviceTest').click(); await idle(a.page);
  await a.page.locator('#startSyncDeviceTest').click(); await idle(a.page);
  const code = (await a.page.locator('#syncDeviceTestStatus').textContent()).match(/Test code ([A-F0-9]{8})/)[1];
  const self = await a.page.evaluate(() => chrome.runtime.sendMessage({ type: 'SYNC_DEVICE_TEST_INSPECT' })); assert.equal(self.ok, false);
  await transport(a.page, b.page);
  await b.page.locator('#showSyncDeviceTest').click(); await idle(b.page);
  await b.page.locator('#receiveSyncDeviceTest').click(); await title(b.page, 'Confirm test reception');
  assert.match(await b.page.locator('#operationDescription').textContent(), new RegExp(code));
  await b.page.locator('#operationCancel').click(); await idle(b.page);
  assert.equal((await send(a.page, 'SYNC_DEVICE_TEST_STATUS')).state, 'waiting');
  await b.page.locator('#receiveSyncDeviceTest').click(); await title(b.page, 'Confirm test reception'); await b.page.locator('#operationConfirm').click(); await idle(b.page);
  await transport(b.page, a.page); await a.page.locator('#checkSyncDeviceTest').click(); await idle(a.page);
  await a.page.waitForFunction(() => document.querySelector('#syncReceiptStatus').textContent.includes('This vault version was received'));
  assert.match(await a.page.locator('#syncDeviceTestStatus').textContent(), /Test exchange confirmed/);
  await a.page.setViewportSize({ width: 320, height: 650 }); await a.page.emulateMedia({ colorScheme: 'dark' });
  await a.page.waitForFunction(() => document.body.dataset.theme === 'dark');
  assert.equal(await a.page.evaluate(() => document.body.scrollWidth <= innerWidth), true);
  await a.page.locator('#syncReceiptStatus').scrollIntoViewIfNeeded(); await shot(a.page, 'receipt-narrow-dark');
  await send(a.page, 'UNLOCK_VAULT', { passphrase: PASS }); await send(a.page, 'STORE_CREDENTIAL', { entry: entry('later') });
  await a.page.waitForFunction(() => document.querySelector('#syncReceiptStatus').textContent.includes('does not confirm delivery of later vault changes'));
  assert.equal((await send(b.page, 'LIST_CREDENTIALS')).entries.length, 1);
  await a.page.locator('label[for="syncToggle"]').click(); await idle(a.page);
  await send(a.page, 'UNLOCK_VAULT', { passphrase: PASS });
  for (let index = 0; index < 13; index++) await send(a.page, 'STORE_CREDENTIAL', { entry: { ...entry(`large-${index}`), notes: 'x'.repeat(3000) } });
  await a.page.setViewportSize({ width: 1200, height: 900 }); await openSetup(a.page); await idle(a.page);
  assert.equal(await a.page.locator('#enableSyncSending').isVisible(), false);
  assert.match(await a.page.locator('#syncSetupSummary').textContent(), /no space/);
  assert.equal((await send(a.page, 'LOAD_SETTINGS')).settings.useSync, false);
  await a.page.locator('#syncSetupPanel').scrollIntoViewIfNeeded(); await shot(a.page, 'capacity-dark');
  assert.deepEqual(errors, []);
  console.log('Guided Chrome Sync passed: browser settings, read-only check/cancel, explicit activation, source comparison, valid restore alongside incomplete data, two-installation receipt, stale-receipt wording, narrow layout and capacity refusal. Transport was emulated.');
} finally { for (const context of contexts) await context.close(); for (const directory of directories) await rm(directory, { recursive: true, force: true }); }
