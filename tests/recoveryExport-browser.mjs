import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdtemp, rm, mkdir, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const profile = await mkdtemp(`${tmpdir()}/securepass-recovery-export-`);
const captures = `${root}docs/screenshots/recovery-export`;
const PASS = 'Fictional export batch master 123!'; let context;
try {
  context = await chromium.launchPersistentContext(profile, { channel: 'chromium', headless: true, acceptDownloads: true, args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`, '--no-sandbox'] });
  let [worker] = context.serviceWorkers(); if (!worker) worker = await context.waitForEvent('serviceworker');
  const page = await context.newPage(); await page.setViewportSize({ width: 1100, height: 850 }); await page.goto(`chrome-extension://${worker.url().split('/')[2]}/popup/popup.html?manage=1#backupsSection`);
  await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
  const send = (type, data = {}) => page.evaluate(({ type, data }) => chrome.runtime.sendMessage({ type, ...data }), { type, data });
  const title = text => page.waitForFunction(text => document.querySelector('#operationDialog').open && document.querySelector('#operationTitle').textContent === text, text);
  const idle = () => page.waitForFunction(() => !document.querySelector('#managementActivity').textContent);
  await send('INITIALIZE_VAULT', { passphrase: PASS });
  for (const id of ['one', 'two']) assert.equal((await send('STORE_CREDENTIAL', { entry: { id, site: 'https://example.com', password: 'Fictional exported password' } })).ok, true);
  // Keep an archived copy with the same logical ID as a local checkpoint: source must disambiguate.
  await page.evaluate(async () => {
    const { readRecoveryRecords } = await import('../src/utils/storage.js');
    await chrome.storage.local.set({ syncRecovery: [(await readRecoveryRecords())[0], null] });
  });
  const inventory = await send('PREVIEW_RECOVERY_EXPORT'); assert.equal(inventory.ok, true); assert.equal(inventory.snapshots.length, 3); assert.equal(inventory.issues.length, 1);
  const revision = (await send('VAULT_STATUS')).status.revision;
  let downloads = 0; page.on('download', () => downloads++);
  const start = async () => { await page.locator('#exportRecoveryBatch').click(); await title('Export saved versions'); assert.equal(await page.getByRole('list', { name: 'Saved versions that cannot be exported' }).count(), 1); };
  await start(); await page.locator('#operationCancel').click(); await idle(); assert.equal(downloads, 0);
  await start(); await page.locator('#operationConfirm').click(); await title('Saved version 1 of 3');
  await mkdir(captures, { recursive: true });
  for (const mode of ['tab', 'popup']) {
    await page.setViewportSize(mode === 'popup' ? { width: 320, height: 560 } : { width: 1100, height: 850 });
    for (const theme of ['light', 'dark']) {
      await page.emulateMedia({ colorScheme: theme }); await page.waitForFunction(theme => document.body.dataset.theme === theme, theme);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.equal(await page.locator('#operationCancel').isEnabled(), true);
      assert.equal(await page.locator('#operationCancel').evaluate(el => getComputedStyle(el).color), theme === 'light' ? 'rgb(30, 41, 59)' : 'rgb(248, 250, 252)');
      await page.screenshot({ path: `${captures}/${mode}-${theme}.png`, fullPage: true });
    }
  }
  await page.setViewportSize({ width: 1100, height: 850 });
  await page.keyboard.press('Tab'); assert.equal(await page.locator('#operationDialog').evaluate(el => el.contains(document.activeElement)), true);
  for (let index = 0; index < inventory.snapshots.length; index++) {
    await title(`Saved version ${index + 1} of 3`);
    const pending = page.waitForEvent('download'); await page.locator('#operationConfirm').click(); const download = await pending;
    assert.equal(await download.failure(), null);
    const content = await readFile(await download.path());
    assert.ok(content.length <= 16 * 1024 * 1024); assert.match(download.suggestedFilename(), /securepass-snapshot-(local|archive)-\d+-/);
    const selected = inventory.snapshots[index];
    const imported = await page.evaluate(async ({ text, passphrase }) => {
      const { readImportFile } = await import('../src/recoveryArchive.js'); const { decryptRecord } = await import('../src/vault/crypto.js');
      const file = new File([text], 'download.json'); const read = await readImportFile(file);
      const record = await read.readSnapshot(read.snapshots[0].id);
      return { revision: record.revision, entries: (await decryptRecord(record, passphrase)).entries };
    }, { text: content.toString('utf8'), passphrase: PASS });
    assert.equal(imported.revision, selected.id); assert.ok(Array.isArray(imported.entries));
  }
  await idle(); assert.equal(downloads, 3); assert.equal((await send('VAULT_STATUS')).status.revision, revision);
  assert.equal(await page.locator('#exportRecoveryBatch').evaluate(el => document.activeElement === el), true);
  // Mid-batch cancellation preserves requests already emitted and never requests later files.
  await start(); await page.locator('#operationConfirm').click(); await title('Saved version 1 of 3');
  const first = page.waitForEvent('download'); await page.locator('#operationConfirm').click(); await first;
  await title('Saved version 2 of 3'); await page.locator('#operationCancel').click(); await idle(); assert.equal(downloads, 4);
  // Same logical identity but changed bytes cannot be substituted after the inventory.
  await start(); await page.locator('#operationConfirm').click(); await title('Saved version 1 of 3');
  await page.evaluate(async () => {
    const original = chrome.runtime.sendMessage.bind(chrome.runtime);
    globalThis.originalExportMessage = original;
    chrome.runtime.sendMessage = (message, ...args) => {
      if (message.type === 'EXPORT_RECOVERY_SNAPSHOT') message = { ...message, digest: '0'.repeat(64) };
      return original(message, ...args);
    };
  });
  await page.locator('#operationConfirm').click(); await page.locator('#operationError:not([hidden])').waitFor();
  assert.match(await page.locator('#operationError').innerText(), /changed after review/); assert.equal(downloads, 4);
  await page.screenshot({ path: `${captures}/changed-version-error.png`, fullPage: true });
  await page.evaluate(() => { chrome.runtime.sendMessage = globalThis.originalExportMessage; });
  await page.locator('#operationCancel').click(); await idle();
  // A lock during preparation suppresses a late result before it can request a download.
  await start(); await page.locator('#operationConfirm').click(); await title('Saved version 1 of 3');
  await page.evaluate(() => {
    const original = chrome.runtime.sendMessage.bind(chrome.runtime);
    chrome.runtime.sendMessage = (message, ...args) => message.type === 'EXPORT_RECOVERY_SNAPSHOT'
      ? new Promise(resolve => { globalThis.releaseBatchExport = () => original(message, response => { args.at(-1)?.(response); globalThis.batchExportReleased = true; resolve(response); }); }) : original(message, ...args);
  });
  await page.locator('#operationConfirm').click(); await page.waitForFunction(() => typeof releaseBatchExport === 'function');
  await send('LOCK_VAULT'); await page.waitForFunction(() => !document.querySelector('#operationDialog').open);
  await page.evaluate(() => releaseBatchExport()); await page.waitForFunction(() => globalThis.batchExportReleased === true); await idle(); assert.equal(downloads, 4);
  console.log('Recovery export Chromium passed: exact source inventory, three actual downloads independently reimported/decrypted, keyboard/light/dark/popup/tab, cancellation, digest failure and late lock suppression; current revision unchanged.');
} finally { if (context) await context.close(); await rm(profile, { recursive: true, force: true }); }
