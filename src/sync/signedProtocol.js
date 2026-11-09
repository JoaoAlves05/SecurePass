import { bufferToBase64 } from '../encoding.js';
import { decodeBytes, validateRecord } from '../vault/crypto.js';
const encoder = new TextEncoder();
const verifiedStates = new WeakMap();
const identity = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(value);
const digestId = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
function fields(value, names) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).sort().join(',') !== [...names].sort().join(',')) throw new Error('Unsupported signed structure.');
}
const bytes = value => encoder.encode(JSON.stringify(value));
async function digest(value) { return [...new Uint8Array(await crypto.subtle.digest('SHA-256', value))].map(byte => byte.toString(16).padStart(2, '0')).join(''); }
const publicKey = value => crypto.subtle.importKey('spki', decodeBytes(value, 91), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
async function sign(tuple, key) { return bufferToBase64(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, bytes(tuple))); }
async function check(tuple, signature, key) {
  if (!await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, await publicKey(key), decodeBytes(signature, 64), bytes(tuple))) throw new Error('Invalid protocol signature.');
}
export async function generateSigningKey() {
  const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify']);
  return { privateKey: pair.privateKey, publicKey: bufferToBase64(await crypto.subtle.exportKey('spki', pair.publicKey)) };
}
export const signingKeyFingerprint = key => digest(decodeBytes(key, 91));
function authorizationPayload(value) {
  fields(value, ['kind', 'version', 'vaultId', 'keyEpoch', 'revision', 'previous', 'adminKey', 'devices']);
  if (value.kind !== 'securepass-authorization' || value.version !== 1 || ![value.vaultId, value.keyEpoch, value.revision].every(identity) || value.previous !== null && !digestId(value.previous)) throw new Error('Invalid authorization identity.');
  decodeBytes(value.adminKey, 91);
  if (!Array.isArray(value.devices) || value.devices.length < 1 || value.devices.length > 128) throw new Error('Invalid device registry.');
  let last = '';
  const devices = value.devices.map(device => {
    fields(device, ['id', 'publicKey']);
    if (!identity(device.id) || device.id <= last) throw new Error('Device registry must be unique and sorted.');
    last = device.id; decodeBytes(device.publicKey, 91);
    return Object.freeze({ id: device.id, publicKey: device.publicKey });
  });
  return Object.freeze({ kind: value.kind, version: 1, vaultId: value.vaultId, keyEpoch: value.keyEpoch, revision: value.revision, previous: value.previous, adminKey: value.adminKey, devices: Object.freeze(devices) });
}
const authTuple = p => ['SecurePass:authorization:1', p.vaultId, p.keyEpoch, p.revision, p.previous, p.adminKey, p.devices.map(d => [d.id, d.publicKey])];
function known(state) {
  const result = verifiedStates.get(state);
  if (!result) throw new Error('Verified authorization state required.');
  return result;
}
export async function createAuthorization(payload, privateKey) {
  const snapshot = authorizationPayload(payload);
  // Signing is not authority verification; consumers must verify the whole chain.
  return { payload: snapshot, signature: await sign(authTuple(snapshot), privateKey) };
}
export function canonicalAuthorizationChain(chain) {
  if (!Array.isArray(chain) || !chain.length || chain.length > 256) throw new Error('A bounded authorization chain is required.');
  return chain.map(value => { fields(value, ['payload', 'signature']); return { payload: authorizationPayload(value.payload), signature: value.signature }; });
}
export async function verifyAuthorizationChain(chain, { vaultId, rootFingerprint, expectedHead, checkpoint } = {}) {
  if (!identity(vaultId) || !digestId(rootFingerprint) || expectedHead !== undefined && !digestId(expectedHead) || checkpoint !== undefined && !digestId(checkpoint) || !Array.isArray(chain) || !chain.length || chain.length > 256) throw new Error('A bounded chain and independent trust anchor are required.');
  // Snapshot caller-controlled inputs before any asynchronous verification.
  const snapshots = canonicalAuthorizationChain(chain);
  let previous = null; let checkpointSeen = false; const revisions = new Set();
  for (const signed of snapshots) {
    const p = signed.payload;
    if (p.vaultId !== vaultId || revisions.has(p.revision)) throw new Error('Authorization vault mismatch or replay.');
    revisions.add(p.revision);
    if (!previous) {
      if (p.previous !== null || await signingKeyFingerprint(p.adminKey) !== rootFingerprint) throw new Error('Untrusted authorization root.');
    } else if (p.previous !== previous.hash) throw new Error('Divergent or incomplete authorization chain.');
    await publicKey(p.adminKey);
    for (const device of p.devices) await publicKey(device.publicKey);
    await check(authTuple(p), signed.signature, previous ? previous.payload.adminKey : p.adminKey);
    previous = { payload: p, hash: await digest(bytes(authTuple(p))) };
    if (previous.hash === checkpoint) checkpointSeen = true;
  }
  if (checkpoint !== undefined && !checkpointSeen) throw new Error('Known authorization checkpoint is not in this chain.');
  if (expectedHead !== undefined && previous.hash !== expectedHead) throw new Error('Authorization checkpoint mismatch.');
  const result = Object.freeze({ ...previous, freshness: expectedHead !== undefined ? 'matches-checkpoint' : checkpointSeen ? 'descends-from-checkpoint' : 'unproven' });
  verifiedStates.set(result, previous); return result;
}
function encryptedRecord(record) {
  fields(record, ['kind', 'version', 'vaultId', 'revision', 'parents', 'keyEpoch', 'updatedAt', 'kdf', 'wrappedKey', 'data']);
  fields(record.kdf, ['name', 'iterations', 'salt']);
  for (const envelope of [record.wrappedKey, record.data]) fields(envelope, ['iv', 'ciphertext']);
  validateRecord(record);
  decodeBytes(record.wrappedKey.ciphertext, 48);
  if (record.version !== 2 || typeof record.updatedAt !== 'string' || record.updatedAt.length > 64 || !Number.isFinite(Date.parse(record.updatedAt)) || new Date(record.updatedAt).toISOString() !== record.updatedAt || new Set(record.parents).size !== record.parents.length) throw new Error('Unsupported signed record.');
  return { kind: record.kind, version: record.version, vaultId: record.vaultId, revision: record.revision, parents: [...record.parents], keyEpoch: record.keyEpoch, updatedAt: record.updatedAt, kdf: { name: record.kdf.name, iterations: record.kdf.iterations, salt: record.kdf.salt }, wrappedKey: { iv: record.wrappedKey.iv, ciphertext: record.wrappedKey.ciphertext }, data: { iv: record.data.iv, ciphertext: record.data.ciphertext } };
}
const revisionTuple = p => ['SecurePass:revision:1', p.author, p.authorization, p.record.kind, p.record.version, p.record.vaultId, p.record.revision, p.record.parents, p.record.keyEpoch, p.record.updatedAt, [p.record.kdf.name, p.record.kdf.iterations, p.record.kdf.salt], [p.record.wrappedKey.iv, p.record.wrappedKey.ciphertext], [p.record.data.iv, p.record.data.ciphertext]];
function revisionPayload(value) {
  fields(value, ['kind', 'version', 'author', 'authorization', 'record']);
  if (value.kind !== 'securepass-signed-revision' || value.version !== 1 || !identity(value.author) || !digestId(value.authorization)) throw new Error('Unsupported signed revision.');
  return { kind: value.kind, version: 1, author: value.author, authorization: value.authorization, record: encryptedRecord(value.record) };
}
function writer(payload, state) {
  const auth = known(state);
  if (payload.authorization !== auth.hash || payload.record.vaultId !== auth.payload.vaultId || payload.record.keyEpoch !== auth.payload.keyEpoch) throw new Error('Revision authorization, vault or epoch mismatch.');
  const device = auth.payload.devices.find(value => value.id === payload.author);
  if (!device) throw new Error('Revision author is not authorized.');
  return device.publicKey;
}
export async function createSignedRevision(record, author, privateKey, state) {
  const p = revisionPayload({ kind: 'securepass-signed-revision', version: 1, author, authorization: known(state).hash, record });
  const key = writer(p, state); const signature = await sign(revisionTuple(p), privateKey);
  await check(revisionTuple(p), signature, key);
  return JSON.stringify({ payload: p, signature });
}
export async function verifySignedPublication(body, publication, state) {
  if (typeof body !== 'string' || body.length > 16 * 1024 * 1024 || encoder.encode(body).length > 16 * 1024 * 1024) throw new Error('Signed packet exceeds limit.');
  const signed = JSON.parse(body); fields(signed, ['payload', 'signature']);
  const p = revisionPayload(signed.payload);
  if (JSON.stringify({ payload: p, signature: signed.signature }) !== body) throw new Error('Noncanonical signed packet.');
  if (p.record.vaultId !== publication?.vaultId || p.record.revision !== publication?.revisionId) throw new Error('Publication identity mismatch.');
  await check(revisionTuple(p), signed.signature, writer(p, state));
  return { record: p.record, author: p.author, authorization: p.authorization };
}
