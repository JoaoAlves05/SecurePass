import { canonicalAuthorityPayload, verifyAuthorityGraph, authorityState, requireAuthorityState } from './authorizationGraph.js';
import { canonicalAdministrativeEnvelope, unlockAdministrativeKey } from './signingKeyProtection.js';
import { canonicalVaultProtection, vaultProtectionDigest, unlockVaultProtection } from './vaultProtection.js';
import { canonicalKeyHistory, keyHistoryDigest } from './keyHistory.js';
import { canonicalRecoveryMaterial, recoveryPolicy } from './recoveryKit.js';
import { exactFields, canonicalBytes } from './keyMaterial.js';

export const MAX_ADMINISTRATION_BYTES = 4 * 1024 * 1024;
const encoder = new TextEncoder();
export function canonicalAdministrationGraph(value) {
  if (!Array.isArray(value) || !value.length || value.length > 256) throw new Error('Invalid administrative graph budget.');
  const chain = value.map(node => {
    exactFields(node, ['payload', 'signatures']); const payload = canonicalAuthorityPayload(node.payload);
    if (!Array.isArray(node.signatures) || node.signatures.length !== Math.max(1, payload.parents.length)) throw new Error('Invalid administrative proofs.');
    const signatures = node.signatures.map((proof, index) => {
      exactFields(proof, ['parent', 'role', 'signature']);
      if (proof.parent !== (payload.parents[index] ?? null) || !['admin', 'recovery'].includes(proof.role)) throw new Error('Invalid administrative proof context.');
      canonicalBytes(proof.signature, 64);
      return { parent: proof.parent, role: proof.role, signature: proof.signature };
    });
    return { payload, signatures };
  });
  chain.sort((a, b) => a.payload.revision < b.payload.revision ? -1 : 1);
  if (encoder.encode(JSON.stringify(chain)).length > MAX_ADMINISTRATION_BYTES) throw new Error('Administrative graph exceeds byte budget.');
  return chain;
}
export function canonicalAdministrationMaterial(value) {
  exactFields(value, ['vaultProtection', 'keyHistory', 'recovery']);
  return { vaultProtection: canonicalVaultProtection(value.vaultProtection), keyHistory: value.keyHistory === null ? null : canonicalKeyHistory(value.keyHistory), recovery: value.recovery === null ? null : canonicalRecoveryMaterial(value.recovery) };
}
async function normalize(value, trust) {
  exactFields(value, ['kind', 'version', 'vaultId', 'head', 'chain', 'administrativeKey', 'material']);
  if (value.kind !== 'securepass-administration' || value.version !== 2 || value.vaultId !== trust?.vaultId) throw new Error('Administrative-v2 publication identity mismatch.');
  const chain = canonicalAdministrationGraph(value.chain); const material = canonicalAdministrationMaterial(value.material);
  // Never promote the packet's head into an independently supplied checkpoint.
  const graph = await verifyAuthorityGraph(chain, trust); const state = authorityState(graph); const authority = requireAuthorityState(state, { live: true });
  if (state.hash !== value.head) throw new Error('Administrative-v2 publication head mismatch.');
  const administrativeKey = canonicalAdministrativeEnvelope(value.administrativeKey, authority.payload);
  if (administrativeKey.publicKey !== authority.payload.adminKey || material.vaultProtection.vaultId !== authority.payload.vaultId || material.vaultProtection.keyEpoch !== authority.payload.keyEpoch || await vaultProtectionDigest(material.vaultProtection) !== authority.payload.protectionDigest) throw new Error('Administrative-v2 master protection mismatch.');
  if (material.keyHistory === null) {
    if (authority.payload.keyHistoryDigest !== null) throw new Error('Administrative-v2 historical material is missing.');
  } else if (material.keyHistory.vaultId !== authority.payload.vaultId || material.keyHistory.keyEpoch !== authority.payload.keyEpoch || await keyHistoryDigest(material.keyHistory) !== authority.payload.keyHistoryDigest) throw new Error('Administrative-v2 historical material mismatch.');
  if (material.recovery === null) {
    if (authority.payload.recovery !== null) throw new Error('Administrative-v2 recovery material is missing.');
  } else if (material.recovery.privateEnvelope.vaultId !== authority.payload.vaultId || material.recovery.rootEnvelope.keyEpoch !== authority.payload.keyEpoch || JSON.stringify(await recoveryPolicy(material.recovery)) !== JSON.stringify(authority.payload.recovery)) throw new Error('Administrative-v2 recovery material mismatch.');
  return { payload: { kind: value.kind, version: 2, vaultId: value.vaultId, head: state.hash, chain, administrativeKey, material }, state, graph };
}
export async function createAdministrationPublication2(chain, administrativeKey, material, trust) {
  const pinned = structuredClone(trust); const selected = canonicalAdministrationGraph(chain); const key = structuredClone(administrativeKey); const protectedMaterial = canonicalAdministrationMaterial(material);
  const graph = await verifyAuthorityGraph(selected, pinned); const state = authorityState(graph);
  const normalized = await normalize({ kind: 'securepass-administration', version: 2, vaultId: state.payload.vaultId, head: state.hash, chain: selected, administrativeKey: key, material: protectedMaterial }, pinned);
  const body = JSON.stringify(normalized.payload);
  if (encoder.encode(body).length > MAX_ADMINISTRATION_BYTES) throw new Error('Administrative-v2 publication exceeds limit.');
  return { vaultId: state.payload.vaultId, revisionId: state.hash, body };
}
export async function verifyAdministrationPublication2(body, publication, trust) {
  if (typeof body !== 'string' || body.length > MAX_ADMINISTRATION_BYTES || encoder.encode(body).length > MAX_ADMINISTRATION_BYTES) throw new Error('Administrative-v2 publication exceeds limit.');
  const identity = structuredClone(publication); const pinned = structuredClone(trust);
  const { payload, state, graph } = await normalize(JSON.parse(body), pinned);
  if (JSON.stringify(payload) !== body) throw new Error('Noncanonical administrative-v2 publication.');
  if (identity?.vaultId !== payload.vaultId || identity?.revisionId !== payload.head) throw new Error('Administrative-v2 publication identity mismatch.');
  return { state, graph, chain: payload.chain, administrativeKey: payload.administrativeKey, material: payload.material };
}
export async function unlockAdministrationPublication2(body, publication, trust, passphrase) {
  const verified = await verifyAdministrationPublication2(body, publication, trust);
  const bytes = await unlockVaultProtection(verified.material.vaultProtection, passphrase);
  try {
    const privateKey = await unlockAdministrativeKey(verified.administrativeKey, passphrase, verified.state.payload);
    return { ...verified, bytes, privateKey };
  } catch (error) { bytes.fill(0); throw error; }
}
