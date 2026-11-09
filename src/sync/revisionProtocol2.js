import { bufferToBase64 } from '../encoding.js';
import { validateRecord, decodeBytes } from '../vault/crypto.js';
import { authorityState, requireAuthorityState } from './authorizationGraph.js';
const encoder = new TextEncoder(); const revisions = new WeakMap(); const references = new WeakMap();
const identity = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(value);
const hashId = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const bytes = value => encoder.encode(JSON.stringify(value));
const hash = async value => [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes(value)))].map(value => value.toString(16).padStart(2, '0')).join('');
const fields = (value, expected) => { if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).sort().join(',') !== [...expected].sort().join(',')) throw new Error('Unsupported revision-v2 fields.'); };
function freeze(value) { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; }
export function canonicalRecord3(record) {
  validateRecord(record);
  if (record.version !== 3) throw new Error('A vault-v3 record is required.');
  return { kind: record.kind, version: 3, vaultId: record.vaultId, revision: record.revision, parents: [...record.parents], keyEpoch: record.keyEpoch, updatedAt: record.updatedAt, keySalt: record.keySalt, kdf: { name: record.kdf.name, iterations: record.kdf.iterations, salt: record.kdf.salt }, wrappedKey: { iv: record.wrappedKey.iv, ciphertext: record.wrappedKey.ciphertext }, data: { iv: record.data.iv, ciphertext: record.data.ciphertext } };
}
export async function protectionDigest(record) {
  const value = canonicalRecord3(record);
  return hash(['SecurePass:protection:1', value.vaultId, value.keyEpoch, [value.kdf.name, value.kdf.iterations, value.kdf.salt], [value.wrappedKey.iv, value.wrappedKey.ciphertext]]);
}
function payload(value) {
  fields(value, ['kind', 'version', 'author', 'authorization', 'record', 'parents']);
  if (value.kind !== 'securepass-signed-revision' || value.version !== 2 || !identity(value.author) || !hashId(value.authorization) || !Array.isArray(value.parents) || value.parents.length > 2) throw new Error('Invalid revision-v2 identity.');
  const record = canonicalRecord3(value.record); let last = '';
  const parents = value.parents.map(parent => {
    fields(parent, ['revision', 'digest', 'authorization']);
    if (!identity(parent.revision) || parent.revision <= last || ![parent.digest, parent.authorization].every(hashId)) throw new Error('Parents must have unique sorted digest-bound identities.');
    last = parent.revision; return { revision: parent.revision, digest: parent.digest, authorization: parent.authorization };
  });
  if (JSON.stringify(record.parents) !== JSON.stringify(parents.map(parent => parent.revision))) throw new Error('Ciphertext ancestry and signed parent proofs differ.');
  return { kind: value.kind, version: 2, author: value.author, authorization: value.authorization, record, parents };
}
const tuple = value => ['SecurePass:revision:2', value.author, value.authorization, value.record, value.parents.map(parent => [parent.revision, parent.digest, parent.authorization])];
function writer(value, state, live) {
  const authority = requireAuthorityState(state, { live });
  if (value.authorization !== authority.hash || value.record.vaultId !== authority.payload.vaultId || value.record.keyEpoch !== authority.payload.keyEpoch) throw new Error('Revision authority, vault or epoch mismatch.');
  const device = authority.payload.devices.find(device => device.id === value.author);
  if (!device) throw new Error('Revision writer is revoked or unknown.');
  return { authority, publicKey: device.publicKey };
}
async function signatureValid(value, signature, publicKey) {
  const raw = decodeBytes(signature, 64);
  if (bufferToBase64(raw.buffer) !== signature) throw new Error('Noncanonical revision signature.');
  const key = await crypto.subtle.importKey('spki', decodeBytes(publicKey, 91), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
  if (!await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, raw, bytes(tuple(value)))) throw new Error('Invalid revision-v2 signature.');
}
function reference(value, graph) {
  const token = Object.freeze({ revision: value.revision, digest: value.digest, authorization: value.authorization });
  references.set(token, { ...token, graph }); return token;
}
export function revisionReference(revision) {
  const verified = revisions.get(revision); if (!verified) throw new Error('A verified revision is required for an ancestry reference.');
  return reference({ revision: verified.payload.record.revision, digest: verified.digest, authorization: verified.payload.authorization }, verified.graph);
}
export function parentReferences(revision) {
  const verified = revisions.get(revision); if (!verified) throw new Error('A verified child is required for parent references.');
  return verified.payload.parents.map(parent => reference(parent, verified.graph));
}
export function anchorReferences(state) {
  const authority = requireAuthorityState(state, { live: true });
  return authority.payload.contentAnchors.map(anchor => reference(anchor, authority.graph));
}
function trustedReference(token, graph) {
  const value = references.get(token);
  if (!value || value.graph.vaultId !== graph.vaultId || value.graph.rootFingerprint !== graph.rootFingerprint) throw new Error('An opaque ancestry reference from this trusted vault is required.');
  authorityState(graph, value.authorization);
  return { revision: value.revision, digest: value.digest, authorization: value.authorization };
}
export async function createSignedRevision2(record, { author, privateKey, state, parents = [] }) {
  const authority = requireAuthorityState(state, { live: true });
  const selected = parents.map(parent => trustedReference(parent, authority.graph)).sort((a, b) => a.revision < b.revision ? -1 : 1);
  const value = payload({ kind: 'securepass-signed-revision', version: 2, author, authorization: authority.hash, record, parents: selected });
  const device = writer(value, state, true);
  if (await protectionDigest(value.record) !== authority.payload.protectionDigest) throw new Error('Only administrative authority may change master protection.');
  const signature = bufferToBase64(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privateKey, bytes(tuple(value))));
  await signatureValid(value, signature, device.publicKey);
  const body = JSON.stringify({ payload: value, signature });
  if (encoder.encode(body).length > 16 * 1024 * 1024) throw new Error('Revision-v2 exceeds byte budget.');
  return body;
}
export async function verifySignedRevision2(body, publication, { graph, reference: parent } = {}) {
  if (typeof body !== 'string' || body.length > 16 * 1024 * 1024 || encoder.encode(body).length > 16 * 1024 * 1024) throw new Error('Revision-v2 exceeds byte budget.');
  const identity = structuredClone(publication); const source = JSON.parse(body); fields(source, ['payload', 'signature']); const value = payload(source.payload);
  if (JSON.stringify({ payload: value, signature: source.signature }) !== body) throw new Error('Noncanonical signed revision-v2.');
  if (identity?.vaultId !== value.record.vaultId || identity?.revisionId !== value.record.revision) throw new Error('Revision publication identity mismatch.');
  // Checking graph membership happens even when a caller supplies a historical
  // reference. A plain look-alike graph/state/reference never grants authority.
  const state = authorityState(graph, value.authorization); const device = writer(value, state, !parent);
  const expected = parent ? trustedReference(parent, graph) : null;
  if (expected && (expected.revision !== value.record.revision || expected.authorization !== value.authorization)) throw new Error('Historical parent identity mismatch.');
  if (await protectionDigest(value.record) !== device.authority.payload.protectionDigest) throw new Error('Master protection does not match administrative authority.');
  const digest = await hash(tuple(value));
  if (expected && expected.digest !== digest) throw new Error('Historical parent contents or ancestry were substituted.');
  await signatureValid(value, source.signature, device.publicKey);
  const result = freeze({ payload: value, record: value.record, author: value.author, authorization: value.authorization, digest, live: !parent });
  revisions.set(result, { payload: result.payload, digest, graph }); return result;
}
