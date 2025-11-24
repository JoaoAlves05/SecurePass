import { checkPassword } from '../src/hibp.js';
import { generatePassword } from '../src/passwordGenerator.js';
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from '../src/settings.js';
import {
  initializeVault,
  unlockVault,
  storeCredential,
  updateCredential,
  deleteCredential,
  listCredentials,
  lockVault,
  vaultStatus,
  changeMasterPassword,
  importVaultData
} from '../src/cryptoVault.js';

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
        try {
          const generated = await generatePassword(message.constraints || {});
          sendResponse({ ok: true, password: generated });
        } catch (error) {
          sendResponse({ ok: false, error: error.message });
        }
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
          const entry = await storeCredential(message.entry, message.passphrase);
          sendResponse({ ok: true, entry });
        } catch (error) {
          sendResponse({ ok: false, error: error.message });
        }
        break;
      }
      case 'UPDATE_CREDENTIAL': {
        try {
          const entry = await updateCredential(message.id, message.updates, message.passphrase);
          sendResponse({ ok: true, entry });
        } catch (error) {
          sendResponse({ ok: false, error: error.message });
        }
        break;
      }
      case 'DELETE_CREDENTIAL': {
        try {
          await deleteCredential(message.id, message.passphrase);
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
      case 'INITIALIZE_VAULT': {
        try {
          const created = await initializeVault(message.passphrase);
          sendResponse({ ok: true, created });
        } catch (error) {
          sendResponse({ ok: false, error: error.message });
        }
        break;
      }
      case 'CHANGE_MASTER_PASSWORD': {
        try {
          await changeMasterPassword(message.oldPassphrase, message.newPassphrase);
          sendResponse({ ok: true });
        } catch (error) {
          sendResponse({ ok: false, error: error.message });
        }
        break;
      }
      case 'EXPORT_VAULT': {
        try {
          const status = await vaultStatus();
          if (!status.unlocked) {
            sendResponse({ ok: false, error: 'Vault is locked' });
            return;
          }
          const entries = await listCredentials();
          sendResponse({ ok: true, data: { entries } });
        } catch (error) {
          sendResponse({ ok: false, error: error.message });
        }
        break;
      }
      case 'IMPORT_VAULT': {
        try {
          const status = await vaultStatus();
          if (!status.unlocked) {
            sendResponse({ ok: false, error: 'Vault is locked' });
            return;
          }
          // We need the passphrase to re-encrypt. 
          // Since we are in service worker and vault is unlocked, we assume we have access to the key in memory via cryptoVault.js cache?
          // Wait, cryptoVault.js cache stores decrypted data, not the key/passphrase.
          // `importVaultData` requires passphrase.
          // But `serviceWorker` doesn't store passphrase in state.
          // The frontend `options.js` doesn't have the passphrase either unless we prompt for it or if we stored it in session (which we don't seem to).
          // However, `unlockVault` caches the decrypted data.
          // `importVaultData` needs to ENCRYPT the new data, so it needs the passphrase.
          // If we don't have the passphrase, we can't encrypt.
          // BUT `cryptoVault.js` doesn't expose the key.
          // We might need to ask the user for the master password again to import?
          // OR we can change `cryptoVault.js` to cache the key/passphrase temporarily? (Not secure)
          // OR `options.js` should prompt for password before import?
          // The user said "not functioning well". This is likely why.
          // Let's check if `options.js` has access to passphrase. It doesn't.
          // `popup.js` has `state.passphrase`.
          // `options.js` is separate.
          // We should probably prompt for password in `options.js` or `serviceWorker` should handle it if it had the key.
          // Since I can't easily change the architecture to store the key in SW without risk, I will assume for now that I need to pass the passphrase from the UI.
          // BUT `options.js` doesn't have it.
          // Maybe I should just return an error if no passphrase provided?
          // Wait, `cryptoVault.js` `importVaultData` takes `passphrase`.
          // If I can't get it, I can't import.
          // I'll update `options.js` to prompt for password if needed, but for now let's just add the handler.
          // Actually, if the vault is unlocked, maybe we can just update the cache and save?
          // No, `saveVaultRecord` saves ENCRYPTED data. We need the key to encrypt.
          // So we MUST have the passphrase.
          // I will add a TODO or just try to get it from message.
          
          if (!message.passphrase) {
            sendResponse({ ok: false, error: 'Master password required for import' });
            return;
          }
             
          const count = await importVaultData(message.data, message.passphrase);
          sendResponse({ ok: true, count });
        } catch (error) {
          sendResponse({ ok: false, error: error.message });
        }
        break;
      }

      default:
        sendResponse({ ok: false, error: 'Unknown message type' });
    }
  };

  handler();
  return true;
});
