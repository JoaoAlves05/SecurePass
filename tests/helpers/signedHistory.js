import { createRecord, encryptEntries } from '../../src/vault/crypto.js';
import { generateSigningKey, createAuthorization, verifyAuthorizationChain, signingKeyFingerprint, createSignedRevision } from '../../src/sync/signedProtocol.js';
export const entry = (id, password = 'fictional') => ({ id, site: 'https://example.com', username: id, password, notes: '', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' });
export async function fixture() {
  const { record: root, bytes } = await createRecord([entry('a'), entry('b')], 'Fictional history master 123!');
  const signer = await generateSigningKey();
  const genesis = await createAuthorization({ kind: 'securepass-authorization', version: 1, vaultId: root.vaultId, keyEpoch: root.keyEpoch, revision: 'auth', previous: null, adminKey: signer.publicKey, devices: [{ id: 'writer', publicKey: signer.publicKey }] }, signer.privateKey);
  const trust = { vaultId: root.vaultId, rootFingerprint: await signingKeyFingerprint(signer.publicKey) };
  const initial = await verifyAuthorizationChain([genesis], trust);
  const authorization = await verifyAuthorizationChain([genesis], { ...trust, expectedHead: initial.hash });
  const packet = async record => ({ body: await createSignedRevision(record, 'writer', signer.privateKey, authorization), publication: { vaultId: record.vaultId, revisionId: record.revision } });
  const left = await encryptEntries(root, [entry('a', 'local secret'), entry('b')], bytes);
  const right = await encryptEntries(root, [entry('a'), entry('b', 'remote secret')], bytes);
  const packets = await Promise.all([root, left, right].map(packet));
  return { root, bytes, signer, genesis, trust, packet, left, right, packets, options: { packets, local: left.revision, remote: right.revision, authorization, bytes, assertCurrent: () => {} } };
}
