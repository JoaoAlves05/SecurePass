import { base64ToBuffer, bufferToBase64 } from '../encoding.js';
import { validateImportData, validateVaultEntries, validateMaster } from '../validation.js';
import { createPayload, validatePayload, advancePayload } from './payload.js';

const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });
export const ITERATIONS = 600000;
export const MAX_CIPHERTEXT_BYTES = 8 * 1024 * 1024;
export const newKey = () => crypto.getRandomValues(new Uint8Array(32));
export const encodeKey = bytes => bufferToBase64(bytes.buffer || bytes);
export function decodeBytes(value, min, max = min) {
  if (typeof value !== 'string' || value.length > Math.ceil(max / 3) * 4 + 4 || !/^[A-Za-z0-9+/]*={0,2}$/.test(value)) throw new Error('Invalid encrypted data encoding.');
  const bytes = new Uint8Array(base64ToBuffer(value));
  if (bytes.length < min || bytes.length > max) throw new Error('Invalid encrypted data length.');
  return bytes;
}

async function aesKey(bytes) {
  return crypto.subtle.importKey('raw', bytes, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

export async function deriveMasterKey(passphrase, salt, iterations = ITERATIONS) {
  if (!Number.isInteger(iterations) || iterations < 100000 || iterations > 2000000) throw new Error('Unsupported KDF cost.');
  const key = await crypto.subtle.importKey('raw', encoder.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, key, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

export async function seal(value, key, context) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = value instanceof Uint8Array ? value : encoder.encode(JSON.stringify(value));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: encoder.encode(context) }, key, data);
  return { iv: encodeKey(iv), ciphertext: bufferToBase64(encrypted) };
}

export async function open(envelope, key, context) {
  return crypto.subtle.decrypt({ name: 'AES-GCM', iv: decodeBytes(envelope.iv, 12), additionalData: encoder.encode(context) }, key, decodeBytes(envelope.ciphertext, 16, MAX_CIPHERTEXT_BYTES));
}

const keyContext = record => `SecurePass:key:${record.vaultId}:${record.keyEpoch}`;
const dataContext = record => JSON.stringify({ version: record.version, vaultId: record.vaultId, revision: record.revision, parents: record.parents, keyEpoch: record.keyEpoch, ...(record.version === 3 ? { keySalt: record.keySalt } : {}) });
async function payloadKey(bytes, record) {
  if (!(bytes instanceof Uint8Array) || bytes.length !== 32) throw new Error('A 256-bit vault root key is required.');
  if (record.version !== 3) return aesKey(bytes);
  const root = await crypto.subtle.importKey('raw', bytes, 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: decodeBytes(record.keySalt, 32), info: encoder.encode(JSON.stringify(['SecurePass:data-key:3', record.vaultId, record.keyEpoch, record.revision])) }, root, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
const freshKeySalt = record => { if (record.version === 3) record.keySalt = encodeKey(crypto.getRandomValues(new Uint8Array(32))); };

export function validateRecord(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) throw new Error('Invalid vault record.');
  if (record.version === undefined) {
    decodeBytes(record.salt, 16); decodeBytes(record.iv, 12); decodeBytes(record.ciphertext, 16, MAX_CIPHERTEXT_BYTES);
    if (!Number.isInteger(record.iterations) || record.iterations < 100000 || record.iterations > 2000000) throw new Error('Invalid legacy KDF.');
    return record;
  }
  if (![2, 3].includes(record.version) || record.kind !== 'securepass-vault') throw new Error('Unsupported vault version.');
  for (const field of ['vaultId', 'revision', 'keyEpoch']) if (typeof record[field] !== 'string' || !/^[\w-]{1,64}$/.test(record[field])) throw new Error('Invalid vault identity.');
  if (!Array.isArray(record.parents) || record.parents.length > 256 || record.parents.some(id => typeof id !== 'string' || !/^[\w-]{1,64}$/.test(id))) throw new Error('Invalid vault ancestry.');
  if (!record.kdf || record.kdf.name !== 'PBKDF2' || record.kdf.iterations < ITERATIONS || record.kdf.iterations > 2000000 || !Number.isInteger(record.kdf.iterations)) throw new Error('Invalid vault KDF.');
  decodeBytes(record.kdf.salt, 16);
  for (const envelope of [record.wrappedKey, record.data]) {
    if (!envelope) throw new Error('Missing encrypted vault payload.');
    decodeBytes(envelope.iv, 12); decodeBytes(envelope.ciphertext, 16, MAX_CIPHERTEXT_BYTES);
  }
  if (record.version === 3) {
    if (Object.keys(record).sort().join(',') !== ['kind', 'version', 'vaultId', 'revision', 'parents', 'keyEpoch', 'updatedAt', 'kdf', 'wrappedKey', 'keySalt', 'data'].sort().join(',')) throw new Error('Unsupported vault-v3 fields.');
    if (record.parents.length > 2 || record.parents.includes(record.revision) || new Set(record.parents).size !== record.parents.length || JSON.stringify(record.parents) !== JSON.stringify([...record.parents].sort())) throw new Error('Invalid vault-v3 ancestry.');
    if (typeof record.updatedAt !== 'string' || record.updatedAt.length > 64 || !Number.isFinite(Date.parse(record.updatedAt)) || new Date(record.updatedAt).toISOString() !== record.updatedAt) throw new Error('Invalid vault-v3 timestamp.');
    if (Object.keys(record.kdf).sort().join(',') !== 'iterations,name,salt' || [record.data, record.wrappedKey].some(value => Object.keys(value).sort().join(',') !== 'ciphertext,iv')) throw new Error('Unsupported vault-v3 envelope fields.');
    for (const [value, minimum, maximum] of [[record.keySalt, 32, 32], [record.kdf.salt, 16, 16], [record.wrappedKey.iv, 12, 12], [record.wrappedKey.ciphertext, 48, 48], [record.data.iv, 12, 12], [record.data.ciphertext, 16, MAX_CIPHERTEXT_BYTES]]) if (encodeKey(decodeBytes(value, minimum, maximum)) !== value) throw new Error('Noncanonical vault-v3 encoding.');
  }
  return record;
}

export async function createRecord(entries, passphrase, identity = {}) {
  validateMaster(passphrase);
  entries = validateVaultEntries(entries);
  const payload = createPayload(entries, identity.history);
  const version = identity.version ?? 2;
  if (![2, 3].includes(version)) throw new Error('Unsupported vault version.');
  const bytes = newKey();
  const record = {
    kind: 'securepass-vault', version, vaultId: identity.vaultId || crypto.randomUUID(),
    revision: crypto.randomUUID(), parents: identity.parents || [], keyEpoch: crypto.randomUUID(),
    updatedAt: new Date().toISOString(), kdf: { name: 'PBKDF2', iterations: ITERATIONS, salt: encodeKey(crypto.getRandomValues(new Uint8Array(16))) }
  };
  if (version === 3) record.parents = [...new Set(record.parents)].sort();
  freshKeySalt(record);
  const master = await deriveMasterKey(passphrase, decodeBytes(record.kdf.salt, 16));
  record.wrappedKey = await seal(bytes, master, keyContext(record));
  record.data = await seal(payload, await payloadKey(bytes, record), dataContext(record));
  validateRecord(record);
  return { record, bytes };
}

export async function decryptRecord(record, passphrase) {
  validateRecord(record);
  if (!record.version) {
    const master = await deriveMasterKey(passphrase, decodeBytes(record.salt, 16), record.iterations);
    const data = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: decodeBytes(record.iv, 12) }, master, decodeBytes(record.ciphertext, 16, MAX_CIPHERTEXT_BYTES));
    return { entries: validateImportData(JSON.parse(decoder.decode(data))).entries, legacy: true };
  }
  const master = await deriveMasterKey(passphrase, decodeBytes(record.kdf.salt, 16), record.kdf.iterations);
  const bytes = new Uint8Array(await open(record.wrappedKey, master, keyContext(record)));
  if (bytes.length !== 32) throw new Error('Invalid vault key.');
  return { ...await decryptPayloadWithKey(record, bytes), bytes };
}

