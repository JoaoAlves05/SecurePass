import { getStorage, setStorage, removeStorage } from '../utils/storage.js';
import { decodeBytes, encodeKey, decryptWithKey } from './crypto.js';
import { loadSettings } from '../settings.js';

const KEY = 'vaultSessionV2';
let epoch = 0;
let memory = null;
let writes = Promise.resolve();
let onLock = () => {};
export const generation = () => epoch;
export function assertGeneration(value) {
  if (value !== epoch) throw new Error('Operation cancelled because the vault was locked.');
}
export function observeLock(callback) { onLock = callback; }
function schedule(task) {
  const next = writes.then(task, task);
  writes = next.catch(() => {});
  return next;
}

export async function revokeSession() {
  epoch++;
  if (memory?.bytes) memory.bytes.fill(0);
  memory = null;
  const notification = onLock();
  await schedule(async () => {
    await removeStorage('session', [KEY, 'biometricSessionPassphrase', 'vaultLastActivity', 'vaultTimeoutMinutes']);
    await setStorage('session', { vaultRevocation: crypto.randomUUID() });
  });
  await chrome.alarms.clear('vaultAutoLock');
  await notification;
}

export async function activate(record, entries, keyBytes, expected, timeout) {
  assertGeneration(expected);
  const minutes = timeout || (await loadSettings()).vaultTimeout;
  const lastActivity = Date.now();
  const deadline = lastActivity + minutes * 60000;
  const bytes = new Uint8Array(keyBytes);
  await schedule(async () => {
    assertGeneration(expected);
    await setStorage('session', { [KEY]: { revision: record.revision, keyEpoch: record.keyEpoch, key: encodeKey(bytes), deadline, lastActivity, timeoutMinutes: minutes } });
    assertGeneration(expected);
    memory = { record, entries: structuredClone(entries), bytes, deadline };
  });
  assertGeneration(expected);
  await chrome.alarms.create('vaultAutoLock', { when: deadline });
  chrome.idle.setDetectionInterval(minutes * 60);
}

export async function current(record, { touch = false } = {}) {
  const expected = generation();
  const stored = (await getStorage('session', KEY))[KEY];
  assertGeneration(expected);
  if (!stored || stored.revision !== record?.revision || stored.keyEpoch !== record?.keyEpoch || stored.deadline <= Date.now()) {
    if (stored || memory) await revokeSession();
    throw new Error('Vault is locked');
  }
  if (!memory || memory.record.revision !== record?.revision) {
    const bytes = decodeBytes(stored.key, 32);
    const entries = await decryptWithKey(record, bytes);
    assertGeneration(expected);
    memory = { record, entries, bytes, deadline: stored.deadline };
  }
  if (stored.deadline <= Date.now()) { await revokeSession(); throw new Error('Vault is locked'); }
  assertGeneration(expected);
  const snapshot = { record, entries: structuredClone(memory.entries), bytes: new Uint8Array(memory.bytes), epoch: expected };
  if (touch) await activate(record, snapshot.entries, snapshot.bytes, expected);
  return snapshot;
}

export async function sessionStatus(record) {
  try { await current(record); return true; } catch (error) {
    if (error.message === 'Vault is locked' || error.message.startsWith('Operation cancelled')) return false;
    throw error;
  }
}

export async function reconfigureTimeout(minutes, previousMinutes = 15) {
  const expected = generation();
  await schedule(async () => {
    const stored = (await getStorage('session', KEY))[KEY];
    if (!stored) return;
    assertGeneration(expected);
    const lastActivity = stored.lastActivity || stored.deadline - (stored.timeoutMinutes || previousMinutes) * 60000;
    const deadline = lastActivity + minutes * 60000;
    await setStorage('session', { [KEY]: { ...stored, lastActivity, timeoutMinutes: minutes, deadline } });
    if (memory) memory.deadline = deadline;
    await chrome.alarms.create('vaultAutoLock', { when: deadline });
    chrome.idle.setDetectionInterval(minutes * 60);
  });
  const stored = (await getStorage('session', KEY))[KEY];
  if (stored && stored.deadline <= Date.now()) await revokeSession();
}
