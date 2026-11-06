import { checked } from './management.js';
const $ = id => document.getElementById(id);
let sequence = 0; let busy = false;
const messages = {
  'authentication-required': 'Google authorization was not completed. Connect again to retry.',
  'permission-denied': 'Google refused access. Check the Drive API and the test-user configuration.',
  'account-changed': 'The Google account changed. Disconnect and connect the intended account.',
  'temporarily-unavailable': 'Google is temporarily unavailable. Try again later.',
  'connection-interrupted': 'The connection was interrupted. Check your network and try again.',
  'binding-changed': 'The connection changed. Check its status before retrying.'
};
export async function refreshGoogleView() {
  const request = ++sequence;
  const { connection } = await checked('GOOGLE_CONNECTION_STATUS');
  if (request !== sequence) return;
  $('connectGoogle').hidden = connection.connected;
  $('connectGoogle').disabled = busy || connection.connecting || !connection.configured;
  $('inspectGoogle').hidden = !connection.connected;
  $('inspectGoogle').disabled = busy;
  $('disconnectGoogle').hidden = !connection.connected && !connection.connecting;
  $('disconnectGoogle').textContent = connection.connecting ? 'Cancel connection' : 'Disconnect';
  $('googleConnectionStatus').textContent = !connection.configured ? 'Google is not configured in this installation.'
    : connection.connecting ? 'Waiting for Google authorization…'
    : connection.connected ? `Connected${connection.email ? ` as ${connection.email}` : ''}. Your vault has not been sent to Drive.`
    : messages[connection.errorCode] || 'No Google account connected. Connecting checks access without sending your vault.';
}
async function act(type) {
  if (busy && type !== 'GOOGLE_DISCONNECT') return;
  const request = ++sequence; busy = true;
  $('connectGoogle').disabled = true; $('inspectGoogle').disabled = true;
  $('googleConnectionResult').hidden = true;
  if (type === 'GOOGLE_CONNECT') {
    $('googleConnectionStatus').textContent = 'Waiting for Google authorization…';
    $('disconnectGoogle').hidden = false; $('disconnectGoogle').textContent = 'Cancel connection';
  }
  try {
    const result = await checked(type);
    if (request !== sequence) return;
    if (type === 'GOOGLE_INSPECT') {
      $('googleConnectionResult').hidden = false;
      $('googleConnectionResult').textContent = `${result.fileCount} app ${result.fileCount === 1 ? 'file' : 'files'} found. These files have not been verified as vaults. No vault data was changed or uploaded.`;
    }
  } catch (error) {
    if (request !== sequence) return;
    $('googleConnectionResult').hidden = false;
    $('googleConnectionResult').textContent = Object.entries(messages).find(([code]) => error.message.includes(code))?.[1] || 'Could not complete the Google check. Verify the configuration and try again.';
  } finally {
    if (request === sequence) { busy = false; await refreshGoogleView().catch(() => {}); }
  }
}
export function attachDriveListeners() {
  for (const [id, type] of [['connectGoogle', 'GOOGLE_CONNECT'], ['inspectGoogle', 'GOOGLE_INSPECT'], ['disconnectGoogle', 'GOOGLE_DISCONNECT']]) $(id).addEventListener('click', () => act(type));
  document.addEventListener('settings-section-changed', event => {
    if (event.detail.id === 'advancedSection' && !busy) refreshGoogleView().catch(() => { $('googleConnectionStatus').textContent = 'Could not check the Google connection. Reopen Settings to retry.'; });
  });
  refreshGoogleView().catch(() => { $('googleConnectionStatus').textContent = 'Could not check the Google connection. Reopen Settings to retry.'; });
}