export async function decryptWithKey(record, bytes, { requireIdentity = false } = {}) {
  return (await decryptPayloadWithKey(record, bytes, { requireIdentity })).entries;
}

export async function decryptPayloadWithKey(record, bytes, { requireIdentity = false } = {}) {
  validateRecord(record);
  const payload = JSON.parse(decoder.decode(await open(record.data, await payloadKey(bytes, record), dataContext(record))));
  return validatePayload(payload, { requireIdentity });
}

export async function encryptEntries(previous, entries, bytes, parents = previous.version === 3 ? [previous.revision] : [previous.revision, ...previous.parents], options = {}) {
  entries = validateVaultEntries(entries);
  parents = [...new Set(parents)].slice(0, 160);
  const record = { ...previous, revision: crypto.randomUUID(), parents: [...new Set(parents)], updatedAt: new Date().toISOString() };
  if (record.version === 3) record.parents.sort();
  freshKeySalt(record);
  const payload = advancePayload(await decryptPayloadWithKey(previous, bytes), entries, record.revision, options);
  record.data = await seal(payload, await payloadKey(bytes, record), dataContext(record));
  validateRecord(record);
  return record;
}

// Callers obtain metadata through a revision-bound authenticated merge review.
export async function encryptMergedPayload(previous, payload, bytes, parents, revision) {
  await decryptPayloadWithKey(previous, bytes);
  payload = validatePayload(payload);
  const record = { ...previous, revision, parents: [...new Set(parents)].sort(), updatedAt: new Date().toISOString() };
  freshKeySalt(record);
  if (record.parents.length < 1 || record.parents.length > 2 || !record.parents.includes(previous.revision) || record.parents.includes(revision)) throw new Error('Invalid selected merge ancestry.');
  validateRecord(record);
  record.data = await seal(payload, await payloadKey(bytes, record), dataContext(record));
  return record;
}

// Historical contents share the active protection, retaining their content ID/date.
export async function protectCheckpoint(previous, entries, active, bytes, history) {
  entries = validateVaultEntries(entries);
  const record = { ...active, revision: previous.revision || crypto.randomUUID(), parents: [], updatedAt: previous.updatedAt };
  if (record.version === 3 && (typeof record.updatedAt !== 'string' || !Number.isFinite(Date.parse(record.updatedAt)))) record.updatedAt = active.updatedAt;
  if (record.version === 3) record.updatedAt = new Date(record.updatedAt).toISOString();
  freshKeySalt(record);
  record.data = await seal(createPayload(entries, history), await payloadKey(bytes, record), dataContext(record));
  validateRecord(record);
  return record;
}

export async function prfKey(prf) {
  const raw = decodeBytes(prf, 32);
  const material = await crypto.subtle.importKey('raw', raw, 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(32), info: encoder.encode('securepass-biometric-v2') }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
