import { readLocalVaultRecordRaw, readRecoveryRecords, writeLocalVaultRecordRaw, snapshotId, getStorage, setStorage, removeStorage } from '../utils/storage.js';
import { decryptWithKey, decryptRecord, protectCheckpoint, encryptEntries } from './crypto.js';
import { validateMaster, validateVaultEntries } from '../validation.js';
import { withVaultOperation } from './queue.js';
import { assertCurrent, commitRecord } from './repository.js';
import { commitLocalRecovery } from './recovery.js';
import * as session from './session.js';

const PREFIX = 'checkpointPreview:';
const FIELDS = ['site', 'username', 'password', 'notes'];
const signature = entry => JSON.stringify(FIELDS.map(field => entry[field] || ''));
const digest = async record => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(record)))), byte => byte.toString(16).padStart(2, '0')).join('');

async function activeVault() {
  const record = await readLocalVaultRecordRaw();
  if (!record) throw new Error('Create or unlock a vault first.');
  return session.current(record);
}

async function findCheckpoint(id) {
  for (const record of await readRecoveryRecords()) if (await snapshotId(record) === id) return record;
  throw new Error('Checkpoint no longer available. Refresh the history.');
}

function compare(entries, current) {
  const byId = new Map(current.map(entry => [entry.id, entry]));
  const ids = new Set(entries.map(entry => entry.id));
  const differences = entries.map(entry => {
    const live = byId.get(entry.id);
    return {
      id: entry.id, site: entry.site, username: entry.username || '',
      change: !live ? 'missing' : signature(entry) === signature(live) ? 'unchanged' : 'changed',
      fields: live ? FIELDS.filter(field => (entry[field] || '') !== (live[field] || '')) : []
    };
  });
  return {
    count: entries.length,
    missing: differences.filter(entry => entry.change === 'missing').length,
    changed: differences.filter(entry => entry.change === 'changed').length,
    newer: current.filter(entry => !ids.has(entry.id)).length,
    newerEntries: current.filter(entry => !ids.has(entry.id)).map(({ id, site, username }) => ({ id, site, username: username || '' })),
    entries: differences
  };
}

export function checkpointStatus() {
  return withVaultOperation(async epoch => {
    const records = await readRecoveryRecords();
    let active;
    const current = await readLocalVaultRecordRaw();
    if (current && await session.sessionStatus(current)) active = await session.current(current);
    const snapshots = [];
    for (const record of records) {
      const info = { id: await snapshotId(record), revision: record.revision, updatedAt: record.updatedAt, source: 'Local', locked: !active };
      if (active) {
        try {
          const summary = compare(await decryptWithKey(record, active.bytes), active.entries);
          Object.assign(info, summary, { examples: summary.entries.filter(entry => entry.change !== 'unchanged').slice(0, 2).map(({ site, username, change, fields }) => ({ site, username, change, fields })) });
          delete info.entries;
          delete info.newerEntries;
        } catch { info.needsPassword = true; }
      }
      snapshots.push(info);
    }
    session.assertGeneration(epoch);
    return snapshots;
  });
}

export function unlockCheckpoint(id, passphrase, expectedRevision) {
  validateMaster(passphrase);
  return withVaultOperation(async epoch => {
    const active = await activeVault();
    if (active.record.revision !== expectedRevision) throw new Error('Vault changed. Review the checkpoints again.');
    const history = await readRecoveryRecords();
    const record = await findCheckpoint(id);
    const opened = await decryptRecord(record, passphrase);
    const protectedRecord = await protectCheckpoint(record, opened.entries, active.record, active.bytes);
    const next = [];
    for (const item of history) next.push(await snapshotId(item) === id ? protectedRecord : item);
    session.assertGeneration(epoch);
    await writeLocalVaultRecordRaw(active.record, active.record.revision, { historyOnly: true, recoveryRecords: next, expectedRecoveryRecords: history });
    return { id: await snapshotId(protectedRecord) };
  });
}

