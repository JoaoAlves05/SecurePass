import { sendMessage } from './messaging.js';
import { state } from '../state.js';
import { syncSettingsView } from './settings.js';
import { refreshState } from './vaultSession.js';
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
    try { await refreshManagement(); } catch (error) { showToast(error.message, 'error'); }
    finally { busy = false; document.getElementById('managementActivity').textContent = ''; }
  });
}

export function attachManagementListeners() {
  const create = document.getElementById('createLocalVault');
  document.addEventListener('vault-ui-state', () => {
    const missing = state.vaultInitialized === false;
    document.getElementById('backupEmptyState').hidden = !missing;
    for (const id of ['exportVault', 'changeMasterKeyBtn', 'clearVault']) document.getElementById(id).disabled = missing;
  });
  create.addEventListener('click', () => runManagement(async () => {
    const result = await requestOperation({ title: 'Create a local vault', description: 'Your master password opens this vault. Choose at least 16 characters, keep it safe and export a backup. No Google account is required.', fields: [{ name: 'password', label: 'Master password', type: 'password', minLength: 16 }, { name: 'confirmation', label: 'Confirm master password', type: 'password' }], confirmLabel: 'Create vault', submit: async values => {
      if (values.password !== values.confirmation) throw new Error('Master passwords do not match. No vault was created.');
      const result = await checked('INITIALIZE_VAULT', { passphrase: values.password });
      if (!result.created) throw new Error('A vault already exists. Cancel and unlock it.');
      return result;
    } });
    if (result) showToast('Local vault created. Export a backup to protect your recovery.', 'success');
  }));
}
