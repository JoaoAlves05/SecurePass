import { state } from '../state.js';
import { sendMessage } from './messaging.js';
import { showToast } from './toast.js';
import { applyTheme } from './theme.js';
import { DEFAULT_SETTINGS } from '../../src/settings.js';
import { requestOperation } from './operationDialog.js';
let saving = Promise.resolve(); let lastQueued; let sequence = 0;
const $ = id => document.getElementById(id);
function setSaveStatus(message, status = '') {
  $('settingsSaveStatus').textContent = message;
  $('settingsSaveStatus').dataset.state = status;
}
function updateRangeLabel(id, value) {
  const text = id === 'autoLockRange' ? `${value} ${value === 1 ? 'minute' : 'minutes'}`
    : value ? `${value} seconds` : 'Never';
  $(id === 'autoLockRange' ? 'autoLockLabel' : 'clipboardLabel').textContent = id === 'clipboardRange' && value ? `After ${text}` : text;
  $(id).setAttribute('aria-valuetext', text);
}
export function initialiseSettings(response) {
  state.settings = response.settings; state.settingsRevision = response.revision; lastQueued = structuredClone(response.settings);
}
export function scheduleSettingsSave() {
  const snapshot = structuredClone(state.settings); const patch = {};
  for (const key of Object.keys(DEFAULT_SETTINGS)) if (key !== 'useSync' && snapshot[key] !== lastQueued?.[key]) patch[key] = snapshot[key];
  lastQueued = snapshot; if (!Object.keys(patch).length) return saving;
  const ticket = ++sequence;
  setSaveStatus('Saving preferences…', 'saving');
  saving = saving.catch(() => {}).then(async () => {
    const current = await sendMessage('LOAD_SETTINGS');
    if (!current.ok) throw new Error(current.error);
    const response = await sendMessage('SAVE_SETTINGS', { patch, expectedRevision: current.revision });
    if (!response.ok) showToast(response.error, 'error');
    if (ticket === sequence) {
      const actual = response.ok ? response : await sendMessage('LOAD_SETTINGS');
      if (actual.ok) {
        initialiseSettings(actual); applyTheme(state.settings.theme); syncSettingsView();
        const { syncGeneratorControls } = await import('./generator.js'); syncGeneratorControls();
      }
      setSaveStatus(response.ok ? 'Preferences saved' : 'Could not save preferences. Please try again.', response.ok ? '' : 'error');
    }
  }).catch(error => {
    showToast(error.message, 'error');
    if (ticket === sequence) setSaveStatus('Could not save preferences. Please try again.', 'error');
  });
  return saving;
}
export function syncSettingsView() {
  if (!state.settings) return;
  document.querySelectorAll('input[name="appearanceTheme"]').forEach(input => { input.checked = input.value === state.settings.theme; });
  $('autoLockRange').value = state.settings.vaultTimeout; updateRangeLabel('autoLockRange', state.settings.vaultTimeout);
  $('clipboardRange').value = state.settings.clipboardTimeout; updateRangeLabel('clipboardRange', state.settings.clipboardTimeout);
  $('syncToggle').checked = state.settings.useSync;
}
export function attachSettingsListeners() {
  const refreshCache = async () => {
    const result = await sendMessage('HIBP_CACHE_STATUS');
    $('hibpCacheUsage').textContent = result.ok ? result.entries ? `${result.entries} cached ranges · ${result.bytes.toLocaleString()} bytes` : 'No cached checks' : 'Cache status unavailable';
    $('clearHibpCache').disabled = !result.ok || !result.entries;
  };
  $('clearHibpCache').addEventListener('click', async () => { const result = await sendMessage('HIBP_CLEAR_CACHE'); showToast(result.ok ? 'HIBP cache cleared.' : result.error, result.ok ? 'success' : 'error'); await refreshCache(); });
  refreshCache();
  document.addEventListener('settings-section-changed', event => { if (event.detail.id === 'advancedSection') refreshCache(); });
  document.addEventListener('management-refresh', refreshCache);
  document.querySelectorAll('input[name="appearanceTheme"]').forEach(input => input.addEventListener('change', () => {
    if (!input.checked) return;
    state.settings.theme = input.value; applyTheme(input.value); scheduleSettingsSave();
  }));
  for (const [id, key] of [['autoLockRange', 'vaultTimeout'], ['clipboardRange', 'clipboardTimeout']]) {
    $(id).addEventListener('input', () => {
      const value = Number($(id).value);
      updateRangeLabel(id, value);
    });
    $(id).addEventListener('change', () => {
      const value = Number($(id).value); state.settings[key] = key === 'clipboardTimeout' && value > 0 ? Math.max(30, value) : value;
      scheduleSettingsSave(); syncSettingsView();
    });
  }
  $('resetSettings').addEventListener('click', async () => {
    try {
      const result = await requestOperation({ title: 'Reset preferences', description: 'Restore appearance, generator and timeout defaults. Vault data, snapshots and the current Sync mode are preserved.', confirmLabel: 'Reset preferences' });
      if (!result) return;
      state.settings = { ...DEFAULT_SETTINGS, useSync: state.settings.useSync }; await scheduleSettingsSave();
    } catch (error) { showToast(error.message, 'error'); }
  });
}
