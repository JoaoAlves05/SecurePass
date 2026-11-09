import { validateRecord, deriveMasterKey, open, ITERATIONS } from '../vault/crypto.js';
import { validateMaster } from '../validation.js';
import { identity, exactFields, canonicalBytes, protectedBytes, textBytes } from './keyMaterial.js';

export function canonicalVaultProtection(value) {
  exactFields(value, ['kind', 'version', 'vaultId', 'keyEpoch', 'kdf', 'wrappedKey']);
  if (value.kind !== 'securepass-vault-protection' || value.version !== 1 || ![value.vaultId, value.keyEpoch].every(identity)) throw new Error('Invalid vault-protection identity.');
  exactFields(value.kdf, ['name', 'iterations', 'salt']);
  if (value.kdf.name !== 'PBKDF2' || !Number.isInteger(value.kdf.iterations) || value.kdf.iterations < ITERATIONS || value.kdf.iterations > 2000000) throw new Error('Invalid vault-protection KDF.');
  canonicalBytes(value.kdf.salt, 16);
  return { kind: value.kind, version: 1, vaultId: value.vaultId, keyEpoch: value.keyEpoch, kdf: { name: value.kdf.name, iterations: value.kdf.iterations, salt: value.kdf.salt }, wrappedKey: protectedBytes(value.wrappedKey, 48, 48) };
}
export function vaultProtectionFromRecord(record) {
  validateRecord(record);
  if (record.version !== 3) throw new Error('Vault-v3 protection is required.');
  return canonicalVaultProtection({ kind: 'securepass-vault-protection', version: 1, vaultId: record.vaultId, keyEpoch: record.keyEpoch, kdf: record.kdf, wrappedKey: record.wrappedKey });
}
export async function vaultProtectionDigest(value) {
  const pinned = canonicalVaultProtection(value);
  const tuple = ['SecurePass:protection:1', pinned.vaultId, pinned.keyEpoch, [pinned.kdf.name, pinned.kdf.iterations, pinned.kdf.salt], [pinned.wrappedKey.iv, pinned.wrappedKey.ciphertext]];
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', textBytes(tuple)))].map(byte => byte.toString(16).padStart(2, '0')).join('');
}
export async function unlockVaultProtection(value, passphrase) {
  const pinned = canonicalVaultProtection(value); validateMaster(passphrase);
  const key = await deriveMasterKey(passphrase, canonicalBytes(pinned.kdf.salt, 16), pinned.kdf.iterations);
  const bytes = new Uint8Array(await open(pinned.wrappedKey, key, `SecurePass:key:${pinned.vaultId}:${pinned.keyEpoch}`));
  if (bytes.length !== 32) { bytes.fill(0); throw new Error('Invalid protected content root.'); }
  return bytes;
}
