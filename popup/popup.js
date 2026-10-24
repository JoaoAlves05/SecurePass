import { sendMessage } from './modules/messaging.js';
import { initToast, showToast } from './modules/toast.js';
import { applyTheme, watchSystemTheme } from './modules/theme.js';
import { attachGeneratorListeners, syncGeneratorControls } from './modules/generator.js';
import { attachTesterListeners } from './modules/tester.js';
import { attachSettingsListeners, syncSettingsView } from './modules/settings.js';
import { renderEntries, handleEntrySubmit, handleUnlock, handleCreateMaster, changeMasterPassword, lockVault, resolveUnlockSetup } from './modules/vault.js';
import { attachUIListeners, setView, openSettingsPanel, closeSettingsPanel, openModal, closeModal, detectActiveOrigin, openEntryModal, openMasterModal } from './modules/ui.js';
import { attachBiometricListeners, syncBiometricView } from './modules/biometricSetup.js';
import { attachDataListeners } from './modules/dataManagement.js';
import { refreshCandidates } from './modules/candidates.js';
import { attachSyncListeners } from './modules/sync.js';

import { state } from './state.js';
import { resetInactivityTimer, clearSensitiveUI, refreshState } from './modules/vaultSession.js';
const $ = id => document.getElementById(id);

async function initialise() {
  initToast($('toast'));
  setView('tester');
  const response = await sendMessage('LOAD_SETTINGS');
  if (!response.ok) { showToast(response.error, 'error'); return; }
  state.settings = response.settings;
  applyTheme(state.settings.theme); watchSystemTheme(() => state.settings.theme);
  document.addEventListener('vault-entries-changed', renderEntries);
  attachUIListeners(); attachGeneratorListeners(); attachTesterListeners(); attachSettingsListeners(); attachBiometricListeners(); attachDataListeners(); attachSyncListeners();
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
  syncGeneratorControls(); syncSettingsView();
  document.querySelector('.app-version').textContent = `v${chrome.runtime.getManifest().version}`;
  chrome.runtime.onMessage.addListener(message => {
    if (message.type === 'VAULT_LOCKED') clearSensitiveUI();
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshState().catch(() => clearSensitiveUI()); });
  await refreshState(); await refreshCandidates();
}
initialise().catch(error => { initToast($('toast')); showToast(error.message, 'error'); });
