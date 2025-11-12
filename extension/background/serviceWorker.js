import { checkPassword } from '../src/hibp.js';
import { generatePassword } from '../src/passwordGenerator.js';
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from '../src/settings.js';
import { initializeVault, unlockVault, storeCredential, listCredentials, lockVault, vaultStatus } from '../src/cryptoVault.js';

chrome.runtime.onInstalled.addListener(async () => {
  const settings = await loadSettings();
  await saveSettings({ ...DEFAULT_SETTINGS, ...settings });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const handler = async () => {
    switch (message.type) {
      case 'HIBP_CHECK': {
        try {
          const result = await checkPassword(message.password);
          sendResponse({ ok: true, result });
        } catch (error) {
          sendResponse({ ok: false, error: error.message });
        }
        break;
      }
      case 'GENERATE_PASSWORD': {
        const generated = await generatePassword(message.constraints || {});
        sendResponse({ ok: true, password: generated });
        break;
      }
      case 'LOAD_SETTINGS': {
        const settings = await loadSettings();
        sendResponse({ ok: true, settings });
        break;
      }
      case 'SAVE_SETTINGS': {
        await saveSettings(message.settings);
        sendResponse({ ok: true });
        break;
      }
      case 'UNLOCK_VAULT': {
        try {
          await initializeVault(message.passphrase);
          const data = await unlockVault(message.passphrase, message.timeoutMinutes);
          sendResponse({ ok: true, data });
        } catch (error) {
          sendResponse({ ok: false, error: error.message });
        }
        break;
      }
      case 'STORE_CREDENTIAL': {
        try {
          await storeCredential(message.entry, message.passphrase);
          sendResponse({ ok: true });
        } catch (error) {
          sendResponse({ ok: false, error: error.message });
        }
        break;
      }
      case 'LIST_CREDENTIALS': {
        const status = await vaultStatus();
        const entries = await listCredentials();
        sendResponse({ ok: true, entries, unlocked: status.unlocked });
        break;
      }
      case 'LOCK_VAULT': {
        lockVault();
        sendResponse({ ok: true });
        break;
      }
      case 'VAULT_STATUS': {
        const status = await vaultStatus();
        sendResponse({ ok: true, status });
        break;
      }
      default:
        sendResponse({ ok: false, error: 'Unknown message type' });
    }
  };

  handler();
  return true;
});
