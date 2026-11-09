import { encodeKey, decodeBytes, seal, open } from '../vault/crypto.js';
const encoder = new TextEncoder();
const identity = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(value);
const fields = (value, expected) => value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).sort().join(',') === [...expected].sort().join(',');
function canonical(value, expected) {
  if (!fields(value, ['kind', 'version', 'role', 'vaultId', 'keyEpoch', 'keyId', 'publicKey', 'kdf', 'keySalt', 'protectedKey']) || value.kind !== 'securepass-signing-key' || value.version !== 2 || value.role !== 'device' || value.kdf !== null || ![value.vaultId, value.keyEpoch, value.keyId].every(identity) || value.vaultId !== expected?.vaultId || value.keyEpoch !== expected?.keyEpoch || !fields(value.protectedKey, ['iv', 'ciphertext'])) throw new Error('Device-v2 signing key context mismatch.');
  for (const [data, min, max] of [[value.publicKey, 91, 91], [value.keySalt, 32, 32], [value.protectedKey.iv, 12, 12], [value.protectedKey.ciphertext, 16, 1024]]) if (encodeKey(decodeBytes(data, min, max)) !== data) throw new Error('Noncanonical device-v2 key encoding.');
  return structuredClone(value);
}
const context = value => JSON.stringify(['SecurePass:device-key:2', value.vaultId, value.keyEpoch, value.keyId, value.publicKey, value.keySalt]);
async function wrappingKey(bytes, value) {
  if (!(bytes instanceof Uint8Array) || bytes.length !== 32) throw new Error('A 256-bit content root is required.');
  const material = await crypto.subtle.importKey('raw', bytes, 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: decodeBytes(value.keySalt, 32), info: encoder.encode(context(value)) }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function unwrap(envelope, key) {
  const raw = new Uint8Array(await open(envelope.protectedKey, key, context(envelope)));
  try {
    const privateKey = await crypto.subtle.importKey('pkcs8', raw, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
    const publicKey = await crypto.subtle.importKey('spki', decodeBytes(envelope.publicKey, 91), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const signature = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privateKey, challenge);
    if (!await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, publicKey, signature, challenge)) throw new Error('Device-v2 signing key pair mismatch.');
    return privateKey;
  } finally { raw.fill(0); }
}
export async function createDeviceKey2(bytes, expected) {
  if (!(bytes instanceof Uint8Array) || bytes.length !== 32 || !identity(expected?.vaultId) || !identity(expected?.keyEpoch)) throw new Error('Valid content root and device identity are required.');
  const root = new Uint8Array(bytes); const pinned = { vaultId: expected.vaultId, keyEpoch: expected.keyEpoch };
  try {
    const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
    const envelope = { kind: 'securepass-signing-key', version: 2, role: 'device', ...pinned, keyId: crypto.randomUUID(), publicKey: encodeKey(new Uint8Array(await crypto.subtle.exportKey('spki', pair.publicKey))), kdf: null, keySalt: encodeKey(crypto.getRandomValues(new Uint8Array(32))) };
    const key = await wrappingKey(root, envelope); const raw = new Uint8Array(await crypto.subtle.exportKey('pkcs8', pair.privateKey));
    try { envelope.protectedKey = await seal(raw, key, context(envelope)); } finally { raw.fill(0); }
    return { envelope, privateKey: await unwrap(envelope, key) };
  } finally { root.fill(0); }
}
export async function unlockDeviceKey2(value, bytes, expected) {
  const envelope = canonical(value, expected);
  if (!(bytes instanceof Uint8Array) || bytes.length !== 32) throw new Error('A 256-bit content root is required.');
  const root = new Uint8Array(bytes);
  try { return await unwrap(envelope, await wrappingKey(root, envelope)); } finally { root.fill(0); }
}
