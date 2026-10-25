import { getStorage, setStorage } from './utils/storage.js';
import { withOperationLock } from './operationQueue.js';

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

export async function loadSettingsState() {
  const local = await getStorage('local', ['settings', 'settingsSync', 'settingsRevision', 'localRestorePending']);
  let stored = local.settings && typeof local.settings === 'object' ? local.settings : {};
  if (local.settingsSync?.useSync && !stored.migratedSettings) {
    const remote = await getStorage('sync', 'settings');
    stored = { ...stored, ...(remote.settings || {}), useSync: true };
  }
  const repaired = [];
  const settings = { ...DEFAULT_SETTINGS };
  for (const key of Object.keys(settings)) {
    if (stored[key] === undefined) continue;
    try { settings[key] = validateSettings({ ...DEFAULT_SETTINGS, [key]: stored[key] })[key]; }
    catch { repaired.push(key); }
  }
  if (![settings.includeUppercase, settings.includeLowercase, settings.includeNumbers, settings.includeSymbols].some(Boolean)) {
    settings.includeLowercase = true; repaired.push('character sets');
  }
  // A failed local restore can never accidentally publish its historical state.
  if (local.localRestorePending) settings.useSync = false;
  return { settings, revision: local.settingsRevision || 0, repaired, restorePending: Boolean(local.localRestorePending) };
}
export async function loadSettings() { return (await loadSettingsState()).settings; }

async function writeSettings(input, allowSyncChange, expectedRevision) {
  const current = await loadSettingsState();
  if (expectedRevision !== undefined && expectedRevision !== current.revision) throw new Error('Preferences changed in another window. Review and try again.');
  const settings = validateSettings(input);
  if (!allowSyncChange && settings.useSync !== current.settings.useSync) throw new Error('Use the Sync transition to change vault storage.');
  await setStorage('local', { settings: { ...settings, migratedSettings: true }, settingsSync: { useSync: false }, settingsRevision: current.revision + 1 });
  return settings;
}
export function saveSettings(input, { allowSyncChange = false } = {}) {
  // Mode transitions already hold the shared operation lock.
  return allowSyncChange ? writeSettings(input, true) : withOperationLock(() => writeSettings(input, false));
}
export function patchSettings(patch, expectedRevision) {
  return withOperationLock(async () => {
    if (!patch || typeof patch !== 'object' || Array.isArray(patch) || Object.keys(patch).some(key => key === 'useSync' || !Object.hasOwn(DEFAULT_SETTINGS, key))) throw new Error('Invalid preference change.');
    const current = await loadSettingsState();
    await writeSettings({ ...current.settings, ...patch }, false, expectedRevision);
    return loadSettingsState();
  });
}
