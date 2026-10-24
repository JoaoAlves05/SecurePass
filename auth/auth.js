import { authenticateBiometric } from '../src/biometric/client.js';

const requestId = new URLSearchParams(location.search).get('requestId');
const $ = id => document.getElementById(id);
let initialized;
let controller;
async function send(type, data = {}) {
  const response = await chrome.runtime.sendMessage({ type, ...data });
  if (!response?.ok) throw new Error(response?.error || 'Request failed.');
  return response;
}
function showError(error) { $('status').textContent = error.name === 'NotAllowedError' ? 'Authentication cancelled.' : error.message; }
async function refresh() {
  const state = (await send('VAULT_STATUS')).status;
  initialized = state.initialized;
  $('unlockForm').hidden = state.unlocked;
  $('unlock').textContent = initialized ? 'Unlock' : 'Create vault';
  $('confirm').hidden = $('confirmLabel').hidden = initialized;
  $('confirm').required = !initialized;
  const bio = await send('BIOMETRIC_STATUS');
  $('biometric').hidden = state.unlocked || !bio.enabled;
  const details = await send('AUTH_REQUEST_DETAILS', { requestId });
  $('origin').textContent = details.origin;
  $('accounts').replaceChildren();
  $('save').hidden = !state.unlocked || details.kind !== 'save';
  if (details.kind === 'save') $('status').textContent = `Save or update ${details.candidate.username || 'this account'}? Confirm only after the website accepts the credentials.`;
  else if (state.unlocked) {
    $('status').textContent = details.entries.length ? 'Choose the account to fill on this exact website.' : 'No account saved for this origin. Add it in the extension popup.';
    for (const entry of details.entries) {
      const button = document.createElement('button'); button.type = 'button';
      button.textContent = entry.username || 'Account without username';
      button.addEventListener('click', () => complete(entry.id).catch(showError));
      $('accounts').append(button);
    }
  }
}
async function complete(credentialId) {
  await send('AUTH_REQUEST_COMPLETE', { requestId, credentialId });
  $('status').textContent = 'Completed.';
  window.close();
}
$('unlockForm').addEventListener('submit', async event => {
  event.preventDefault(); $('unlock').disabled = true;
  const passphrase = $('passphrase').value;
  try {
    if (!initialized) {
      if (passphrase !== $('confirm').value) throw new Error('Master passwords do not match.');
      await send('INITIALIZE_VAULT', { passphrase });
    } else await send('UNLOCK_VAULT', { passphrase });
    await refresh();
  } catch (error) { showError(error); }
  finally { $('passphrase').value = $('confirm').value = ''; $('unlock').disabled = false; }
});
$('biometric').addEventListener('click', async () => {
  controller = new AbortController(); $('biometric').disabled = true;
  try { await authenticateBiometric(controller.signal); await refresh(); } catch (error) { showError(error); }
  finally { $('biometric').disabled = false; }
});
$('save').addEventListener('click', () => complete().catch(showError));
$('cancel').addEventListener('click', async () => { controller?.abort(); await send('AUTH_REQUEST_CANCEL', { requestId }).catch(() => {}); window.close(); });
window.addEventListener('pagehide', () => { controller?.abort(); $('passphrase').value = $('confirm').value = ''; });
chrome.runtime.onMessage.addListener(message => {
  if (message.type === 'VAULT_LOCKED') { controller?.abort(); $('passphrase').value = $('confirm').value = ''; $('accounts').replaceChildren(); $('save').hidden = true; $('status').textContent = 'Vault locked. Start a new request from the website.'; }
});
refresh().catch(showError);
