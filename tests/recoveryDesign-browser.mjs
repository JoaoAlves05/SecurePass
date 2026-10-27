import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdtemp, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const profile = await mkdtemp(`${tmpdir()}/securepass-recovery-ui-`);
const captures = new URL('../docs/screenshots/recovery-ui/', import.meta.url);
const password = 'Disposable recovery design master 123!';
let context;
const errors = [];
async function send(page, type, data = {}) {
  const response = await page.evaluate(({ type, data }) => chrome.runtime.sendMessage({ type, ...data }), { type, data });
  assert.equal(response.ok, true, response.error); return response;
}
async function fit(page, selector) {
  const bounds = await page.locator(selector).evaluate(element => {
    const box = element.getBoundingClientRect();
    return { x: box.x, y: box.y, right: box.right, bottom: box.bottom, width: innerWidth, height: innerHeight, overflow: element.scrollWidth > element.clientWidth };
  });
  assert.ok(bounds.x >= 0 && bounds.y >= 0 && bounds.right <= bounds.width && bounds.bottom <= bounds.height && !bounds.overflow, JSON.stringify(bounds));
}
async function authRow(page, inputId, buttonId, enabled) {
  await page.evaluate(() => Promise.all(document.getAnimations().filter(animation => animation.effect.getTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => {}))));
  const layout = await page.locator(`#${inputId}`).evaluate((input, buttonId) => {
    const row = input.closest('.auth-method-row').getBoundingClientRect();
    const field = input.closest('.input-wrapper').getBoundingClientRect();
    const button = document.getElementById(buttonId).getBoundingClientRect();
    return { rowWidth: row.width, fieldWidth: field.width, fieldHeight: field.height, gap: button.x - field.right, top: button.y - field.y, width: button.width, height: button.height, inputWidth: input.getBoundingClientRect().width };
  }, buttonId);
  assert.ok(layout.inputWidth >= 100, 'Password remains usable on narrow screens');
  if (enabled) {
    assert.equal(layout.width, 40); assert.equal(layout.height, 40);
    assert.equal(layout.fieldHeight, 40); assert.equal(layout.top, 0); assert.equal(layout.gap, 8);
  } else assert.equal(layout.fieldWidth, layout.rowWidth, 'Password fills the row without biometrics');
}
async function capture(page, name) {
  await page.screenshot({ path: fileURLToPath(new URL(`${name}.png`, captures)), animations: 'disabled' });
}
try {
  await mkdir(captures, { recursive: true });
  context = await chromium.launchPersistentContext(profile, { channel: 'chromium', headless: true, args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`, '--no-sandbox'] });
  context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
  let [worker] = context.serviceWorkers(); if (!worker) worker = await context.waitForEvent('serviceworker');
  const base = `chrome-extension://${worker.url().split('/')[2]}/popup/popup.html`;
  const page = await context.newPage();
  await page.goto(`${base}?manage=1#backupsSection`);
  await send(page, 'INITIALIZE_VAULT', { passphrase: password });
  await send(page, 'STORE_CREDENTIAL', { entry: { id: 'mail', site: 'https://mail.example', username: 'alex@example.com', password: 'Fictional saved password' } });
  await send(page, 'DELETE_CREDENTIAL', { id: 'mail' });
  const checkpoint = (await send(page, 'RECOVERY_STATUS')).snapshots[0];
  await send(page, 'LOCK_VAULT'); await page.reload();
  for (const [mode, width, height, theme] of [['popup', 320, 480, 'light'], ['popup', 400, 600, 'dark'], ['tab', 1280, 800, 'light']]) {
    await page.setViewportSize({ width, height }); await page.emulateMedia({ colorScheme: theme });
    await page.goto(`${base}${mode === 'tab' ? '?manage=1' : ''}#backupsSection`);
    await page.reload();
    if (mode === 'popup') await page.locator('#openSettings').click();
    await page.locator(`[data-checkpoint-id="${checkpoint.id}"] [data-snapshot-action="review"]`).click();
    await page.locator('#unlockSetupModal').waitFor({ state: 'visible' });
    await fit(page, '#unlockSetupModal');
    assert.ok((await page.locator('#unlockSetupModal').boundingBox()).height < 280, 'Unlock stays compact');
    assert.equal(await page.locator('#modalBackdrop').evaluate(node => node.classList.contains('unlock-backdrop')), true);
    await authRow(page, 'unlockSetupPassword', 'unlockWithBiometric', false);
    await capture(page, `unlock-${mode}-${theme}`);
    await page.locator('#unlockSetupPassword').fill('Wrong disposable password');
    await page.locator('#unlockSetupForm [type="submit"]').click();
    await page.locator('#unlockSetupError').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#unlockSetupPassword').inputValue(), '');
    assert.equal(await page.locator('#unlockSetupPassword').getAttribute('aria-invalid'), 'true');
    await fit(page, '#unlockSetupModal');
    assert.ok((await page.locator('#unlockSetupModal').boundingBox()).height < 280, 'Unlock stays compact');
    assert.equal(await page.locator('#modalBackdrop').evaluate(node => node.classList.contains('unlock-backdrop')), true);
    await capture(page, `unlock-error-${mode}-${theme}`);
    await page.keyboard.press('Escape');
    await page.locator('#unlockSetupModal').waitFor({ state: 'hidden' });
    await page.locator(`[data-checkpoint-id="${checkpoint.id}"] [data-snapshot-action="review"]`).click();
    await page.locator('#unlockSetupPassword').fill(password);
    await page.locator('#unlockSetupForm [type="submit"]').click();
    await page.locator('#checkpointReview').waitFor({ state: 'visible' });
    await page.waitForFunction(() => document.querySelector('#checkpointReview').getAttribute('aria-busy') === 'false');
    await capture(page, `review-${mode}-${theme}`);
    await page.locator('[data-recover-entry="mail"]').click();
    await page.locator('#operationDialog').waitFor({ state: 'visible' });
    await fit(page, '#operationDialog'); await capture(page, `recover-${mode}-${theme}`);
    await page.locator('#operationCancel').click();
    await page.locator('#checkpointReviewFullRestore').click();
    await page.locator('#operationDialog').waitFor({ state: 'visible' });
    await fit(page, '#operationDialog'); await capture(page, `restore-${mode}-${theme}`);
    assert.ok(await page.locator('#operationConfirm').isVisible());
    assert.ok((await page.locator('#operationDialog').boundingBox()).height < 390, 'Full restore uses a compact confirmation');
    await page.locator('#operationCancel').click();
    await send(page, 'LOCK_VAULT');
  }
  // A pending WebAuthn prompt can be cancelled without resuming recovery.
  await send(page, 'UNLOCK_VAULT', { passphrase: password });
  const webauthn = await context.newCDPSession(page);
  await webauthn.send('WebAuthn.enable', { enableUI: false });
  const { authenticatorId } = await webauthn.send('WebAuthn.addVirtualAuthenticator', { options: { protocol: 'ctap2', ctap2Version: 'ctap2_1', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true, hasPrf: true } });
  await page.bringToFront();
  await page.evaluate(async password => { const { enrollBiometric } = await import('../src/biometric/client.js'); await enrollBiometric(password); }, password);
  await send(page, 'LOCK_VAULT');
  await page.setViewportSize({ width: 320, height: 480 }); await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto(`${base}?manage=1#backupsSection`); await page.reload();
  await page.locator(`[data-checkpoint-id="${checkpoint.id}"] [data-snapshot-action="review"]`).click();
  await page.locator('#unlockWithBiometric').waitFor({ state: 'visible' });
  await fit(page, '#unlockSetupModal');
  assert.ok((await page.locator('#unlockSetupModal').boundingBox()).height < 280);
  assert.equal(await page.locator('#unlockWithBiometric svg').count(), 1);
  assert.equal(await page.locator('#unlockWithBiometric').getAttribute('aria-label'), 'Use biometric unlock');
  await authRow(page, 'unlockSetupPassword', 'unlockWithBiometric', true);
  assert.equal(await page.locator('.unlock-actions #unlockWithBiometric').count(), 0);
  await capture(page, 'unlock-biometric-dark');
  await webauthn.send('WebAuthn.setAutomaticPresenceSimulation', { authenticatorId, enabled: false });
  await page.locator('#unlockWithBiometric').click();
  await page.waitForFunction(() => document.querySelector('#unlockSetupModal').dataset.busy === 'biometric');
  assert.equal(await page.locator('#unlockWithBiometric svg').count(), 1, 'Fingerprint survives pending state');
  await page.locator('#unlockSetupModal [data-close]').click();
  await page.locator('#unlockSetupModal').waitFor({ state: 'hidden' });
  assert.equal((await send(page, 'VAULT_STATUS')).status.unlocked, false);
  assert.equal(await page.locator('#checkpointReview').isVisible(), false);
  await webauthn.send('WebAuthn.setAutomaticPresenceSimulation', { authenticatorId, enabled: true });
  await page.locator(`[data-checkpoint-id="${checkpoint.id}"] [data-snapshot-action="review"]`).click();
  await page.locator('#unlockWithBiometric').click();
  await page.locator('#checkpointReview').waitFor({ state: 'visible' });
  const vaultPage = await context.newPage(); await vaultPage.setViewportSize({ width: 320, height: 480 });
  await vaultPage.emulateMedia({ colorScheme: 'dark' }); await send(page, 'LOCK_VAULT');
  await vaultPage.goto(base); await vaultPage.locator('[data-view="vault"]').click();
  await vaultPage.locator('#biometricUnlockBtn').waitFor({ state: 'visible' });
  await authRow(vaultPage, 'vaultPassphrase', 'biometricUnlockBtn', true);
  await capture(vaultPage, 'vault-unlock-biometric-dark');
  await vaultPage.close();
  await page.goto(`${base}?manage=1#securitySection`);
  await page.locator('#changeMasterKeyBtn').click();
  await page.locator('#masterUseBiometric').waitFor({ state: 'visible' });
  await authRow(page, 'currentMaster', 'masterUseBiometric', true);
  assert.equal(await page.locator('#masterUseBiometric').innerText(), '');
  await capture(page, 'master-identity-biometric-dark');
  await page.locator('#masterIdentityForm [data-cancel-master]').click();
  await webauthn.detach();
  assert.deepEqual(errors, []);
  console.log('Recovery surfaces passed: inline password errors, retry/cancel, clear secrets, bounded unlock/recovery dialogs and popup/tab light/dark captures.');
} finally { await context?.close(); await rm(profile, { recursive: true, force: true }); }
