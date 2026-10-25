import { state } from '../state.js';
import { refreshState } from './vaultSession.js';
import { sendMessage } from './messaging.js';
import { showToast } from './toast.js';
import { enrollBiometric, authenticateBiometric } from '../../src/biometric/client.js';

let controller;
const $ = id => document.getElementById(id);
export async function syncBiometricView() {
  const status = await sendMessage('BIOMETRIC_STATUS');
  const enabled = Boolean(status.ok && status.enabled);
  $('biometricUnlockContainer').classList.toggle('hidden', !enabled || !state.vaultInitialized);
  $('biometricUnlockBtn').classList.toggle('hidden', !enabled);
  $('disableBiometric').hidden = !enabled;
  $('biometricRevokeHelp').hidden = !enabled;
  $('biometricBtnLabel').textContent = enabled ? 'Replace biometric authenticator' : 'Set up biometric unlock';
  $('biometricSetupBtn').disabled = state.vaultInitialized === false;
  $('biometricBtnSub').textContent = state.vaultInitialized === false ? 'Create or import a vault to enable biometric unlock.' : status.requiresReconfiguration
    ? 'Previous setup was removed. Set up a compatible authenticator again.'
    : 'Use a compatible fingerprint, face, PIN or security key';
}
export function attachBiometricListeners() {
  document.addEventListener('vault-ui-state', () => syncBiometricView().catch(() => {}));
  const setup = $('biometricSetupBtn');
  const section = $('biometricSetting');
  const auth = $('biometricInlineAuth');
  const toggle = () => {
    const expanded = section.classList.toggle('inline-auth-open');
    setup.setAttribute('aria-expanded', String(expanded));
    auth.setAttribute('aria-hidden', String(!expanded));
    auth.inert = !expanded;
    if (expanded) $('biometricInlinePassword').focus(); else $('biometricInlinePassword').value = '';
  };
  setup.addEventListener('click', toggle);
  $('biometricInlineCancel').addEventListener('click', () => { controller?.abort(); section.classList.remove('inline-auth-open'); setup.setAttribute('aria-expanded', 'false'); $('biometricInlinePassword').value = ''; auth.setAttribute('aria-hidden', 'true'); auth.inert = true; });
  $('biometricInlineConfirm').addEventListener('click', async () => {
    const button = $('biometricInlineConfirm'); if (button.disabled) return;
    button.disabled = true; controller = new AbortController();
    try {
      await enrollBiometric($('biometricInlinePassword').value, controller.signal);
      showToast('PRF biometric unlock configured and tested.', 'success'); await refreshState();
    } catch (error) { showToast(error.name === 'NotAllowedError' ? 'Authentication cancelled.' : error.message, 'error'); }
    finally { button.disabled = false; $('biometricInlinePassword').value = ''; section.classList.remove('inline-auth-open'); setup.setAttribute('aria-expanded', 'false'); auth.setAttribute('aria-hidden', 'true'); auth.inert = true; await syncBiometricView(); }
  });
  $('biometricUnlockBtn').addEventListener('click', async () => {
    const button = $('biometricUnlockBtn'); button.disabled = true; controller = new AbortController();
    try { await authenticateBiometric(controller.signal); await refreshState(); showToast('Vault unlocked.', 'success'); }
    catch (error) { showToast(error.name === 'NotAllowedError' ? 'Authentication cancelled.' : error.message, 'error'); }
    finally { button.disabled = false; }
  });
  $('disableBiometric').addEventListener('click', async () => {
    controller?.abort();
    const response = await sendMessage('DISABLE_BIOMETRIC');
    showToast(response.ok ? 'Biometric unlock revoked on this device.' : response.error, response.ok ? 'success' : 'error');
    await syncBiometricView();
  });
  window.addEventListener('pagehide', () => controller?.abort());
  chrome.runtime.onMessage.addListener(message => { if (message.type === 'VAULT_LOCKED') { controller?.abort(); $('biometricInlinePassword').value = ''; section.classList.remove('inline-auth-open'); setup.setAttribute('aria-expanded', 'false'); auth.setAttribute('aria-hidden', 'true'); auth.inert = true; } });
}
