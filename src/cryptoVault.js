// Public vault service. Only background handlers call mutations; UI and content use messages.
import { getStorage, setStorage, removeStorage, readLocalVaultRecordRaw, writeLocalVaultRecordRaw, readRecoveryRecords, recordRevision, snapshotId } from './utils/storage.js';
import { validateEntry, validateImportData, validateMaster, MAX_ENTRIES, MAX_VAULT_BYTES } from './validation.js';
import { createRecord, decryptRecord, decryptWithKey, encryptEntries, validateRecord } from './vault/crypto.js';
import { withVaultOperation as operation } from './vault/queue.js';
import { loadRecord, commitRecord, assertCurrent, getSyncStatus as readSyncStatus } from './vault/repository.js';
import * as session from './vault/session.js';
import { loadSettings } from './settings.js';
import { commitLocalRecovery } from './vault/recovery.js';


export const lockVault = session.revokeSession;
export const onVaultLock = session.observeLock;
export const vaultGeneration = session.generation;
export const assertVaultGeneration = session.assertGeneration;
export { getSyncStatus, changeSyncMode, resolveSyncGeneration, retrySync, compactSync, clearSyncArchive } from './vault/syncService.js';

export async function vaultStatus() {
  const record = await loadRecord();
  const sync = await readSyncStatus();
  return { initialized: Boolean(record), unlocked: record ? await session.sessionStatus(record) : false, revision: record?.revision, syncPending: Boolean((await loadSettings()).useSync && sync?.pending), syncError: sync?.error };
}

export function initializeVault(passphrase) {
  validateMaster(passphrase, true);
  return operation(async epoch => {
    if (await loadRecord()) return false;
    const { record, bytes } = await createRecord([], passphrase);
    session.assertGeneration(epoch);
    await commitRecord(record, null);
    await session.activate(record, [], bytes, epoch);
    return true;
  });
}

export function unlockVault(passphrase) {
  validateMaster(passphrase);
  return operation(async epoch => {
    const attempt = (await getStorage('session', 'unlockAttempts')).unlockAttempts || { count: 0, until: 0 };
    if (attempt.until > Date.now()) throw new Error('Too many attempts. Wait 30 seconds.');
    let record = await loadRecord();
    if (!record) throw new Error('Vault not initialized. Create it explicitly.');
    validateRecord(record);
    let decrypted;
    try { decrypted = await decryptRecord(record, passphrase); } catch {
      const count = attempt.count + 1;
      await setStorage('session', { unlockAttempts: { count: count >= 5 ? 0 : count, until: count >= 5 ? Date.now() + 30000 : 0 } });
      throw new Error('Invalid master password or corrupted vault.');
    }
    session.assertGeneration(epoch);
    if (decrypted.legacy) {
      const migrated = await createRecord(decrypted.entries, passphrase);
      session.assertGeneration(epoch);
      await commitRecord(migrated.record, recordRevision(record));
      record = migrated.record;
      decrypted.bytes = migrated.bytes;
    }
    await setStorage('session', { unlockAttempts: { count: 0, until: 0 } });
    await session.activate(record, decrypted.entries, decrypted.bytes, epoch);
    await removeStorage('local', ['securepassMeta', 'securepassTrustedDeviceKey']);
    return { entries: structuredClone(decrypted.entries) };
  });
}

export async function requireVault({ touch = false } = {}) {
  const record = await loadRecord();
  if (!record) throw new Error('Vault not initialized.');
  return session.current(record, { touch });
}

async function mutate(transform, epoch) {
  const state = await requireVault();
  await assertCurrent(state.record);
  session.assertGeneration(epoch);
  const entries = await transform(state.entries);
  if (entries.length > MAX_ENTRIES || new TextEncoder().encode(JSON.stringify({ entries })).length > MAX_VAULT_BYTES) throw new Error('Vault capacity reached (5,000 entries or 3 MB). Export a backup before reducing entries.');
  const record = await encryptEntries(state.record, entries, state.bytes);
  session.assertGeneration(epoch);
  await commitRecord(record, state.record.revision);
  await session.activate(record, entries, state.bytes, epoch);
  return entries;
}

function normalize(entry, existing) {
  const now = new Date().toISOString();
  return { username: '', notes: '', ...existing, ...validateEntry(entry, Boolean(existing)),
    id: existing?.id || entry.id || crypto.randomUUID(), createdAt: existing?.createdAt || entry.createdAt || now, updatedAt: now };
}

export function storeCredential(entry) {
  return operation(async epoch => {
    const normalized = normalize(entry);
    await mutate(entries => {
      if (entries.some(e => e.id === normalized.id)) throw new Error('Credential ID already exists.');
      return [...entries, normalized];
    }, epoch);
    return normalized;
  });
}

