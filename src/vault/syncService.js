import { getStorage, setStorage, removeStorage, readLocalVaultRecordRaw, writeLocalVaultRecordRaw, recordRevision, readLegacySyncRecord } from '../utils/storage.js';
import { loadSettings, saveSettings } from '../settings.js';
import { loadRecord, getSyncStatus, assertCurrent, commitRecord, publishLocalRecord } from './repository.js';
import { syncHeads, inspectSync, requirePublicationCapacity, legacyRevision } from './sync.js';
import { planSyncMerge, compareSyncContents } from './syncPlan.js';
import { createRecord, decryptRecord, encryptEntries } from './crypto.js';
import { withVaultOperation as operation } from './queue.js';
import * as session from './session.js';
import { validateMaster } from '../validation.js';
import { commitLocalRecovery, finishLocalRecovery } from './recovery.js';

const lockVault = session.revokeSession;
const digest = async record => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(record)))), b => b.toString(16).padStart(2, '0')).join('');
const signature = heads => JSON.stringify(heads.map(record => record.revision || 'legacy').sort());
async function requireVault() { return session.current(await loadRecord()); }
export { getSyncStatus };

export function changeSyncMode(target, strategy, passphrase, options = {}) {
  return operation(async epoch => {
    await finishLocalRecovery();
    if (!target) {
      await saveSettings({ ...(await loadSettings()), useSync: false }, { allowSyncChange: true });
      await lockVault();
      return { requiresResolution: false };
    }
    const local = await readLocalVaultRecordRaw();
    if (options.expectedRevision !== undefined && recordRevision(local) !== options.expectedRevision) throw new Error('Local vault changed. Review the storage choice again.');
    const heads = await syncHeads();
    if (options.expectedHeads !== undefined && options.expectedHeads !== signature(heads)) throw new Error('Chrome Sync copies changed. Check the setup again.');
    if (!local && !heads.length) throw new Error('Create a local vault or restore a backup before enabling Sync.');
    const divergent = heads.filter(r => recordRevision(r) !== recordRevision(local) && !local?.parents?.includes(r.revision));
    if (local && divergent.length && !strategy) return { requiresResolution: true };
    if (strategy && !['keep-local', 'use-sync'].includes(strategy)) throw new Error('Invalid Sync resolution.');
    if (strategy === 'use-sync' || (!local && heads.length)) {
      const chosen = options.revision ? heads.find(head => (head.revision || 'legacy') === options.revision) : heads.length === 1 ? heads[0] : null;
      if (!chosen) throw new Error('Remote version changed or is ambiguous. Refresh and choose a specific Sync generation.');
      if (!passphrase) throw new Error('Enter the master password for the selected remote vault first.');
      await decryptRecord(chosen, validateMaster(passphrase));
      await requirePublicationCapacity(chosen);
      if (local) await session.current(local);
      session.assertGeneration(epoch);
      await writeLocalVaultRecordRaw(chosen, recordRevision(local));
      await removeStorage('local', 'securepassBiometric');
    } else if (local) {
      const state = await requireVault();
      const identities = await Promise.all(heads.map(record => record.version ? record.revision : legacyRevision(record)));
      const parents = [...new Set([local.revision, ...identities, ...local.parents, ...heads.flatMap(r => r.parents || [])])].slice(0, 160);
      const record = await encryptEntries(local, state.entries, state.bytes, parents);
      await requirePublicationCapacity(record);
      session.assertGeneration(epoch);
      // All differing remote heads remain recoverable locally before resolving the branch.
      for (const head of heads) if (head.revision !== local.revision) await archiveRemote(head);
      // Establish the durable local revision/outbox before enabling any remote
      // work. A failed transaction cannot leave a new setup switched on.
      await writeLocalVaultRecordRaw(record, local.revision, { saveCheckpoint: false, pendingSync: true });
      await saveSettings({ ...(await loadSettings()), useSync: true }, { allowSyncChange: true });
      await publishLocalRecord(record);
    }
    await saveSettings({ ...(await loadSettings()), useSync: true }, { allowSyncChange: true });
    await setStorage('local', { syncSetupComplete: true });
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

export function checkSyncSetup() {
  return operation(async () => {
    const current = await readLocalVaultRecordRaw();
    const active = current ? await session.current(current) : null;
    const status = await getSyncStatus({ inspectRemote: true });
    if (status.remoteError) throw new Error(`Could not inspect Chrome Sync copies: ${status.remoteError}`);
    if (status.issues.length) throw new Error('Some Chrome Sync copies are incomplete. You can still restore a complete copy locally; automatic sending remains off.');
    return { status, currentCount: active?.entries.length || 0, expectedRevision: recordRevision(current), expectedHeads: JSON.stringify(status.heads.map(head => head.revision).sort()), divergent: status.heads.filter(head => !head.current && !current?.parents?.includes(head.revision)).length };
  });
}
export function previewSyncGeneration(revision, passphrase, merge, owner) {
  return operation(async epoch => {
    const current = await readLocalVaultRecordRaw();
    const active = current ? await session.current(current) : null;
    if (merge && !active) throw new Error('Create or restore a local vault before combining entries.');
    const chosen = (await inspectSync()).heads.find(record => (record.revision || 'legacy') === revision);
    if (!chosen) throw new Error('Remote version no longer available. Check existing copies again.');
    const remote = await decryptRecord(chosen, validateMaster(passphrase));
    const token = crypto.randomUUID();
    const all = await getStorage('session', null);
    const obsolete = Object.keys(all).filter(key => key.startsWith('syncPreview:') && (all[key].owner === owner || all[key].expiresAt <= Date.now()));
    if (obsolete.length) await removeStorage('session', obsolete);
    if (Object.keys(all).filter(key => key.startsWith('syncPreview:') && !obsolete.includes(key)).length >= 16) throw new Error('Too many open reviews. Close another review first.');
    session.assertGeneration(epoch);
    const createdAt = Date.now();
    await setStorage('session', { [`syncPreview:${token}`]: { owner, epoch, revision, merge, destination: recordRevision(current), digest: await digest(chosen), createdAt, expiresAt: createdAt + 5 * 60000 } });
    return { token, expectedRevision: recordRevision(current), ...compareSyncContents(active?.entries || [], remote.entries), destinationExists: Boolean(current) };
  });
}
export function resolveSyncGeneration(revision, passphrase, merge = false, expectedRevision, review) {
  return operation(async epoch => {
    // Local recovery does not resolve or publish any other remote generation.
    const heads = merge ? await syncHeads() : (await inspectSync()).heads;
    const chosen = heads.find(r => (r.revision || 'legacy') === revision);
    if (!chosen) throw new Error('Remote version no longer available. Refresh and choose again.');
    const remote = await decryptRecord(chosen, validateMaster(passphrase));
    const local = await readLocalVaultRecordRaw();
    if (review) {
      const key = `syncPreview:${review.token}`;
      const preview = (await getStorage('session', key))[key];
      if (!preview || preview.owner !== review.owner || Date.now() < preview.createdAt || preview.expiresAt <= Date.now() || preview.revision !== revision || preview.merge !== merge || preview.destination !== recordRevision(local) || preview.digest !== await digest(chosen)) throw new Error('The selected copy or local vault changed, or this review expired. Review the copy again.');
      session.assertGeneration(preview.epoch);
      await removeStorage('session', key);
    }
    if (expectedRevision !== undefined && recordRevision(local) !== expectedRevision) throw new Error('Local vault changed. Review the selected version again.');
    session.assertGeneration(epoch);
    if (!merge) {
      // A download is a local recovery operation, never an implicit remote publication.
      const active = local ? await session.current(local) : null;
      const next = active
        ? { record: await encryptEntries(active.record, remote.entries, active.bytes), bytes: active.bytes }
        : await createRecord(remote.entries, passphrase, { vaultId: chosen.vaultId });
      session.assertGeneration(epoch);
      await commitLocalRecovery(next, remote.entries, local, epoch);
    } else {
      if (!local) throw new Error('Create or unlock the destination vault before merging.');
      const state = await requireVault();
      const { entries } = planSyncMerge(state.entries, remote.entries);
      const chosenIdentity = chosen.version ? chosen.revision : await legacyRevision(chosen);
      const parents = [...new Set([local.revision, chosenIdentity, ...(local.parents || []), ...(chosen.parents || [])].filter(Boolean))].slice(0, 160);
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

export function compactSync({ manual = false } = {}) {
  return operation(async () => {
    if (!(await loadSettings()).useSync && !manual) throw new Error('Sync is off. No remote changes were made.');
    const all = await getStorage('sync', null);
    const heads = await syncHeads(all);
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
    // Retire an old-format copy only when its exact content fingerprint was
    // explicitly adopted as ancestry. An unrelated or changed copy stays active.
    const legacy = all.securepassVault_manifest ? await readLegacySyncRecord(all) : null;
    if (legacy && ancestors.has(await legacyRevision(legacy))) obsolete.push(...Object.keys(all).filter(key => key === 'securepassVault_manifest' || /^securepassVault_chunk_\d+$/.test(key)));
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
