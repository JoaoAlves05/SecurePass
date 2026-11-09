import { bufferToBase64 } from '../encoding.js';
import { deriveMasterKey, decodeBytes, seal, open, ITERATIONS } from '../vault/crypto.js';
import { validateMaster } from '../validation.js';
const validId = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(value);
function validate(value, expected, role) {
  if (!value || Object.keys(value).sort().join(',') !== ['kind','version','role','vaultId','keyEpoch','keyId','publicKey','kdf','protectedKey'].sort().join(',') || value.kind !== 'securepass-signing-key' || value.version !== 1 || value.role !== role || ![value.vaultId,value.keyEpoch,value.keyId].every(validId) || value.vaultId !== expected?.vaultId || value.keyEpoch !== expected?.keyEpoch) throw new Error('Signing key context mismatch.');
  decodeBytes(value.publicKey,91);
  if (!value.protectedKey || Object.keys(value.protectedKey).sort().join(',') !== 'ciphertext,iv') throw new Error('Invalid protected signing key.');
  decodeBytes(value.protectedKey.iv,12);decodeBytes(value.protectedKey.ciphertext,16,1024);
  if (role === 'admin') {
    if (!value.kdf || Object.keys(value.kdf).sort().join(',') !== 'iterations,name,salt' || value.kdf.name !== 'PBKDF2' || !Number.isInteger(value.kdf.iterations) || value.kdf.iterations < ITERATIONS || value.kdf.iterations > 2000000) throw new Error('Invalid signing-key KDF.');
    decodeBytes(value.kdf.salt,16);
  } else if (value.kdf !== null) throw new Error('Invalid device key protection.');
  return structuredClone(value);
}
const context = value => JSON.stringify(['SecurePass:signing-key:1',value.role,value.vaultId,value.keyEpoch,value.keyId,value.publicKey]);
export function canonicalAdministrativeEnvelope(value, expected) {
  const key = validate(value, expected, 'admin');
  return { kind: key.kind, version: key.version, role: key.role, vaultId: key.vaultId, keyEpoch: key.keyEpoch, keyId: key.keyId, publicKey: key.publicKey, kdf: { name: key.kdf.name, iterations: key.kdf.iterations, salt: key.kdf.salt }, protectedKey: { iv: key.protectedKey.iv, ciphertext: key.protectedKey.ciphertext } };
}
async function contentKey(bytes) {
  if (!(bytes instanceof Uint8Array) || bytes.length !== 32) throw new Error('A valid content key is required.');
  return crypto.subtle.importKey('raw',bytes,'AES-GCM',false,['encrypt','decrypt']);
}
async function unwrap(envelope, wrappingKey) {
  const raw = new Uint8Array(await open(envelope.protectedKey,wrappingKey,context(envelope)));
  try {
    const privateKey = await crypto.subtle.importKey('pkcs8',raw,{name:'ECDSA',namedCurve:'P-256'},false,['sign']);
    const publicKey = await crypto.subtle.importKey('spki',decodeBytes(envelope.publicKey,91),{name:'ECDSA',namedCurve:'P-256'},false,['verify']);
    const probe = crypto.getRandomValues(new Uint8Array(32));
    const signature = await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},privateKey,probe);
    if (!await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},publicKey,signature,probe)) throw new Error('Signing key pair mismatch.');
    return privateKey;
  } finally { raw.fill(0); }
}
async function create(role, expected, wrappingKey, kdf) {
  if (!validId(expected?.vaultId) || !validId(expected?.keyEpoch)) throw new Error('Invalid signing key identity.');
  const pair = await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
  const envelope = {kind:'securepass-signing-key',version:1,role,vaultId:expected.vaultId,keyEpoch:expected.keyEpoch,keyId:crypto.randomUUID(),publicKey:bufferToBase64(await crypto.subtle.exportKey('spki',pair.publicKey)),kdf};
  const raw = new Uint8Array(await crypto.subtle.exportKey('pkcs8',pair.privateKey));
  try { envelope.protectedKey = await seal(raw,wrappingKey,context(envelope)); }
  finally { raw.fill(0); }
  return {envelope,privateKey:await unwrap(envelope,wrappingKey)};
}
export async function createAdministrativeKey(passphrase, expected) {
  validateMaster(passphrase);
  const pinned = structuredClone(expected);
  const kdf = {name:'PBKDF2',iterations:ITERATIONS,salt:bufferToBase64(crypto.getRandomValues(new Uint8Array(16)).buffer)};
  const key = await deriveMasterKey(passphrase,decodeBytes(kdf.salt,16));
  return create('admin',pinned,key,kdf);
}
export async function unlockAdministrativeKey(value, passphrase, expected) {
  const envelope = validate(value,expected,'admin'); validateMaster(passphrase);
  return unwrap(envelope,await deriveMasterKey(passphrase,decodeBytes(envelope.kdf.salt,16),envelope.kdf.iterations));
}
export function createDeviceKey(bytes, expected) {
  const pinned = structuredClone(expected);
  return contentKey(bytes).then(key=>create('device',pinned,key,null));
}
export async function unlockDeviceKey(value, bytes, expected) {
  return unwrap(validate(value,expected,'device'),await contentKey(bytes));
}
