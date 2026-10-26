import { validateImportData, validateVaultEntries, validateMaster } from '../validation.js';
import { decryptBackupPayload, isEncryptedBackupEnvelope } from '../backupCrypto.js';
import { readLocalVaultRecordRaw, recordRevision, getStorage, setStorage, removeStorage } from '../utils/storage.js';
import { withVaultOperation } from './queue.js';
import { createRecord, encryptEntries } from './crypto.js';
import { assertCurrent, commitRecord } from './repository.js';
import { commitLocalRecovery } from './recovery.js';
import * as session from './session.js';
const PREVIEW = 'backupPreview';
async function sourceDigest(data) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(data)));
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
}
async function decode(data, backupPassword) {
  const source = isEncryptedBackupEnvelope(data) ? await decryptBackupPayload(data, validateMaster(backupPassword)) : data;
  return validateImportData(source).entries;
}
const equal = (a, b) => ['site', 'username', 'password', 'notes'].every(key => (a[key] || '') === (b[key] || ''));
export function planImport(current, incoming, strategy = 'keep-both') {
  if (!['keep-both', 'skip', 'replace'].includes(strategy)) throw new Error('Choose an import conflict policy.');
  const entries = structuredClone(current); const stats = { new: 0, identical: 0, conflicts: 0, imported: 0 };
  for (const item of incoming) {
    // A previous keep-both import has a new ID; recognize its exact contents too.
    if (strategy === 'keep-both' && entries.some(entry => equal(entry, item))) { stats.identical++; continue; }
    let index = entries.findIndex(entry => entry.id === item.id);
    if (index < 0) index = entries.findIndex(entry => entry.site === item.site && entry.username === item.username);
    if (index < 0) { entries.push(item); stats.new++; stats.imported++; continue; }
    const existing = entries[index];
    if (equal(existing, item)) { stats.identical++; continue; }
    stats.conflicts++;
    if (strategy === 'skip') continue;
    if (strategy === 'replace') entries[index] = { ...item, id: existing.id, createdAt: existing.createdAt };
    else entries.push({ ...item, id: crypto.randomUUID() });
    stats.imported++;
  }
  return { entries: validateVaultEntries(entries), ...stats };
}
export function previewBackup(data, backupPassword, strategy) {
  return withVaultOperation(async epoch => {
    const current = await readLocalVaultRecordRaw();
    const state = current ? await session.current(current) : null;
    const incoming = await decode(data, backupPassword);
    const plan = planImport(state?.entries || [], incoming, strategy);
    const token = crypto.randomUUID();
    const preview = { token, digest: await sourceDigest(data), revision: recordRevision(current), strategy: strategy || 'keep-both', epoch, expires: Date.now() + 5 * 60000 };
    session.assertGeneration(epoch);
    await setStorage('session', { [PREVIEW]: preview });
    return { token, destinationRevision: preview.revision, destinationExists: Boolean(current), count: incoming.length, new: plan.new, identical: plan.identical, conflicts: plan.conflicts, imported: plan.imported };
  });
}
export function commitBackup({ data, backupPassword, token, newMasterPassword }) {
  return withVaultOperation(async epoch => {
    const preview = (await getStorage('session', PREVIEW))[PREVIEW];
    if (!preview || preview.token !== token || preview.expires < Date.now()) throw new Error('Import review expired. Choose the file and review again.');
    session.assertGeneration(preview.epoch);
    const current = await readLocalVaultRecordRaw();
    if (preview.revision !== recordRevision(current)) throw new Error('Vault changed. Review the import again.');
    if (preview.digest !== await sourceDigest(data)) throw new Error('Backup changed. Review the import again.');
    const state = current ? await session.current(current) : null;
    const incoming = await decode(data, backupPassword);
    const plan = planImport(state?.entries || [], incoming, preview.strategy);
    if (current) {
      if (!plan.imported) {
        await removeStorage('session', PREVIEW);
        return { count: 0 };
      }
      await assertCurrent(current);
      const next = await encryptEntries(current, plan.entries, state.bytes);
      session.assertGeneration(epoch);
      await commitRecord(next, current.revision);
      await session.activate(next, plan.entries, state.bytes, epoch);
    } else {
      const next = await createRecord(plan.entries, validateMaster(newMasterPassword, true));
      await commitLocalRecovery(next, plan.entries, null, epoch);
    }
    await removeStorage('session', PREVIEW);
    return { count: plan.imported };
  });
}
