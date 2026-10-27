import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import http from 'node:http';
import { mkdtemp, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const output = fileURLToPath(new URL('../docs/screenshots/account-prompts/', import.meta.url));
const profile = await mkdtemp(`${tmpdir()}/securepass-account-ui-`);
const PASS = 'Fictional account UI master 123!'; const LOGIN = 'Fictional login secret 123!'; const errors = [];
const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html');
  if (req.url.startsWith('/accepted')) { res.end('<!doctype html><h1>Fictional account signed in</h1>'); return; }
  const changing = req.url.startsWith('/change'); const register = req.url.startsWith('/register');
  res.end(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font:16px system-ui;background:#f0f4f8;color:#1e293b;padding:32px;margin:0}main{max-width:340px;margin:0 auto}input,button{font:inherit;box-sizing:border-box;display:block;width:100%;padding:12px;margin:12px 0;border:1px solid #cbd5e1;border-radius:8px;background:white}label{font-size:13px}#spacer{height:500px}</style></head><body><main><h1>Fictional ${changing ? 'password change' : register ? 'registration' : 'login'}</h1><form action="/accepted" method="post"><label>Username<input name="username" autocomplete="username"></label>${changing ? '<label>Current password<input type="password" name="old" autocomplete="current-password"></label>' : ''}<label>${changing || register ? 'New password' : 'Password'}<input id="password" name="password" type="password" autocomplete="${changing || register ? 'new-password' : 'current-password'}" minlength="16" maxlength="32"></label>${changing || register ? '<label>Confirm password<input name="confirm" type="password" autocomplete="new-password"></label>' : ''}<button id="submit">${changing || register ? 'Save account' : 'Sign in'}</button></form><div id="spacer"></div></main><script>window.submitted=0;document.querySelector('form').addEventListener('submit',e=>{window.submitted++;if(!location.search.includes('navigate')){e.preventDefault();if(location.search.includes('clear'))document.querySelector('#password').value='';}});</script></body></html>`);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let context;
function nextPage() { const pending = context.waitForEvent('page'); pending.catch(() => {}); return pending; }
async function send(page, type, data = {}) { const response = await page.evaluate(({ type, data }) => chrome.runtime.sendMessage({ type, ...data }), { type, data }); assert.equal(response.ok, true, `${type}: ${response.error}`); return response; }
async function shadow(page, selector, mode = 'click') {
  const session = await context.newCDPSession(page);
  try {
    const { root: document } = await session.send('DOM.getDocument', { depth: -1, pierce: true });
    function find(node) { if (node.attributes?.includes('securepass-extension-root')) return node.shadowRoots?.[0]; for (const child of node.children || []) { const found = find(child); if (found) return found; } }
    const root = find(document); if (!root && mode === 'exists') return false;
    assert.ok(root, 'Closed extension shadow root exists');
    const { nodeId } = await session.send('DOM.querySelector', { nodeId: root.nodeId, selector });
    if (mode === 'exists') return Boolean(nodeId);
    assert.ok(nodeId, selector); const { object } = await session.send('DOM.resolveNode', { nodeId });
    const result = await session.send('Runtime.callFunctionOn', { objectId: object.objectId, functionDeclaration: `function(mode) {
      if(mode==='text')return this.textContent;
      if(mode==='box'){const r=this.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};}
      if(mode==='disabled')return this.disabled;
      if(mode==='opacity')return getComputedStyle(this).opacity;
      if(mode==='focus'){this.focus();return true;}
      this.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,composed:true,pointerType:'mouse'}));
      if(!this.isConnected)throw new Error('Control disappeared during pointer interaction');this.click();return true;
    }`, arguments: [{ value: mode }], returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text); return result.result.value;
  } finally { await session.detach(); }
}
async function waitShadow(page, selector, exists = true) { for (let attempt = 0; attempt < 60; attempt++) { if (await shadow(page, selector, 'exists') === exists) return; await new Promise(resolve => setTimeout(resolve, 50)); } assert.fail(`Shadow selector ${selector} expected ${exists}`); }
async function waitShadowText(page, selector, pattern) { for (let attempt = 0; attempt < 60; attempt++) { if (pattern.test(await shadow(page, selector, 'text'))) return; await new Promise(resolve => setTimeout(resolve, 50)); } assert.fail(`Shadow text ${selector} expected ${pattern}`); }
async function openTools(page) { await waitShadow(page, '.securepass-floating:not([hidden])'); await shadow(page, '.securepass-floating:not([hidden])'); await waitShadow(page, '.securepass-panel'); }
async function openFill(site) { const created = nextPage(); await shadow(site, '[data-action="fill"]'); const page = await created; page.on('pageerror', error => errors.push(error.message)); await page.waitForURL('**/auth/auth.html?**'); await page.locator('#origin').filter({ hasText: origin }).waitFor(); return page; }
async function theme(popup, value) { const current = await send(popup, 'LOAD_SETTINGS'); await send(popup, 'SAVE_SETTINGS', { patch: { theme: value }, expectedRevision: current.revision }); }
async function primaryContrast(page) {
  const ratio = await page.locator('.auth-actions .primary:visible').first().evaluate(node => {
    const style = getComputedStyle(node);
    const luminance = color => color.match(/[\d.]+/g).slice(0, 3).map(Number).map(value => value / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4).reduce((total, value, index) => total + value * [.2126, .7152, .0722][index], 0);
    const one = luminance(style.color); const two = luminance(style.backgroundColor); return (Math.max(one, two) + .05) / (Math.min(one, two) + .05);
  });
  assert.ok(ratio >= 4.5, `Primary action contrast ${ratio}`);
}
async function capture(page, name) {
  if (await page.locator('#securepass-extension-root').count()) {
    for (let attempt = 0; attempt < 20; attempt++) {
      if (!await shadow(page, '.securepass-panel', 'exists') || await shadow(page, '.securepass-panel', 'opacity') === '1') break;
      await new Promise(resolve => setTimeout(resolve, 25));
    }
  }
  await page.screenshot({ path: `${output}/${name}.png`, animations: 'disabled' });
}
try {
  await mkdir(output, { recursive: true });
  context = await chromium.launchPersistentContext(profile, { channel: 'chromium', headless: true, args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`, '--no-sandbox'] });
  let [worker] = context.serviceWorkers(); if (!worker) worker = await context.waitForEvent('serviceworker');
  const popup = await context.newPage(); await popup.setViewportSize({ width: 400, height: 700 }); await popup.goto(`chrome-extension://${worker.url().split('/')[2]}/popup/popup.html`); await popup.locator('#passwordInput').waitFor();
  await send(popup, 'INITIALIZE_VAULT', { passphrase: PASS });
  const saved = (await send(popup, 'STORE_CREDENTIAL', { entry: { site: origin, username: 'student-fictional', password: LOGIN, notes: 'Keep existing notes <> exactly.' } })).entry;
  await send(popup, 'STORE_CREDENTIAL', { entry: { site: 'https://other.example', username: 'not-for-this-origin', password: 'Other fictional login' } });
  await theme(popup, 'light');
  const site = await context.newPage(); site.on('pageerror', error => errors.push(error.message)); await site.setViewportSize({ width: 400, height: 700 }); await site.goto(`${origin}/login`);
  await openTools(site); assert.equal(await shadow(site, '[data-action="copy"]', 'disabled'), true); assert.equal(await shadow(site, '[data-action="save"]', 'disabled'), true);
  const light = await shadow(site, '.securepass-panel', 'box'); assert.ok(light.x >= 0 && light.right <= 400 && light.y >= 0 && light.bottom <= 700);
  assert.equal(await shadow(site, '.securepass-floating svg', 'exists'), true); await capture(site, 'inline-light');
  await shadow(site, '[data-action="fill"]', 'focus'); await site.keyboard.press('Escape'); await waitShadow(site, '.securepass-panel', false);
  await openTools(site); await site.locator('h1').click(); await waitShadow(site, '.securepass-panel', false);
  await openTools(site); let auth = await openFill(site); await auth.locator('#accounts button').waitFor();
  assert.equal(await auth.locator('#accounts button').count(), 1); assert.match(await auth.locator('#status').textContent(), /will not be submitted/);
  await auth.locator('#accounts button').click(); await site.waitForFunction(() => document.querySelector('#password').value.length > 0); assert.equal(await site.locator('#password').inputValue(), LOGIN); assert.equal(await site.evaluate(() => window.submitted), 0);
  // An identical login is suppressed, including the on-page suggestion.
  await site.locator('#submit').click(); await popup.waitForTimeout(350); assert.equal((await send(popup, 'LIST_SAVE_CANDIDATES')).candidates.length, 0); assert.equal(await shadow(site, '.securepass-panel', 'exists'), false);
  await send(popup, 'LOCK_VAULT'); await theme(popup, 'dark');
  await site.evaluate(() => { window.captured=[];document.addEventListener('keydown',event=>window.captured.push(event.key),true); });
  await openTools(site); auth = await openFill(site); await auth.setViewportSize({ width: 320, height: 520 }); await auth.waitForFunction(() => document.body.dataset.theme === 'dark'); await auth.locator('#passphrase').waitFor();
  assert.equal(await auth.locator('#error').isVisible(), false); await primaryContrast(auth); await capture(auth, 'unlock-dark');
  await auth.locator('#passphrase').fill('Wrong fictional password'); await auth.locator('#unlock').click(); await auth.locator('#error').waitFor({ state: 'visible' }); assert.equal(await auth.locator('#passphrase').inputValue(), '');
  await auth.locator('#passphrase').pressSequentially(PASS); await auth.locator('#unlock').click(); await auth.locator('#accounts button').waitFor(); assert.deepEqual(await site.evaluate(() => window.captured), []);
  await auth.locator('#cancel').click(); await popup.waitForTimeout(100); assert.equal(await shadow(site, '[data-action="fill"]', 'disabled'), false); await shadow(site, '.securepass-icon-btn');
  // A submission that clears fields still captures the original value for review.
  await site.goto(`${origin}/login?clear`); await site.locator('[name="username"]').fill('new-fictional-user'); await site.locator('#password').fill(' Exact fictional <> password '); await site.locator('#submit').click();
  await popup.locator('.save-candidate').waitFor(); assert.equal(await site.locator('#password').inputValue(), ''); assert.match(await popup.locator('.save-candidate').textContent(), /No changes saved yet/);
  await theme(popup, 'light'); await popup.waitForFunction(() => document.body.dataset.theme === 'light'); await capture(popup, 'suggestion-light');
  let created = nextPage(); await popup.locator('.save-candidate [data-action="review"]').click(); auth = await created; await auth.locator('#saveReview').waitFor();
  await auth.setViewportSize({ width: 320, height: 560 }); await auth.waitForFunction(() => document.body.dataset.theme === 'light'); assert.equal(await auth.locator('#saveUsername').inputValue(), 'new-fictional-user'); await capture(auth, 'save-light');
  await auth.locator('#cancel').click(); await popup.locator('.save-candidate').waitFor(); assert.equal((await send(popup, 'LIST_CREDENTIALS')).entries.length, 2);
  created = nextPage(); await popup.locator('.save-candidate [data-action="review"]').click(); auth = await created; await auth.locator('#saveReview').waitFor(); await auth.locator('#saveUsername').fill(' corrected fictional user '); await auth.locator('#save').click();
  await popup.waitForFunction(() => !document.querySelector('.save-candidate')); assert.equal((await send(popup, 'LIST_CREDENTIALS')).entries.find(entry => entry.username === ' corrected fictional user ').password, ' Exact fictional <> password ');
  // Explicit update keeps notes and requires another review after a concurrent change.
  await site.goto(`${origin}/login`); await site.locator('[name="username"]').fill('student-fictional'); await site.locator('#password').fill('New fictional password 123!'); await site.locator('#submit').click(); await popup.locator('.save-candidate').waitFor();
  await theme(popup, 'dark'); created = nextPage(); await popup.locator('.save-candidate [data-action="review"]').click(); auth = await created; await auth.locator('#saveReview').waitFor(); await auth.waitForFunction(() => document.body.dataset.theme === 'dark');
  assert.equal(await auth.locator('#save').textContent(), 'Update password'); await auth.setViewportSize({ width: 400, height: 600 }); await primaryContrast(auth); await capture(auth, 'update-dark');
  await send(popup, 'STORE_CREDENTIAL', { entry: { site: origin, username: 'concurrent-fictional', password: 'Concurrent fictional password' } });
  await auth.locator('#save').click(); await auth.locator('#error').waitFor({ state: 'visible' }); assert.match(await auth.locator('#error').textContent(), /vault changed/);
  await auth.locator('#refreshReview').click(); await auth.locator('#save').click(); await popup.waitForFunction(() => !document.querySelector('.save-candidate'));
  const updated = (await send(popup, 'LIST_CREDENTIALS')).entries.find(entry => entry.id === saved.id); assert.equal(updated.password, 'New fictional password 123!'); assert.equal(updated.notes, 'Keep existing notes <> exactly.');
  // On-page decline removes the stored proposal; no password is written to the vault.
  await site.locator('#password').fill('Declined fictional password'); await site.locator('#submit').click(); await waitShadow(site, '.securepass-panel');
  await shadow(site, '.securepass-panel [data-action="close"]'); await popup.waitForFunction(() => !document.querySelector('.save-candidate'));
  assert.equal((await send(popup, 'LIST_CREDENTIALS')).entries.find(entry => entry.id === saved.id).password, 'New fictional password 123!');
  // Full navigation retains a bounded proposal but never fills a new document implicitly.
  await site.goto(`${origin}/login?navigate`); await site.locator('[name="username"]').fill('navigation-fictional'); await site.locator('#password').fill('Navigation fictional password'); await site.locator('#submit').click(); await site.waitForURL('**/accepted');
  await popup.locator('.save-candidate').waitFor(); assert.match(await popup.locator('.save-candidate').textContent(), /navigation-fictional/); await popup.locator('.save-candidate [data-action="dismiss"]').click(); await popup.waitForFunction(() => !document.querySelector('.save-candidate'));
  // Registration generation fills confirmation; change forms preserve the old password.
  await site.goto(`${origin}/register`); await openTools(site); assert.equal(await shadow(site, '[data-action="fill"]', 'exists'), false); await shadow(site, '[data-action="generate"]');
  const generated = await site.locator('#password').inputValue(); assert.ok(generated.length >= 16 && generated.length <= 32); assert.equal(await site.locator('[name="confirm"]').inputValue(), generated); await shadow(site, '[data-action="copy"]'); await waitShadowText(site, '.securepass-status', /Password copied/);
  await site.goto(`${origin}/change`); await site.locator('[name="old"]').fill('Original fictional current'); await waitShadow(site, '.securepass-floating');
  await shadow(site, '.securepass-floating'); assert.equal(await shadow(site, '[data-action="generate"]', 'exists'), false); assert.equal(await shadow(site, '[data-action="save"]', 'exists'), false); await shadow(site, '.securepass-icon-btn');
  await shadow(site, '.securepass-floating:nth-of-type(2)'); await shadow(site, '[data-action="generate"]');
  await site.waitForFunction(() => document.querySelector('#password').value.length >= 16);
  assert.equal(await site.locator('[name="old"]').inputValue(), 'Original fictional current');
  assert.equal(await site.locator('[name="confirm"]').inputValue(), await site.locator('#password').inputValue());
  // A narrow dark login menu follows the field on scrolling and stays in the viewport.
  await site.goto(`${origin}/login`); await site.setViewportSize({ width: 320, height: 520 }); await openTools(site); await capture(site, 'inline-dark');
  const box = await shadow(site, '.securepass-panel', 'box'); assert.ok(box.x >= 0 && box.right <= 320 && box.y >= 0 && box.bottom <= 520);
  await site.evaluate(() => window.scrollBy(0, 40)); const moved = await shadow(site, '.securepass-panel', 'box'); assert.ok(moved.bottom <= 520);
  await site.evaluate(() => document.querySelector('form').remove()); await waitShadow(site, '.securepass-panel', false);
  // Native WebAuthn cancellation in the dedicated confirmation keeps the vault locked.
  const webauthn = await context.newCDPSession(popup);
  await webauthn.send('WebAuthn.enable', { enableUI: false });
  const { authenticatorId } = await webauthn.send('WebAuthn.addVirtualAuthenticator', { options: { protocol: 'ctap2', ctap2Version: 'ctap2_1', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true, hasPrf: true } });
  await popup.bringToFront();
  const enrollment = await popup.evaluate(async pass => { try { const { enrollBiometric } = await import('../src/biometric/client.js'); await enrollBiometric(pass); return { ok: true }; } catch (error) { return { ok: false, error: error.message }; } }, PASS);
  assert.equal(enrollment.ok, true, enrollment.error);
  await webauthn.send('WebAuthn.setAutomaticPresenceSimulation', { authenticatorId, enabled: false });
  await send(popup, 'LOCK_VAULT'); await site.goto(`${origin}/login`); await openTools(site); auth = await openFill(site);
  await auth.setViewportSize({ width: 320, height: 520 }); await auth.locator('#biometric').waitFor();
  const passwordBox = await auth.locator('#passphrase').boundingBox(); const biometricBox = await auth.locator('#biometric').boundingBox();
  assert.equal(passwordBox.height, biometricBox.height); await capture(auth, 'unlock-biometric-dark');
  await auth.locator('#biometric').click(); await auth.waitForFunction(() => document.body.hasAttribute('aria-busy'));
  await auth.locator('#cancel').click(); assert.equal((await send(popup, 'VAULT_STATUS')).status.unlocked, false);
  await webauthn.detach();
  // Fresh-vault setup still requires a separate final save; expiry never saves.
  await send(popup, 'WIPE_DEVICE', { force: true, confirmation: 'ERASE THIS DEVICE' });
  await site.goto(`${origin}/login`); await site.locator('[name="username"]').fill('fresh-fictional-user'); await site.locator('#password').fill('Fresh fictional password'); await openTools(site);
  created = nextPage(); await shadow(site, '[data-action="save"]'); auth = await created; await auth.locator('#unlockForm').waitFor();
  assert.equal(await auth.locator('#heading').textContent(), 'Create your vault');
  await auth.locator('#passphrase').fill(PASS); await auth.locator('#confirm').fill('A different fictional password'); await auth.locator('#unlock').click(); await auth.locator('#error').waitFor({ state: 'visible' });
  assert.equal((await send(popup, 'VAULT_STATUS')).status.initialized, false);
  await auth.locator('#passphrase').fill(PASS); await auth.locator('#confirm').fill(PASS); await auth.locator('#unlock').click(); await auth.locator('#saveReview').waitFor();
  assert.equal((await send(popup, 'LIST_CREDENTIALS')).entries.length, 0); await auth.locator('#cancel').click();
  created = nextPage(); await shadow(site, '[data-action="save"]'); auth = await created; await auth.locator('#saveReview').waitFor();
  await worker.evaluate(async requestId => { const key = `autofill:${requestId}`; const data = await chrome.storage.session.get(key); data[key].expires = Date.now() - 1; await chrome.storage.session.set(data); }, new URL(auth.url()).searchParams.get('requestId'));
  await auth.locator('#save').click(); await auth.waitForFunction(() => document.querySelector('#heading').textContent === 'Request expired'); assert.equal(await auth.locator('#save').isVisible(), false);
  assert.equal((await send(popup, 'LIST_CREDENTIALS')).entries.length, 0); await auth.locator('#cancel').click();
  created = nextPage(); await shadow(site, '[data-action="save"]'); auth = await created; await auth.locator('#saveReview').waitFor(); await auth.locator('#save').click();
  await popup.waitForFunction(async () => (await chrome.runtime.sendMessage({ type: 'LIST_CREDENTIALS' })).entries.length === 1);
  created = nextPage(); await shadow(site, '[data-action="save"]'); auth = await created; await auth.waitForFunction(() => document.querySelector('#heading').textContent === 'Login already saved'); assert.equal(await auth.locator('#save').isVisible(), false); await auth.locator('#cancel').click();
  assert.deepEqual(errors, []);
  console.log('Account prompts passed: exact-origin/no-submit fill, locked retry and isolated master input, live clean suggestions, field clearing/navigation, cancel/dismiss, explicit save/update preserving notes, stale-review rejection, registration generation/confirmation/copy, current-password protection, narrow light/dark layout, Escape/outside/scroll/removal.');
} catch (error) { console.error('Account prompt scenario failed:', error.message); throw error; } finally { if (context) await context.close(); await new Promise(resolve => server.close(resolve)); await rm(profile, { recursive: true, force: true }); }
