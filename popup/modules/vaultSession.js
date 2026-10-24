import { state } from '../state.js';
import { sendMessage } from './messaging.js';
import { showToast } from './toast.js';

let touching = false;
const $ = id => document.getElementById(id);

export function resetInactivityTimer() {
  if (!state.vaultUnlocked || touching) return;
  touching = true;
  sendMessage('KEEP_ALIVE').then(response => { if (!response.ok) clearSensitiveUI(); }).finally(() => { setTimeout(() => { touching = false; }, 500); });
}
export function clearSensitiveUI() {
  state.vaultUnlocked = false; state.entries = []; state.editingEntryId = null; state.generatorPassword = '';
  document.querySelectorAll('input[type="password"], #entryNotes, #generatedResult, #passwordInput').forEach(input => { input.value = ''; });
  document.querySelectorAll('[data-toggle-password]').forEach(button => { const input = $(button.dataset.togglePassword); if (input) input.type = 'password'; button.setAttribute('aria-label', 'Show password'); });
  document.dispatchEvent(new CustomEvent('vault-ui-locked'));
  document.dispatchEvent(new CustomEvent('vault-entries-changed')); renderVaultState();
}
export function renderVaultState() {
  $('vaultLocked').classList.toggle('hidden', state.vaultUnlocked);
  $('vaultUnlocked').classList.toggle('hidden', !state.vaultUnlocked);
  $('createMaster').classList.toggle('hidden', state.vaultInitialized !== false);
  $('unlockMaster').classList.toggle('hidden', !state.vaultInitialized);
  if (!state.vaultUnlocked) { state.entries = []; state.filter = ''; $('vaultSearch').value = ''; }
  document.dispatchEvent(new CustomEvent('vault-ui-state'));
}
export async function refreshState() {
  const status = await sendMessage('VAULT_STATUS');
  if (!status.ok) { showToast(status.error, 'error'); return; }
  state.vaultInitialized = status.status.initialized;
  const warning = $('vaultSyncStatus'); warning.hidden = !status.status.syncPending; warning.textContent = status.status.syncPending ? `Saved locally. Sync pending: ${status.status.syncError}` : '';
  if (!status.status.unlocked) { clearSensitiveUI(); return; }
  state.vaultUnlocked = true;
  const list = await sendMessage('LIST_CREDENTIALS');
  if (!list.ok || !list.unlocked) { clearSensitiveUI(); return; }
  state.entries = list.entries; renderVaultState(); document.dispatchEvent(new CustomEvent('vault-entries-changed'));
}
