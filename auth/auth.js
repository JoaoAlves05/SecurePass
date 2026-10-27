import { authenticateBiometric } from '../src/biometric/client.js';
import { icon } from '../content/modules/icons.js';
import { applyTheme, watchSystemTheme } from '../popup/modules/theme.js';
const requestId = new URLSearchParams(location.search).get('requestId');
const $ = id => document.getElementById(id);
let invalidated = false; let initialized; let controller; let details; let busy = false; let disposed = false; let completed = false; let expiry; let theme = 'system';
async function send(type, data = {}) {
  const response = await chrome.runtime.sendMessage({ type, ...data });
  if (!response?.ok) throw new Error(response?.error || 'SecurePass is unavailable. Try again.'); return response;
}
function clearSecrets() { $('passphrase').value = $('confirm').value = ''; $('passphrase').type = 'password'; $('revealPassword').setAttribute('aria-label', 'Show master password'); $('revealPassword').setAttribute('aria-pressed', 'false'); }
function showError(error) {
  if (disposed) return;
  if (/Request expired|does not belong|original document is no longer active/.test(error.message || '')) { expired(); return; }
  $('error').textContent = error.name === 'NotAllowedError' || error.name === 'AbortError' ? 'Authentication cancelled. Try again or enter your master password.' : error.message;
  $('error').hidden = false;
  $('refreshReview').hidden = !details || /expired|no longer active|does not belong/.test(error.message);
}
function expired() {
  invalidated = true;
  controller?.abort(); clearSecrets(); $('accounts').replaceChildren(); $('saveReview').hidden = $('save').hidden = $('unlockForm').hidden = $('unlock').hidden = $('biometric').hidden = true;
  $('status').textContent = 'This request has expired. Return to the website and open SecurePass again.'; $('heading').textContent = 'Request expired';
  $('refreshReview').hidden = true;
}
async function run(task) {
  if (busy || disposed) return;
  busy = true; document.body.setAttribute('aria-busy', 'true'); $('error').hidden = true; $('refreshReview').hidden = true;
  const controls = [...document.querySelectorAll('button:not(#cancel), input, select')]; controls.forEach(control => { control.disabled = true; });
  try { await task(); } catch (error) { showError(error); }
  finally { clearSecrets(); busy = false; document.body.removeAttribute('aria-busy'); if (!disposed) controls.forEach(control => { control.disabled = false; }); if (details?.kind === 'save' && !$('save').hidden) saveTargetChanged(); }
}
function saveTargetChanged() {
  const create = $('saveTarget').value === 'new';
  $('save').textContent = create ? 'Save login' : 'Update password';
  $('saveActionHelp').textContent = create ? 'Save this as a separate login in your vault. The captured password stays hidden.' : 'Replace this login’s password and keep its notes. A checkpoint preserves the previous vault contents.';
  $('save').disabled = !$('saveTarget').value;
}
async function refresh() {
  if (invalidated || disposed) return;
  const state = (await send('VAULT_STATUS')).status;
  const next = await send('AUTH_REQUEST_DETAILS', { requestId }); if (disposed || invalidated) return;
  details = next; initialized = state.initialized; $('origin').textContent = details.origin;
  clearTimeout(expiry); expiry = setTimeout(expired, Math.max(0, details.expires - Date.now()));
  $('unlockForm').hidden = $('unlock').hidden = state.unlocked;
  $('unlock').textContent = initialized ? 'Unlock' : 'Create vault';
  $('confirmGroup').hidden = initialized; $('confirm').required = !initialized;
  $('passphrase').autocomplete = initialized ? 'current-password' : 'new-password';
  const bio = await send('BIOMETRIC_STATUS'); if (disposed || invalidated) return;
  $('biometric').hidden = state.unlocked || !bio.enabled;
  $('accounts').replaceChildren(); $('saveReview').hidden = $('save').hidden = true;
  $('cancel').textContent = 'Cancel';
  if (!state.unlocked) {
    $('heading').textContent = initialized ? details.kind === 'save' ? 'Unlock to review login' : 'Unlock to fill login' : 'Create your vault';
    $('status').textContent = initialized ? 'Enter your master password in this SecurePass window to continue.' : details.kind === 'save' ? 'Choose a master password of at least 16 characters. Your login is saved only after a separate confirmation.' : 'Choose a master password of at least 16 characters to create a local vault. You can then add your logins in SecurePass.';
    return;
  }
  if (details.kind === 'save') {
    if (details.saveMode === 'unchanged') {
      $('heading').textContent = 'Login already saved'; $('status').textContent = 'This username and password already match a login in your vault. No changes are needed.'; $('cancel').textContent = 'Done'; return;
    }
    $('heading').textContent = details.saveMode === 'update' ? 'Review password update' : 'Save this login?';
    $('status').textContent = 'Check the website and username before confirming.';
    $('saveReview').hidden = $('save').hidden = false; $('saveUsername').value = details.candidate.username;
    const target = $('saveTarget'); target.replaceChildren();
    if (details.matchingIds.length > 1) { const prompt = document.createElement('option'); prompt.value = ''; prompt.textContent = 'Choose which login to update'; prompt.disabled = true; target.append(prompt); }
    const fresh = document.createElement('option'); fresh.value = 'new'; fresh.textContent = 'Save as a new login'; target.append(fresh);
    for (const entry of details.entries) {
      const option = document.createElement('option'); option.value = entry.id; option.textContent = `${entry.username || 'No username'}${entry.updatedAt ? ` · ${new Date(entry.updatedAt).toLocaleString()}` : ''}${details.matchingIds.length > 1 ? ` · ${entry.id.slice(0, 8)}` : ''}`; target.append(option);
    }
    target.value = details.matchingIds.length === 1 ? details.matchingIds[0] : details.matchingIds.length > 1 ? '' : 'new';
    $('targetGroup').hidden = !details.entries.length; saveTargetChanged();
  } else {
    $('heading').textContent = 'Choose a login';
    $('status').textContent = details.entries.length ? 'Fill one saved login on this exact website. The form will not be submitted.' : 'No logins saved for this website. Save one from the website’s key button or add it in the extension.';
    for (const entry of details.entries) {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'auth-account';
      const text = document.createElement('span'); text.textContent = entry.username || 'No username'; button.append(icon('user'), text, icon('arrow'));
      button.addEventListener('click', () => run(() => complete({ credentialId: entry.id })));
      $('accounts').append(button);
    }
  }
}
async function complete(payload = {}) {
  $('cancel').disabled = true;
  $('status').textContent = details.kind === 'save' ? 'Saving login…' : 'Filling login…';
  try {
    await send('AUTH_REQUEST_COMPLETE', { requestId, ...payload }); completed = true;
    $('status').textContent = details.kind === 'save' ? 'Login saved.' : 'Login filled.'; window.close();
  } catch (error) { $('cancel').disabled = false; throw error; }
}
$('brandIcon').append(icon('key', 18)); $('biometric').append(icon('fingerprint', 22)); $('revealPassword').append(icon('eye'));
$('revealPassword').addEventListener('click', () => {
  const reveal = $('passphrase').type === 'password'; $('passphrase').type = reveal ? 'text' : 'password'; $('revealPassword').setAttribute('aria-label', `${reveal ? 'Hide' : 'Show'} master password`); $('revealPassword').setAttribute('aria-pressed', String(reveal));
});
$('unlockForm').addEventListener('submit', event => {
  event.preventDefault();
  const passphrase = $('passphrase').value; const confirmation = $('confirm').value;
  run(async () => {
    if (!initialized) {
      if (passphrase !== confirmation) throw new Error('Master passwords do not match.');
      await send('INITIALIZE_VAULT', { passphrase });
    } else await send('UNLOCK_VAULT', { passphrase });
    await refresh();
  });
});
$('biometric').addEventListener('click', () => run(async () => { controller = new AbortController(); await authenticateBiometric(controller.signal); await refresh(); }));
$('saveTarget').addEventListener('change', saveTargetChanged);
$('save').addEventListener('click', () => run(async () => {
  if (!$('saveTarget').value) throw new Error('Choose the login to update, or save a new login.');
  await complete({ username: $('saveUsername').value, saveAction: $('saveTarget').value === 'new' ? 'create' : 'update', credentialId: $('saveTarget').value === 'new' ? undefined : $('saveTarget').value, expectedRevision: details.revision });
}));
$('refreshReview').addEventListener('click', () => run(refresh));
$('cancel').addEventListener('click', async () => { disposed = true; controller?.abort(); clearSecrets(); await send('AUTH_REQUEST_CANCEL', { requestId }).catch(() => {}); window.close(); });
window.addEventListener('pagehide', () => { disposed = true; clearTimeout(expiry); controller?.abort(); clearSecrets(); if (!completed) chrome.runtime.sendMessage({ type: 'AUTH_REQUEST_CANCEL', requestId }).catch(() => {}); });
chrome.runtime.onMessage.addListener(message => {
  if (message.type === 'VAULT_LOCKED') { invalidated = true; controller?.abort(); clearSecrets(); $('accounts').replaceChildren(); $('saveUsername').value = ''; $('saveReview').hidden = $('save').hidden = $('unlock').hidden = $('unlockForm').hidden = true; $('status').textContent = 'Vault locked. Start a new request from the website.'; }
  if (message.type === 'SETTINGS_CHANGED') updateTheme().catch(() => {});
});
async function updateTheme() { const response = await send('PUBLIC_SETTINGS'); theme = response.settings.theme; applyTheme(theme); }
watchSystemTheme(() => theme);
updateTheme().catch(() => applyTheme('system'));
refresh().catch(showError);
