import { bufferToBase64 } from '../encoding.js';
import { decodeBytes } from '../vault/crypto.js';
const encoder = new TextEncoder();
const graphs = new WeakMap(); const states = new WeakMap();
const identity = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(value);
const hashId = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const bytes = value => encoder.encode(JSON.stringify(value));
const reasons = ['bootstrap', 'enroll', 'revoke', 'rotate', 'recover', 'resolve', 'recovery-set', 'recovery-clear', 'checkpoint'];
const fields = (value, keys) => { if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).sort().join(',') !== [...keys].sort().join(',')) throw new Error('Unsupported authority-graph fields.'); };
function encoded(value, min, max = min) {
  const decoded = decodeBytes(value, min, max);
  if (bufferToBase64(decoded.buffer) !== value) throw new Error('Noncanonical authority encoding.');
  return decoded;
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function recovery(value) {
  if (value === null) return null;
  fields(value, ['signingKey', 'encryptionKey', 'privateEnvelopeDigest', 'rootEnvelopeDigest']);
  encoded(value.signingKey, 91); encoded(value.encryptionKey, 350, 600);
  if (![value.privateEnvelopeDigest, value.rootEnvelopeDigest].every(hashId)) throw new Error('Invalid recovery digests.');
  return Object.freeze({ signingKey: value.signingKey, encryptionKey: value.encryptionKey, privateEnvelopeDigest: value.privateEnvelopeDigest, rootEnvelopeDigest: value.rootEnvelopeDigest });
}
export function canonicalAuthorityPayload(value) {
  fields(value, ['kind', 'version', 'vaultId', 'keyEpoch', 'revision', 'parents', 'reason', 'adminKey', 'devices', 'protectionDigest', 'keyHistoryDigest', 'recovery', 'contentAnchors', 'contentVersion', 'writerVersion']);
  if (value.kind !== 'securepass-authorization' || value.version !== 2 || ![value.vaultId, value.keyEpoch, value.revision].every(identity) || !reasons.includes(value.reason) || value.contentVersion !== 3 || value.writerVersion !== 2 || !hashId(value.protectionDigest) || value.keyHistoryDigest !== null && !hashId(value.keyHistoryDigest)) throw new Error('Invalid authority-graph identity or policy.');
  if (!Array.isArray(value.parents) || value.parents.length > 2 || value.parents.some(parent => !hashId(parent)) || new Set(value.parents).size !== value.parents.length || !same(value.parents, [...value.parents].sort())) throw new Error('Invalid administrative parents.');
  encoded(value.adminKey, 91);
  if (!Array.isArray(value.devices) || !value.devices.length || value.devices.length > 128) throw new Error('Invalid active writer registry.');
  let previous = '';
  const devices = value.devices.map(device => {
    fields(device, ['id', 'publicKey']);
    if (!identity(device.id) || device.id <= previous) throw new Error('Writer identities must be unique and sorted.');
    encoded(device.publicKey, 91); previous = device.id;
    return Object.freeze({ id: device.id, publicKey: device.publicKey });
  });
  if (!Array.isArray(value.contentAnchors) || value.contentAnchors.length > 256) throw new Error('Invalid content checkpoint anchors.');
  previous = '';
  const anchors = value.contentAnchors.map(anchor => {
    fields(anchor, ['revision', 'digest', 'authorization']);
    if (!identity(anchor.revision) || anchor.revision <= previous || ![anchor.digest, anchor.authorization].every(hashId)) throw new Error('Content anchors must be unique, sorted and digest-bound.');
    previous = anchor.revision; return Object.freeze({ revision: anchor.revision, digest: anchor.digest, authorization: anchor.authorization });
  });
  const kit = recovery(value.recovery); const writerKeys = devices.map(device => device.publicKey);
  if (new Set(writerKeys).size !== writerKeys.length || writerKeys.includes(value.adminKey) || kit && (kit.signingKey === value.adminKey || writerKeys.includes(kit.signingKey))) throw new Error('Administrative, recovery and unique writer keys must be separate.');
  return Object.freeze({ kind: value.kind, version: 2, vaultId: value.vaultId, keyEpoch: value.keyEpoch, revision: value.revision, parents: Object.freeze([...value.parents]), reason: value.reason, adminKey: value.adminKey, devices: Object.freeze(devices), protectionDigest: value.protectionDigest, keyHistoryDigest: value.keyHistoryDigest, recovery: kit, contentAnchors: Object.freeze(anchors), contentVersion: 3, writerVersion: 2 });
}
const tuple = value => ['SecurePass:authorization:2', value.vaultId, value.keyEpoch, value.revision, value.parents, value.reason, value.adminKey, value.devices.map(device => [device.id, device.publicKey]), value.protectionDigest, value.keyHistoryDigest, value.recovery && [value.recovery.signingKey, value.recovery.encryptionKey, value.recovery.privateEnvelopeDigest, value.recovery.rootEnvelopeDigest], value.contentAnchors.map(anchor => [anchor.revision, anchor.digest, anchor.authorization]), value.contentVersion, value.writerVersion];
export async function authorityDigest(payload) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes(tuple(canonicalAuthorityPayload(payload)))))].map(value => value.toString(16).padStart(2, '0')).join('');
}
async function publicKey(value) { return crypto.subtle.importKey('spki', encoded(value, 91), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']); }
async function checkSignature(payload, signature, key) {
  if (!await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, await publicKey(key), encoded(signature, 64), bytes(tuple(payload)))) throw new Error('Invalid administrative role signature.');
}
export async function createAuthorityState(payload, signers) {
  const normalized = canonicalAuthorityPayload(payload);
  if (!Array.isArray(signers) || signers.length !== (normalized.parents.length || 1)) throw new Error('One signer per administrative parent is required.');
  const signatures = [];
  for (const [index, signer] of signers.entries()) {
    const parent = normalized.parents[index] ?? null;
    if (signer.parent !== parent || !['admin', 'recovery'].includes(signer.role)) throw new Error('Signer parent or role mismatch.');
    signatures.push({ parent, role: signer.role, signature: bufferToBase64(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, signer.privateKey, bytes(tuple(normalized)))) });
  }
  return { payload: normalized, signatures };
}
function transition(child, parents) {
  if (!parents.length) {
    if (child.reason !== 'bootstrap' || child.contentAnchors.length) throw new Error('A bootstrap has no previous state or historical anchors.');
    return;
  }
  if (child.reason === 'bootstrap') throw new Error('Cannot bootstrap over existing authority.');
  if (child.reason === 'resolve') {
    if (parents.length !== 2 || parents.some(parent => child.keyEpoch === parent.keyEpoch || child.adminKey === parent.adminKey || child.protectionDigest === parent.protectionDigest)) throw new Error('Fork resolution requires two parents and new protection/authority.');
    if (parents.some(parent => child.keyHistoryDigest !== null && child.keyHistoryDigest === parent.keyHistoryDigest || child.recovery && parent.recovery && child.recovery.rootEnvelopeDigest === parent.recovery.rootEnvelopeDigest)) throw new Error('Resolved epochs need newly protected history/recovery roots.');
    return;
  }
  if (parents.length !== 1) throw new Error('This transition requires one administrative parent.');
  const parent = parents[0];
  if (['rotate', 'recover'].includes(child.reason)) {
    if (child.keyEpoch === parent.keyEpoch || child.adminKey === parent.adminKey || child.protectionDigest === parent.protectionDigest) throw new Error('Rotation/recovery must replace content epoch and administrative protection.');
    if (child.reason === 'recover' && child.recovery !== null) throw new Error('Recovery consumes the old kit; activate a fresh kit separately.');
    if (child.recovery && parent.recovery && child.recovery.rootEnvelopeDigest === parent.recovery.rootEnvelopeDigest) throw new Error('New epoch needs a new protected recovery root.');
    if (child.keyHistoryDigest !== null && child.keyHistoryDigest === parent.keyHistoryDigest) throw new Error('New epoch needs newly protected historical keys.');
    return;
  }
  if (child.keyEpoch !== parent.keyEpoch || child.adminKey !== parent.adminKey || child.protectionDigest !== parent.protectionDigest || child.keyHistoryDigest !== parent.keyHistoryDigest) throw new Error('Writer/kit/checkpoint changes cannot change master protection or content keys.');
  if (child.reason === 'recovery-set' || child.reason === 'recovery-clear') {
    if (!same(child.devices, parent.devices) || child.reason === 'recovery-set' && !child.recovery || child.reason === 'recovery-clear' && (child.recovery !== null || parent.recovery === null)) throw new Error('Invalid recovery enrollment/clear transition.');
    return;
  }
  if (!same(child.recovery, parent.recovery)) throw new Error('Recovery authority requires an explicit kit transition.');
  if (child.reason === 'checkpoint') {
    if (!same(child.devices, parent.devices)) throw new Error('A checkpoint cannot change writers.');
    return;
  }
  const before = new Map(parent.devices.map(device => [device.id, device.publicKey]));
  const after = new Map(child.devices.map(device => [device.id, device.publicKey]));
  if (child.reason === 'enroll') {
    if (after.size !== before.size + 1 || [...before].some(([id, key]) => after.get(id) !== key)) throw new Error('Enrollment may add exactly one writer, never replace keys.');
  } else if (child.reason === 'revoke') {
    if (after.size !== before.size - 1 || [...after].some(([id, key]) => before.get(id) !== key)) throw new Error('Revocation may remove exactly one writer.');
  } else throw new Error('Unsupported administrative transition reason.');
}
export async function verifyAuthorityGraph(records, trust = {}) {
  const pinned = structuredClone(trust);
  if (!identity(pinned.vaultId) || !hashId(pinned.rootFingerprint) || pinned.expectedHead !== undefined && !hashId(pinned.expectedHead) || pinned.checkpoint !== undefined && !hashId(pinned.checkpoint) || !Array.isArray(records) || !records.length || records.length > 256) throw new Error('A bounded graph and independent trust anchor are required.');
  const snapshots = records.map(value => {
    fields(value, ['payload', 'signatures']); const payload = canonicalAuthorityPayload(value.payload);
    if (!Array.isArray(value.signatures) || value.signatures.length !== (payload.parents.length || 1)) throw new Error('Missing administrative parent proofs.');
    const signatures = value.signatures.map((proof, index) => {
      fields(proof, ['parent', 'role', 'signature']);
      if (proof.parent !== (payload.parents[index] ?? null) || !['admin', 'recovery'].includes(proof.role)) throw new Error('Invalid administrative proof role or parent.');
      encoded(proof.signature, 64); return { parent: proof.parent, role: proof.role, signature: proof.signature };
    });
    return { payload, signatures };
  });
  if (bytes(snapshots).length > 4 * 1024 * 1024) throw new Error('Administrative graph exceeds byte budget.');
  const nodes = new Map(); const revisions = new Set();
  for (const signed of snapshots) {
    if (signed.payload.vaultId !== pinned.vaultId || revisions.has(signed.payload.revision)) throw new Error('Administrative identity mismatch or replay.');
    revisions.add(signed.payload.revision); const hash = await authorityDigest(signed.payload);
    if (nodes.has(hash)) throw new Error('Duplicate administrative state.');
    nodes.set(hash, { ...signed, hash });
  }
  const roots = [...nodes.values()].filter(value => !value.payload.parents.length);
  if (roots.length !== 1) throw new Error('Exactly one independently trusted root is required.');
  const fingerprint = [...new Uint8Array(await crypto.subtle.digest('SHA-256', encoded(roots[0].payload.adminKey, 91)))].map(value => value.toString(16).padStart(2, '0')).join('');
  if (fingerprint !== pinned.rootFingerprint) throw new Error('Untrusted administrative graph root.');
  const visiting = new Set(); const verified = new Map(); const keyCache = new Map();
  const validateKey = async key => { if (!keyCache.has(key)) { const imported = await publicKey(key); if (keyCache.size < 512) keyCache.set(key, imported); } };
  async function visit(hash) {
    if (verified.has(hash)) return verified.get(hash);
    const node = nodes.get(hash); if (!node || visiting.has(hash)) throw new Error('Incomplete or cyclic administrative graph.');
    visiting.add(hash);
    const parents = []; const ancestors = new Set();
    for (const parent of node.payload.parents) { const state = await visit(parent); parents.push(state.payload); ancestors.add(parent); for (const ancestor of state.ancestors) ancestors.add(ancestor); }
    transition(node.payload, parents);
    if (node.payload.contentAnchors.some(anchor => !ancestors.has(anchor.authorization))) throw new Error('A content anchor must reference authenticated prior authority.');
    await validateKey(node.payload.adminKey); for (const device of node.payload.devices) await validateKey(device.publicKey);
    if (node.payload.recovery) {
      await validateKey(node.payload.recovery.signingKey);
      const encryption = await crypto.subtle.importKey('spki', encoded(node.payload.recovery.encryptionKey, 350, 600), { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt']);
      if (encryption.algorithm.modulusLength !== 3072 || !same([...encryption.algorithm.publicExponent], [1, 0, 1])) throw new Error('Unsupported recovery encryption key.');
    }
    for (const [index, proof] of node.signatures.entries()) {
      const parent = parents[index]; const recoveryRole = node.payload.reason === 'recover';
      if (proof.role !== (recoveryRole ? 'recovery' : 'admin')) throw new Error('Administrative role is not authorized for this transition.');
      const key = !parent ? node.payload.adminKey : recoveryRole ? parent.recovery?.signingKey : parent.adminKey;
      if (!key) throw new Error('Recovery was not enrolled by the parent authority.');
      await checkSignature(node.payload, proof.signature, key);
    }
    visiting.delete(hash); const state = { payload: node.payload, hash, ancestors }; verified.set(hash, state); return state;
  }
  for (const hash of nodes.keys()) await visit(hash);
  const parents = new Set([...nodes.values()].flatMap(node => node.payload.parents));
  const heads = [...nodes.keys()].filter(hash => !parents.has(hash)).sort();
  if (pinned.checkpoint !== undefined && !nodes.has(pinned.checkpoint)) throw new Error('Known administrative checkpoint is missing.');
  if (pinned.expectedHead !== undefined && (heads.length !== 1 || heads[0] !== pinned.expectedHead)) throw new Error('Administrative checkpoint mismatch or unresolved fork.');
  const freshness = heads.length > 1 ? 'conflict' : pinned.expectedHead !== undefined ? 'matches-checkpoint' : pinned.checkpoint !== undefined ? 'descends-from-checkpoint' : 'unproven';
  const result = Object.freeze({ vaultId: pinned.vaultId, rootFingerprint: pinned.rootFingerprint, heads: Object.freeze(heads), freshness }); const capabilities = new Map();
  for (const [hash, value] of verified) {
    const capability = Object.freeze({ payload: value.payload, hash, live: heads.length === 1 && heads[0] === hash, freshness: heads.includes(hash) ? freshness : 'authenticated-history' });
    states.set(capability, { ...value, graph: result }); capabilities.set(hash, capability);
  }
  graphs.set(result, capabilities); return result;
}
export function authorityState(graph, hash = graph?.heads?.[0]) {
  const values = graphs.get(graph); if (!values || !values.has(hash)) throw new Error('Verified administrative graph/state required.');
  return values.get(hash);
}
export function requireAuthorityState(state, { live = false } = {}) {
  const value = states.get(state);
  if (!value || live && !state.live) throw new Error('Verified live authority without unresolved forks is required.');
  return { payload: value.payload, hash: value.hash, graph: value.graph };
}
