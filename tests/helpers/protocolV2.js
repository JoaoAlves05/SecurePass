import { createRecord } from '../../src/vault/crypto.js';
import { generateSigningKey, signingKeyFingerprint } from '../../src/sync/signedProtocol.js';
import { createAuthorityState, authorityDigest, verifyAuthorityGraph, authorityState } from '../../src/sync/authorizationGraph.js';
import { protectionDigest } from '../../src/sync/revisionProtocol2.js';
export const PASS = 'Fictional protocol-v2 master 123!';
export const entry = (id = 'one') => ({ id, site: 'https://example.com', username: id, password: 'Fictional protocol-v2 secret', notes: 'x'.repeat(4096) });
export async function fixture() {
  const created = await createRecord([entry()], PASS, { version: 3 });
  const admin = await generateSigningKey(); const writer = await generateSigningKey(); const other = await generateSigningKey();
  const payload = { kind: 'securepass-authorization', version: 2, vaultId: created.record.vaultId, keyEpoch: created.record.keyEpoch, revision: 'genesis', parents: [], reason: 'bootstrap', adminKey: admin.publicKey, devices: [{ id: 'writer', publicKey: writer.publicKey }], protectionDigest: await protectionDigest(created.record), keyHistoryDigest: null, recovery: null, contentAnchors: [], contentVersion: 3, writerVersion: 2 };
  const signed = await createAuthorityState(payload, [{ parent: null, role: 'admin', privateKey: admin.privateKey }]);
  const trust = { vaultId: payload.vaultId, rootFingerprint: await signingKeyFingerprint(admin.publicKey) };
  const graph = await verifyAuthorityGraph([signed], trust);
  return { ...created, admin, writer, other, payload, signed, trust, graph, state: authorityState(graph), head: await authorityDigest(payload) };
}
export async function successor(f, changes, { key = f.admin.privateKey, parent = f.head, role = 'admin' } = {}) {
  return createAuthorityState({ ...f.payload, revision: crypto.randomUUID(), parents: [parent], ...changes }, [{ parent, role, privateKey: key }]);
}
