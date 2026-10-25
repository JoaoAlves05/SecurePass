import { sendMessage } from './messaging.js';
import { state } from '../state.js';
import { syncSettingsView } from './settings.js';
import { refreshState } from './vaultSession.js';
import { ensureVaultAccessible } from './vault.js';
import { requestOperation } from './operationDialog.js';
import { showToast } from './toast.js';
let busy = false;
export async function checked(type, payload = {}) {
  const response = await sendMessage(type, payload);
  if (!response.ok) throw new Error(response.error);
  return response;
}
export async function refreshManagement() {
  const settings = await checked('LOAD_SETTINGS'); state.settings = settings.settings; state.settingsRevision = settings.revision;
  syncSettingsView(); await refreshState();
  document.dispatchEvent(new CustomEvent('management-refresh'));
}
export function runManagement(task) {
  if (busy) { showToast('Finish or cancel the current operation first.', 'warning'); return Promise.resolve(); }
  busy = true;
  document.getElementById('managementActivity').textContent = 'Operation in progress…';
  return Promise.resolve().then(task).catch(error => showToast(error.message, 'error')).finally(async () => {
    busy = false; document.getElementById('managementActivity').textContent = '';
    try { await refreshManagement(); } catch (error) { showToast(error.message, 'error'); }
  });
}

export function attachManagementListeners() {
  const action = document.getElementById('managementVaultAction');
  const backup = document.getElementById('managementBackupAction');
  document.addEventListener('vault-ui-state', () => {
    action.textContent = state.vaultInitialized === false ? 'Create local vault' : state.vaultUnlocked ? 'Lock vault' : 'Unlock vault';
    backup.disabled = state.vaultInitialized === false;
  });
  backup.addEventListener('click', () => document.getElementById('exportVault').click());
  action.addEventListener('click', () => runManagement(async () => {
    if (state.vaultInitialized === false) {
      const result = await requestOperation({ title: 'Create a local vault', description: 'Your master password opens this vault. Choose at least 16 characters, keep it safe and export a backup. No Google account is required.', fields: [{ name: 'password', label: 'Master password', type: 'password', minLength: 16 }, { name: 'confirmation', label: 'Confirm master password', type: 'password' }], confirmLabel: 'Create vault', submit: async values => {
        if (values.password !== values.confirmation) throw new Error('Master passwords do not match. No vault was created.');
        const result = await checked('INITIALIZE_VAULT', { passphrase: values.password });
        if (!result.created) throw new Error('A vault already exists. Cancel and unlock it.');
        return result;
      } });
      if (result) showToast('Local vault created. Export a backup to protect your recovery.', 'success');
    } else if (state.vaultUnlocked) await checked('LOCK_VAULT');
    else await ensureVaultAccessible('Enter the master password for this local vault.');
  }));
}
