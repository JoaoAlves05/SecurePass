import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdtemp, rm, mkdir, readFile } from 'node:fs/promises';
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
  const link = page.locator(`[data-settings-section="${id}"]`);
  if (!await link.isVisible()) await page.getByRole('button', { name: 'Back to settings', exact: true }).click();
  await link.click();
  assert.equal(await link.getAttribute('aria-current'), 'page');
  assert.equal(await page.locator('.settings-content-wrapper > .settings-section:visible').count(), 1);
  assert.equal(await page.locator(`#${id}`).isVisible(), true);
  await page.waitForFunction(() => document.activeElement === document.querySelector('#settingsTitle') || document.activeElement === document.querySelector('.settings-section:not([hidden]) h3'));
}
async function screenshot(page, name) {
  await page.waitForFunction(() => !document.querySelector('#toast').classList.contains('visible'));
  await page.screenshot({ path: fileURLToPath(new URL(`../docs/screenshots/${name}.png`, import.meta.url)), animations: 'disabled' });
}
async function layouts(page) {
  for (const width of [320, 400, 740, 760, 1200]) {
    await page.setViewportSize({ width, height: 650 });
    for (const theme of ['light', 'dark']) {
      await page.emulateMedia({ colorScheme: theme });
      await page.waitForFunction(theme => document.body.dataset.theme === theme, theme);
      for (const id of ['generalSection', 'securitySection', 'backupsSection', 'advancedSection']) {
        await section(page, id);
        const sidebar = page.url().includes('manage=1') && width >= 760;
        assert.equal(await page.locator('#settingsNavigation').isVisible(), sidebar);
        assert.equal(await page.locator('#settingsPanel [role="tab"], #settingsPanel [role="tablist"]').count(), 0);
        assert.equal(await page.getByRole('button', { name: 'Back to settings', exact: true }).isVisible(), !sidebar);
        assert.equal(await page.locator('.app-version').isVisible(), true);
        assert.equal(await page.getByRole('link', { name: 'GitHub', exact: true }).isVisible(), true);
        const footer = await page.locator('.settings-footer').boundingBox();
        assert.ok(footer.y >= 0 && footer.y + footer.height <= 651, `Settings footer remains in view at ${width}px, ${theme}, ${id}`);
        const overflow = await page.evaluate(() => ({ width: innerWidth, body: document.body.scrollWidth, layout: document.querySelector('.settings-content-wrapper').scrollWidth, available: document.querySelector('.settings-content-wrapper').clientWidth }));
        assert.ok(overflow.body <= overflow.width && overflow.layout <= overflow.available, `Horizontal overflow at ${width}px, ${theme}, ${id}: ${JSON.stringify(overflow)}`);
        if (id === 'advancedSection') {
          const cache = await page.locator('#hibpCacheUsage').boundingBox();
          assert.ok(cache.width >= 120 && cache.height < 60, `Cache state remains readable at ${width}px: ${JSON.stringify(cache)}`);
        }
      }
      if (!(page.url().includes('manage=1') && width >= 760)) {
        await page.getByRole('button', { name: 'Back to settings', exact: true }).click();
        assert.equal(await page.getByRole('navigation', { name: 'Settings sections' }).getByRole('link').count(), 4);
        assert.equal(await page.locator('.settings-section:visible').count(), 0);
        assert.equal(await page.locator('.app-version').isVisible(), true);
        assert.equal(await page.locator('#settingsSaveStatus').isVisible(), true);
      }
    }
  }
}
try {
  context = await chromium.launchPersistentContext(profile, { channel: 'chromium', headless: true, args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`, '--no-sandbox'] });
  context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
  const page = await context.newPage();
  let [worker] = context.serviceWorkers(); if (!worker) worker = await context.waitForEvent('serviceworker');
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.goto(`chrome-extension://${worker.url().split('/')[2]}/popup/popup.html?manage=1`);
  await page.waitForFunction(() => document.querySelector('#settingsPanel').getAttribute('aria-hidden') === 'false');
  assert.equal(await page.locator('#generalSection').isVisible(), true);
  assert.equal(await page.getByRole('navigation', { name: 'Settings sections' }).getByRole('link').count(), 4);
  assert.equal(await page.locator('#settingsSectionSelect, #managementOverview, #managementVaultAction').count(), 0);
  assert.equal(await page.locator('.settings-header').evaluate(el => getComputedStyle(el).borderBottomWidth), '0px');
  assert.equal(await page.locator('#settingsPanel').evaluate(el => getComputedStyle(el).getPropertyValue('--primary').trim()), await page.locator('body').evaluate(el => getComputedStyle(el).getPropertyValue('--primary').trim()));
  for (const id of ['generalSection', 'backupsSection', 'advancedSection', 'securitySection']) {
    await section(page, id);
    assert.equal(await page.locator(`#${id} h3`).evaluate(el => el === document.activeElement), true);
  }
  await section(page, 'securitySection');
  assert.ok((await page.locator('#autoLockRange').boundingBox()).height >= 24);
  await page.locator('#autoLockRange').focus(); await page.keyboard.press('ArrowRight');
  await page.waitForFunction(() => document.querySelector('#settingsSaveStatus').textContent === 'Preferences saved');
  assert.equal(await page.locator('#settingsSaveStatus').isVisible(), true);
  assert.equal((await send(page, 'LOAD_SETTINGS')).settings.vaultTimeout, 16);
  assert.equal(await page.locator('#autoLockRange').getAttribute('aria-valuetext'), '16 minutes');
  await section(page, 'generalSection');
  for (const name of ['System', 'Light', 'Dark']) assert.equal(await page.getByRole('radio', { name, exact: true }).count(), 1);
  await page.getByRole('radio', { name: 'Dark', exact: true }).focus(); await page.keyboard.press('Space');
  await page.waitForFunction(() => document.body.dataset.theme === 'dark' && document.querySelector('#settingsSaveStatus').textContent === 'Preferences saved');
  assert.equal((await send(page, 'LOAD_SETTINGS')).settings.theme, 'dark');
  assert.notEqual(await page.locator('.theme-option:has(input:checked) .theme-icon').evaluate(el => getComputedStyle(el).outlineStyle), 'none');
  await page.reload();
  await page.waitForFunction(() => document.querySelector('#settingsPanel').getAttribute('aria-hidden') === 'false');
  assert.equal(await page.locator('#generalSection').isVisible(), true);
  assert.equal(await page.getByRole('radio', { name: 'Dark', exact: true }).isChecked(), true);
  await section(page, 'advancedSection');
  assert.equal(await page.getByRole('button', { name: 'Connect Google Drive' }).count(), 0);
  await section(page, 'backupsSection');
  assert.equal(await page.locator('#exportVault').isDisabled(), true);
  assert.equal(await page.locator('#createLocalVault').isVisible(), true);
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
  await section(page, 'backupsSection');
  await page.locator(`[data-snapshot-id="${selected.id}"][data-snapshot-action="restore"]`).click(); await title(page, 'Restore snapshot locally');
  await fill(page, 'password', 'wrong'); await submit(page); await page.locator('#operationError').waitFor({ state: 'visible' });
  await fill(page, 'password', PASS); await submit(page);
  await page.waitForFunction(() => !document.querySelector('#operationDialog').open && !document.querySelector('#syncToggle').checked && document.querySelector('#syncStatus').textContent.startsWith('Sync is off.'));
  assert.equal((await send(page, 'LOAD_SETTINGS')).settings.useSync, false);
  assert.equal(await page.locator('#retrySync').isDisabled(), true);
  await section(page, 'advancedSection');
  await page.locator('#refreshSync').click();
  await page.locator('#syncVersions:not([disabled])').waitFor();
  await page.waitForFunction(() => !document.querySelector('#managementActivity').textContent);
  await page.locator('#downloadSync').click(); await title(page, 'Restore this version locally');
  await page.locator('#operationCancel').click();
  await page.waitForFunction(() => !document.querySelector('#managementActivity').textContent);
  await page.locator('#mergeSync').click(); await title(page, 'Combine into the local vault');
  await fill(page, 'password', PASS); await submit(page);
  await page.waitForFunction(() => !document.querySelector('#operationDialog').open && !document.querySelector('#managementActivity').textContent);
  await section(page, 'backupsSection');
  await page.locator('#exportVault').click();
  await page.locator('#unlockSetupModal:not(.hidden), #operationDialog[open]').first().waitFor();
  if (await page.locator('#unlockSetupModal').isVisible()) {
    await page.locator('#unlockSetupPassword').fill(PASS);
    await page.locator('#unlockSetupForm [type="submit"]').click();
  }
  await title(page, 'Export encrypted backup');
  await fill(page, 'backupPassword', BACKUP); await fill(page, 'confirmation', BACKUP);
  const [backupDownload] = await Promise.all([page.waitForEvent('download'), submit(page)]);
  const exportedBackup = JSON.parse(await readFile(await backupDownload.path(), 'utf8'));
  const exportedEntries = await page.evaluate(async ({ data, password }) => {
    const { decryptBackupPayload } = await import('../src/backupCrypto.js');
    return (await decryptBackupPayload(data, password)).entries;
  }, { data: exportedBackup, password: BACKUP });
  assert.deepEqual(exportedEntries, (await send(page, 'LIST_CREDENTIALS')).entries);
  await page.waitForFunction(() => !document.querySelector('#managementActivity').textContent);
  const [snapshotDownload] = await Promise.all([page.waitForEvent('download'), page.locator('[data-snapshot-action="export"]').first().click()]);
  const snapshotData = JSON.parse(await readFile(await snapshotDownload.path(), 'utf8'));
  assert.equal(snapshotData.kind, 'securepass-encrypted-recovery');
  assert.equal(snapshotData.snapshots.length, 1);
  await page.waitForFunction(() => !document.querySelector('#managementActivity').textContent);
  await page.evaluate(data => chrome.storage.local.set({ syncRecovery: data.snapshots }), snapshotData);
  const uniqueVersions = new Set((await send(page, 'RECOVERY_ARCHIVE_STATUS')).snapshots.map(item => item.id)).size;
  await page.waitForFunction(count => document.querySelectorAll('[data-snapshot-action="export"]').length === count, uniqueVersions);
  const beforeReset = (await send(page, 'LIST_CREDENTIALS')).entries;
  await section(page, 'generalSection');
  await page.locator('#resetSettings').click(); await title(page, 'Reset preferences');
  await page.locator('#operationCancel').click();
  assert.equal((await send(page, 'LOAD_SETTINGS')).settings.theme, 'dark');
  await page.locator('#resetSettings').click(); await title(page, 'Reset preferences'); await submit(page);
  await page.waitForFunction(() => document.querySelector('#settingsSaveStatus').textContent === 'Preferences saved');
  const reset = (await send(page, 'LOAD_SETTINGS')).settings;
  assert.equal(reset.theme, 'system'); assert.equal(reset.vaultTimeout, 15); assert.equal(reset.useSync, false);
  assert.deepEqual((await send(page, 'LIST_CREDENTIALS')).entries, beforeReset);
  await page.evaluate(() => chrome.storage.local.set({ hibpCache: { ABCDE: { payload: 'F'.repeat(35) + ':0', timestamp: Date.now() } } }));
  await section(page, 'advancedSection');
  await page.locator('#clearHibpCache:not([disabled])').waitFor(); await page.locator('#clearHibpCache').click();
  await page.waitForFunction(() => document.querySelector('#hibpCacheUsage').textContent === 'No cached checks');
  assert.equal((await send(page, 'HIBP_CACHE_STATUS')).entries, 0);
  await mkdir(new URL('../docs/screenshots/', import.meta.url), { recursive: true });
  await section(page, 'securitySection');
  await page.evaluate(() => { document.body.dataset.theme = 'light'; document.querySelector('.settings-scroll-container').scrollTop = 0; });
  await screenshot(page, 'settings-management-light');
  await page.evaluate(() => document.body.dataset.theme = 'dark');
  await screenshot(page, 'settings-management-dark');
  await section(page, 'generalSection');
  await screenshot(page, 'settings-appearance-dark');
  await section(page, 'advancedSection');
  await page.locator('#wipeDevice').click(); await title(page, 'Erase only this device');
  await page.locator('#operationDialog [name="mode"]').selectOption('force'); await fill(page, 'confirmation', 'wrong'); await submit(page);
  await page.locator('#operationError').waitFor({ state: 'visible' }); assert.match(await page.locator('#operationError').textContent(), /Type ERASE THIS DEVICE/);
  await screenshot(page, 'settings-erasure-review');
  await page.locator('#operationCancel').click();
  await page.waitForFunction(() => !document.querySelector('#operationDialog').open && !document.querySelector('#managementActivity').textContent);
  assert.equal((await send(page, 'VAULT_STATUS')).status.initialized, true);
  await page.locator('#clearVault').click(); await title(page, 'Clear current entries');
  await fill(page, 'password', PASS); await submit(page);
  await page.waitForFunction(() => !document.querySelector('#operationDialog').open && !document.querySelector('#managementActivity').textContent);
  assert.equal((await send(page, 'LIST_CREDENTIALS')).entries.length, 0);
  assert.ok((await send(page, 'RECOVERY_STATUS')).snapshots.length > 0);
  await page.locator('#wipeDevice').click(); await title(page, 'Erase only this device');
  await page.locator('#operationDialog [name="mode"]').selectOption('force'); await fill(page, 'confirmation', 'ERASE THIS DEVICE'); await submit(page);
  await page.waitForFunction(() => !document.querySelector('#backupEmptyState').hidden);
  await section(page, 'backupsSection');
  assert.equal((await send(page, 'VAULT_STATUS')).status.initialized, false);
  await page.locator('#createLocalVault').click(); await title(page, 'Create a local vault');
  await fill(page, 'password', PASS); await fill(page, 'confirmation', 'Different fictional master'); await submit(page);
  await page.locator('#operationError').waitFor({ state: 'visible' }); assert.equal((await send(page, 'VAULT_STATUS')).status.initialized, false);
  await fill(page, 'password', PASS); await fill(page, 'confirmation', PASS); await submit(page);
  await page.waitForFunction(() => !document.querySelector('#operationDialog').open && !document.querySelector('#managementActivity').textContent);
  assert.equal((await send(page, 'VAULT_STATUS')).status.unlocked, true);
  await page.evaluate(data => chrome.storage.local.set({ syncRecovery: data.snapshots }), snapshotData);
  await section(page, 'backupsSection');
  await page.locator('.snapshot-item').filter({ hasText: 'Archived Chrome Sync copy' }).getByRole('button', { name: /^Restore/ }).click();
  await title(page, 'Restore on this device'); await fill(page, 'password', PASS); await submit(page);
  await page.waitForFunction(() => !document.querySelector('#operationDialog').open && !document.querySelector('#managementActivity').textContent);
  const restoredArchive = (await send(page, 'LIST_CREDENTIALS')).entries;
  assert.ok(restoredArchive.length > 0);
  await section(page, 'advancedSection');
  await page.locator('#clearSyncArchive').click(); await title(page, 'Clear archived Sync copies');
  await fill(page, 'password', PASS); await submit(page);
  await page.waitForFunction(() => !document.querySelector('#operationDialog').open && !document.querySelector('#managementActivity').textContent && document.querySelector('#clearSyncArchive').hidden);
  assert.deepEqual((await send(page, 'LIST_CREDENTIALS')).entries, restoredArchive);
  await section(page, 'securitySection');
  await send(page, 'LOCK_VAULT');
  assert.equal((await send(page, 'VAULT_STATUS')).status.unlocked, false);
  await page.locator('#changeMasterKeyBtn').click();
  await page.locator('#unlockSetupModal:not(.hidden)').waitFor();
  await page.locator('#unlockSetupPassword').fill(PASS);
  await page.locator('#unlockSetupForm [type="submit"]').click();
  await page.locator('#masterModal:not(.hidden)').waitFor();
  await page.locator('#masterModal').getByRole('button', { name: 'Cancel', exact: true }).click();
  assert.equal(await page.locator('#securitySection').isVisible(), true);
  const rotatedPassword = 'Replacement fictional master 456!';
  const beforeRotation = (await send(page, 'LIST_CREDENTIALS')).entries;
  await page.locator('#changeMasterKeyBtn').click();
  await page.locator('#masterModal:not(.hidden)').waitFor();
  await page.locator('#currentMaster').fill(PASS);
  await page.locator('#nextMaster').fill(rotatedPassword);
  await page.locator('#confirmNextMaster').fill(rotatedPassword);
  await page.locator('#masterForm [type="submit"]').click();
  await page.locator('#masterModal').waitFor({ state: 'hidden' });
  await send(page, 'LOCK_VAULT');
  const rejectedOldPassword = await page.evaluate(passphrase => chrome.runtime.sendMessage({ type: 'UNLOCK_VAULT', passphrase }), PASS);
  assert.equal(rejectedOldPassword.ok, false);
  await send(page, 'UNLOCK_VAULT', { passphrase: rotatedPassword });
  assert.deepEqual((await send(page, 'LIST_CREDENTIALS')).entries, beforeRotation);
  await page.setViewportSize({ width: 400, height: 650 }); await page.goto(page.url().split('?')[0].split('#')[0]); await page.locator('#openSettings').click();
  await page.waitForFunction(() => document.querySelector('#settingsPanel').getAttribute('aria-hidden') === 'false');
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.settings-surface')).opacity === '1');
  assert.equal(await page.locator('#tab-tester').getAttribute('aria-selected'), 'true');
  assert.equal(await page.locator('#settingsNavigation').isVisible(), true);
  assert.equal(await page.locator('.settings-section:visible').count(), 0);
  await screenshot(page, 'settings-popup-home');
  await page.locator('[data-settings-section="generalSection"]').focus();
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('[data-settings-section="securitySection"]').evaluate(el => el === document.activeElement), true);
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.activeElement === document.querySelector('#settingsTitle'));
  assert.equal(await page.locator('#settingsTitle').textContent(), 'Security');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.activeElement === document.querySelector('[data-settings-section="securitySection"]'));
  assert.equal(await page.locator('#settingsNavigation').isVisible(), true);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.activeElement === document.querySelector('#openSettings'));
  await page.locator('#openSettings').click();
  await section(page, 'advancedSection');
  await page.locator('.settings-scroll-container').evaluate(el => { el.scrollTop = 150; });
  const previousScroll = await page.locator('.settings-scroll-container').evaluate(el => el.scrollTop);
  assert.ok(previousScroll > 100);
  await page.getByRole('button', { name: 'Back to settings', exact: true }).click();
  await section(page, 'securitySection');
  await section(page, 'advancedSection');
  assert.equal(await page.locator('.settings-scroll-container').evaluate(el => el.scrollTop), previousScroll);
  await page.goBack();
  await page.waitForFunction(() => document.querySelector('#settingsTitle').textContent === 'Settings');
  assert.equal(await page.locator('#settingsNavigation').isVisible(), true);
  await page.goForward();
  await page.waitForFunction(() => document.querySelector('#settingsTitle').textContent === 'Advanced');
  await page.waitForFunction(top => document.querySelector('.settings-scroll-container').scrollTop === top, previousScroll);
  await section(page, 'securitySection');
  await screenshot(page, 'settings-popup');
  await layouts(page);
  await page.emulateMedia({ colorScheme: 'light' });
  await page.waitForFunction(() => document.body.dataset.theme === 'light');
  await page.setViewportSize({ width: 400, height: 650 });
  await section(page, 'generalSection');
  await screenshot(page, 'settings-popup-appearance');
  await page.getByRole('button', { name: 'Back to settings', exact: true }).click();
  await page.getByRole('button', { name: 'Back to extension', exact: true }).click();
  await page.waitForFunction(() => document.activeElement === document.querySelector('#openSettings'));
  await page.locator('#openSettings').click();
  await section(page, 'backupsSection');
  const [managementTab] = await Promise.all([context.waitForEvent('page'), page.locator('#openManagement').click()]);
  await managementTab.waitForLoadState('domcontentloaded');
  assert.match(managementTab.url(), /\?manage=1#backupsSection$/);
  await managementTab.locator('#backupsSection').waitFor({ state: 'visible' });
  await layouts(managementTab);
  await managementTab.setViewportSize({ width: 1060, height: 900 });
  for (const [legacy, current] of [['preferencesSection', 'generalSection'], ['recoverySection', 'backupsSection'], ['syncSection', 'advancedSection']]) {
    await managementTab.goto(managementTab.url().split('#')[0] + `#${legacy}`);
    await managementTab.locator(`#${current}`).waitFor({ state: 'visible' });
    assert.equal(await managementTab.locator(`[data-settings-section="${current}"]`).getAttribute('aria-current'), 'page');
  }
  await managementTab.setViewportSize({ width: 400, height: 650 });
  await managementTab.getByRole('button', { name: 'Back to settings', exact: true }).click();
  await managementTab.reload();
  await managementTab.locator('#settingsNavigation').waitFor({ state: 'visible' });
  assert.equal(await managementTab.locator('.settings-section:visible').count(), 0);
  await section(managementTab, 'securitySection');
  await managementTab.setViewportSize({ width: 1060, height: 900 });
  await managementTab.locator('#settingsNavigation').waitFor({ state: 'visible' });
  assert.equal(await managementTab.locator('#securitySection').isVisible(), true);
  await managementTab.reload();
  await managementTab.locator('#securitySection').waitFor({ state: 'visible' });
  await managementTab.close();
  assert.deepEqual(errors, []);
  console.log('Hierarchical Settings passed: list/detail/sidebar navigation, keyboard/back/history/scroll/focus, legacy deep links and tab transfer, light/dark layouts at 320–1200px, readable cache state, preferences/reset/cache, encrypted backup and version downloads, import/conflicts, local/archive restores and deduplication, legacy remote merge, archive/entry cleanup, device erasure and master-password rotation.');
} finally { await context?.close(); await rm(profile, { recursive: true, force: true }); }