export function updateCredential(id, updates) {
  return operation(async epoch => {
    let updated;
    await mutate(entries => {
      const index = entries.findIndex(e => e.id === id);
      if (index < 0) throw new Error('Credential not found.');
      updated = normalize(updates, entries[index]);
      entries[index] = updated;
      return entries;
    }, epoch);
    return updated;
  });
}

export function deleteCredential(id) {
  return operation(epoch => mutate(entries => {
    if (!entries.some(e => e.id === id)) throw new Error('Credential not found.');
    return entries.filter(e => e.id !== id);
  }, epoch));
}

export function clearVaultEntries(passphrase, expectedRevision) {
  return operation(async epoch => {
    const state = await requireVault();
    if (expectedRevision !== undefined && state.record.revision !== expectedRevision) throw new Error('Vault changed. Review the deletion again.');
    await decryptRecord(state.record, validateMaster(passphrase));
    session.assertGeneration(epoch);
    await mutate(() => [], epoch);
  });
}

export function overwriteVaultEntries(entries) {
  return operation(epoch => mutate(() => validateImportData({ entries }).entries, epoch));
}

export function importVaultData(data, _passphrase, strategy = 'skip') {
  const incoming = validateImportData(data).entries;
  if (!['skip', 'replace'].includes(strategy)) throw new Error('Invalid import strategy.');
  return operation(async epoch => {
    let count = 0;
    await mutate(entries => {
      const byId = new Map(entries.map(e => [e.id, e]));
      for (const item of incoming) {
        const match = byId.get(item.id) || [...byId.values()].find(e => e.site === item.site && e.username === item.username);
        if (match && strategy === 'skip') continue;
        byId.set(match?.id || item.id, { ...item, id: match?.id || item.id });
        count++;
      }
      return [...byId.values()];
    }, epoch);
    return count;
  });
}

export async function listCredentials() {
  try { return (await requireVault()).entries; } catch (error) {
    if (error.message === 'Vault is locked') return [];
    throw error;
  }
}

export function keepAlive() {
  return operation(async () => { await requireVault({ touch: true }); return true; });
}

export function changeMasterPassword(oldPassphrase, newPassphrase) {
  validateMaster(newPassphrase, true);
  return operation(async epoch => {
    const state = await requireVault();
    await assertCurrent(state.record);
    await decryptRecord(state.record, validateMaster(oldPassphrase));
    const rotated = await createRecord(state.entries, newPassphrase, { vaultId: state.record.vaultId, parents: [state.record.revision, ...state.record.parents] });
    session.assertGeneration(epoch);
    await commitRecord(rotated.record, state.record.revision);
    await removeStorage('local', ['securepassBiometric', 'securepassTrustedDeviceKey']);
    await session.activate(rotated.record, state.entries, rotated.bytes, epoch);
  });
}

export function unlockWithBiometricKey(bytes, vaultId, keyEpoch, expectedEpoch, credentialId) {
  return operation(async epoch => {
    session.assertGeneration(expectedEpoch);
    const config = (await getStorage('local', 'securepassBiometric')).securepassBiometric;
    if (config?.version !== 2 || config.credentialId !== credentialId || config.keyEpoch !== keyEpoch || config.vaultId !== vaultId) throw new Error('Biometric setup was revoked.');
    const record = await loadRecord();
    if (record?.vaultId !== vaultId || record.keyEpoch !== keyEpoch) throw new Error('Biometric setup was revoked. Use the master password.');
    const entries = await decryptWithKey(record, bytes);
    await session.activate(record, entries, bytes, epoch);
  });
}

export async function recoveryStatus() {
  return Promise.all((await readRecoveryRecords()).map(async (record, index) => ({ index, id: await snapshotId(record), revision: record.revision, updatedAt: record.updatedAt, legacy: !record.version })));
}

export function restoreRecovery(identity, passphrase, expectedRevision) {
  return operation(async epoch => {
    const records = await readRecoveryRecords();
    // Numeric legacy callers remain supported; the UI exclusively uses stable IDs.
    const record = Number.isInteger(identity) ? records[identity] : (await Promise.all(records.map(async record => ({ record, id: await snapshotId(record) })))).find(item => item.id === identity)?.record;
    if (!record) throw new Error('Recovery snapshot not found. Refresh and select again.');
    const recovered = await decryptRecord(record, validateMaster(passphrase));
    const current = await readLocalVaultRecordRaw();
    if (expectedRevision !== undefined && recordRevision(current) !== expectedRevision) throw new Error('Vault changed. Review the restore again.');
    if (current) await session.current(current);
    const next = await createRecord(recovered.entries, passphrase, { vaultId: record.vaultId });
    await commitLocalRecovery(next, recovered.entries, current, epoch);
  });
}
