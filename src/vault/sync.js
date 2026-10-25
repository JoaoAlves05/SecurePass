import { getStorage, setStorage, recordRevision, readLegacySyncRecord } from '../utils/storage.js';
import { validateRecord } from './crypto.js';
const PREFIX = 'sp2:';
const CHUNK = 6500;
const LIMIT = 95000;
const utf8 = value => new TextEncoder().encode(JSON.stringify(value)).length;
async function digest(text) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(hash), n => n.toString(16).padStart(2, '0')).join('');
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
    try { const legacy = await readLegacySyncRecord(); if (legacy) heads.push(validateRecord(legacy)); }
    catch (error) { issues.push({ revision: 'legacy', error: error.message }); }
  }
  return { heads, issues, bytesUsed: Object.entries(items).reduce((n, [k, v]) => n + utf8(v) + k.length, 0), itemCount: Object.keys(items).length };
}
export async function syncHeads(snapshot) {
  const result = await inspectSync(snapshot);
  if (result.issues.length) throw new Error(result.issues[0].error);
  return result.heads;
}
export async function publishGeneration(record) {
  validateRecord(record);
  if (record.version !== 2) throw new Error('Unlock the legacy vault before enabling Sync.');
  const existing = await getStorage('sync', null);
  const key = `${PREFIX}head:${record.revision}`;
  const text = JSON.stringify(record);
  const chunks = {};
  for (let i = 0; i < text.length; i += CHUNK) chunks[`${PREFIX}${record.revision}:${i / CHUNK}`] = text.slice(i, i + CHUNK);
  const manifest = { id: record.revision, chunks: Object.keys(chunks).length, parents: record.parents, digest: await digest(text) };
  if (existing[key]) {
    if (existing[key].digest !== manifest.digest) throw new Error('An existing Sync revision has different contents.');
    if (Object.entries(chunks).every(([k, v]) => existing[k] === v)) return;
  }
  if (manifest.chunks > 32) throw new Error('Vault exceeds legacy Chrome Sync capacity. Keep using your local vault and encrypted backups.');
  const all = { ...existing, ...chunks, [key]: manifest };
  if (Object.entries(all).some(([k, v]) => utf8(v) + k.length > 8192)) throw new Error('Legacy Sync metadata exceeds the per-item limit. Local data is safe; export a backup.');
  if (Object.keys(all).length > 512) throw new Error('Legacy Sync has too many items. Local changes remain saved.');
  if (Object.entries(all).reduce((n, [k, v]) => n + utf8(v) + k.length, 0) > LIMIT) throw new Error('Legacy Sync has no space for another complete version. Compacting may not free enough; local changes remain saved. Export a backup.');
  await setStorage('sync', chunks);
  const written = await getStorage('sync', Object.keys(chunks));
  if (Object.entries(chunks).some(([k, v]) => written[k] !== v)) throw new Error('Sync chunks could not be verified.');
  await setStorage('sync', { [key]: manifest });
}
export const revisionOf = recordRevision;
