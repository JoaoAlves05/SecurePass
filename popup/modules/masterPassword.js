import { authorizeMasterPassword, authenticateBiometric, updateMasterPassword, cancelMasterPassword } from '../../src/biometric/client.js';
import { sendMessage } from './messaging.js';
import { refreshState } from './vaultSession.js';
import { syncBiometricView } from './biometricSetup.js';

const $ = id => document.getElementById(id);

export function attachMasterPasswordListeners() {
  const trigger = $('changeMasterKeyBtn');
  const flow = $('masterChangeFlow');
  const identity = $('masterIdentityForm');
  const form = $('masterForm');
  const success = $('masterChangeSuccess');
  const error = $('masterChangeError');
  let authorization;
  let expiryTimer;
  let controller;
  let version = 0;
  let busy = false;
  let biometricEnabled = false;

  const report = message => {
    error.textContent = message || '';
    error.hidden = !message;
  };
  const clearFields = () => {
    for (const input of flow.querySelectorAll('input')) { input.value = ''; input.type = 'password'; input.removeAttribute('aria-invalid'); }
    for (const button of flow.querySelectorAll('[data-toggle-password]')) button.setAttribute('aria-label', 'Show password');
  };
  const setBusy = (value, saving = false) => {
    busy = value;
    flow.setAttribute('aria-busy', String(value));
    for (const button of flow.querySelectorAll('button')) button.disabled = value && (saving || !button.hasAttribute('data-cancel-master'));
    for (const input of flow.querySelectorAll('input')) input.disabled = value;
    identity.querySelector('[type="submit"]').textContent = value && !saving ? 'Verifying…' : 'Continue';
    form.querySelector('[type="submit"]').textContent = saving ? 'Saving…' : 'Save new password';
  };
  const showStep = step => {
    trigger.hidden = true;
    trigger.setAttribute('aria-expanded', 'true');
    flow.hidden = false;
    for (const panel of [identity, form, success]) panel.hidden = panel !== step;
    report('');
    (step.querySelector('input') || step.querySelector('.master-step-title'))?.focus({ preventScroll: true });
    requestAnimationFrame(() => {
      if (flow.hidden || step.hidden) return;
      const scroller = flow.closest('.settings-scroll-container');
      scroller.scrollTop += flow.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 12;
    });
  };
  const revoke = () => {
    clearTimeout(expiryTimer);
    if (authorization) cancelMasterPassword(authorization).catch(() => {});
    authorization = null;
  };
  const reset = (focus = false) => {
    version++;
    controller?.abort();
    revoke();
    clearFields();
    setBusy(false);
    flow.hidden = true;
    trigger.hidden = false;
    trigger.setAttribute('aria-expanded', 'false');
    report('');
    if (focus) { trigger.focus({ preventScroll: true }); trigger.scrollIntoView({ block: 'nearest' }); }
  };
  const loadBiometricStatus = async expected => {
    const status = await sendMessage('BIOMETRIC_STATUS');
    if (expected !== version) return;
    biometricEnabled = Boolean(status.ok && status.enabled);
    $('masterUseBiometric').hidden = !biometricEnabled;
    $('masterBiometricWarning').hidden = !biometricEnabled;
  };
  const verify = async biometric => {
    if (busy) return;
    const expected = version;
    const passphrase = $('currentMaster').value;
    if (!biometric && !passphrase) return;
    report('');
    setBusy(true);
    controller = new AbortController();
    try {
      const result = biometric
        ? await authenticateBiometric(controller.signal, 'change-master-password')
        : await authorizeMasterPassword(passphrase);
      if (expected !== version) {
        if (result.authorization) await cancelMasterPassword(result.authorization).catch(() => {});
        return;
      }
      $('currentMaster').value = '';
      authorization = result.authorization;
      if (!authorization) throw new Error('Unable to authorize this change. Confirm your identity again.');
      expiryTimer = setTimeout(() => {
        revoke();
        clearFields();
        showStep(identity);
        report('Your confirmation expired. Confirm your identity again to continue.');
      }, Math.max(0, result.expiresAt - Date.now()));
      await refreshState();
      await loadBiometricStatus(expected);
      if (expected === version) showStep(form);
    } catch (failure) {
      if (expected === version) report(['NotAllowedError', 'AbortError'].includes(failure.name)
        ? 'Authentication cancelled. Try again or use your master password.' : failure.message);
    } finally {
      if (expected === version) { $('currentMaster').value = ''; setBusy(false); if (!form.hidden) $('nextMaster').focus({ preventScroll: true }); }
    }
  };

  trigger.addEventListener('click', () => {
    reset();
    biometricEnabled = false;
    $('masterUseBiometric').hidden = true;
    showStep(identity);
    loadBiometricStatus(version).catch(() => {});
  });
  identity.addEventListener('submit', event => { event.preventDefault(); verify(false); });
  $('masterUseBiometric').addEventListener('click', () => verify(true));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || !authorization) return;
    report('');
    const next = $('nextMaster').value;
    if ([...next].length < 16) { report('Use at least 16 characters for your new master password.'); $('nextMaster').focus(); return; }
    if (next !== $('confirmNextMaster').value) {
      $('confirmNextMaster').setAttribute('aria-invalid', 'true');
      report('The new passwords do not match. Check the confirmation.');
      $('confirmNextMaster').focus();
      return;
    }
    const expected = version;
    setBusy(true, true);
    clearTimeout(expiryTimer);
    try {
      await updateMasterPassword(authorization, next);
      authorization = null;
      clearFields();
      await refreshState();
      await syncBiometricView();
      if (expected !== version) return;
      $('masterReconfigureBiometric').hidden = !biometricEnabled;
      showStep(success);
    } catch (failure) {
      if (expected !== version) return;
      revoke();
      clearFields();
      showStep(identity);
      report(`${failure.message} Confirm your identity to try again.`);
    } finally { if (expected === version) setBusy(false); }
  });
  for (const button of flow.querySelectorAll('[data-cancel-master]')) button.addEventListener('click', () => reset(true));
  $('masterChangeDone').addEventListener('click', () => reset(true));
  $('masterReconfigureBiometric').addEventListener('click', () => {
    reset();
    if ($('biometricSetupBtn').getAttribute('aria-expanded') !== 'true') $('biometricSetupBtn').click();
    $('biometricInlinePassword').focus();
    $('biometricSetting').scrollIntoView({ block: 'nearest' });
  });
  flow.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      if (busy && !form.hidden) return;
      reset(true);
    }
  });
  document.addEventListener('vault-ui-locked', () => reset());
  document.addEventListener('settings-closed', () => reset());
  document.addEventListener('settings-section-changed', event => { if (event.detail.id !== 'securitySection') reset(); });
  window.addEventListener('pagehide', () => reset());
}
