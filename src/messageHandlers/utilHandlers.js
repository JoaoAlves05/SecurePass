import { checkPassword, clearHibpCache, hibpCacheStatus } from '../hibp.js';
import { generatePassword } from '../passwordGenerator.js';
import { loadSettings, saveSettings, loadSettingsState, patchSettings } from '../settings.js';
import { validateString, validateConstraints } from '../validation.js';
import * as vault from '../cryptoVault.js';
import * as requests from '../autofill/requests.js';
import * as candidates from '../autofill/candidates.js';
import { copyInBackground } from '../clipboard/service.js';

import { reconfigureTimeout } from '../vault/session.js';

export const utilHandlers = new Map([
  ['PROPOSE_CREDENTIAL', candidates.proposeCandidate],
  ['LIST_SAVE_CANDIDATES', candidates.listCandidates],
  ['REVIEW_SAVE_CANDIDATE', candidates.reviewCandidate],
  ['DISMISS_SAVE_CANDIDATE', candidates.dismissCandidate],
  ['LOAD_SETTINGS', loadSettingsState],
  ['PUBLIC_SETTINGS', async () => { const s = await loadSettings(); return { settings: { theme: s.theme, clipboardTimeout: s.clipboardTimeout } }; }],
  ['SAVE_SETTINGS', async m => {
    const old = await loadSettings();
    const result = m.patch ? await patchSettings(m.patch, m.expectedRevision) : { settings: await saveSettings(m.settings) };
    if (old.vaultTimeout !== result.settings.vaultTimeout) await reconfigureTimeout(result.settings.vaultTimeout, old.vaultTimeout);
    return { ...await loadSettingsState() };
  }],
  ['GENERATE_PASSWORD', async m => ({ password: await generatePassword(validateConstraints(m.constraints)) })],
  ['HIBP_CACHE_STATUS', hibpCacheStatus],
  ['HIBP_CLEAR_CACHE', async () => { await clearHibpCache(); return {}; }],
  ['HIBP_CHECK', async m => ({ result: await checkPassword(validateString(m.password, 1024, 'password', true)) })],
  ['SET_SYNC_MODE_SAFE', async m => {
    if (typeof m.targetUseSync !== 'boolean') throw new Error('Invalid Sync mode.');
    return { ...await vault.changeSyncMode(m.targetUseSync, m.strategy, m.passphrase, { revision: m.revision, expectedRevision: m.expectedRevision }), settings: await loadSettings() };
  }],
  ['SYNC_STATUS', async m => ({ status: await vault.getSyncStatus({ inspectRemote: m.inspectRemote === true }) })],
  ['SYNC_RETRY', async () => { await vault.retrySync(); return {}; }],
  ['SYNC_RESOLVE', async m => { return vault.resolveSyncGeneration(m.revision, m.passphrase, Boolean(m.merge), m.expectedRevision); }],
  ['SYNC_COMPACT', vault.compactSync],
  ['SYNC_CLEAR_ARCHIVE', async m => { await vault.clearSyncArchive(m.passphrase); return {}; }],
  ['LIST_SITE_CREDENTIALS', requests.listForOrigin],
  ['REQUEST_AUTOFILL', requests.createRequest],
  ['PROMPT_SAVE_CREDENTIAL', (m, s) => requests.createRequest(m, s, 'save')],
  ['AUTH_REQUEST_DETAILS', requests.requestDetails],
  ['AUTH_REQUEST_COMPLETE', requests.completeRequest],
  ['AUTH_REQUEST_CANCEL', requests.cancelRequest],
  ['COPY_PASSWORD', async m => { await copyInBackground(validateString(m.value, 1024, 'password', true)); return {}; }],
  ['COPY_INLINE_PASSWORD', async m => { await copyInBackground(validateString(m.value, 1024, 'password', true)); return {}; }]
]);
