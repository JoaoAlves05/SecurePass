import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdtemp, rm, mkdir, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const profile = await mkdtemp(`${tmpdir()}/securepass-backup-dialogs-`);
const captures = new URL('../docs/screenshots/backup-dialogs/', import.meta.url);
const PASS = 'Disposable dialog master 123!';
const BACKUP = 'Disposable backup password 123!';
const errors = []; let context;
async function send(page, type, data = {}) {
  const result = await page.evaluate(({ type, data }) => chrome.runtime.sendMessage({ type, ...data }), { type, data });
  assert.equal(result.ok, true, `${type}: ${result.error}`); return result;
}
async function idle(page) { await page.waitForFunction(() => !document.querySelector('#managementActivity').textContent); }
async function dialog(page, text) { await page.waitForFunction(text => document.querySelector('#operationDialog').open && document.querySelector('#operationTitle').textContent === text, text); }
async function cancel(page) { await page.locator('#operationCancel').click(); await idle(page); }
async function capture(page, name) {
  await page.waitForFunction(() => !document.querySelector('#toast').classList.contains('visible'));
  await page.screenshot({ path: fileURLToPath(new URL(`${name}.png`, captures)), animations: 'disabled' });
}
async function fit(page) {
  const layout = await page.locator('#operationDialog').evaluate(element => {
    const box = element.getBoundingClientRect(); const actions = element.querySelector('.operation-actions').getBoundingClientRect();
    return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, actionsTop: actions.top, actionsBottom: actions.bottom, width: innerWidth, height: innerHeight, overflow: element.scrollWidth > element.clientWidth };
  });
  assert.ok(layout.left >= 0 && layout.right <= layout.width && layout.top >= 0 && layout.bottom <= layout.height, JSON.stringify(layout));
  assert.ok(layout.actionsTop >= layout.top && layout.actionsBottom <= layout.bottom, 'Actions remain inside the visible dialog');
  assert.equal(layout.overflow, false);
  const confirm = await page.locator('#operationConfirm').boundingBox();
  assert.ok(confirm && confirm.y >= 0 && confirm.y + confirm.height <= layout.height, 'Confirmation remains visible');
}

