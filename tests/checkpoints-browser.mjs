import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdtemp, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const profile = await mkdtemp(`${tmpdir()}/securepass-checkpoints-`);
const captures = new URL('../docs/screenshots/checkpoints/', import.meta.url);
const PASS = 'Disposable checkpoint master 123!';
const NEXT = 'Disposable new checkpoint master 456!';
const OLD = 'Disposable historical checkpoint 789!';
const entry = id => ({ id, site: `https://${id}.example`, username: `${id}-account`, password: `Fictional ${id} password`, notes: `Private ${id} note` });
let context; const errors = [];
async function send(page, type, data = {}) {
  const result = await page.evaluate(({ type, data }) => chrome.runtime.sendMessage({ type, ...data }), { type, data });
  assert.equal(result.ok, true, `${type}: ${result.error}`); return result;
}
async function idle(page) { await page.waitForFunction(() => !document.querySelector('#managementActivity').textContent && !document.querySelector('#operationDialog').open); }
async function title(page, text) { await page.waitForFunction(text => document.querySelector('#operationDialog').open && document.querySelector('#operationTitle').textContent === text, text); }
async function capture(page, name) {
  await page.waitForFunction(() => !document.querySelector('#toast').classList.contains('visible'));
  await page.screenshot({ path: fileURLToPath(new URL(`${name}.png`, captures)), animations: 'disabled' });
}
async function fit(page) {
  const dimensions = await page.locator('#operationDialog').evaluate(dialog => {
    const box = dialog.getBoundingClientRect(); const actions = dialog.querySelector('.operation-actions').getBoundingClientRect();
    return { x: box.x, right: box.right, y: box.y, bottom: box.bottom, actions: actions.bottom, width: innerWidth, height: innerHeight, overflow: dialog.scrollWidth > dialog.clientWidth };
  });
  assert.ok(dimensions.x >= 0 && dimensions.right <= dimensions.width && dimensions.y >= 0 && dimensions.bottom <= dimensions.height && dimensions.actions <= dimensions.height && !dimensions.overflow, JSON.stringify(dimensions));
}
try {
  await mkdir(captures, { recursive: true });
  context = await chromium.launchPersistentContext(profile, { channel: 'chromium', headless: true, args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`, '--no-sandbox'] });
  context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
  let [worker] = context.serviceWorkers(); if (!worker) worker = await context.waitForEvent('serviceworker');
  const page = await context.newPage(); await page.setViewportSize({ width: 1200, height: 900 });
  const base = `chrome-extension://${worker.url().split('/')[2]}/popup/popup.html`;
  await page.goto(`${base}?manage=1#backupsSection`);
  await send(page, 'INITIALIZE_VAULT', { passphrase: PASS });
  for (const id of ['mail', 'bank', 'work']) await send(page, 'STORE_CREDENTIAL', { entry: entry(id) });
  await send(page, 'DELETE_CREDENTIAL', { id: 'mail' });
  const point = (await send(page, 'RECOVERY_STATUS')).snapshots[0];
  await send(page, 'UPDATE_CREDENTIAL', { id: 'work', updates: { password: 'New unrelated work password' } });
  await page.reload();
  const card = page.locator(`[data-checkpoint-id="${point.id}"]`);
  await page.waitForFunction(() => document.querySelector('#snapshotList').textContent.includes('deleted entry'));
  assert.equal(await page.locator('.snapshot-item').count(), 3);
  assert.match(await card.textContent(), /1 deleted entry available to recover/);
  assert.match(await card.textContent(), /1 entry with older details/);
  assert.equal((await page.locator('#snapshotList').textContent()).includes('Fictional mail password'), false);
  await capture(page, 'management-light');
  await page.emulateMedia({ colorScheme: 'dark' }); await page.waitForFunction(() => document.body.dataset.theme === 'dark');
  await capture(page, 'management-dark');
  await card.locator('[data-snapshot-action="recover"]').click(); await title(page, 'Recover an entry');
  assert.equal(await page.locator('#operationFields input[type="password"]').count(), 0);
  assert.equal(await page.locator('#operationFields').textContent().then(text => text.includes('Fictional mail password')), false);
  await page.locator('#operation-entryId').selectOption('mail');
  await fit(page); await capture(page, 'recover-entry');
  await page.locator('#operationConfirm').click(); await idle(page);
  let contents = (await send(page, 'LIST_CREDENTIALS')).entries;
  assert.equal(contents.find(item => item.id === 'mail').password, entry('mail').password);
  assert.equal(contents.find(item => item.id === 'work').password, 'New unrelated work password');
  const full = (await send(page, 'RECOVERY_ARCHIVE_STATUS')).snapshots.find(item => item.source === 'Local' && item.newer > 0);
  await page.locator(`[data-checkpoint-id="${full.id}"] [data-snapshot-action="restore"]`).click(); await title(page, 'Restore whole vault');
  assert.match(await page.locator('#operationDescription').textContent(), /master password.*stay the same/);
  assert.match(await page.locator('#operationSummary').textContent(), /To remove/);
  await fit(page); await capture(page, 'restore-whole-vault');
  await page.locator('#operationConfirm').click(); await idle(page);
  await send(page, 'LOCK_VAULT');
  await page.waitForFunction(() => !document.querySelector('#snapshotList').textContent.includes('mail-account'));
  assert.equal(await page.locator('#operationFields').textContent(), '');
  await send(page, 'UNLOCK_VAULT', { passphrase: PASS });
  // Add a legacy-protection fixture and exercise explicit migration before password rotation.
  const olderId = await page.evaluate(async ({ old, entry }) => {
    const crypto = await import('../src/vault/crypto.js'); const storage = await import('../src/utils/storage.js');
    const oldRecord = await crypto.createRecord([entry], old);
    const active = await storage.readLocalVaultRecordRaw(); const history = await storage.readRecoveryRecords();
    await storage.writeLocalVaultRecordRaw(active, active.revision, { historyOnly: true, recoveryRecords: [oldRecord.record, ...history] });
    return oldRecord.record.revision;
  }, { old: OLD, entry: entry('legacy') });
  await page.locator('[data-settings-section="securitySection"]').click();
  await page.locator('#changeMasterKeyBtn').click(); await page.locator('#currentMaster').fill(PASS);
  await page.locator('#masterIdentityForm [type="submit"]').click(); await page.locator('#masterForm').waitFor({ state: 'visible' });
  await page.locator('#nextMaster').fill(NEXT); await page.locator('#confirmNextMaster').fill(NEXT);
  await page.locator('#masterForm [type="submit"]').click(); await page.locator('#masterChangeError').waitFor({ state: 'visible' });
  assert.match(await page.locator('#masterChangeError').textContent(), /older checkpoint/);
  await page.locator('[data-settings-section="backupsSection"]').click();
  const legacy = page.locator(`[data-checkpoint-id="${olderId}"]`);
  await legacy.locator('[data-snapshot-action="unlock"]').click(); await title(page, 'Unlock older checkpoint');
  await page.locator('#operation-password').fill('Wrong older password'); await page.locator('#operationConfirm').click();
  await page.locator('#operationError').waitFor({ state: 'visible' });
  await page.locator('#operation-password').fill(OLD); await page.locator('#operationConfirm').click(); await idle(page);
  await legacy.locator('[data-snapshot-action="recover"]').waitFor({ state: 'visible' });
  const idsBeforeRotation = (await send(page, 'RECOVERY_STATUS')).snapshots.map(item => item.id);
  await page.locator('[data-settings-section="securitySection"]').click();
  await page.locator('#changeMasterKeyBtn').click(); await page.locator('#currentMaster').fill(PASS);
  await page.locator('#masterIdentityForm [type="submit"]').click(); await page.locator('#masterForm').waitFor({ state: 'visible' });
  await page.locator('#nextMaster').fill(NEXT); await page.locator('#confirmNextMaster').fill(NEXT);
  await page.locator('#masterForm [type="submit"]').click(); await page.locator('#masterChangeSuccess').waitFor({ state: 'visible' });
  assert.deepEqual((await send(page, 'RECOVERY_STATUS')).snapshots.map(item => item.id), idsBeforeRotation);
  await send(page, 'LOCK_VAULT'); await send(page, 'UNLOCK_VAULT', { passphrase: NEXT });
  // Verify both popup themes, short layouts and privacy of locked cards.
  await page.setViewportSize({ width: 400, height: 650 }); await page.goto(`${base}#backupsSection`); await page.locator('#openSettings').click();
  for (const theme of ['light', 'dark']) {
    await page.emulateMedia({ colorScheme: theme }); await page.waitForFunction(theme => document.body.dataset.theme === theme, theme);
    await page.waitForFunction(() => document.querySelector('#snapshotList').textContent.includes('entry saved'));
    await page.locator('.snapshot-item').first().scrollIntoViewIfNeeded(); await capture(page, `popup-${theme}`);
    const header = await page.locator('.settings-header').boundingBox();
    assert.ok(header.height >= 44 && header.y >= 0, 'Long checkpoint lists keep the popup heading fully visible.');
    await page.setViewportSize({ width: 320, height: 480 });
    await page.locator('[data-snapshot-action="recover"]').first().click(); await title(page, 'Recover an entry'); await fit(page);
    await page.keyboard.press('Escape'); await idle(page);
    assert.ok(await page.locator('.snapshot-item').evaluateAll(cards => cards.every(card => card.scrollWidth <= card.clientWidth)));
    await page.setViewportSize({ width: 400, height: 650 });
  }
  await send(page, 'LOCK_VAULT');
  await page.waitForFunction(() => !document.querySelector('#snapshotList').textContent.includes('legacy-account'));
  assert.equal((await page.locator('#snapshotList').textContent()).includes('entries saved'), false);
  await send(page, 'UNLOCK_VAULT', { passphrase: NEXT });
  // A lock also clears private preview rows while an operation is finishing.
  await page.evaluate(() => {
    import('./modules/operationDialog.js').then(({ requestOperation }) => requestOperation({
      title: 'Recovery progress fixture', description: 'Disposable in-flight privacy fixture.',
      details: [{ label: 'Account', value: 'Private checkpoint account' }],
      changes: [{ title: 'Private checkpoint site', text: 'Older password' }],
      submit: () => new Promise((_resolve, reject) => { window.failCheckpointFixture = () => reject(new Error('Vault is locked')); })
    }));
  });
  await title(page, 'Recovery progress fixture'); await page.locator('#operationConfirm').click();
  await send(page, 'LOCK_VAULT');
  await page.waitForFunction(() => !document.querySelector('#operationFields').textContent && !document.querySelector('#operationSummary').textContent);
  await page.evaluate(() => { window.failCheckpointFixture(); delete window.failCheckpointFixture; });
  await page.locator('#operationDialog').waitFor({ state: 'hidden' });
  await send(page, 'UNLOCK_VAULT', { passphrase: NEXT });
  // Explicit deletion validates the current password, leaves contents alone and creates no checkpoint.
  await page.reload(); await page.locator('#openSettings').click();
  const beforeClear = (await send(page, 'LIST_CREDENTIALS')).entries;
  await page.locator('#clearCheckpointHistory').click(); await title(page, 'Clear checkpoint history');
  await page.locator('#operation-password').fill('Wrong current password'); await page.locator('#operationConfirm').click();
  await page.locator('#operationError').waitFor({ state: 'visible' });
  await page.locator('#operation-password').fill(NEXT); await page.locator('#operationConfirm').click(); await idle(page);
  assert.equal((await send(page, 'RECOVERY_STATUS')).snapshots.length, 0);
  assert.deepEqual((await send(page, 'LIST_CREDENTIALS')).entries, beforeClear);
  assert.deepEqual(errors, []);
  console.log('Checkpoint browser checks passed: differentiated cards, individual/full recovery, unchanged master password, legacy migration, rotation without a checkpoint, lock privacy, deletion and light/dark popup/tab layouts.');
} finally { await context?.close(); await rm(profile, { recursive: true, force: true }); }
