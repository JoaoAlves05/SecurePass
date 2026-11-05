import { createSignedRevision, verifySignedPublication } from './signedProtocol.js';
export async function prepareSignedPublication(record, { binding, author, privateKey, authorization }) {
  if (!binding || binding.vaultId !== record?.vaultId) throw new Error('Signing binding does not match the vault.');
  const pinned = { accountId: binding.accountId, vaultId: binding.vaultId, generation: binding.generation };
  const body = await createSignedRevision(record, author, privateKey, authorization);
  const publication = { vaultId: record.vaultId, revisionId: record.revision, body };
  await verifySignedPublication(body, publication, authorization);
  return { binding: pinned, publication, authorization: authorization.hash };
}
