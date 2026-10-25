import { sendMessage } from './modules/messaging.js';
import { initToast, showToast } from './modules/toast.js';
import { applyTheme, watchSystemTheme } from './modules/theme.js';
import { attachGeneratorListeners, syncGeneratorControls } from './modules/generator.js';
import { attachTesterListeners } from './modules/tester.js';
import { attachSettingsListeners, syncSettingsView, initialiseSettings } from './modules/settings.js';
import { renderEntries, handleEntrySubmit, handleUnlock, handleCreateMaster, changeMasterPassword, lockVault, resolveUnlockSetup } from './modules/vault.js';
import { attachUIListeners, setView, openSettingsPanel, closeSettingsPanel, openModal, closeModal, detectActiveOrigin, openEntryModal, openMasterModal } from './modules/ui.js';
import { attachBiometricListeners, syncBiometricView } from './modules/biometricSetup.js';
import { authenticateBiometric } from '../src/biometric/client.js';
import { attachDataListeners } from './modules/dataManagement.js';
import { refreshCandidates } from './modules/candidates.js';
import { attachManagementListeners } from './modules/management.js';
import { attachSyncListeners } from './modules/sync.js';

import { state } from './state.js';
import { resetInactivityTimer, clearSensitiveUI, refreshState } from './modules/vaultSession.js';
const $ = id => document.getElementById(id);

async function initialise() {
  initToast($('toast'));
  setView('tester');
  const managementMode = new URL(location.href).searchParams.get('manage') === '1';
  document.body.classList.toggle('management-mode', managementMode);
  const response = await sendMessage('LOAD_SETTINGS');
  if (!response.ok) { showToast(response.error, 'error'); return; }
  initialiseSettings(response);
  applyTheme(state.settings.theme); watchSystemTheme(() => state.settings.theme);
  document.addEventListener('vault-entries-changed', renderEntries);
  attachUIListeners(); attachGeneratorListeners(); attachTesterListeners(); attachSettingsListeners(); attachBiometricListeners(); attachDataListeners(); attachSyncListeners(); attachManagementListeners();
  $('addEntry').addEventListener('click', () => openEntryModal());
  $('lockVault').addEventListener('click', () => lockVault(true));
  $('changeMasterKeyBtn').addEventListener('click', openMasterModal);
  $('vaultSearch').addEventListener('input', event => { state.filter = event.target.value; renderEntries(); resetInactivityTimer(); });
  $('searchToggle').addEventListener('click', () => {
    const container = document.querySelector('.search-container');
    container.classList.toggle('active');
    if (container.classList.contains('active')) $('vaultSearch').focus();
    else { state.filter = ''; $('vaultSearch').value = ''; renderEntries(); }
  });
  const forms = { entryForm: handleEntrySubmit, unlockForm: handleUnlock, createMasterForm: handleCreateMaster, masterForm: changeMasterPassword };
  for (const [id, handler] of Object.entries(forms)) $(id).addEventListener('submit', async event => {
    event.preventDefault();
    const submit = $(id).querySelector('[type="submit"]');
    if (submit.disabled) return;
    submit.disabled = true;
    try { await handler(event); } catch (error) { showToast(error.message, 'error'); }
    finally { submit.disabled = false; }
  });
  $('unlockSetupForm').addEventListener('submit', event => { event.preventDefault(); const pass = $('unlockSetupPassword').value; if (pass) { resolveUnlockSetup(pass); closeModal('unlockSetupModal'); } });
  $('unlockWithBiometric').addEventListener('click', async event => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
      await authenticateBiometric();
      await refreshState();
      if (!state.vaultUnlocked) throw new Error('Biometric authentication did not unlock the vault.');
      resolveUnlockSetup(true);
      closeModal('unlockSetupModal');
    } catch (error) {
      showToast(error.name === 'NotAllowedError' ? 'Authentication cancelled. You can use your master password instead.' : error.message, error.name === 'NotAllowedError' ? 'warning' : 'error');
    } finally {
      button.disabled = false;
    }
  });
  syncGeneratorControls(); syncSettingsView();
  $('openManagement').addEventListener('click', () => chrome.tabs.create({ url: chrome.runtime.getURL('popup/popup.html?manage=1') }));
  if (managementMode) { openSettingsPanel(); $('openManagement').hidden = true; document.title = 'SecurePass · Settings & data'; }
  const wrapper = document.querySelector('.settings-content-wrapper');
  for (const id of ['syncSection', 'dataSection', 'recoverySection', 'securitySection', 'preferencesSection', 'dangerSection', 'aboutSection']) wrapper.append($(id));
  $('preferencesSection').querySelector('.card').append($('resetSettings'));
  const danger = $('dangerActions');
  for (const id of ['clearVault', 'wipeDevice']) danger.append($(id));
  const dataCard = $('dataSection').querySelector('.card');
  while (dataCard.firstElementChild?.classList.contains('divider')) dataCard.firstElementChild.remove();
  while (dataCard.lastElementChild?.classList.contains('divider')) dataCard.lastElementChild.remove();
  if (response.repaired?.length) showToast('Some invalid preferences were replaced with safe defaults. Review your settings.', 'warning');
  document.querySelector('.app-version').textContent = `v${chrome.runtime.getManifest().version}`;
  chrome.runtime.onMessage.addListener(message => {
    if (message.type === 'VAULT_LOCKED') clearSensitiveUI();
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshState().catch(() => clearSensitiveUI()); });
  document.addEventListener('vault-ui-state', () => { $('managementVaultState').textContent = state.vaultInitialized === false ? 'No local vault yet. Create one in Vault, or import a backup below.' : `Saved on this device · ${state.vaultUnlocked ? 'Unlocked' : 'Locked'}`; });
  let refreshing = false;
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && (changes.settings || changes.syncStatus || changes.syncRecovery) && !refreshing) {
      refreshing = true;
      setTimeout(async () => {
        try { const current = await sendMessage('LOAD_SETTINGS'); if (current.ok) { initialiseSettings(current); applyTheme(state.settings.theme); syncSettingsView(); } document.dispatchEvent(new CustomEvent('management-refresh')); await refreshState(); }
        finally { refreshing = false; }
      }, 100);
    }
  });
  await refreshState(); await refreshCandidates();
}
initialise().catch(error => { initToast($('toast')); showToast(error.message, 'error'); });
