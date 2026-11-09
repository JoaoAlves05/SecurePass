import { canonicalAuthorizationChain, verifyAuthorizationChain } from './signedProtocol.js';
import { canonicalAdministrativeEnvelope, unlockAdministrativeKey } from './signingKeyProtection.js';
export const MAX_ADMINISTRATION_BYTES = 4 * 1024 * 1024;
const encoder = new TextEncoder();
function fields(value, expected) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).sort().join(',') !== [...expected].sort().join(',')) throw new Error('Unsupported administrative publication.');
}
async function normalize(value, trust) {
  fields(value, ['kind', 'version', 'vaultId', 'head', 'chain', 'administrativeKey']);
  if (value.kind !== 'securepass-administration' || value.version !== 1 || value.vaultId !== trust?.vaultId) throw new Error('Administrative publication identity mismatch.');
  const chain = canonicalAuthorizationChain(value.chain);
  const state = await verifyAuthorizationChain(chain, trust);
  if (state.hash !== value.head) throw new Error('Administrative publication head mismatch.');
  const administrativeKey = canonicalAdministrativeEnvelope(value.administrativeKey, state.payload);
  if (administrativeKey.publicKey !== state.payload.adminKey) throw new Error('Administrative key does not match verified authority.');
  return { payload: { kind: value.kind, version: 1, vaultId: value.vaultId, head: state.hash, chain, administrativeKey }, state };
}
export async function createAdministrationPublication(chain, administrativeKey, trust) {
  const snapshot = canonicalAuthorizationChain(chain); const pinned = structuredClone(trust); const protectedKey = structuredClone(administrativeKey);
  const state = await verifyAuthorizationChain(snapshot, pinned);
  const normalized = await normalize({ kind: 'securepass-administration', version: 1, vaultId: state.payload.vaultId, head: state.hash, chain: snapshot, administrativeKey: protectedKey }, pinned);
  const body = JSON.stringify(normalized.payload);
  if (encoder.encode(body).length > MAX_ADMINISTRATION_BYTES) throw new Error('Administrative publication exceeds limit.');
  return { vaultId: state.payload.vaultId, revisionId: state.hash, body };
}
export async function verifyAdministrationPublication(body, publication, trust) {
  if (typeof body !== 'string' || body.length > MAX_ADMINISTRATION_BYTES || encoder.encode(body).length > MAX_ADMINISTRATION_BYTES) throw new Error('Administrative publication exceeds limit.');
  const identity = structuredClone(publication);
  const { payload, state } = await normalize(JSON.parse(body), structuredClone(trust));
  if (JSON.stringify(payload) !== body) throw new Error('Noncanonical administrative publication.');
  if (identity?.vaultId !== payload.vaultId || identity?.revisionId !== payload.head) throw new Error('Administrative publication identity mismatch.');
  // This verifies public authority and encrypted-envelope context, not possession
  // of the administrative private key. Adoption must unwrap it with master proof.
  return { state, chain: payload.chain, administrativeKey: payload.administrativeKey };
}
export async function unlockAdministrationPublication(body, publication, trust, passphrase) {
  const verified = await verifyAdministrationPublication(body, publication, trust);
  const privateKey = await unlockAdministrativeKey(verified.administrativeKey, passphrase, verified.state.payload);
  return { ...verified, privateKey };
}
