import { decodeBytes, encodeKey } from '../vault/crypto.js';

export const textBytes = value => new TextEncoder().encode(JSON.stringify(value));
export const identity = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(value);
export function exactFields(value, names) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).sort().join(',') !== [...names].sort().join(',')) throw new Error('Unsupported protected material fields.');
}
export function canonicalBytes(value, min, max = min) {
  const raw = decodeBytes(value, min, max);
  if (encodeKey(raw) !== value) throw new Error('Noncanonical protected material encoding.');
  return raw;
}
export function copyRoot(value) {
  if (!(value instanceof Uint8Array) || value.length !== 32) throw new Error('A 256-bit root is required.');
  return new Uint8Array(value);
}
export async function materialDigest(domain, value) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', textBytes([domain, value])))].map(byte => byte.toString(16).padStart(2, '0')).join('');
}
export async function materialKey(root, salt, context) {
  const key = await crypto.subtle.importKey('raw', root, 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: canonicalBytes(salt, 32), info: new TextEncoder().encode(context) }, key, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
export function protectedBytes(value, min, max) {
  exactFields(value, ['iv', 'ciphertext']);
  canonicalBytes(value.iv, 12); canonicalBytes(value.ciphertext, min, max);
  return { iv: value.iv, ciphertext: value.ciphertext };
}
