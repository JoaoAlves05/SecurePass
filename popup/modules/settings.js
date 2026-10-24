import { state } from '../state.js';
import { sendMessage } from './messaging.js';
import { showToast } from './toast.js';
import { applyTheme } from './theme.js';
import { DEFAULT_SETTINGS } from '../../src/settings.js';

let saving = Promise.resolve();
const $ = id => document.getElementById(id);
export function scheduleSettingsSave() {
  const snapshot = structuredClone(state.settings);
  saving = saving.then(async () => {
    const response = await sendMessage('SAVE_SETTINGS', { settings: snapshot });
    if (!response.ok) {
      const current = await sendMessage('LOAD_SETTINGS');
      if (current.ok) state.settings = current.settings;
      syncSettingsView(); showToast(response.error, 'error');
      return;
    }
  });
  return saving;
}
export function syncSettingsView() {
  if (!state.settings) return;
  document.querySelectorAll('input[name="appearanceTheme"]').forEach(input => { input.checked = input.value === state.settings.theme; });
  $('autoLockRange').value = state.settings.vaultTimeout; $('autoLockLabel').textContent = `${state.settings.vaultTimeout} min`;
  $('clipboardRange').value = state.settings.clipboardTimeout; $('clipboardLabel').textContent = state.settings.clipboardTimeout ? `${state.settings.clipboardTimeout}s (best effort)` : 'Never';
  $('syncToggle').checked = state.settings.useSync;
  $('hibpCacheRange').value = state.settings.hibpCacheTtlHours; $('hibpCacheLabel').textContent = `${state.settings.hibpCacheTtlHours} hours`;
}
export function attachSettingsListeners() {
  document.querySelectorAll('input[name="appearanceTheme"]').forEach(input => input.addEventListener('change', () => {
    if (!input.checked) return;
    state.settings.theme = input.value; applyTheme(input.value); scheduleSettingsSave();
  }));
  for (const [id, key] of [['autoLockRange', 'vaultTimeout'], ['clipboardRange', 'clipboardTimeout'], ['hibpCacheRange', 'hibpCacheTtlHours']]) {
    $(id).addEventListener('input', () => { $(id === 'autoLockRange' ? 'autoLockLabel' : id === 'hibpCacheRange' ? 'hibpCacheLabel' : 'clipboardLabel').textContent = `${$(id).value}${id === 'autoLockRange' ? ' min' : id === 'hibpCacheRange' ? ' hours' : 's (best effort)'}`; });
    $(id).addEventListener('change', () => {
      const value = Number($(id).value);
      state.settings[key] = key === 'clipboardTimeout' && value > 0 ? Math.max(30, value) : value;
      scheduleSettingsSave(); syncSettingsView();
    });
  }
  $('resetSettings').addEventListener('click', async () => {
    if (!confirm('Reset preferences? Vault data and the current Sync mode are preserved.')) return;
    state.settings = { ...DEFAULT_SETTINGS, useSync: state.settings.useSync };
    await scheduleSettingsSave(); applyTheme(state.settings.theme); syncSettingsView();
    const { syncGeneratorControls } = await import('./generator.js'); syncGeneratorControls();
  });
}
