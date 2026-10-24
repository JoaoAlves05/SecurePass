import { getStorage, setStorage, recordRevision, readLegacySyncRecord } from '../utils/storage.js';
import { validateRecord } from './crypto.js';

const PREFIX = 'sp2:';
const CHUNK = 6500;
const LIMIT = 95000; // Leave room for older settings; preflight includes all keys.
const utf8 = value => new TextEncoder().encode(JSON.stringify(value)).length;
async function digest(text) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(hash), n => n.toString(16).padStart(2, '0')).join('');
}

export async function syncHeads(snapshot) {
  const items = snapshot || await getStorage('sync', null);
  const manifests = Object.entries(items).filter(([key]) => key.startsWith(`${PREFIX}head:`));
  const generations = [];
  for (const [key, m] of manifests) {
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
  }
  const ancestors = new Set(generations.flatMap(r => r.parents));
  const heads = generations.filter(r => !ancestors.has(r.revision));
  if (!generations.length) {
    const legacy = await readLegacySyncRecord();
    if (legacy) heads.push(validateRecord(legacy));
  }
  return heads;
}

export async function publishGeneration(record) {
  validateRecord(record);
  if (record.version !== 2) throw new Error('Unlock the legacy vault before enabling Sync.');
  const existing = await getStorage('sync', null);
  const key = `${PREFIX}head:${record.revision}`;
  if (existing[key]) return;
  const text = JSON.stringify(record);
  const chunks = {};
  for (let i = 0; i < text.length; i += CHUNK) chunks[`${PREFIX}${record.revision}:${i / CHUNK}`] = text.slice(i, i + CHUNK);
  const manifest = { id: record.revision, chunks: Object.keys(chunks).length, parents: record.parents, digest: await digest(text) };
  if (manifest.chunks > 32) throw new Error('Vault exceeds Chrome Sync capacity. Your local copy is safe; use encrypted backups.');
  const all = { ...existing, ...chunks, [key]: manifest };
  if (Object.entries(all).reduce((n, [k, v]) => n + utf8(v) + k.length, 0) > LIMIT) {
    throw new Error('Sync history is full. Export recovery copies and compact history in Sync settings. Local changes remain saved.');
  }
  // Immutable chunks first; only complete generations become visible. Never delete an old generation here.
  await setStorage('sync', chunks);
  const written = await getStorage('sync', Object.keys(chunks));
  if (Object.entries(chunks).some(([k, v]) => written[k] !== v)) throw new Error('Sync chunks could not be verified.');
  await setStorage('sync', { [key]: manifest });
}

export const revisionOf = recordRevision;
