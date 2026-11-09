import { encodeKey, seal, open, decryptWithKey } from '../vault/crypto.js';
import { requireAuthorityState } from './authorizationGraph.js';
import { canonicalRecord3, protectionDigest } from './revisionProtocol2.js';
import { identity, exactFields, canonicalBytes, copyRoot, materialDigest, materialKey, protectedBytes, textBytes } from './keyMaterial.js';

const signingAlgorithm = { name: 'ECDSA', namedCurve: 'P-256' };
const encryptionAlgorithm = { name: 'RSA-OAEP', hash: 'SHA-256' };
function privateEnvelope(value) {
  exactFields(value, ['kind', 'version', 'vaultId', 'recoveryId', 'signingKey', 'encryptionKey', 'keySalt', 'protectedKeys']);
  if (value.kind !== 'securepass-recovery-private' || value.version !== 1 || ![value.vaultId, value.recoveryId].every(identity)) throw new Error('Invalid recovery-private identity.');
  canonicalBytes(value.signingKey, 91); canonicalBytes(value.encryptionKey, 350, 600); canonicalBytes(value.keySalt, 32);
  return { kind: value.kind, version: 1, vaultId: value.vaultId, recoveryId: value.recoveryId, signingKey: value.signingKey, encryptionKey: value.encryptionKey, keySalt: value.keySalt, protectedKeys: protectedBytes(value.protectedKeys, 18, 8192) };
}
function rootEnvelope(value) {
  exactFields(value, ['kind', 'version', 'vaultId', 'keyEpoch', 'recoveryId', 'ciphertext']);
  if (value.kind !== 'securepass-recovery-root' || value.version !== 1 || ![value.vaultId, value.keyEpoch, value.recoveryId].every(identity)) throw new Error('Invalid recovery-root identity.');
  canonicalBytes(value.ciphertext, 384);
  return { kind: value.kind, version: 1, vaultId: value.vaultId, keyEpoch: value.keyEpoch, recoveryId: value.recoveryId, ciphertext: value.ciphertext };
}
function canonical(value) {
  exactFields(value, ['privateEnvelope', 'rootEnvelope']);
  const secret = privateEnvelope(value.privateEnvelope); const root = rootEnvelope(value.rootEnvelope);
  if (secret.vaultId !== root.vaultId || secret.recoveryId !== root.recoveryId) throw new Error('Recovery envelope identities differ.');
  return { privateEnvelope: secret, rootEnvelope: root };
}
const privateContext = value => JSON.stringify(['SecurePass:recovery-private:1', value.vaultId, value.recoveryId, value.signingKey, value.encryptionKey, value.keySalt]);
const rootContext = value => textBytes(['SecurePass:recovery-root:1', value.vaultId, value.keyEpoch, value.recoveryId]);
export async function recoveryPolicy(value) {
  const material = canonical(value);
  return {
    signingKey: material.privateEnvelope.signingKey,
    encryptionKey: material.privateEnvelope.encryptionKey,
    privateEnvelopeDigest: await materialDigest('SecurePass:recovery-private-envelope:1', material.privateEnvelope),
    rootEnvelopeDigest: await materialDigest('SecurePass:recovery-root-envelope:1', material.rootEnvelope)
  };
}
async function boundMaterial(value, authority) {
  const material = canonical(value); const policy = await recoveryPolicy(material); const expected = authority.payload.recovery;
  if (material.privateEnvelope.vaultId !== authority.payload.vaultId || material.rootEnvelope.keyEpoch !== authority.payload.keyEpoch || !expected || Object.keys(policy).some(field => policy[field] !== expected[field])) throw new Error('Recovery material is not bound to live authority.');
  return material;
}
async function encryptionPublic(encoded) {
  const key = await crypto.subtle.importKey('spki', canonicalBytes(encoded, 350, 600), encryptionAlgorithm, false, ['encrypt']);
  if (key.algorithm.modulusLength !== 3072 || JSON.stringify([...key.algorithm.publicExponent]) !== '[1,0,1]') throw new Error('Unsupported recovery encryption key.');
  return key;
}
async function wrapRoot(secret, bytes, keyEpoch) {
  const value = { kind: 'securepass-recovery-root', version: 1, vaultId: secret.vaultId, keyEpoch, recoveryId: secret.recoveryId };
  value.ciphertext = encodeKey(new Uint8Array(await crypto.subtle.encrypt({ name: 'RSA-OAEP', label: rootContext(value) }, await encryptionPublic(secret.encryptionKey), bytes)));
  return rootEnvelope(value);
}
async function codeFor(secret, value) {
  const prefix = `SPREC1:${value.vaultId}:${value.recoveryId}:${encodeKey(secret).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')}`;
  return `${prefix}:${(await materialDigest('SecurePass:recovery-code:1', prefix)).slice(0, 16)}`;
}
async function parseCode(code, expected) {
  if (typeof code !== 'string' || code.length > 256) throw new Error('Invalid recovery code.');
  const parts = code.split(':');
  if (parts.length !== 5 || parts[0] !== 'SPREC1' || parts[1] !== expected.vaultId || parts[2] !== expected.recoveryId || !/^[A-Za-z0-9_-]{43}$/.test(parts[3]) || !/^[a-f0-9]{16}$/.test(parts[4])) throw new Error('Recovery code identity or encoding mismatch.');
  const secret = canonicalBytes(parts[3].replace(/-/g, '+').replace(/_/g, '/') + '=', 32);
  try {
    if (await codeFor(secret, expected) !== code) throw new Error('Recovery code checksum mismatch.');
    return secret;
  } catch (error) { secret.fill(0); throw error; }
}
async function checkRecord(record, bytes, payload, current) {
  if (record.vaultId !== payload.vaultId || current && (record.keyEpoch !== payload.keyEpoch || await protectionDigest(record) !== payload.protectionDigest) || !current && record.keyEpoch === payload.keyEpoch) throw new Error('Recovery content record does not match the required epoch/protection.');
  await decryptWithKey(record, bytes);
}
// Returns a candidate, not an enrolled kit. The controller must sign its policy,
// test openRecoveryKit against that candidate graph and obtain save confirmation.
export async function createRecoveryKit(record, bytes, state) {
  const authority = requireAuthorityState(state, { live: true }); const pinned = canonicalRecord3(record); const root = copyRoot(bytes);
  const secret = crypto.getRandomValues(new Uint8Array(32)); let plaintext; let signingRaw; let encryptionRaw;
  try {
    await checkRecord(pinned, root, authority.payload, true);
    const signing = await crypto.subtle.generateKey(signingAlgorithm, true, ['sign', 'verify']);
    const encryption = await crypto.subtle.generateKey({ ...encryptionAlgorithm, modulusLength: 3072, publicExponent: new Uint8Array([1, 0, 1]) }, true, ['encrypt', 'decrypt']);
    const value = { kind: 'securepass-recovery-private', version: 1, vaultId: pinned.vaultId, recoveryId: crypto.randomUUID(), signingKey: encodeKey(new Uint8Array(await crypto.subtle.exportKey('spki', signing.publicKey))), encryptionKey: encodeKey(new Uint8Array(await crypto.subtle.exportKey('spki', encryption.publicKey))), keySalt: encodeKey(crypto.getRandomValues(new Uint8Array(32))) };
    signingRaw = new Uint8Array(await crypto.subtle.exportKey('pkcs8', signing.privateKey)); encryptionRaw = new Uint8Array(await crypto.subtle.exportKey('pkcs8', encryption.privateKey));
    plaintext = new TextEncoder().encode(JSON.stringify({ signing: encodeKey(signingRaw), encryption: encodeKey(encryptionRaw) }));
    value.protectedKeys = await seal(plaintext, await materialKey(secret, value.keySalt, privateContext(value)), privateContext(value));
    const material = canonical({ privateEnvelope: value, rootEnvelope: await wrapRoot(value, root, pinned.keyEpoch) });
    return { code: await codeFor(secret, value), material, policy: await recoveryPolicy(material) };
  } finally { root.fill(0); secret.fill(0); plaintext?.fill(0); signingRaw?.fill(0); encryptionRaw?.fill(0); }
}
export async function openRecoveryKit(code, value, record, state) {
  const authority = requireAuthorityState(state, { live: true }); const pinned = canonicalRecord3(record);
  // Snapshot all untrusted inputs before the first asynchronous operation.
  const selected = canonical(value); const material = await boundMaterial(selected, authority);
  const secret = await parseCode(code, material.privateEnvelope); let plaintext; let signingRaw; let encryptionRaw; let root;
  try {
    const envelope = material.privateEnvelope;
    plaintext = new Uint8Array(await open(envelope.protectedKeys, await materialKey(secret, envelope.keySalt, privateContext(envelope)), privateContext(envelope)));
    const source = new TextDecoder('utf-8', { fatal: true }).decode(plaintext); const keys = JSON.parse(source); exactFields(keys, ['signing', 'encryption']);
    signingRaw = canonicalBytes(keys.signing, 100, 256); encryptionRaw = canonicalBytes(keys.encryption, 1200, 4096);
    if (JSON.stringify({ signing: encodeKey(signingRaw), encryption: encodeKey(encryptionRaw) }) !== source) throw new Error('Noncanonical recovery private keys.');
    const privateKey = await crypto.subtle.importKey('pkcs8', signingRaw, signingAlgorithm, false, ['sign']);
    const publicKey = await crypto.subtle.importKey('spki', canonicalBytes(envelope.signingKey, 91), signingAlgorithm, false, ['verify']);
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    if (!await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, publicKey, await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privateKey, challenge), challenge)) throw new Error('Recovery signing key pair mismatch.');
    const decryption = await crypto.subtle.importKey('pkcs8', encryptionRaw, encryptionAlgorithm, false, ['decrypt']);
    if (decryption.algorithm.modulusLength !== 3072 || JSON.stringify([...decryption.algorithm.publicExponent]) !== '[1,0,1]') throw new Error('Unsupported recovery private key.');
    // Prove both halves of the RSA pair, even if a faulty producer used the
    // wrong public key for the stored root ciphertext.
    const probe = crypto.getRandomValues(new Uint8Array(32)); const label = rootContext(material.rootEnvelope);
    const encrypted = await crypto.subtle.encrypt({ name: 'RSA-OAEP', label }, await encryptionPublic(envelope.encryptionKey), probe);
    const checked = new Uint8Array(await crypto.subtle.decrypt({ name: 'RSA-OAEP', label }, decryption, encrypted));
    if (checked.length !== probe.length || checked.some((byte, index) => byte !== probe[index])) throw new Error('Recovery encryption key pair mismatch.');
    root = new Uint8Array(await crypto.subtle.decrypt({ name: 'RSA-OAEP', label }, decryption, canonicalBytes(material.rootEnvelope.ciphertext, 384)));
    if (root.length !== 32) throw new Error('Invalid recovered root length.');
    await checkRecord(pinned, root, authority.payload, true);
    return { bytes: root, privateKey };
  } catch (error) { root?.fill(0); throw error;
  } finally { secret.fill(0); plaintext?.fill(0); signingRaw?.fill(0); encryptionRaw?.fill(0); }
}
// Public encryption permits rotation without the printed secret. This still
// produces a candidate requiring a new authenticated administrative transition.
export async function rewrapRecoveryRoot(value, record, bytes, state) {
  const authority = requireAuthorityState(state, { live: true }); const selected = canonical(value); const pinned = canonicalRecord3(record); const root = copyRoot(bytes);
  try {
    const material = await boundMaterial(selected, authority);
    await checkRecord(pinned, root, authority.payload, false);
    const next = { privateEnvelope: material.privateEnvelope, rootEnvelope: await wrapRoot(material.privateEnvelope, root, pinned.keyEpoch) };
    return { material: next, policy: await recoveryPolicy(next) };
  } finally { root.fill(0); }
}