try {
  await mkdir(captures, { recursive: true });
  context = await chromium.launchPersistentContext(profile, { channel: 'chromium', headless: true, args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`, '--no-sandbox'] });
  context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
  let [worker] = context.serviceWorkers(); if (!worker) worker = await context.waitForEvent('serviceworker');
  const page = await context.newPage(); await page.setViewportSize({ width: 400, height: 650 });
  const popup = `chrome-extension://${worker.url().split('/')[2]}/popup/popup.html`;
  await page.goto(popup);
  await send(page, 'INITIALIZE_VAULT', { passphrase: PASS });
  await send(page, 'STORE_CREDENTIAL', { entry: { id: 'first', site: 'https://example.com', username: 'fictional', password: 'Disposable first secret' } });
  await send(page, 'STORE_CREDENTIAL', { entry: { id: 'second', site: 'https://example.org', password: 'Disposable second secret' } });
  await page.reload(); await page.locator('#openSettings').click(); await page.locator('[data-settings-section="backupsSection"]').click();
  await page.waitForFunction(() => document.querySelectorAll('[data-snapshot-action="restore"]').length >= 2);
  const revision = (await send(page, 'VAULT_STATUS')).status.revision;

  // Verify the actual popup route, both themes, narrow/short viewports and the tab layout.
  for (const theme of ['light', 'dark']) {
    await page.emulateMedia({ colorScheme: theme });
    await page.waitForFunction(theme => document.body.dataset.theme === theme, theme);
    for (const [width, height] of [[400, 650], [320, 480]]) {
      await page.setViewportSize({ width, height });
      await page.locator('#exportVault').click(); await dialog(page, 'Export encrypted backup');
      assert.equal(await page.locator('#operation-backupPassword').evaluate(input => input === document.activeElement), true);
      assert.ok(await page.getByLabel('Backup password', { exact: true }).getAttribute('aria-describedby'));
      await fit(page); await capture(page, `export-${theme}-${width}`); await cancel(page);
      await page.locator('[data-snapshot-action="restore"]').first().click(); await dialog(page, 'Restore whole vault');
      assert.equal(await page.locator('#operationSummary dd').count(), 5);
      assert.match(await page.locator('#operationNotice').textContent(), /Sync turns off/);
      await fit(page); await capture(page, `restore-${theme}-${width}`); await page.keyboard.press('Escape'); await idle(page);
    }
  }
  assert.equal((await send(page, 'VAULT_STATUS')).status.revision, revision, 'Review/cancel never changes the vault');
  await page.setViewportSize({ width: 400, height: 650 });
  await page.locator('#exportVault').click(); await dialog(page, 'Export encrypted backup');
  await page.getByLabel('Backup password', { exact: true }).fill(BACKUP);
  const reveal = page.getByRole('button', { name: 'Show backup password', exact: true });
  await reveal.click(); assert.equal(await page.getByLabel('Backup password', { exact: true }).getAttribute('type'), 'text');
  await page.getByLabel('Confirm backup password', { exact: true }).fill('Different disposable password');
  await page.locator('#operationConfirm').click(); await page.locator('#operationError').waitFor({ state: 'visible' });
  assert.match(await page.locator('#operationError').textContent(), /do not match/);
  assert.equal(await page.getByLabel('Backup password', { exact: true }).inputValue(), '');
  assert.equal(await page.getByLabel('Backup password', { exact: true }).getAttribute('type'), 'password');
  assert.equal(await reveal.getAttribute('aria-pressed'), 'false');
  await fit(page); await capture(page, 'export-error-dark');
  await page.getByLabel('Backup password', { exact: true }).fill(BACKUP);
  await page.getByLabel('Confirm backup password', { exact: true }).fill(BACKUP);
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#operationConfirm').click()]);
  const data = JSON.parse(await readFile(await download.path(), 'utf8')); await idle(page);
  const contents = await page.evaluate(async ({ data, password }) => (await (await import('../src/backupCrypto.js')).decryptBackupPayload(data, password)).entries, { data, password: BACKUP });
  assert.equal(contents.length, 2);

  const first = page.locator('[data-snapshot-action="export"]').first(); const selectedId = await first.getAttribute('data-snapshot-id');
  await first.click(); await dialog(page, 'Export saved version');
  assert.match(await page.locator('#operationSummary').textContent(), new RegExp(selectedId.slice(0, 8)));
  assert.equal(await page.locator('#operationFields input').count(), 0);
  await capture(page, 'saved-version-export-dark'); await cancel(page);
  await first.click(); await dialog(page, 'Export saved version');
  const [snapshotDownload] = await Promise.all([page.waitForEvent('download'), page.locator('#operationConfirm').click()]);
  const snapshot = JSON.parse(await readFile(await snapshotDownload.path(), 'utf8')); await idle(page);
  assert.equal(snapshot.snapshots[0].revision, selectedId);

  await page.locator('[data-snapshot-action="restore"]').first().click(); await dialog(page, 'Restore whole vault');
  assert.equal(await page.locator('#operationFields input[type="password"]').count(), 0);
  assert.match(await page.locator('#operationDescription').textContent(), /master password.*stay the same/);
  await page.locator('#operationConfirm').click(); await idle(page);
  assert.equal((await send(page, 'LOAD_SETTINGS')).settings.useSync, false);

  // A deferred action keeps its progress label and disables editable controls.
  await page.evaluate(() => {
    import('./modules/operationDialog.js').then(({ requestOperation }) => requestOperation({ title: 'Preparing backup', description: 'Disposable loading-state fixture.', fields: [{ name: 'password', label: 'Password', type: 'password' }], busyLabel: 'Preparing…', submit: () => new Promise(resolve => { window.finishDialogFixture = resolve; }) }));
  });
  await dialog(page, 'Preparing backup'); await page.locator('#operation-password').fill(PASS); await page.locator('#operationConfirm').click();
  assert.equal(await page.locator('#operationConfirm').textContent(), 'Preparing…');
  assert.equal(await page.locator('#operationCancel').isDisabled(), true);
  assert.equal(await page.locator('#operation-password').isDisabled(), true);
  await page.keyboard.press('Escape'); assert.equal(await page.locator('#operationDialog').isVisible(), true);
  await page.evaluate(() => { window.finishDialogFixture({}); delete window.finishDialogFixture; });
  await page.locator('#operationDialog').waitFor({ state: 'hidden' });

  await page.goto(`${popup}?manage=1#backupsSection`); await page.setViewportSize({ width: 1060, height: 800 });
  await page.locator('#exportVault').click(); await dialog(page, 'Export encrypted backup'); await fit(page); await capture(page, 'export-management-dark'); await cancel(page);
  assert.deepEqual(errors, []);
  console.log('Backup dialogs passed: popup light/dark at 320–400px, short-height actions, keyboard/cancel, password masking/error recovery, real encrypted and selected-version downloads, restore, progress/exclusivity and management tab.');
} finally { await context?.close(); await rm(profile, { recursive: true, force: true }); }
