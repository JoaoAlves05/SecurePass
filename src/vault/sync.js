import { getStorage, setStorage, recordRevision, readLegacySyncRecord } from '../utils/storage.js';
import { validateRecord } from './crypto.js';
const PREFIX = 'sp2:';
const CHUNK = 6500;
const LIMIT = 95000;
const utf8 = value => new TextEncoder().encode(JSON.stringify(value)).length;
const inventoryBytes = items => Object.entries(items).reduce((n, [key, value]) => n + utf8(value) + key.length, 0);
async function digest(text) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(hash), n => n.toString(16).padStart(2, '0')).join('');
}
export async function legacyRevision(record) {
  return `legacy-${(await digest(JSON.stringify([record.salt, record.iv, record.ciphertext, record.iterations]))).slice(0, 56)}`;
}
export async function inspectSync(snapshot) {
  const items = snapshot || await getStorage('sync', null);
  const generations = []; const issues = [];
  for (const [key, m] of Object.entries(items).filter(([key]) => key.startsWith(`${PREFIX}head:`))) {
    try {
      if (!m || typeof m.id !== 'string' || key !== `${PREFIX}head:${m.id}` || !Number.isInteger(m.chunks) || m.chunks < 1 || m.chunks > 32 || !Array.isArray(m.parents)) throw new Error('Invalid Sync generation.');
      let text = '';
      for (let i = 0; i < m.chunks; i++) {
        const chunk = items[`${PREFIX}${m.id}:${i}`];
        if (typeof chunk !== 'string') throw new Error('Sync is still arriving or incomplete. Keep the local recovery copy and retry.');
        text += chunk;
      }
      if (await digest(text) !== m.digest) throw new Error('Sync integrity check failed.');
      const record = validateRecord(JSON.parse(text));
      if (record.revision !== m.id || JSON.stringify(record.parents) !== JSON.stringify(m.parents)) throw new Error('Sync manifest mismatch.');
      generations.push(record);
    } catch (error) { issues.push({ revision: key.slice(9), error: error.message }); }
  }
  const ancestors = new Set(generations.flatMap(r => r.parents));
  const heads = generations.filter(r => !ancestors.has(r.revision));
  // Inventory legacy even when v2 coexists, without silently treating it as resolved.
  if (items.securepassVault_manifest) {
    try {
      const legacy = await readLegacySyncRecord(items);
      if (legacy) {
        validateRecord(legacy);
        if (!ancestors.has(await legacyRevision(legacy))) heads.push(legacy);
      }
    }
    catch (error) { issues.push({ revision: 'legacy', error: error.message }); }
  }
  return { heads, issues, bytesUsed: Object.entries(items).reduce((n, [k, v]) => n + utf8(v) + k.length, 0), itemCount: Object.keys(items).length };
}
export async function syncHeads(snapshot) {
  const result = await inspectSync(snapshot);
  if (result.issues.length) throw new Error(result.issues[0].error);
  return result.heads;
}
async function encodeGeneration(record) {
  validateRecord(record);
  if (record.version !== 2) throw new Error('Unlock the legacy vault before enabling Sync.');
  const text = JSON.stringify(record);
  const chunks = {};
  for (let i = 0; i < text.length; i += CHUNK) chunks[`${PREFIX}${record.revision}:${i / CHUNK}`] = text.slice(i, i + CHUNK);
  const manifest = { id: record.revision, chunks: Object.keys(chunks).length, parents: record.parents, digest: await digest(text) };
  return { chunks, manifest, key: `${PREFIX}head:${record.revision}` };
}
export async function publicationCapacity(record, snapshot, reserveNext = true) {
  if (!record?.version) return { fits: false, reason: 'Create or unlock a local vault before setting up Chrome Sync.' };
  const existing = snapshot || await getStorage('sync', null);
  const { chunks, manifest, key } = await encodeGeneration(record);
  const generation = { ...chunks, [key]: manifest };
  const combined = { ...existing, ...generation };
  // A subsequent immutable generation must coexist with this one. Include ancestry
  // growth and diagnostic metadata; this estimates today's contents, not future growth.
  const reserve = reserveNext ? inventoryBytes(generation) + 1024 : 0;
  const baseBytes = inventoryBytes(combined);
  const required = baseBytes + reserve;
  const items = Object.keys(combined).length + (reserveNext ? Object.keys(generation).length + 2 : 0);
  const oversized = Object.entries(generation).some(([k, value]) => utf8(value) + k.length + (reserveNext && k === key ? 128 : 0) > 8192);
  const fits = manifest.chunks <= 32 && !oversized && required <= LIMIT && items <= 512;
  return { fits, canPublish: manifest.chunks <= 32 && !oversized && baseBytes <= LIMIT && inventoryBytes(generation) * 2 + 1024 <= LIMIT && Object.keys(combined).length <= 512, bytesUsed: inventoryBytes(existing), requiredBytes: required, limitBytes: LIMIT,
    reason: fits ? null : oversized ? 'Chrome Sync metadata exceeds the per-item limit. Keep this vault local and export an encrypted backup.'
      : 'Chrome Sync has no space for this vault and another complete version. Keep automatic sending off, export a backup, or clean old remote history and check again.' };
}
export async function requirePublicationCapacity(record, snapshot) {
  const capacity = await publicationCapacity(record, snapshot);
  if (!capacity.fits) throw Object.assign(new Error(capacity.reason), { code: 'capacity' });
  return capacity;
}
export async function publishGeneration(record) {
  const existing = await getStorage('sync', null);
  const { chunks, manifest, key } = await encodeGeneration(record);
  if (existing[key]) {
    if (existing[key].digest !== manifest.digest) throw new Error('An existing Sync revision has different contents.');
    if (Object.entries(chunks).every(([k, v]) => existing[k] === v)) return;
  }
  const version = { ...chunks, [key]: manifest };
  if (inventoryBytes(version) * 2 + 1024 > LIMIT) throw Object.assign(new Error('Chrome Sync has no space for this vault and another complete version. Changes remain saved locally. Turn off automatic sending and export an encrypted backup.'), { code: 'capacity' });
  if (manifest.chunks > 32) throw Object.assign(new Error('Vault exceeds Chrome Sync capacity. Keep using your local vault and encrypted backups.'), { code: 'capacity' });
  const all = { ...existing, ...chunks, [key]: manifest };
  if (Object.entries(all).some(([k, v]) => utf8(v) + k.length > 8192)) throw Object.assign(new Error('Chrome Sync metadata exceeds the per-item limit. Local data is safe; export a backup.'), { code: 'capacity' });
  if (Object.keys(all).length > 512 || inventoryBytes(all) > LIMIT) throw Object.assign(new Error('Chrome Sync has no space for another complete version. Local changes remain saved. Turn off automatic sending and export a backup, or clean old remote history.'), { code: 'capacity' });
  await setStorage('sync', chunks);
  const written = await getStorage('sync', Object.keys(chunks));
  if (Object.entries(chunks).some(([k, v]) => written[k] !== v)) throw new Error('Sync chunks could not be verified.');
  await setStorage('sync', { [key]: manifest });
}
export const revisionOf = recordRevision;
