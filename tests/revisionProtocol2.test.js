import { test } from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
globalThis.crypto = webcrypto;
const protocol = await import('../src/sync/revisionProtocol2.js');
const graphs = await import('../src/sync/authorizationGraph.js');
const crypt = await import('../src/vault/crypto.js');
const { fixture, successor, entry } = await import('./helpers/protocolV2.js');
const publication = record => ({ vaultId: record.vaultId, revisionId: record.revision });
const sign = (record, f, extra = {}) => protocol.createSignedRevision2(record, { author: 'writer', privateKey: f.writer.privateKey, state: f.state, ...extra });
async function resign(payload, key) {
  const tuple = ['SecurePass:revision:2', payload.author, payload.authorization, payload.record, payload.parents.map(parent => [parent.revision, parent.digest, parent.authorization])];
  const signature = Buffer.from(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(JSON.stringify(tuple)))).toString('base64');
  return JSON.stringify({ payload, signature });
}
test('vault-v3 content is signed/verified under opaque live authority with exact plaintext round trip', async () => {
  const f = await fixture(); const body = await sign(f.record, f);
  const verified = await protocol.verifySignedRevision2(body, publication(f.record), { graph: f.graph });
  assert.equal(verified.live, true); assert.equal(verified.record.version, 3); assert.equal((await crypt.decryptWithKey(verified.record, f.bytes))[0].notes, entry().notes);
  assert.equal(protocol.revisionReference(verified).digest, verified.digest);
});
test('even an authorized content writer cannot substitute the master password wrapper', async () => {
  const f = await fixture(); const other = await crypt.createRecord([entry()], 'Another fictional master password 456!', { version: 3 });
  const changed = { ...f.record, kdf: other.record.kdf, wrappedKey: other.record.wrappedKey };
  await assert.rejects(sign(changed, f), /administrative authority/);
  const source = JSON.parse(await sign(f.record, f)); source.payload.record.kdf = other.record.kdf; source.payload.record.wrappedKey = other.record.wrappedKey;
  const validWriterSignature = await resign(source.payload, f.writer.privateKey);
  await assert.rejects(protocol.verifySignedRevision2(validWriterSignature, publication(f.record), { graph: f.graph }), /Master protection/);
});
test('revoked writers cannot issue live packets or substitute historical contents under an anchored ID', async () => {
  const f = await fixture(); const originalBody = await sign(f.record, f); const original = await protocol.verifySignedRevision2(originalBody, publication(f.record), { graph: f.graph });
  const enrolled = await successor(f, { reason: 'enroll', devices: [{ id: 'other', publicKey: f.other.publicKey }, ...f.payload.devices] });
  const enrolledHead = await graphs.authorityDigest(enrolled.payload);
  const revoked = await graphs.createAuthorityState({ ...enrolled.payload, revision: 'revoke-writer', parents: [enrolledHead], reason: 'revoke', devices: [{ id: 'other', publicKey: f.other.publicKey }] }, [{ parent: enrolledHead, role: 'admin', privateKey: f.admin.privateKey }]);
  const graph = await graphs.verifyAuthorityGraph([f.signed, enrolled, revoked], f.trust); const state = graphs.authorityState(graph);
  await assert.rejects(protocol.verifySignedRevision2(originalBody, publication(f.record), { graph }), /live authority/);
  const child = await crypt.encryptEntries(f.record, [entry('new')], f.bytes);
  await assert.rejects(protocol.createSignedRevision2(child, { author: 'writer', privateKey: f.writer.privateKey, state, parents: [protocol.revisionReference(original)] }), /revoked/);
  const childBody = await protocol.createSignedRevision2(child, { author: 'other', privateKey: f.other.privateKey, state, parents: [protocol.revisionReference(original)] });
  const verifiedChild = await protocol.verifySignedRevision2(childBody, publication(child), { graph }); const [reference] = protocol.parentReferences(verifiedChild);
  const history = await protocol.verifySignedRevision2(originalBody, publication(f.record), { graph, reference }); assert.equal(history.live, false);
  const changed = await crypt.protectCheckpoint(f.record, [entry('substituted')], f.record, f.bytes);
  const equivocalBody = await sign(changed, f);
  await assert.rejects(protocol.verifySignedRevision2(equivocalBody, publication(changed), { graph, reference }), /substituted/);
});
test('look-alike state, graph, parent references and unrelated keys cannot grant capability', async () => {
  const f = await fixture(); const body = await sign(f.record, f); const verified = await protocol.verifySignedRevision2(body, publication(f.record), { graph: f.graph });
  await assert.rejects(sign(f.record, f, { state: { ...f.state } }), /Verified/);
  await assert.rejects(protocol.verifySignedRevision2(body, publication(f.record), { graph: { ...f.graph } }), /Verified/);
  await assert.rejects(sign(f.record, f, { privateKey: f.other.privateKey }), /signature/);
  const next = await crypt.encryptEntries(f.record, [entry()], f.bytes);
  await assert.rejects(sign(next, f, { parents: [{ ...protocol.revisionReference(verified) }] }), /opaque ancestry/);
  assert.throws(() => protocol.revisionReference({ ...verified }), /verified revision/);
});
test('canonical/identity/schema changes fail and signed administrative anchors issue historical references', async () => {
  const f = await fixture(); const body = await sign(f.record, f); const verified = await protocol.verifySignedRevision2(body, publication(f.record), { graph: f.graph });
  await assert.rejects(protocol.verifySignedRevision2(body + '\n', publication(f.record), { graph: f.graph }), /Noncanonical/);
  await assert.rejects(protocol.verifySignedRevision2(body, { vaultId: f.record.vaultId, revisionId: 'wrong' }, { graph: f.graph }), /identity mismatch/);
  const checkpoint = await successor(f, { reason: 'checkpoint', contentAnchors: [{ revision: f.record.revision, digest: verified.digest, authorization: f.head }] });
  const graph = await graphs.verifyAuthorityGraph([f.signed, checkpoint], f.trust); const [reference] = protocol.anchorReferences(graphs.authorityState(graph));
  assert.equal((await protocol.verifySignedRevision2(body, publication(f.record), { graph, reference })).live, false);
  const changed = JSON.parse(body); changed.payload.extra = true;
  await assert.rejects(protocol.verifySignedRevision2(JSON.stringify(changed), publication(f.record), { graph: f.graph }), /fields/);
});
