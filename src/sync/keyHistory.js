import { encodeKey, seal, open } from '../vault/crypto.js';
import { requireAuthorityState } from './authorizationGraph.js';
import { identity, exactFields, canonicalBytes, copyRoot, materialDigest, materialKey, protectedBytes } from './keyMaterial.js';

const MAX_KEYS = 64;
export function canonicalKeyHistory(value) {
  exactFields(value, ['kind', 'version', 'vaultId', 'keyEpoch', 'keySalt', 'protectedKeys']);
  if (value.kind !== 'securepass-key-history' || value.version !== 1 || ![value.vaultId, value.keyEpoch].every(identity)) throw new Error('Invalid historical-key identity.');
  canonicalBytes(value.keySalt, 32);
  return { kind: value.kind, version: 1, vaultId: value.vaultId, keyEpoch: value.keyEpoch, keySalt: value.keySalt, protectedKeys: protectedBytes(value.protectedKeys, 18, 16384) };
}
const canonical = canonicalKeyHistory;
const context = value => JSON.stringify(['SecurePass:key-history:1', value.vaultId, value.keyEpoch, value.keySalt]);
export async function keyHistoryDigest(value) {
  return materialDigest('SecurePass:key-history-envelope:1', canonical(value));
}
// Produces a candidate only. Its digest must be enrolled by an administrative
// transition before any historical key is used for an authenticated revision.
export async function createKeyHistory(entries, bytes, expected) {
  if (!identity(expected?.vaultId) || !identity(expected?.keyEpoch) || !Array.isArray(entries) || entries.length < 1 || entries.length > MAX_KEYS) throw new Error('Invalid historical-key identity or key budget.');
  const root = copyRoot(bytes); const copied = []; let plaintext;
  try {
    const epochs = new Set();
    for (const entry of entries) {
      exactFields(entry, ['keyEpoch', 'bytes']);
      if (!identity(entry.keyEpoch) || entry.keyEpoch === expected.keyEpoch || epochs.has(entry.keyEpoch)) throw new Error('Historical epochs must be unique and exclude the active epoch.');
      epochs.add(entry.keyEpoch); copied.push({ keyEpoch: entry.keyEpoch, bytes: copyRoot(entry.bytes) });
    }
    copied.sort((a, b) => a.keyEpoch < b.keyEpoch ? -1 : 1);
    const value = { kind: 'securepass-key-history', version: 1, vaultId: expected.vaultId, keyEpoch: expected.keyEpoch, keySalt: encodeKey(crypto.getRandomValues(new Uint8Array(32))) };
    plaintext = new TextEncoder().encode(JSON.stringify(copied.map(entry => ({ keyEpoch: entry.keyEpoch, root: encodeKey(entry.bytes) }))));
    value.protectedKeys = await seal(plaintext, await materialKey(root, value.keySalt, context(value)), context(value));
    return canonical(value);
  } finally { root.fill(0); plaintext?.fill(0); copied.forEach(entry => entry.bytes.fill(0)); }
}
export async function openKeyHistory(value, bytes, state) {
  const authority = requireAuthorityState(state, { live: true }); const envelope = canonical(value);
  if (envelope.vaultId !== authority.payload.vaultId || envelope.keyEpoch !== authority.payload.keyEpoch) throw new Error('Historical-key authority context mismatch.');
  const root = copyRoot(bytes); let plaintext; const result = [];
  try {
    if (await keyHistoryDigest(envelope) !== authority.payload.keyHistoryDigest) throw new Error('Historical-key envelope is not bound to authority.');
    plaintext = new Uint8Array(await open(envelope.protectedKeys, await materialKey(root, envelope.keySalt, context(envelope)), context(envelope)));
    const source = new TextDecoder('utf-8', { fatal: true }).decode(plaintext); const entries = JSON.parse(source);
    if (!Array.isArray(entries) || !entries.length || entries.length > MAX_KEYS) throw new Error('Invalid historical-key budget.');
    let previous = '';
    for (const entry of entries) {
      exactFields(entry, ['keyEpoch', 'root']);
      if (!identity(entry.keyEpoch) || entry.keyEpoch <= previous || entry.keyEpoch === envelope.keyEpoch) throw new Error('Invalid historical-key epoch.');
      previous = entry.keyEpoch; result.push({ keyEpoch: entry.keyEpoch, bytes: canonicalBytes(entry.root, 32) });
    }
    if (JSON.stringify(result.map(entry => ({ keyEpoch: entry.keyEpoch, root: encodeKey(entry.bytes) }))) !== source) throw new Error('Noncanonical historical-key plaintext.');
    return result;
  } catch (error) { result.forEach(entry => entry.bytes.fill(0)); throw error;
  } finally { root.fill(0); plaintext?.fill(0); }
}
