import { createSignedRevision, verifySignedPublication } from './signedProtocol.js';
import { createSignedRevision2, verifySignedRevision2 } from './revisionProtocol2.js';
import { requireAuthorityState } from './authorizationGraph.js';
export async function prepareSignedPublication(record, { binding, author, privateKey, authorization, parents = [] }) {
  if (!binding || binding.vaultId !== record?.vaultId) throw new Error('Signing binding does not match the vault.');
  const pinned = { accountId: binding.accountId, vaultId: binding.vaultId, generation: binding.generation };
  const body = record.version === 3 ? await createSignedRevision2(record, { author, privateKey, state: authorization, parents }) : await createSignedRevision(record, author, privateKey, authorization);
  const publication = { vaultId: record.vaultId, revisionId: record.revision, body };
  if (record.version === 3) await verifySignedRevision2(body, publication, { graph: requireAuthorityState(authorization, { live: true }).graph });
  else await verifySignedPublication(body, publication, authorization);
  return { binding: pinned, publication, authorization: authorization.hash };
}
