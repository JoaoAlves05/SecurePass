import { getStorage, setStorage, removeStorage, readLocalVaultRecordRaw, writeLocalVaultRecordRaw, recordRevision } from '../utils/storage.js';
import { loadSettings, saveSettings } from '../settings.js';
import { loadRecord, getSyncStatus, assertCurrent } from './repository.js';
import { syncHeads, publishGeneration } from './sync.js';
import { createRecord, decryptRecord, encryptEntries } from './crypto.js';
import { withVaultOperation as operation } from './queue.js';
import * as session from './session.js';
import { validateMaster } from '../validation.js';

const lockVault = session.revokeSession;
async function requireVault() { return session.current(await loadRecord()); }
export { getSyncStatus };

export function changeSyncMode(target, strategy) {
  return operation(async epoch => {
    if (!target) {
      await saveSettings({ ...(await loadSettings()), useSync: false }, { allowSyncChange: true });
      await lockVault();
      return { requiresResolution: false };
    }
    const local = await loadRecord();
    const heads = await syncHeads();
    const divergent = heads.filter(r => recordRevision(r) !== recordRevision(local) && !local?.parents?.includes(r.revision));
    if (local && divergent.length && !strategy) return { requiresResolution: true };
    if (strategy && !['keep-local', 'use-sync'].includes(strategy)) throw new Error('Invalid Sync resolution.');
    if (strategy === 'use-sync' || (!local && heads.length)) {
      if (heads.length !== 1) throw new Error('Choose a specific Sync generation in the recovery panel.');
      await writeLocalVaultRecordRaw(heads[0], recordRevision(local));
    } else if (local) {
      const state = await requireVault();
      if (heads.some(r => !r.version)) throw new Error('Legacy remote vault: download and unlock it before merging.');
      const parents = [...new Set([local.revision, ...heads.map(r => r.revision), ...local.parents, ...heads.flatMap(r => r.parents)])].slice(0, 256);
      const record = await encryptEntries(local, state.entries, state.bytes, parents);
      session.assertGeneration(epoch);
      // All differing remote heads remain recoverable locally before resolving the branch.
      for (const head of heads) if (head.revision !== local.revision) await archiveRemote(head);
      await publishGeneration(record);
      await writeLocalVaultRecordRaw(record, local.revision);
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

export function resolveSyncGeneration(revision, passphrase, merge = false) {
  return operation(async epoch => {
    const heads = await syncHeads();
    const chosen = heads.find(r => (r.revision || 'legacy') === revision);
    if (!chosen) throw new Error('Sync generation no longer available. Refresh the list.');
    const remote = await decryptRecord(chosen, validateMaster(passphrase));
    const local = await loadRecord();
    let entries = remote.entries;
    if (merge && local) {
      const state = await requireVault();
      const map = new Map(state.entries.map(e => [e.id, e]));
      for (const item of entries) {
        const previous = map.get(item.id);
        if (previous && JSON.stringify(previous) !== JSON.stringify(item)) {
          const id = crypto.randomUUID();
          map.set(id, { ...item, id, notes: `${item.notes}\nRecovered conflicting Sync copy` });
        } else map.set(item.id, item);
      }
      entries = [...map.values()];
    }
    for (const head of heads) await archiveRemote(head);
    const versioned = heads.filter(r => r.version === 2);
    const parents = [...new Set([...versioned.map(r => r.revision), ...versioned.flatMap(r => r.parents)])].slice(0, 256);
    const next = await createRecord(entries, passphrase, { vaultId: chosen.vaultId, parents });
    session.assertGeneration(epoch);
    await publishGeneration(next.record);
    await writeLocalVaultRecordRaw(next.record, recordRevision(local));
    await removeStorage('local', 'securepassBiometric');
    await lockVault();
  });
}

export function retrySync() {
  return operation(async () => {
    const record = await loadRecord();
    if (!record) throw new Error('Vault not initialized.');
    await assertCurrent(record);
    await publishGeneration(record);
    await setStorage('local', { syncStatus: { pending: false } });
  });
}

export function compactSync() {
  return operation(async () => {
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
