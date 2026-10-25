import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import http from 'node:http';
import { mkdtemp, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const profile = await mkdtemp(`${tmpdir()}/securepass-e2e-`);
const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.end('<!doctype html><html><body><h1>Fictional login</h1><form><input name="username" autocomplete="username"><input type="password" autocomplete="current-password"><button>Login</button></form><script>window.submitted=0;document.querySelector("form").onsubmit=e=>{e.preventDefault();window.submitted++;};</script></body></html>');
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let context;
const errors = [];
async function send(page, type, data = {}) {
  return page.evaluate(({ type, data }) => chrome.runtime.sendMessage({ type, ...data }), { type, data });
}
async function settingsSection(page, id) {
  const link = page.locator(`[data-settings-section="${id}"]`);
  if (!await link.isVisible()) await page.getByRole('button', { name: 'Back to settings', exact: true }).click();
  await link.click();
  await page.locator(`#${id}`).waitFor({ state: 'visible' });
}
async function shadowClick(page, selector) {
  const session = await context.newCDPSession(page);
  const { root } = await session.send('DOM.getDocument', { depth: -1, pierce: true });
  function find(node) {
    if (node.attributes?.includes('securepass-extension-root')) return node.shadowRoots?.[0];
    for (const child of node.children || []) { const found = find(child); if (found) return found; }
  }
  const shadow = find(root); assert.ok(shadow, 'Content shadow root exists');
  const { nodeId } = await session.send('DOM.querySelector', { nodeId: shadow.nodeId, selector }); assert.ok(nodeId, selector);
  const { object } = await session.send('DOM.resolveNode', { nodeId });
  await session.send('Runtime.callFunctionOn', { objectId: object.objectId, functionDeclaration: `function() {
    this.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, pointerType: 'mouse', isPrimary: true }));
    if (!this.isConnected) throw new Error('Pointer down removed the clicked extension control.');
    this.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, composed: true, pointerType: 'mouse', isPrimary: true }));
    this.click();
  }` });
  await session.detach();
}
try {
  context = await chromium.launchPersistentContext(profile, { channel: 'chromium', headless: true, args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`, '--no-sandbox'], acceptDownloads: true });
  context.on('page', page => { page.on('pageerror', error => errors.push(error.message)); page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); }); });
  let [worker] = context.serviceWorkers(); if (!worker) worker = await context.waitForEvent('serviceworker');
  const id = worker.url().split('/')[2];
  const popup = await context.newPage(); await popup.goto(`chrome-extension://${id}/popup/popup.html`);
  await popup.waitForFunction(() => document.querySelector('#createMaster') && !document.querySelector('#createMaster').classList.contains('hidden'));
  const testerPassword = popup.locator('#passwordInput');
  await testerPassword.fill('Fictional tester password');
  assert.equal(await testerPassword.getAttribute('type'), 'password');
  assert.equal(await popup.locator('#togglePassword svg').isVisible(), true, 'Tester visibility icon is visible.');
  assert.equal(await popup.locator('#copyTestPassword svg').isVisible(), true, 'Tester copy icon is visible.');
  await popup.locator('#togglePassword').click();
  assert.equal(await testerPassword.getAttribute('type'), 'text', 'Show password reveals the tester input.');
  assert.equal(await popup.locator('#togglePassword').getAttribute('aria-pressed'), 'true');
  await popup.locator('#togglePassword').click();
  assert.equal(await testerPassword.getAttribute('type'), 'password', 'Hide password masks the tester input again.');
  assert.equal(await popup.locator('#togglePassword').getAttribute('aria-pressed'), 'false');
  await popup.locator('#copyTestPassword').click();
  await popup.waitForFunction(() => document.querySelector('#toast').textContent === 'Password copied.');
  const passphrase = 'Fictional browser master 123!';
  assert.equal((await send(popup, 'INITIALIZE_VAULT', { passphrase })).created, true);
  const original = { site: origin, username: ' user <> ', password: ' a<>秘密 b ', notes: 'two words\nnext line' };
  const saved = await send(popup, 'STORE_CREDENTIAL', { entry: original }); assert.equal(saved.ok, true, saved.error);
  await popup.reload(); await popup.locator('[data-view="vault"]').click(); await popup.waitForSelector('.vault-item');
  assert.equal((await send(popup, 'LIST_CREDENTIALS')).entries[0].password, original.password);
  const site = await context.newPage(); await site.goto(`${origin}/${'long-login-path-'.repeat(20)}?return=${'x'.repeat(300)}`); await site.waitForSelector('#securepass-extension-root');
  await site.waitForTimeout(400);
  await shadowClick(site, '.securepass-floating');
  const secureWindow = context.waitForEvent('page');
  await shadowClick(site, '.securepass-panel .securepass-btn');
  const auth = await secureWindow; await auth.waitForURL('**/auth/auth.html?**');
  await auth.waitForSelector('#accounts button'); await auth.locator('#accounts button').click();
  await site.waitForFunction(() => document.querySelector('input[type=password]').value.length > 0);
  assert.equal(await site.locator('input[type=password]').inputValue(), original.password);
  assert.equal(await site.locator('input[name=username]').inputValue(), original.username);
  assert.equal(await site.evaluate(() => window.submitted), 0);
  assert.equal((await send(popup, 'LOCK_VAULT')).ok, true);
  await popup.waitForFunction(() => document.querySelector('#vaultUnlocked').classList.contains('hidden'));
  assert.equal((await send(popup, 'LIST_CREDENTIALS')).entries.length, 0);
  // Entering the master password happens in an extension window, outside website listeners.
  await site.locator('input[type=password]').fill('');
  await site.evaluate(() => { window.capturedKeys = []; document.addEventListener('keydown', e => window.capturedKeys.push(e.key), true); });
  await shadowClick(site, '.securepass-floating');
  const lockedWindow = context.waitForEvent('page');
  await shadowClick(site, '.securepass-panel .securepass-btn');
  const lockedAuth = await lockedWindow; await lockedAuth.waitForURL('**/auth/auth.html?**');
  await lockedAuth.waitForSelector('#unlockForm');
  await lockedAuth.locator('#passphrase').pressSequentially(passphrase);
  await lockedAuth.locator('#unlock').click();
  await lockedAuth.waitForSelector('#accounts button'); await lockedAuth.locator('#accounts button').click();
  await site.waitForFunction(() => document.querySelector('input[type=password]').value.length > 0);
  assert.deepEqual(await site.evaluate(() => window.capturedKeys), []);
  // Navigation revokes a previously approved document identity, even on the same origin.
  await shadowClick(site, '.securepass-floating');
  const staleWindow = context.waitForEvent('page');
  await shadowClick(site, '.securepass-panel .securepass-btn');
  const staleAuth = await staleWindow; await staleAuth.waitForURL('**/auth/auth.html?**'); await staleAuth.waitForSelector('#accounts button');
  const staleRequest = new URL(staleAuth.url()).searchParams.get('requestId');
  await site.goto(`${origin}/new-document`);
  const staleFill = await send(staleAuth, 'AUTH_REQUEST_COMPLETE', { requestId: staleRequest, credentialId: saved.entry.id });
  assert.equal(staleFill.ok, false); assert.equal(await site.locator('input[type=password]').inputValue(), '');
  assert.equal((await send(staleAuth, 'LIST_CREDENTIALS')).ok, false);
  await staleAuth.close();
  // A save suggestion survives a successful form navigation but needs trusted confirmation.
  await site.locator('input[name=username]').fill('new-fictional-account');
  await site.locator('input[type=password]').fill(' new fictional <> password ');
  await site.locator('form button').click();
  await popup.waitForFunction(async () => (await chrome.runtime.sendMessage({ type: 'LIST_SAVE_CANDIDATES' })).candidates.length === 1);
  await site.goto(`${origin}/after-successful-submit`);
  const candidates = await send(popup, 'LIST_SAVE_CANDIDATES');
  const saveWindow = context.waitForEvent('page');
  await send(popup, 'REVIEW_SAVE_CANDIDATE', { candidateId: candidates.candidates[0].id });
  const saveAuth = await saveWindow; await saveAuth.waitForURL('**/auth/auth.html?**'); await saveAuth.waitForSelector('#save'); await saveAuth.locator('#save').click();
  await popup.waitForFunction(async () => (await chrome.runtime.sendMessage({ type: 'LIST_CREDENTIALS' })).entries.length === 2);
  // Clipboard writes work through the extension's single offscreen document.
  const copied = await send(popup, 'COPY_PASSWORD', { value: 'Fictional clipboard value' }); assert.equal(copied.ok, true, copied.error);
  const copiedAgain = await send(popup, 'COPY_PASSWORD', { value: 'Second fictional clipboard value' }); assert.equal(copiedAgain.ok, true, copiedAgain.error);
  await popup.bringToFront();
  await worker.evaluate(() => chrome.runtime.sendMessage({ target: 'offscreen', type: 'COPY', value: 'Owned fictional value', timeout: 0.1 }));
  await popup.waitForTimeout(1600); assert.equal(await popup.evaluate(() => navigator.clipboard.readText()), '');
  await worker.evaluate(() => chrome.runtime.sendMessage({ target: 'offscreen', type: 'COPY', value: 'Owned fictional value', timeout: 0.2 }));
  await popup.evaluate(() => navigator.clipboard.writeText('Subsequent user clipboard value'));
  await popup.waitForTimeout(1600); assert.equal(await popup.evaluate(() => navigator.clipboard.readText()), 'Subsequent user clipboard value');
  assert.equal((await send(popup, 'UNLOCK_VAULT', { passphrase })).ok, true);
  const backup = await send(popup, 'EXPORT_VAULT', { backupPassword: 'Fictional backup password 123!' }); assert.equal(backup.ok, true, backup.error);
  const preview = await send(popup, 'IMPORT_VAULT', { data: backup.data, backupPassword: 'Fictional backup password 123!', preview: true }); assert.equal(preview.count, 2);
  await popup.reload(); await popup.locator('[data-view="vault"]').click(); await popup.waitForSelector('.vault-item');
  const savedCard = popup.locator('.vault-item').first();
  assert.equal(await savedCard.locator('.vault-item-header .vault-site').textContent(), original.site);
  assert.equal(await savedCard.locator('.vault-item-header .vault-field-value').count(), 0, 'The username is not placed beside the website.');
  assert.equal(await savedCard.locator('.vault-username-row .vault-field-value').textContent(), original.username);
  assert.equal(await savedCard.locator('.vault-username-row svg').count(), 1, 'The username row has a user icon.');
  assert.equal(await savedCard.locator('.vault-username-row').evaluate(element => element.nextElementSibling?.matches('.password-display')), true, 'The password row follows the username row.');
  assert.equal(await savedCard.locator('.password-display .vault-field-icon svg').count(), 1, 'The password row has an icon.');
  assert.equal(await savedCard.locator('.vault-username-row').evaluate(element => getComputedStyle(element).display), 'flex');
  assert.equal(await savedCard.locator('.password-display').evaluate(element => getComputedStyle(element).display), 'flex');
  await popup.locator('.vault-item').getByRole('button', { name: 'Show password', exact: true }).first().click();
  assert.equal(await popup.locator('.password-value').first().textContent(), original.password);
  await popup.locator('.vault-item').getByRole('button', { name: 'Hide password', exact: true }).first().click();
  await popup.setViewportSize({ width: 400, height: 600 });
  await mkdir(new URL('../docs/screenshots/', import.meta.url), { recursive: true });
  await popup.screenshot({ path: fileURLToPath(new URL('../docs/screenshots/phase1-vault.png', import.meta.url)) });
  await popup.locator('#openSettings').click();
  await popup.waitForFunction(() => getComputedStyle(document.querySelector('.settings-panel .settings-surface')).opacity === '1');
  await settingsSection(popup, 'securitySection');
  const autoLock = popup.locator('#autoLockRange');
  const rangeHeight = await autoLock.evaluate(element => element.getBoundingClientRect().height);
  await autoLock.hover();
  assert.equal(await autoLock.evaluate(element => element.getBoundingClientRect().height), rangeHeight, 'Settings sliders keep a stable height on hover.');
  assert.equal(await autoLock.evaluate(element => getComputedStyle(element).boxShadow), 'none', 'Light theme sliders do not show an outline on hover.');
  assert.equal(await popup.locator('#biometricSetupBtn').getAttribute('aria-expanded'), 'false');
  assert.equal(await popup.locator('#biometricSetupBtn').evaluate(element => element.tagName), 'BUTTON');
  assert.equal(await popup.locator('#biometricSetupBtn button').count(), 0, 'Biometric disclosure does not nest interactive controls.');
  assert.equal(await popup.locator('#disableBiometric').isVisible(), false, 'Revoke action is hidden until biometric unlock is enabled.');
  assert.equal(await popup.locator('#biometricRevokeHelp').isVisible(), false, 'Revoke explanation is hidden until biometric unlock is enabled.');
  await popup.waitForFunction(() => document.querySelector('#recoveryStatus').textContent.includes('saved version'));
  assert.match(await popup.locator('#syncStatus').textContent(), /Sync is off\./);
  assert.equal(await popup.locator('#retrySync').isDisabled(), true, 'Retry stays disabled when no publication is pending.');
  assert.equal(await popup.locator('#compactSync').isDisabled(), true, 'Compaction stays disabled while Sync is off.');
  assert.equal(await popup.locator('#clearSyncArchive').isDisabled(), true, 'Archive clearing stays disabled when the archive is empty.');
  assert.match(await popup.locator('.settings-section').filter({ has: popup.locator('#syncToggle') }).textContent(), /Unlock is requested/);
  await send(popup, 'LOCK_VAULT');
  await settingsSection(popup, 'advancedSection');
  await popup.locator('label[for="syncToggle"]').click();
  await popup.waitForSelector('#unlockSetupModal:not(.hidden)');
  assert.equal(await popup.locator('#unlockWithBiometric').isVisible(), false, 'Biometric unlock is hidden when it is not configured.');
  await popup.locator('#unlockSetupPassword').fill('Incorrect fictional password');
  await popup.locator('#unlockSetupForm [type="submit"]').click();
  await popup.waitForFunction(() => document.querySelector('#toast').classList.contains('error') && !document.querySelector('#unlockSetupModal').classList.contains('hidden'));
  await popup.locator('#unlockSetupPassword').fill(passphrase);
  await popup.locator('#unlockSetupForm [type="submit"]').click();
  await popup.waitForFunction(() => document.querySelector('#unlockSetupModal').classList.contains('hidden') && document.querySelector('#syncToggle').checked && !document.querySelector('#syncToggle').disabled);
  assert.equal((await send(popup, 'VAULT_STATUS')).status.unlocked, false, 'Sync mode change relocks the vault as before.');
  await popup.locator('label[for="syncToggle"]').click();
  await popup.waitForFunction(() => !document.querySelector('#syncToggle').checked && !document.querySelector('#syncToggle').disabled);
  await settingsSection(popup, 'securitySection');
  await popup.locator('#biometricSetupBtn').click();
  assert.equal(await popup.locator('#biometricSetupBtn').getAttribute('aria-expanded'), 'true');
  assert.equal(await popup.locator('#biometricInlineAuth').getAttribute('aria-hidden'), 'false');
  assert.equal(await popup.locator('#biometricInlineAuth').evaluate(element => element.inert), false);
  await popup.locator('#biometricInlineCancel').click();
  assert.equal(await popup.locator('#biometricSetupBtn').getAttribute('aria-expanded'), 'false');
  await popup.waitForFunction(() => getComputedStyle(document.querySelector('#biometricInlineAuth')).maxHeight === '0px');
  await popup.mouse.move(390, 5);
  await popup.screenshot({ path: fileURLToPath(new URL('../docs/screenshots/phase1-settings.png', import.meta.url)) });
  await settingsSection(popup, 'backupsSection');
  await popup.locator('#snapshotList').scrollIntoViewIfNeeded();
  await popup.mouse.move(390, 5);
  await popup.screenshot({ path: fileURLToPath(new URL('../docs/screenshots/phase1-recovery.png', import.meta.url)) });
  // A virtual authenticator exercises the actual browser PRF and assertion serialization path.
  const webauthn = await context.newCDPSession(popup);
  await webauthn.send('WebAuthn.enable', { enableUI: false });
  await webauthn.send('WebAuthn.addVirtualAuthenticator', { options: { protocol: 'ctap2', ctap2Version: 'ctap2_1', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true, hasPrf: true } });
  await popup.bringToFront();
  console.log('Browser PRF: enrolling virtual authenticator.');
  const enrollment = await popup.evaluate(async pass => {
    try { const { enrollBiometric } = await import('./modules/../../src/biometric/client.js'); await enrollBiometric(pass); return { ok: true }; }
    catch (error) { return { ok: false, error: error.message }; }
  }, passphrase);
  assert.equal(enrollment.ok, true, enrollment.error);
  await send(popup, 'LOCK_VAULT');
  await popup.bringToFront();
  console.log('Browser PRF: unlocking with verified assertion.');
  const biometric = await popup.evaluate(async () => {
    try { const { authenticateBiometric } = await import('./modules/../../src/biometric/client.js'); await authenticateBiometric(); return { ok: true }; }
    catch (error) { return { ok: false, error: error.message }; }
  });
  assert.equal(biometric.ok, true, biometric.error);
  assert.equal((await send(popup, 'VAULT_STATUS')).status.unlocked, true);
  await popup.evaluate(() => document.dispatchEvent(new CustomEvent('vault-ui-state')));
  await popup.waitForFunction(() => !document.querySelector('#disableBiometric').hidden);
  await settingsSection(popup, 'securitySection');
  assert.equal(await popup.locator('#disableBiometric').isVisible(), true);
  await send(popup, 'LOCK_VAULT');
  await settingsSection(popup, 'advancedSection');
  await popup.locator('label[for="syncToggle"]').click();
  await popup.waitForSelector('#unlockSetupModal:not(.hidden)');
  assert.equal(await popup.locator('#unlockWithBiometric').isVisible(), true, 'Configured biometric unlock is offered in the Sync authentication dialog.');
  await popup.locator('#unlockWithBiometric').click();
  await popup.waitForFunction(() => document.querySelector('#unlockSetupModal').classList.contains('hidden') && document.querySelector('#syncToggle').checked && !document.querySelector('#syncToggle').disabled);
  assert.equal((await send(popup, 'VAULT_STATUS')).status.unlocked, false, 'Sync mode change relocks the vault after biometric authentication.');
  await popup.locator('label[for="syncToggle"]').click();
  await popup.waitForFunction(() => !document.querySelector('#syncToggle').checked && !document.querySelector('#syncToggle').disabled);
  await settingsSection(popup, 'securitySection');
  await popup.locator('#disableBiometric').click();
  await popup.waitForFunction(() => document.querySelector('#disableBiometric').hidden);
  assert.equal((await send(popup, 'BIOMETRIC_STATUS')).enabled, false);
  await webauthn.detach();
  assert.deepEqual(errors, []);
  console.log('Browser checks passed: startup, origin confirmation, exact autofill, no auto-submit, locking, encrypted backup password reveal, isolated master input, repeated clipboard copying and virtual PRF enrollment/unlock/revocation.');
} finally {
  await context?.close(); await new Promise(resolve => server.close(resolve)); await rm(profile, { recursive: true, force: true });
}
