import { VAULT_KEY, CHUNK_SIZE, SECUREPASS_DB_NAME, DB_VERSION, DB_STORE_NAME } from '../constants.js';

function handleRuntimeError(reject) {
  const err = chrome.runtime?.lastError;
  if (err) {
    reject(new Error(err.message));
    return true;
  }
  return false;
}

export function getStorage(area = 'local', keys = null) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage[area].get(keys, items => {
        if (!handleRuntimeError(reject)) resolve(items);
      });
    } catch (e) {
      reject(e);
    }
  });
}

export function setStorage(area = 'local', items) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage[area].set(items, () => {
        if (!handleRuntimeError(reject)) resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
}

export function removeStorage(area = 'local', keys) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage[area].remove(keys, () => {
        if (!handleRuntimeError(reject)) resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
}

export function clearStorage(area = 'local') {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage[area].clear(() => {
        if (!handleRuntimeError(reject)) resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
}

export function onStorageChanged(listener) {
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}

export function deleteIndexedDb(name) {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.deleteDatabase(name);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error || new Error(`Failed to delete ${name}`));
      request.onblocked = () => reject(new Error(`Unable to delete ${name} because it is still open.`));
    } catch (e) {
      reject(e);
    }
  });
}

export function getDB() {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(SECUREPASS_DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(DB_STORE_NAME)) {
          db.createObjectStore(DB_STORE_NAME);
        }
      };
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = () => reject(request.error);
    } catch (e) {
      reject(e);
    }
  });
}

export const recordRevision = record => record?.revision || record?.ciphertext || null;

export async function readLocalVaultRecordRaw() {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE_NAME, 'readonly');
    let result;
    const request = tx.objectStore(DB_STORE_NAME).get(VAULT_KEY);
    request.onsuccess = () => { result = request.result || null; };
    tx.oncomplete = () => { db.close(); resolve(result); };
    tx.onerror = tx.onabort = () => { db.close(); reject(tx.error || new Error('Vault read aborted.')); };
  });
}

export async function writeLocalVaultRecordRaw(record, expectedRevision) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE_NAME, 'readwrite');
    const store = tx.objectStore(DB_STORE_NAME);
    let failure;
    const request = store.get(VAULT_KEY);
    request.onsuccess = () => {
      const previous = request.result || null;
      if (expectedRevision !== undefined && recordRevision(previous) !== expectedRevision) {
        failure = new Error('Vault changed in another context. Unlock again.');
        tx.abort();
        return;
      }
      if (previous) {
        const recovery = store.get('recovery');
        recovery.onsuccess = () => store.put([previous, ...(recovery.result || [])].slice(0, 5), 'recovery');
      }
      store.put(record, VAULT_KEY);
    };
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = tx.onabort = () => { db.close(); reject(failure || tx.error || new Error('Vault write aborted.')); };
  });
}

export async function readRecoveryRecords() {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE_NAME, 'readonly');
    const request = tx.objectStore(DB_STORE_NAME).get('recovery');
    tx.oncomplete = () => { db.close(); resolve(request.result || []); };
    tx.onerror = tx.onabort = () => { db.close(); reject(tx.error || new Error('Recovery read failed.')); };
  });
}

// Read-only migration support for the original unversioned Sync layout.
export async function readLegacySyncRecord() {
  const items = await getStorage('sync', null);
  const manifest = items[`${VAULT_KEY}_manifest`];
  if (!manifest) return null;
  if (!Number.isInteger(manifest.chunks) || manifest.chunks < 1 || manifest.chunks > 100) throw new Error('Invalid legacy Sync manifest.');
  let json = '';
  for (let i = 0; i < manifest.chunks; i++) {
    const part = items[`${VAULT_KEY}_chunk_${i}`];
    if (typeof part !== 'string') throw new Error('Sync is incomplete. Retry after synchronization; do not create a new vault.');
    json += part;
  }
  return JSON.parse(json);
}
