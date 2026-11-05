export const PUBLICATION_STATE_KEY = 'drivePublicationState';
export const sameBinding = (a, b) => a && b && ['accountId', 'vaultId', 'generation'].every(key => a[key] === b[key]);
export function preparePublication(binding, publication, authorization) {
  if (!binding || !['accountId', 'vaultId', 'generation'].every(key => typeof binding[key] === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(binding[key])) || !publication || publication.vaultId !== binding.vaultId || typeof publication.revisionId !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(publication.revisionId) || typeof publication.body !== 'string' || publication.body.length > 5 * 1024 * 1024 - 4096 || new TextEncoder().encode(publication.body).length > 5 * 1024 * 1024 - 4096) throw new Error('Invalid bounded publication.');
  if (authorization !== undefined && (typeof authorization !== 'string' || !/^[a-f0-9]{64}$/.test(authorization))) throw new Error('Invalid publication authorization.');
  return {
    ...(authorization === undefined ? {} : { authorization }),
    binding: { accountId: binding.accountId, vaultId: binding.vaultId, generation: binding.generation },
    publication: { vaultId: publication.vaultId, revisionId: publication.revisionId, body: publication.body }
  };
}
export function enqueuePublication(state, prepared) {
  const { binding, publication } = prepared;
  if (!state.enabled || !sameBinding(state.binding, binding)) throw new Error('Drive binding changed or disabled.');
  const existing = state.operations.find(value => sameBinding(value.binding, binding) && value.publication.revisionId === publication.revisionId);
  if (existing) {
    if (existing.publication.body !== publication.body) throw new Error('Revision content conflict.');
    return existing.id;
  }
  const total = state.operations.reduce((sum, value) => sum + new TextEncoder().encode(value.publication.body).length, 0);
  if (state.operations.length >= 32 || total + new TextEncoder().encode(publication.body).length > 32 * 1024 * 1024) throw new Error('Drive outbox full; preserve the local revision.');
  const operation = { id: crypto.randomUUID(), binding, publication, ...(prepared.authorization === undefined ? {} : { authorization: prepared.authorization }), attempts: 0, outcome: 'not-sent' };
  state.operations.push(operation); return operation.id;
}
