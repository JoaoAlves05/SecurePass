import { readRecoveryRecords, getStorage, snapshotId } from '../utils/storage.js';
import { validateRecord } from './crypto.js';
import { MAX_IMPORT_BYTES } from '../validation.js';

const encoder = new TextEncoder();
const sources = ['Local', 'Archived Sync'];
async function recordsFor(source) {
  if (!sources.includes(source)) throw new Error('Invalid recovery source.');
  const records = source === 'Local' ? await readRecoveryRecords() : (await getStorage('local', 'syncRecovery')).syncRecovery || [];
  if (!Array.isArray(records)) throw new Error('Recovery history is damaged. Review saved versions before exporting.');
  return records;
}
async function prepare(record) {
  validateRecord(record);
  const data = { kind: 'securepass-encrypted-recovery', version: 1, snapshots: [record], sync: [] };
  const bytes = encoder.encode(JSON.stringify(data));
  if (bytes.length > MAX_IMPORT_BYTES) throw new Error('This version exceeds the 16 MiB recovery file limit. No download was requested.');
  const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(byte => byte.toString(16).padStart(2, '0')).join('');
  return { data, digest, bytes: bytes.length };
}
export async function recoveryExportInventory() {
  const snapshots = []; const issues = [];
  for (const source of sources) {
    const records = await recordsFor(source); const seen = new Map();
    if (snapshots.length + issues.length + records.length > 100) throw new Error('Recovery history exceeds the batch limit of 100 versions. Export individual versions.');
    for (let index = 0; index < records.length; index++) {
      try {
        const record = records[index]; const prepared = await prepare(record); const id = await snapshotId(record);
        if (typeof id !== 'string' || !/^[\w-]{1,80}$/.test(id)) throw new Error('This version has an invalid identity.');
        if (seen.has(id)) {
          const previous = snapshots.findIndex(item => item.id === id && item.source === source);
          if (previous !== -1) { snapshots.splice(previous, 1); issues.push({ source, position: seen.get(id), error: 'This version has a duplicate identity.' }); }
          throw new Error('This version has a duplicate identity.');
        }
        seen.set(id, index + 1);
        snapshots.push({ id, source, digest: prepared.digest, bytes: prepared.bytes, updatedAt: typeof record.updatedAt === 'string' && record.updatedAt.length <= 64 && Number.isFinite(Date.parse(record.updatedAt)) ? record.updatedAt : undefined });
      } catch (error) { issues.push({ source, position: index + 1, error: error.message }); }
    }
  }
  if (snapshots.length + issues.length > 100) throw new Error('Recovery history exceeds the batch limit of 100 versions. Export individual versions.');
  return { snapshots, issues };
}
export async function exportRecoverySnapshot({ id, source, digest } = {}) {
  if (typeof id !== 'string' || !/^[\w-]{1,80}$/.test(id)) throw new Error('Invalid recovery identity.');
  if (digest !== undefined && (typeof digest !== 'string' || !/^[a-f0-9]{64}$/.test(digest))) throw new Error('Invalid recovery digest.');
  for (const selectedSource of source === undefined ? sources : [source]) {
    const records = await recordsFor(selectedSource);
    const matches = [];
    for (const record of records) if (record && await snapshotId(record) === id) matches.push(record);
    if (matches.length > 1) throw new Error('This version has a duplicate identity. Review the history before exporting.');
    if (!matches.length) continue;
    const prepared = await prepare(matches[0]);
    if (digest !== undefined && prepared.digest !== digest) throw new Error('This saved version changed after review. Stop this batch and review the updated history.');
    return { data: prepared.data };
  }
  throw new Error('Snapshot no longer available. Stop this batch and review the updated history.');
}
