import { getStorage, setStorage } from './storage.js';
import { loadSettings } from './settings.js';

const VAULT_KEY = 'securepassVault';
const ITERATIONS = 100000;
const ENCODER = new TextEncoder();
const DECODER = new TextDecoder();
const STORAGE_PREFERENCE = ['sync', 'local'];

let cache = {
  data: null,
  timeout: null,
  timeoutMinutes: 15
};

function bufferToBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function deriveKey(passphrase, salt, iterations = ITERATIONS) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    ENCODER.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptData(data, passphrase) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt.buffer);
  const encoded = ENCODER.encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  return {
    salt: bufferToBase64(salt.buffer),
    iv: bufferToBase64(iv.buffer),
    ciphertext: bufferToBase64(ciphertext),
    iterations: ITERATIONS
  };
}

async function decryptData(record, passphrase) {
  const { salt, iv, ciphertext, iterations } = record;
  const key = await deriveKey(passphrase, base64ToBuffer(salt), iterations);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(base64ToBuffer(iv)) },
    key,
    base64ToBuffer(ciphertext)
  );
  return JSON.parse(DECODER.decode(decrypted));
}

async function loadVaultRecord() {
  for (const area of STORAGE_PREFERENCE) {
    try {
      const stored = await getStorage(area, [VAULT_KEY]);
      if (stored && stored[VAULT_KEY]) {
        if (area === 'local') {
          try {
            await setStorage('sync', { [VAULT_KEY]: stored[VAULT_KEY] });
          } catch (error) {
            // ignore sync errors, keep local copy as fallback
          }
        }
        return stored[VAULT_KEY];
      }
    } catch (error) {
      if (area === 'local') {
        throw error;
      }
    }
  }
  return null;
}

async function saveVaultRecord(record) {
  let savedToSync = false;
  try {
    await setStorage('sync', { [VAULT_KEY]: record });
    savedToSync = true;
  } catch (error) {
    // continue with local fallback
  }

  try {
    await setStorage('local', { [VAULT_KEY]: record });
  } catch (error) {
    if (!savedToSync) {
      throw error;
    }
  }
}

function resetTimeout(timeoutMinutes) {
  if (cache.timeout) clearTimeout(cache.timeout);
  cache.timeoutMinutes = timeoutMinutes;
  cache.timeout = setTimeout(() => {
    cache.data = null;
    cache.timeout = null;
  }, timeoutMinutes * 60 * 1000);
}

async function ensureUnlocked(passphrase, timeoutMinutes) {
  if (!cache.data) {
    await unlockVault(passphrase, timeoutMinutes || cache.timeoutMinutes || 15);
  } else if (timeoutMinutes) {
    resetTimeout(timeoutMinutes);
  }
  return cache.data;
}

function normalizeEntry(partial, existing) {
  const now = new Date().toISOString();
  const password = partial.password || existing?.password;
  if (!password) {
    throw new Error('Password is required');
  }

  return {
    id: partial.id || existing?.id || crypto.randomUUID(),
    site: (partial.site ?? existing?.site ?? '').trim(),
    username: (partial.username ?? existing?.username ?? '').trim(),
    notes: (partial.notes ?? existing?.notes ?? '').trim(),
    password,
    createdAt: existing?.createdAt || partial.createdAt || now,
    updatedAt: now
  };
}

async function writeVault(data, passphrase) {
  const record = await encryptData(data, passphrase);
  await saveVaultRecord(record);
  cache.data = data;
}

export async function vaultStatus() {
  const record = await loadVaultRecord();
  return {
    initialized: Boolean(record),
    unlocked: Boolean(cache.data)
  };
}

export async function initializeVault(passphrase) {
  const record = await loadVaultRecord();
  if (record) return false;
  const payload = await encryptData({ entries: [] }, passphrase);
  await saveVaultRecord(payload);
  cache.data = { entries: [] };
  const settings = await loadSettings();
  resetTimeout(settings.vaultTimeout || 15);
  return true;
}

export async function unlockVault(passphrase, timeoutMinutes = 15) {
  const record = await loadVaultRecord();
  if (!record) {
    await initializeVault(passphrase);
    return cache.data;
  }
  let data;
  try {
    data = await decryptData(record, passphrase);
  } catch (error) {
    throw new Error('Invalid master password');
  }
  cache.data = data;
  resetTimeout(timeoutMinutes);
  return data;
}

export function lockVault() {
  if (cache.timeout) clearTimeout(cache.timeout);
  cache.timeout = null;
  cache.data = null;
}

export async function storeCredential(entry, passphrase) {
  const settings = await loadSettings();
  const timeout = settings.vaultTimeout || cache.timeoutMinutes || 15;
  const data = await ensureUnlocked(passphrase, timeout);
  const normalized = normalizeEntry(entry);
  data.entries = data.entries || [];
  data.entries.push(normalized);
  await writeVault(data, passphrase);
  resetTimeout(timeout);
  return normalized;
}

export async function updateCredential(id, updates, passphrase) {
  if (!id) throw new Error('Missing credential id');
  const settings = await loadSettings();
  const timeout = settings.vaultTimeout || cache.timeoutMinutes || 15;
  const data = await ensureUnlocked(passphrase, timeout);
  data.entries = data.entries || [];
  const index = data.entries.findIndex(item => item.id === id);
  if (index === -1) {
    throw new Error('Credential not found');
  }
  const updated = normalizeEntry({ ...updates, id }, data.entries[index]);
  data.entries[index] = updated;
  await writeVault(data, passphrase);
  resetTimeout(timeout);
  return updated;
}

export async function deleteCredential(id, passphrase) {
  if (!id) throw new Error('Missing credential id');
  const settings = await loadSettings();
  const timeout = settings.vaultTimeout || cache.timeoutMinutes || 15;
  const data = await ensureUnlocked(passphrase, timeout);
  data.entries = data.entries || [];
  const index = data.entries.findIndex(item => item.id === id);
  if (index === -1) {
    throw new Error('Credential not found');
  }
  data.entries.splice(index, 1);
  await writeVault(data, passphrase);
  resetTimeout(timeout);
}

export async function changeMasterPassword(oldPassphrase, newPassphrase) {
  if (!newPassphrase) {
    throw new Error('New master password required');
  }
  const record = await loadVaultRecord();
  if (!record) {
    throw new Error('Vault not initialized');
  }
  let data;
  try {
    data = await decryptData(record, oldPassphrase);
  } catch (error) {
    throw new Error('Invalid current master password');
  }
  const newRecord = await encryptData(data, newPassphrase);
  await saveVaultRecord(newRecord);
  cache.data = data;
  const settings = await loadSettings();
  resetTimeout(settings.vaultTimeout || cache.timeoutMinutes || 15);
}

export async function listCredentials() {
  return cache.data ? [...(cache.data.entries || [])] : [];
}
