import { test } from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
globalThis.crypto = webcrypto;
const p = await import('../src/sync/authorizationGraph.js');
const keys = await import('../src/sync/signedProtocol.js');
const { fixture, successor } = await import('./helpers/protocolV2.js');
test('a graph preserves independent-root/checkpoint trust and never infers freshness from itself', async () => {
  const f = await fixture(); assert.equal(f.graph.freshness, 'unproven');
  const graph = await p.verifyAuthorityGraph([f.signed], { ...f.trust, expectedHead: f.head }); assert.equal(graph.freshness, 'matches-checkpoint');
  await assert.rejects(p.verifyAuthorityGraph([f.signed], { ...f.trust, rootFingerprint: 'f'.repeat(64) }), /Untrusted/);
  await assert.rejects(p.verifyAuthorityGraph([f.signed], { ...f.trust, checkpoint: 'f'.repeat(64) }), /missing/);
  assert.throws(() => p.requireAuthorityState({ ...f.state }), /Verified/);
});
test('enrollment/revocation is explicit and cannot replace master protection or existing writer keys', async () => {
  const f = await fixture(); const devices = [{ id: 'other', publicKey: f.other.publicKey }, ...f.payload.devices];
  const next = await successor(f, { reason: 'enroll', devices }); const head = await p.authorityDigest(next.payload);
  const graph = await p.verifyAuthorityGraph([next, f.signed], { ...f.trust, checkpoint: f.head }); assert.equal(graph.freshness, 'descends-from-checkpoint');
  assert.equal(p.authorityState(graph).hash, head);
  const replaced = await successor(f, { reason: 'enroll', devices, protectionDigest: 'f'.repeat(64) });
  await assert.rejects(p.verifyAuthorityGraph([f.signed, replaced], f.trust), /master protection/);
  const badKey = await successor(f, { reason: 'enroll', devices: [{ id: 'other', publicKey: f.writer.publicKey }, ...f.payload.devices] }).catch(error => error);
  assert.ok(badKey instanceof Error); assert.match(badKey.message, /separate/);
});
test('competing heads remain conflicts and cannot issue live-writer capabilities', async () => {
  const f = await fixture(); const a = await successor(f, { reason: 'checkpoint' }); const b = await successor(f, { reason: 'checkpoint' });
  const graph = await p.verifyAuthorityGraph([b, f.signed, a], { ...f.trust, checkpoint: f.head });
  assert.equal(graph.heads.length, 2); assert.equal(graph.freshness, 'conflict');
  assert.ok(graph.heads.every(hash => p.authorityState(graph, hash).freshness === 'conflict'));
  assert.throws(() => p.requireAuthorityState(p.authorityState(graph), { live: true }), /unresolved forks/);
  await assert.rejects(p.verifyAuthorityGraph([f.signed, a, b], { ...f.trust, expectedHead: f.head }), /unresolved fork/);
});
test('concurrent rotation resolution requires both current administrative keys and new protection', async () => {
  const f = await fixture(); const aKey = await keys.generateSigningKey(); const bKey = await keys.generateSigningKey(); const finalKey = await keys.generateSigningKey();
  const a = await successor(f, { reason: 'rotate', keyEpoch: 'epoch-a', adminKey: aKey.publicKey, protectionDigest: 'a'.repeat(64) });
  const b = await successor(f, { reason: 'rotate', keyEpoch: 'epoch-b', adminKey: bKey.publicKey, protectionDigest: 'b'.repeat(64) });
  const parents = [{ hash: await p.authorityDigest(a.payload), privateKey: aKey.privateKey }, { hash: await p.authorityDigest(b.payload), privateKey: bKey.privateKey }].sort((x, y) => x.hash.localeCompare(y.hash));
  const payload = { ...f.payload, revision: 'join', parents: parents.map(value => value.hash), reason: 'resolve', keyEpoch: 'joined-epoch', adminKey: finalKey.publicKey, protectionDigest: 'c'.repeat(64) };
  const joined = await p.createAuthorityState(payload, parents.map(value => ({ parent: value.hash, role: 'admin', privateKey: value.privateKey })));
  const graph = await p.verifyAuthorityGraph([joined, b, f.signed, a], { ...f.trust, checkpoint: f.head }); assert.equal(graph.heads.length, 1);
  const forged = structuredClone(joined); forged.signatures[1].signature = forged.signatures[0].signature;
  await assert.rejects(p.verifyAuthorityGraph([f.signed, a, b, forged], f.trust), /role signature/);
  const historical = await p.createAuthorityState({ ...f.payload, revision: 'history-root', keyHistoryDigest: '9'.repeat(64) }, [{ parent: null, role: 'admin', privateKey: f.admin.privateKey }]);
  const previous = await p.authorityDigest(historical.payload);
  const staleKeys = await p.createAuthorityState({ ...historical.payload, revision: 'history-next', parents: [previous], reason: 'rotate', keyEpoch: 'new-history-epoch', adminKey: aKey.publicKey, protectionDigest: 'a'.repeat(64) }, [{ parent: previous, role: 'admin', privateKey: f.admin.privateKey }]);
  await assert.rejects(p.verifyAuthorityGraph([historical, staleKeys], f.trust), /newly protected historical/);
});
test('writer, admin and recovery roles cannot be aliased or used interchangeably', async () => {
  const f = await fixture();
  assert.throws(() => p.canonicalAuthorityPayload({ ...f.payload, devices: [{ id: 'writer', publicKey: f.admin.publicKey }] }), /separate/);
  const wrongRole = await p.createAuthorityState({ ...f.payload, revision: 'wrong-role', parents: [f.head], reason: 'checkpoint' }, [{ parent: f.head, role: 'recovery', privateKey: f.admin.privateKey }]);
  await assert.rejects(p.verifyAuthorityGraph([f.signed, wrongRole], f.trust), /role is not authorized/);
});
test('content anchors must reference authenticated ancestors, not loose metadata or unrelated states', async () => {
  const f = await fixture();
  const next = await successor(f, { reason: 'checkpoint', contentAnchors: [{ revision: 'known-content', digest: 'a'.repeat(64), authorization: f.head }] });
  assert.equal((await p.verifyAuthorityGraph([next, f.signed], f.trust)).heads.length, 1);
  const forged = await successor(f, { reason: 'checkpoint', contentAnchors: [{ revision: 'unknown-content', digest: 'a'.repeat(64), authorization: 'f'.repeat(64) }] });
  await assert.rejects(p.verifyAuthorityGraph([f.signed, forged], f.trust), /authenticated prior/);
});
test('replay, missing parents, unknown fields and unbounded graphs fail before granting authority', async () => {
  const f = await fixture();
  await assert.rejects(p.verifyAuthorityGraph([f.signed, f.signed], f.trust), /replay/);
  const next = await successor(f, { reason: 'checkpoint' }); await assert.rejects(p.verifyAuthorityGraph([next], f.trust), /root/);
  await assert.rejects(p.verifyAuthorityGraph(Array(257).fill(f.signed), f.trust), /bounded/);
  const extra = { ...f.signed, payload: { ...f.payload, extra: true } }; await assert.rejects(p.verifyAuthorityGraph([extra], f.trust), /fields/);
});
test('an enrolled recovery signer can replace authority once, but cannot use an unregistered or retained kit', async () => {
  const f = await fixture(); const recovery = await keys.generateSigningKey(); const nextAdmin = await keys.generateSigningKey();
  const rsa = await crypto.subtle.generateKey({ name: 'RSA-OAEP', modulusLength: 3072, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, false, ['encrypt', 'decrypt']);
  const kit = { signingKey: recovery.publicKey, encryptionKey: Buffer.from(await crypto.subtle.exportKey('spki', rsa.publicKey)).toString('base64'), privateEnvelopeDigest: 'a'.repeat(64), rootEnvelopeDigest: 'b'.repeat(64) };
  const activated = await successor(f, { reason: 'recovery-set', recovery: kit }); const parent = await p.authorityDigest(activated.payload);
  const payload = { ...activated.payload, revision: 'recovered', parents: [parent], reason: 'recover', keyEpoch: 'recovered-epoch', adminKey: nextAdmin.publicKey, protectionDigest: 'c'.repeat(64), recovery: null };
  const recovered = await p.createAuthorityState(payload, [{ parent, role: 'recovery', privateKey: recovery.privateKey }]);
  const graph = await p.verifyAuthorityGraph([recovered, f.signed, activated], f.trust); assert.equal(p.authorityState(graph).payload.adminKey, nextAdmin.publicKey);
  const wrong = await p.createAuthorityState(payload, [{ parent, role: 'recovery', privateKey: f.writer.privateKey }]);
  await assert.rejects(p.verifyAuthorityGraph([f.signed, activated, wrong], f.trust), /role signature/);
  const retained = await p.createAuthorityState({ ...payload, recovery: kit }, [{ parent, role: 'recovery', privateKey: recovery.privateKey }]);
  await assert.rejects(p.verifyAuthorityGraph([f.signed, activated, retained], f.trust), /consumes the old kit/);
});
