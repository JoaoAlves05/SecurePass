import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { generateKeyPairSync, createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, writeFile, readFile, appendFile, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const temporary = await mkdtemp(join(tmpdir(), 'securepass-drive-review-')); let context; let output;
const captures = join(root, 'docs/screenshots/drive-review'); const errors = [];
try {
  const { publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 }); const der = publicKey.export({ type: 'spki', format: 'der' });
  const extensionId = createHash('sha256').update(der).digest('hex').slice(0, 32).replace(/[0-9a-f]/g, v => String.fromCharCode(97 + parseInt(v, 16)));
  const config = join(temporary, 'public.json'); await writeFile(config, JSON.stringify({ clientId: '123456-fictional.apps.googleusercontent.com', extensionId, publicKey: der.toString('base64') }));
  const result = await promisify(execFile)(process.execPath, [join(root, 'scripts/configureGoogle.mjs'), '--config', config]); output = result.stdout.match(/^Prepared (.+)$/m)?.[1]; assert.ok(output?.startsWith(join(root, 'dist', 'SecurePass-google-')));
  await writeFile(join(output, 'background/driveReviewFixture.js'), (await readFile(join(root, 'tests/fixtures/driveReviewSetup.js'), 'utf8')).replaceAll('../../src/', '../src/'));
  await appendFile(join(output, 'background/serviceWorker.js'), `\nimport ${JSON.stringify('./driveReviewFixture.js')};\n`);
  context = await chromium.launchPersistentContext(join(temporary, 'profile'), { channel: 'chromium', headless: true, args: [`--disable-extensions-except=${output}`, `--load-extension=${output}`, '--no-sandbox'] });
  const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
  const baseUrl = `chrome-extension://${extensionId}/popup/popup.html`;
  await page.goto(baseUrl); await page.evaluate(() => chrome.runtime.sendMessage({ type: 'LOAD_SETTINGS' }));
  let [worker] = context.serviceWorkers(); if (!worker) worker = await context.waitForEvent('serviceworker');
  const fixture = await worker.evaluate(() => globalThis.installDriveReviewFixture());
  async function open(mode = 'tab') {
    await page.goto(`${baseUrl}${mode === 'tab' ? '?manage=1' : ''}#advancedSection`);
    if (mode === 'popup') await page.locator('#openSettings').click();
    await page.locator('#inspectDriveCopies:visible:enabled').waitFor();
    await page.evaluate(() => { const original = chrome.runtime.sendMessage.bind(chrome.runtime); chrome.runtime.sendMessage = (...args) => { const message = args[0]; if (message.type === 'DRIVE_REVIEW_PREVIEW') globalThis.lastDriveReview = { token: message.token, clientId: message.clientId }; return original(...args); }; });
  }
  async function inspectAndReview() {
    await page.locator('#inspectDriveCopies').click(); await page.locator('#driveCopySelection').waitFor({ state: 'visible' });
    await page.locator('#driveCopies').selectOption(fixture.remote); await page.locator('#compareDriveCopy').click(); await page.locator('#driveReviewForm').waitFor({ state: 'visible' });
    await page.locator('#driveConflicts select:enabled').first().waitFor();
    assert.equal((await page.locator('#driveReviewPanel').innerText()).includes('alpha-not-in-preview'), false);
    assert.equal((await page.locator('#driveReviewPanel').innerText()).includes('beta-not-in-preview'), false);
  }
  await page.setViewportSize({ width: 1200, height: 900 }); await open();
  await worker.evaluate(() => { globalThis.holdDriveList = true; globalThis.heldDriveList = false; });
  const held = worker.evaluate(() => new Promise(resolve => { globalThis.onDriveHold = resolve; if (globalThis.heldDriveList) resolve(); }));
  await page.locator('#inspectDriveCopies').click(); await held; await page.locator('#cancelDriveReview').click();
  await page.locator('#inspectDriveCopies:visible:enabled').waitFor(); assert.equal(await page.locator('#driveReviewPanel').isVisible(), false);
  assert.equal(await worker.evaluate(async () => (await inspectDriveReviewFixture()).revision), fixture.local);
  await inspectAndReview();
  await page.locator('#commitDriveReview').click(); assert.equal(await worker.evaluate(async () => (await inspectDriveReviewFixture()).revision), fixture.local);
  const captured = await page.evaluate(() => lastDriveReview); const other = await context.newPage(); await other.goto(baseUrl);
  const stolen = await other.evaluate(async data => chrome.runtime.sendMessage({ type: 'DRIVE_REVIEW_COMMIT', ...data, decisions: { a: 'both' } }), captured);
  assert.equal(stolen.ok, false); await other.close();
  await mkdir(captures, { recursive: true });
  for (const [mode, width, height] of [['tab', 1200, 900], ['popup', 320, 560]]) {
    if (mode === 'popup') {
      await page.evaluate(async data => chrome.runtime.sendMessage({ type: 'DRIVE_REVIEW_CANCEL', ...data }), await page.evaluate(() => lastDriveReview));
      await page.setViewportSize({ width, height }); await open(mode); await inspectAndReview();
    }
    for (const theme of ['light', 'dark']) {
      await page.emulateMedia({ colorScheme: theme }); await page.waitForFunction(theme => document.body.dataset.theme === theme, theme);
      await page.locator('#driveReviewTitle').focus();
      await page.locator('.settings-scroll-container').evaluate(node => { node.scrollTop += document.querySelector('#driveReviewTitle').getBoundingClientRect().top - node.getBoundingClientRect().top - 12; });
      const size = await page.evaluate(() => ({ width: innerWidth, body: document.body.scrollWidth, page: document.documentElement.scrollWidth, panel: document.querySelector('#driveReviewPanel').scrollWidth, available: document.querySelector('#driveReviewPanel').clientWidth }));
      assert.ok(size.body <= size.width && size.page <= size.width && size.panel <= size.available, JSON.stringify(size));
      await page.screenshot({ path: join(captures, `${mode}-${theme}.png`), fullPage: true });
      await page.locator('#commitDriveReview').scrollIntoViewIfNeeded();
      await page.screenshot({ path: join(captures, `${mode}-actions-${theme}.png`), fullPage: true });
    }
  }
  await page.locator('#driveConflicts select').selectOption('both'); await page.locator('#driveConflicts select').focus(); await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'commitDriveReview');
  await page.locator('#commitDriveReview').click(); await page.locator('#driveReviewPanel').waitFor({ state: 'hidden' });
  const persisted = await worker.evaluate(() => inspectDriveReviewFixture());
  assert.notEqual(persisted.revision, fixture.local); assert.deepEqual({ ...persisted, revision: undefined }, { revision: undefined, entries: 3, tombstones: 1, copies: 1, onlyReads: true, tokensPersisted: false });
  fixture.remote = await worker.evaluate(() => addDriveReviewCopy());
  await page.locator('#inspectDriveCopies:enabled').waitFor(); await inspectAndReview();
  assert.equal(await page.locator('#driveConflicts fieldset').count(), 8);
  await page.locator('#driveConflictSearch').fill('many-16'); assert.equal(await page.locator('#driveConflicts fieldset').count(), 1);
  await page.locator('#driveConflicts select').selectOption('both'); await page.locator('#driveConflictSearch').fill('');
  await page.locator('#driveConflictNext').click(); assert.ok((await page.locator('#driveConflictRange').innerText()).includes('9–16'));
  assert.equal(await page.locator('#driveConflicts select[data-entry-id="many-16"]').inputValue(), 'both');
  await page.locator('#driveBulkChoice').selectOption('both'); await page.locator('#driveBulkApply').click();
  assert.ok((await page.locator('#driveConflictRange').innerText()).includes('18 of 18 choices completed'));
  await page.locator('#driveConflictSearch').scrollIntoViewIfNeeded(); await page.screenshot({ path: join(captures, 'popup-many-dark.png'), fullPage: true });
  await worker.evaluate(() => lockDriveReviewFixture());
  await page.locator('#driveMergeTools').waitFor({ state: 'hidden' }); assert.equal(await page.locator('#driveConflicts').innerText(), '');
  assert.deepEqual(errors, []);
  console.log('Drive review UI passed: real routes/clicks, cancel during fetch, document ownership, required choices, keyboard, 320/1200px light/dark, signed atomic save, lock privacy and no provider writes/tokens persisted. Internal enrollment and emulated Google only.');
} finally { if (context) await context.close(); if (output?.startsWith(join(root, 'dist', 'SecurePass-google-'))) await rm(output, { recursive: true, force: true }); await rm(temporary, { recursive: true, force: true }); }
