import { getStorage, setStorage } from './utils/storage.js';

export const DEFAULT_SETTINGS = Object.freeze({
  theme: 'system', minLength: 16, includeUppercase: true, includeLowercase: true,
  includeNumbers: true, includeSymbols: true, avoidSimilar: true,
  vaultTimeout: 15, clipboardTimeout: 30, hibpCacheTtlHours: 24, useSync: false
});

export function validateSettings(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid settings.');
  const result = { ...DEFAULT_SETTINGS };
  for (const key of Object.keys(result)) if (input[key] !== undefined) result[key] = input[key];
  if (!['system', 'light', 'dark'].includes(result.theme)) throw new Error('Invalid theme.');
  for (const [key, min, max] of [['minLength', 6, 128], ['vaultTimeout', 1, 60], ['clipboardTimeout', 0, 120], ['hibpCacheTtlHours', 1, 168]]) {
    if (!Number.isInteger(result[key]) || result[key] < min || result[key] > max) throw new Error(`Invalid ${key}.`);
  }
  for (const key of ['includeUppercase', 'includeLowercase', 'includeNumbers', 'includeSymbols', 'avoidSimilar', 'useSync']) {
    if (typeof result[key] !== 'boolean') throw new Error(`Invalid ${key}.`);
  }
  if (![result.includeUppercase, result.includeLowercase, result.includeNumbers, result.includeSymbols].some(Boolean)) throw new Error('Select at least one character set.');
  if (result.clipboardTimeout > 0 && result.clipboardTimeout < 30) result.clipboardTimeout = 30;
  return result;
}

export async function loadSettings() {
  const local = await getStorage('local', ['settings', 'settingsSync']);
  let stored = local.settings || {};
  if (local.settingsSync?.useSync && !stored.migratedSettings) {
    const remote = await getStorage('sync', 'settings');
    stored = { ...stored, ...(remote.settings || {}), useSync: true };
  }
  return validateSettings(stored);
}

export async function saveSettings(input, { allowSyncChange = false } = {}) {
  const current = await loadSettings();
  const settings = validateSettings(input);
  if (!allowSyncChange && settings.useSync !== current.useSync) throw new Error('Use the Sync transition to change vault storage.');
  await setStorage('local', { settings: { ...settings, migratedSettings: true }, settingsSync: { useSync: false } });
  return settings;
}
