import { state } from '../state.js';
import { sendMessage } from './messaging.js';
import { openModal, closeModal } from './ui.js';
import { setUnlockResolver, resolveUnlockSetup } from './modalResolver.js';
import { refreshState, resetInactivityTimer } from './vaultSession.js';
import { authenticateBiometric } from '../../src/biometric/client.js';

const $ = id => document.getElementById(id);
let sequence = 0;
let controller;

function clearPassword() {
  $('unlockSetupPassword').value = '';
  $('unlockSetupPassword').type = 'password';
  $('unlockSetupModal').querySelector('[data-toggle-password]').setAttribute('aria-label', 'Show password');
}

function busy(method) {
  const modal = $('unlockSetupModal');
  modal.dataset.busy = method || '';
  $('unlockSetupForm').setAttribute('aria-busy', String(Boolean(method)));
  for (const control of modal.querySelectorAll('input, button')) control.disabled = Boolean(method);
  modal.querySelector('[data-close]').disabled = method === 'password';
  modal.querySelector('[type="submit"]').textContent = method === 'password' ? 'Unlocking…' : 'Unlock vault';
  $('unlockWithBiometric').textContent = method === 'biometric' ? 'Verifying…' : 'Use biometric unlock';
}

function report(message) {
  $('unlockSetupError').textContent = message || '';
  $('unlockSetupError').hidden = !message;
}

export async function requestVaultUnlock(message) {
  if (!$('unlockSetupModal').classList.contains('hidden') || $('operationDialog').open) return false;
  const expected = ++sequence;
  const status = await sendMessage('BIOMETRIC_STATUS');
  if (sequence !== expected) return false;
  clearPassword(); $('unlockSetupPassword').removeAttribute('aria-invalid'); busy(null); report('');
  $('unlockSetupLead').textContent = message || 'Enter your master password to continue.';
  const biometric = Boolean(status.ok && status.enabled);
  $('unlockWithBiometric').hidden = !biometric;
  $('unlockBiometricAlternative').hidden = !biometric;
  if (!status.ok) report('Biometric unlock is unavailable. You can use your master password.');
  return new Promise(resolve => {
    setUnlockResolver(value => resolve(value === true));
    openModal('unlockSetupModal');
  });
}

async function verify(method) {
  if ($('unlockSetupModal').dataset.busy) return;
  const expected = sequence;
  const password = $('unlockSetupPassword').value;
  if (method === 'password' && !password) return;
  report(''); $('unlockSetupPassword').removeAttribute('aria-invalid'); busy(method); controller = new AbortController();
  try {
    if (method === 'biometric') await authenticateBiometric(controller.signal);
    else {
      const response = await sendMessage('UNLOCK_VAULT', { passphrase: password, timeoutMinutes: state.settings?.vaultTimeout || 15 });
      if (!response.ok) throw new Error(response.error || 'Could not unlock the vault.');
    }
    if (sequence !== expected) return;
    clearPassword(); await refreshState();
    if (sequence !== expected) return;
    if (!state.vaultUnlocked) throw new Error('The vault is locked. Try again.');
    resetInactivityTimer();
    resolveUnlockSetup(true);
    closeModal('unlockSetupModal', { force: true });
  } catch (error) {
    if (sequence !== expected) return;
    report(['NotAllowedError', 'AbortError'].includes(error.name)
      ? 'Authentication cancelled. Try again or use your master password.' : error.message);
    if (method === 'password') $('unlockSetupPassword').setAttribute('aria-invalid', 'true');
  } finally {
    if (sequence === expected) {
      clearPassword(); busy(null);
      $('unlockSetupPassword').focus({ preventScroll: true });
    }
  }
}

export function attachVaultUnlockListeners() {
  $('unlockSetupForm').addEventListener('submit', event => { event.preventDefault(); verify('password'); });
  $('unlockWithBiometric').addEventListener('click', () => verify('biometric'));
  document.addEventListener('unlock-dialog-closed', () => { sequence++; controller?.abort(); clearPassword(); busy(null); report(''); });
  window.addEventListener('pagehide', () => closeModal('unlockSetupModal', { force: true }));
}
