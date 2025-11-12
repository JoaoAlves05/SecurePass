import { getStorage, setStorage } from './storage.js';
import { loadSettings } from './settings.js';

const VAULT_KEY = 'securepassVault';
const ITERATIONS = 100000;
const ENCODER = new TextEncoder();
const DECODER = new TextDecoder();
let cache = { data: null, timeout: null };

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
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(base64ToBuffer(iv)) }, key, base64ToBuffer(ciphertext));
  return JSON.parse(DECODER.decode(decrypted));
}

async function loadVaultRecord() {
  const stored = await getStorage('local', [VAULT_KEY]);
  return stored[VAULT_KEY] || null;
}

async function saveVaultRecord(record) {
  await setStorage('local', { [VAULT_KEY]: record });
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
  return true;
}

export async function unlockVault(passphrase, timeoutMinutes = 15) {
  const record = await loadVaultRecord();
  if (!record) {
    await initializeVault(passphrase);
    return cache.data;
  }
  const data = await decryptData(record, passphrase);
  cache.data = data;
  if (cache.timeout) clearTimeout(cache.timeout);
  cache.timeout = setTimeout(() => {
    cache.data = null;
  }, timeoutMinutes * 60 * 1000);
  return data;
}

export function lockVault() {
  if (cache.timeout) clearTimeout(cache.timeout);
  cache.data = null;
}

export async function storeCredential(entry, passphrase) {
  const settings = await loadSettings();
  const timeout = settings.vaultTimeout || 15;
  if (!cache.data) {
    await unlockVault(passphrase, timeout);
  }
  const data = cache.data || { entries: [] };
  data.entries.push({ ...entry, createdAt: new Date().toISOString() });
  const record = await encryptData(data, passphrase);
  await saveVaultRecord(record);
  cache.data = data;
}

export async function listCredentials() {
  return cache.data ? cache.data.entries : [];
}
