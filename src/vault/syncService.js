import { getStorage, setStorage, removeStorage, readLocalVaultRecordRaw, writeLocalVaultRecordRaw, recordRevision } from '../utils/storage.js';
import { loadSettings, saveSettings } from '../settings.js';
import { loadRecord, getSyncStatus, assertCurrent, commitRecord, publishLocalRecord } from './repository.js';
import { syncHeads } from './sync.js';
import { createRecord, decryptRecord, encryptEntries } from './crypto.js';
import { withVaultOperation as operation } from './queue.js';
import * as session from './session.js';
import { validateMaster } from '../validation.js';

const lockVault = session.revokeSession;
async function requireVault() { return session.current(await loadRecord()); }
export { getSyncStatus };

export function changeSyncMode(target, strategy, passphrase, options = {}) {
  return operation(async epoch => {
    if (!target) {
      await saveSettings({ ...(await loadSettings()), useSync: false }, { allowSyncChange: true });
      await lockVault();
      return { requiresResolution: false };
    }
    const local = await readLocalVaultRecordRaw();
    if (options.expectedRevision !== undefined && recordRevision(local) !== options.expectedRevision) throw new Error('Local vault changed. Review the storage choice again.');
    const heads = await syncHeads();
    const divergent = heads.filter(r => recordRevision(r) !== recordRevision(local) && !local?.parents?.includes(r.revision));
    if (local && divergent.length && !strategy) return { requiresResolution: true };
    if (strategy && !['keep-local', 'use-sync'].includes(strategy)) throw new Error('Invalid Sync resolution.');
    if (strategy === 'use-sync' || (!local && heads.length)) {
      if (heads.length !== 1) throw new Error('Choose a specific Sync generation in the recovery panel.');
      if (options.revision && (heads[0].revision || 'legacy') !== options.revision) throw new Error('Remote version changed. Refresh and choose again.');
      if (!passphrase) throw new Error('Enter the master password for the selected remote vault first.');
      await decryptRecord(heads[0], validateMaster(passphrase));
      session.assertGeneration(epoch);
      await writeLocalVaultRecordRaw(heads[0], recordRevision(local));
    } else if (local) {
      const state = await requireVault();
      if (heads.some(r => !r.version)) throw new Error('Legacy remote vault: download and unlock it before merging.');
      const parents = [...new Set([local.revision, ...heads.map(r => r.revision), ...local.parents, ...heads.flatMap(r => r.parents)])].slice(0, 160);
      const record = await encryptEntries(local, state.entries, state.bytes, parents);
      session.assertGeneration(epoch);
      // All differing remote heads remain recoverable locally before resolving the branch.
      for (const head of heads) if (head.revision !== local.revision) await archiveRemote(head);
      await saveSettings({ ...(await loadSettings()), useSync: true }, { allowSyncChange: true });
      await commitRecord(record, local.revision);
    }
    await saveSettings({ ...(await loadSettings()), useSync: true }, { allowSyncChange: true });
    await lockVault();
    return { requiresResolution: false };
  });
}

async function archiveRemote(record) {
  // A dedicated encrypted archive avoids relying on a single mutable Sync manifest.
  const stored = (await getStorage('local', 'syncRecovery')).syncRecovery || [];
  if (!stored.some(r => recordRevision(r) === recordRevision(record))) {
    if (stored.length >= 20) throw new Error('Export and clear your Sync recovery archive before resolving more conflicts.');
    await setStorage('local', { syncRecovery: [...stored, record] });
  }
}

