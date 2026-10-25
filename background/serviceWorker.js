import { authorizeMessage } from '../src/security/messages.js';
import { extensionPage } from '../src/security/origins.js';
import { vaultHandlers } from '../src/messageHandlers/vaultHandlers.js';
import { biometricHandlers } from '../src/messageHandlers/biometricHandlers.js';
import { utilHandlers } from '../src/messageHandlers/utilHandlers.js';
import { lockVault, onVaultLock, vaultStatus } from '../src/cryptoVault.js';
import { clearRequests, expireRequests } from '../src/autofill/requests.js';
import { clearCandidates, listCandidates } from '../src/autofill/candidates.js';
import { cancelCeremonies, expireCeremonies } from '../src/biometric/service.js';
import { retryPendingSync } from '../src/vault/retry.js';
import { removeStorage } from '../src/utils/storage.js';

const handlers = new Map([...vaultHandlers, ...biometricHandlers, ...utilHandlers]);
// Set access levels before processing even the first request after a worker restart.
const ready = Promise.all(['local', 'sync', 'session'].map(area => chrome.storage[area].setAccessLevel({ accessLevel: 'TRUSTED_CONTEXTS' })))
  .then(() => Promise.all([removeStorage('session', 'biometricSessionPassphrase'), removeStorage('local', 'securepassTrustedDeviceKey')]));

ready.then(async () => {
  await chrome.alarms.create('syncOutboxRetry', { periodInMinutes: 1 });
  await retryPendingSync();
}).catch(() => {});

chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (message?.target === 'offscreen') return; // Only the offscreen document responds to its protocol.
  if (message?.type === 'VAULT_LOCKED') return;
  const run = async () => {
    await ready;
    authorizeMessage(message, sender);
    const handler = handlers.get(message.type);
    if (!handler) throw new Error('Unknown message type.');
    // Trusted auth pages may unlock, but must not receive the full vault in that response.
    const result = await handler(message, sender);
    if (message.type === 'SAVE_SETTINGS') {
      chrome.tabs.query({}).then(tabs => Promise.allSettled(tabs.map(tab => chrome.tabs.sendMessage(tab.id, { type: 'SETTINGS_CHANGED' })))).catch(() => {});
    }
    if (extensionPage(sender, ['/auth/auth.html']) && message.type === 'UNLOCK_VAULT') return { ok: true };
    return { ok: true, ...result };
  };
  run().then(respond, error => respond({ ok: false, error: error?.message || 'Operation failed.' }));
  return true;
});

onVaultLock(() => {
  const cleanup = Promise.all([removeStorage('session', 'backupPreview'), clearRequests(), cancelCeremonies(), clearCandidates()]);
  chrome.runtime.sendMessage({ type: 'VAULT_LOCKED' }).catch(() => {});
  chrome.tabs.query({}).then(tabs => Promise.allSettled(tabs.map(tab => chrome.tabs.sendMessage(tab.id, { type: 'VAULT_LOCKED' })))).catch(() => {});
  return cleanup;
});
chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'syncOutboxRetry') retryPendingSync().catch(() => {});
  if (alarm.name === 'authRequestCleanup') expireRequests().catch(() => {});
  if (alarm.name === 'webauthnCleanup') expireCeremonies().catch(() => {});
  if (alarm.name === 'candidateCleanup') listCandidates().catch(() => {});
  if (alarm.name === 'vaultAutoLock') vaultStatus().then(status => { if (!status.unlocked) return lockVault(); }).catch(() => lockVault());
});
chrome.idle.onStateChanged.addListener(state => { if (state === 'locked') lockVault().catch(() => {}); });
chrome.windows.onRemoved.addListener(async () => {
  if (!(await chrome.windows.getAll()).length) await lockVault();
});