export function previewCheckpoint(id, mode, owner) {
  if (!['entry', 'vault'].includes(mode)) throw new Error('Choose a recovery action.');
  return withVaultOperation(async epoch => {
    const active = await activeVault();
    const checkpoint = await findCheckpoint(id);
    let entries;
    try { entries = await decryptWithKey(checkpoint, active.bytes); }
    catch { throw new Error('Unlock this older checkpoint with its previous master password first.'); }
    const all = await getStorage('session', null);
    const obsolete = Object.keys(all).filter(key => key.startsWith(PREFIX) && (all[key].owner === owner || all[key].expires <= Date.now()));
    if (obsolete.length) await removeStorage('session', obsolete);
    if (Object.keys(all).filter(key => key.startsWith(PREFIX) && !obsolete.includes(key)).length >= 16) throw new Error('Too many recovery previews. Try again shortly.');
    const token = crypto.randomUUID();
    const sourceDigest = await digest(checkpoint);
    const requiresAuthentication = mode === 'vault' && !session.hasRecentAuthentication(active);
    await setStorage('session', { [`${PREFIX}${token}`]: {
      owner, id, mode, digest: sourceDigest, revision: active.record.revision,
      expires: Date.now() + 120000, revocation: all.vaultRevocation || null, requiresAuthentication
    } });
    session.assertGeneration(epoch);
    return { token, revision: active.record.revision, sourceDigest, requiresAuthentication, ...compare(entries, active.entries) };
  });
}

export function recoverCheckpoint(token, entryId, owner) {
  return withVaultOperation(async epoch => {
    const active = await activeVault();
    if (typeof token !== 'string' || token.length > 64) throw new Error('Review this checkpoint again.');
    const key = `${PREFIX}${token}`;
    const preview = (await getStorage('session', key))[key];
    if (!preview || preview.owner !== owner) throw new Error('Review this checkpoint again.');
    await removeStorage('session', key);
    if (preview.expires <= Date.now() || preview.revision !== active.record.revision ||
        preview.revocation !== ((await getStorage('session', 'vaultRevocation')).vaultRevocation || null)) {
      throw new Error('The review expired or the vault changed. Review this checkpoint again.');
    }
    const checkpoint = await findCheckpoint(preview.id);
    if (await digest(checkpoint) !== preview.digest) throw new Error('Checkpoint changed. Review it again.');
    // Recheck at confirmation: authentication may expire while the dialog is open.
    // The consumed preview cannot authorize a retry; the UI must authenticate and review again.
    if (preview.mode === 'vault' && (preview.requiresAuthentication !== false || !session.hasRecentAuthentication(active))) {
      return { requiresAuthentication: true };
    }
    const historical = await decryptWithKey(checkpoint, active.bytes);
    let entries = historical;
    if (preview.mode === 'entry') {
      const selected = historical.find(entry => entry.id === entryId);
      if (!selected) throw new Error('Choose an entry from this checkpoint.');
      const live = active.entries.find(entry => entry.id === entryId);
      if (live && signature(live) === signature(selected)) return { unchanged: true };
      const recovered = { ...selected, updatedAt: new Date().toISOString() };
      entries = live ? active.entries.map(entry => entry.id === entryId ? recovered : entry) : [...active.entries, recovered];
    } else if (preview.mode !== 'vault') throw new Error('Invalid recovery action.');
    validateVaultEntries(entries);
    const differences = compare(historical, active.entries);
    if (preview.mode === 'vault' && !differences.missing && !differences.changed && !differences.newer) return { unchanged: true };
    await assertCurrent(active.record);
    const next = { record: await encryptEntries(active.record, entries, active.bytes), bytes: active.bytes };
    session.assertGeneration(epoch);
    if (preview.mode === 'vault') await commitLocalRecovery(next, entries, active.record, epoch);
    else {
      await commitRecord(next.record, active.record.revision);
      await session.activate(next.record, entries, next.bytes, epoch);
    }
    return { recovered: true };
  });
}

export function removeCheckpoints(passphrase, expectedRevision, id) {
  validateMaster(passphrase);
  return withVaultOperation(async epoch => {
    const active = await activeVault();
    if (active.record.revision !== expectedRevision) throw new Error('Vault changed. Review the history again.');
    await decryptRecord(active.record, passphrase);
    const history = await readRecoveryRecords();
    const next = [];
    for (const record of history) if (id && await snapshotId(record) !== id) next.push(record);
    if (id && next.length === history.length) throw new Error('Checkpoint no longer available.');
    session.assertGeneration(epoch);
    await writeLocalVaultRecordRaw(active.record, active.record.revision, { historyOnly: true, recoveryRecords: next, expectedRecoveryRecords: history });
  });
}

export async function clearCheckpointPreviews(owner, token) {
  const all = await getStorage('session', null);
  const keys = Object.keys(all).filter(key => key.startsWith(PREFIX) && (!owner || all[key].owner === owner) && (!token || key === `${PREFIX}${token}`));
  if (keys.length) await removeStorage('session', keys);
}