export function resolveSyncGeneration(revision, passphrase, merge = false, expectedRevision) {
  return operation(async epoch => {
    const heads = await syncHeads();
    const chosen = heads.find(r => (r.revision || 'legacy') === revision);
    if (!chosen) throw new Error('Remote version no longer available. Refresh and choose again.');
    const remote = await decryptRecord(chosen, validateMaster(passphrase));
    const local = await readLocalVaultRecordRaw();
    if (expectedRevision !== undefined && recordRevision(local) !== expectedRevision) throw new Error('Local vault changed. Review the selected version again.');
    session.assertGeneration(epoch);
    if (!merge) {
      // A download is a local recovery operation, never an implicit remote publication.
      const next = await createRecord(remote.entries, passphrase, { vaultId: chosen.vaultId });
      session.assertGeneration(epoch);
      await setStorage('local', { localRestorePending: { revision: next.record.revision } });
      await writeLocalVaultRecordRaw(next.record, recordRevision(local));
      await saveSettings({ ...(await loadSettings()), useSync: false }, { allowSyncChange: true });
      await removeStorage('local', ['securepassBiometric', 'localRestorePending']);
    } else {
      if (!local) throw new Error('Create or unlock the destination vault before merging.');
      const state = await requireVault();
      const entries = [...state.entries]; const byId = new Map(entries.map(e => [e.id, e]));
      for (const item of remote.entries) {
        const previous = byId.get(item.id);
        if (entries.some(entry => ['site', 'username', 'password', 'notes'].every(key => (entry[key] || '') === (item[key] || '')))) continue;
        const copy = previous ? { ...item, id: crypto.randomUUID() } : item;
        entries.push(copy); byId.set(copy.id, copy);
      }
      const parents = [...new Set([local.revision, chosen.revision, ...(local.parents || []), ...(chosen.parents || [])].filter(Boolean))].slice(0, 160);
      const next = await encryptEntries(local, entries, state.bytes, parents);
      session.assertGeneration(epoch);
      await archiveRemote(chosen);
      // Keep the destination key/password; only the selected head is resolved.
      await commitRecord(next, recordRevision(local));
    }
    await lockVault();
    return { settings: await loadSettings() };
  });
}
export function retrySync() {
  return operation(async () => {
    if (!(await loadSettings()).useSync) throw new Error('Sync is off. No remote changes were made.');
    const record = await loadRecord();
    if (!record) throw new Error('Vault not initialized.');
    await assertCurrent(record);
    await publishLocalRecord(record);
    const status = await getSyncStatus();
    if (status.pending) throw new Error(status.error || 'Publication is still pending.');
  });
}

export function compactSync() {
  return operation(async () => {
    if (!(await loadSettings()).useSync) throw new Error('Sync is off. No remote changes were made.');
    const all = await getStorage('sync', null);
    const heads = await syncHeads(all);
    const local = await readLocalVaultRecordRaw();
    for (const head of heads) if (recordRevision(head) !== recordRevision(local)) await archiveRemote(head);
    // Follow the entire published ancestry graph before deleting, including history
    // older than the bounded ancestry list carried by the latest encrypted record.
    const ancestors = new Set();
    const pending = heads.flatMap(r => r.parents || []);
    while (pending.length) {
      const id = pending.pop();
      if (ancestors.has(id)) continue;
      ancestors.add(id);
      pending.push(...(all[`sp2:head:${id}`]?.parents || []));
    }
    const obsoleteIds = new Set(Object.keys(all).filter(k => k.startsWith('sp2:head:') && ancestors.has(k.slice(9))).map(k => k.slice(9)));
    const obsolete = Object.keys(all).filter(k => k.startsWith('sp2:') && obsoleteIds.has(k.startsWith('sp2:head:') ? k.slice(9) : k.split(':')[1]));
    if (heads.some(r => !r.version)) {
      if (local?.version !== 2) throw new Error('Unlock and migrate the legacy vault locally before compacting its Sync copy.');
      obsolete.push(...Object.keys(all).filter(k => k === 'securepassVault_manifest' || /^securepassVault_chunk_\d+$/.test(k)));
    }
    // Remove only published ancestors from this snapshot, never in-flight uploads.
    if (obsolete.length) await removeStorage('sync', obsolete);
    return { removed: obsolete.length };
  });
}

export function clearSyncArchive(passphrase) {
  return operation(async epoch => {
    const record = await loadRecord();
    if (!record) throw new Error('Vault not initialized.');
    await decryptRecord(record, validateMaster(passphrase));
    session.assertGeneration(epoch);
    await removeStorage('local', 'syncRecovery');
  });
}
