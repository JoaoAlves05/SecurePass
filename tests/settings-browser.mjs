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
async function section(page, id) {
  if (await page.locator('.settings-navigation').isVisible()) await page.locator(`.settings-navigation a[href="#${id}"]`).click();
  else await page.getByLabel('Settings section', { exact: true }).selectOption(id);
  assert.equal(await page.locator('.settings-content-wrapper > .settings-section:visible').count(), 1);
  assert.equal(await page.locator(`#${id}`).isVisible(), true);
}
async function screenshot(page, name) {
  await page.waitForFunction(() => !document.querySelector('#toast').classList.contains('visible'));
  await page.screenshot({ path: fileURLToPath(new URL(`../docs/screenshots/${name}.png`, import.meta.url)), animations: 'disabled' });
}
try {
  context = await chromium.launchPersistentContext(profile, { channel: 'chromium', headless: true, args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`, '--no-sandbox'] });
  const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
  let [worker] = context.serviceWorkers(); if (!worker) worker = await context.waitForEvent('serviceworker');
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.goto(`chrome-extension://${worker.url().split('/')[2]}/popup/popup.html?manage=1`);
  await page.waitForFunction(() => document.querySelector('#settingsPanel').getAttribute('aria-hidden') === 'false');
  assert.equal(await page.locator('#securitySection').isVisible(), true);
  for (const id of ['preferencesSection', 'dataSection', 'syncSection', 'recoverySection', 'dangerSection', 'securitySection']) {
    await section(page, id);
    assert.equal(await page.locator(`#${id} h3`).evaluate(el => el === document.activeElement), true);
  }
  assert.ok((await page.locator('#autoLockRange').boundingBox()).height >= 24);
  await page.locator('#autoLockRange').focus(); await page.keyboard.press('ArrowRight');
  await page.waitForFunction(() => document.querySelector('#settingsSaveStatus').textContent === 'Preferences saved');
  assert.equal((await send(page, 'LOAD_SETTINGS')).settings.vaultTimeout, 16);
  assert.equal(await page.locator('#autoLockRange').getAttribute('aria-valuetext'), '16 minutes');
  await section(page, 'preferencesSection');
  for (const name of ['System', 'Light', 'Dark']) assert.equal(await page.getByRole('radio', { name, exact: true }).count(), 1);
  await page.getByRole('radio', { name: 'Dark', exact: true }).focus(); await page.keyboard.press('Space');
  await page.waitForFunction(() => document.body.dataset.theme === 'dark' && document.querySelector('#settingsSaveStatus').textContent === 'Preferences saved');
  assert.equal((await send(page, 'LOAD_SETTINGS')).settings.theme, 'dark');
  assert.notEqual(await page.locator('.theme-option:has(input:checked) .theme-icon').evaluate(el => getComputedStyle(el).outlineStyle), 'none');
  await page.reload();
  await page.waitForFunction(() => document.querySelector('#settingsPanel').getAttribute('aria-hidden') === 'false');
  assert.equal(await page.locator('#preferencesSection').isVisible(), true);
  assert.equal(await page.getByRole('radio', { name: 'Dark', exact: true }).isChecked(), true);
  await section(page, 'syncSection');
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
  await section(page, 'recoverySection');
  await page.locator('#restoreRecovery').click(); await title(page, 'Choose a local snapshot');
  await page.locator('#operationDialog [name="id"]').selectOption(selected.id); await submit(page); await title(page, 'Restore snapshot locally');
  await fill(page, 'password', 'wrong'); await submit(page); await page.locator('#operationError').waitFor({ state: 'visible' });
  await fill(page, 'password', PASS); await submit(page);
  await page.waitForFunction(() => !document.querySelector('#operationDialog').open && !document.querySelector('#syncToggle').checked && document.querySelector('#syncStatus').textContent.startsWith('Sync is off.'));
  assert.equal((await send(page, 'LOAD_SETTINGS')).settings.useSync, false);
  assert.equal(await page.locator('#retrySync').isDisabled(), true);
  await mkdir(new URL('../docs/screenshots/', import.meta.url), { recursive: true });
  await section(page, 'securitySection');
  await page.evaluate(() => { document.body.dataset.theme = 'light'; document.querySelector('.settings-scroll-container').scrollTop = 0; });
  await screenshot(page, 'settings-management-light');
  await page.evaluate(() => document.body.dataset.theme = 'dark');
  await screenshot(page, 'settings-management-dark');
  await section(page, 'preferencesSection');
  await screenshot(page, 'settings-appearance-dark');
  await section(page, 'dangerSection');
  await page.locator('#wipeDevice').click(); await title(page, 'Erase only this device');
  await page.locator('#operationDialog [name="mode"]').selectOption('force'); await fill(page, 'confirmation', 'wrong'); await submit(page);
  await page.locator('#operationError').waitFor({ state: 'visible' }); assert.match(await page.locator('#operationError').textContent(), /Type ERASE THIS DEVICE/);
  await screenshot(page, 'settings-erasure-review');
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
  await section(page, 'securitySection');
  await send(page, 'LOCK_VAULT');
  await page.waitForFunction(() => document.querySelector('#managementVaultAction').textContent === 'Unlock vault');
  await page.locator('#changeMasterKeyBtn').click();
  await page.locator('#unlockSetupModal:not(.hidden)').waitFor();
  await page.locator('#unlockSetupPassword').fill(PASS);
  await page.locator('#unlockSetupForm [type="submit"]').click();
  await page.locator('#masterModal:not(.hidden)').waitFor();
  await page.locator('#masterModal').getByRole('button', { name: 'Cancel', exact: true }).click();
  assert.equal(await page.locator('#securitySection').isVisible(), true);
  await page.setViewportSize({ width: 400, height: 650 }); await page.goto(page.url().split('?')[0].split('#')[0]); await page.locator('#openSettings').click();
  await page.waitForFunction(() => document.querySelector('#settingsPanel').getAttribute('aria-hidden') === 'false');
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.settings-surface')).opacity === '1');
  await screenshot(page, 'settings-popup');
  for (const width of [320, 400, 740, 760, 1200]) {
    await page.setViewportSize({ width, height: 650 });
    for (const id of ['preferencesSection', 'securitySection', 'dataSection', 'syncSection', 'recoverySection', 'dangerSection']) {
      await section(page, id);
      const overflow = await page.evaluate(() => ({ width: innerWidth, body: document.body.scrollWidth, layout: document.querySelector('.settings-layout').scrollWidth, available: document.querySelector('.settings-layout').clientWidth }));
      assert.ok(overflow.body <= overflow.width && overflow.layout <= overflow.available, `Horizontal overflow at ${width}px, ${id}: ${JSON.stringify(overflow)}`);
    }
  }
  await page.setViewportSize({ width: 400, height: 650 });
  await section(page, 'preferencesSection');
  await screenshot(page, 'settings-popup-appearance');
  await page.locator('#closeSettings').click();
  await page.waitForFunction(() => document.activeElement === document.querySelector('#openSettings'));
  await page.locator('#openSettings').click();
  await page.getByLabel('Settings section', { exact: true }).selectOption('dataSection');
  const [managementTab] = await Promise.all([context.waitForEvent('page'), page.locator('#openManagement').click()]);
  await managementTab.waitForLoadState('domcontentloaded');
  assert.match(managementTab.url(), /\?manage=1#dataSection$/);
  assert.equal(await managementTab.locator('#dataSection').isVisible(), true);
  await managementTab.close();
  assert.deepEqual(errors, []);
  console.log('Settings browser journeys passed: navigation/deep links, keyboard theme and preference persistence, 320–1200px layouts, fresh-profile restore, wrong passwords, confirmation mismatch, preview conflicts, stale destination, local recovery/Sync state, erasure guard/cancel and focus restoration.');
} finally { await context?.close(); await rm(profile, { recursive: true, force: true }); }
