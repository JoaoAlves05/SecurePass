import { test } from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { encryptEntries, seal } from '../src/vault/crypto.js';
import { createAuthorization, verifyAuthorizationChain } from '../src/sync/signedProtocol.js';
import { planAuthenticatedMerge } from '../src/vault/authenticatedMerge.js';
import { resolveThreeWayMerge } from '../src/vault/threeWayMerge.js';
import { entry, fixture } from './helpers/signedHistory.js';
globalThis.crypto = webcrypto;
test('signed history selects the nearest base, decrypts and merges independent edits without preview secrets', async () => {
  const f = await fixture();
  const p = await planAuthenticatedMerge(f.options);
  assert.equal(p.identity.base, f.root.revision);
  assert.equal(JSON.stringify(p).includes('secret'), false);
  assert.deepEqual((await resolveThreeWayMerge(p, {}, p.identity)).entries.map(e => e.password), ['local secret', 'remote secret']);
  const next = await encryptEntries(f.left, [entry('a', 'next'), entry('b')], f.bytes);
  const linear = await planAuthenticatedMerge({ ...f.options, remote: next.revision, packets: [...f.packets, await f.packet(next)] });
  assert.equal(linear.identity.base, f.left.revision);
  const same = await planAuthenticatedMerge({ ...f.options, remote: f.left.revision });
  assert.equal(same.identity.base, f.left.revision);
});
test('signed deletion versus edit reaches explicit conflict decisions', async () => {
  const f = await fixture();
  const removed = await encryptEntries(f.root, [entry('b')], f.bytes);
  const p = await planAuthenticatedMerge({ ...f.options, remote: removed.revision, packets: [...f.packets, await f.packet(removed)] });
  assert.deepEqual(p.conflicts, [{ id: 'a', type: 'delete-edit' }]);
  assert.deepEqual((await resolveThreeWayMerge(p, { a: 'remote' }, p.identity)).deletedIds, ['a']);
});
test('missing revisions, absent heads and disconnected roots never imply an empty common base', async () => {
  const f = await fixture();
  await assert.rejects(planAuthenticatedMerge({ ...f.options, packets: f.packets.slice(1) }), /Incomplete/);
  await assert.rejects(planAuthenticatedMerge({ ...f.options, local: 'missing' }), /Incomplete/);
  const root = await encryptEntries(f.root, [], f.bytes, []);
  await assert.rejects(planAuthenticatedMerge({ ...f.options, remote: root.revision, packets: [...f.packets, await f.packet(root)] }), /No unique/);
});
test('signed cycles, revision equivocation and ambiguous merge bases are rejected', async () => {
  const f = await fixture();
  const cycle = { ...f.left, parents: [f.left.revision] };
  await assert.rejects(planAuthenticatedMerge({ ...f.options, packets: [f.packets[0], await f.packet(cycle), f.packets[2]] }), /Cyclic/);
  await assert.rejects(planAuthenticatedMerge({ ...f.options, packets: [...f.packets, await f.packet({ ...f.left, updatedAt: '2026-02-01T00:00:00.000Z' })] }), /inconsistent/);
  const a = await encryptEntries(f.left, [], f.bytes, [f.left.revision, f.right.revision]);
  const b = await encryptEntries(f.right, [], f.bytes, [f.right.revision, f.left.revision]);
  await assert.rejects(planAuthenticatedMerge({ ...f.options, local: a.revision, remote: b.revision, packets: [...f.packets, await f.packet(a), await f.packet(b)] }), /No unique/);
});
test('duplicate downloads and packet order do not change the selected base or result', async () => {
  const f = await fixture();
  // A fresh ECDSA signature can differ while the immutable record is identical.
  const packets = [await f.packet(f.left), ...[...f.packets].reverse()];
  const p = await planAuthenticatedMerge({ ...f.options, packets });
  assert.equal(p.identity.base, f.root.revision);
  assert.equal((await resolveThreeWayMerge(p, {}, p.identity)).entries.length, 2);
});
test('tampered signatures, wrong publication identity, forged authorization and wrong keys fail closed', async () => {
  const f = await fixture();
  const altered = JSON.parse(f.packets[0].body); altered.payload.record.parents = ['forged'];
  await assert.rejects(planAuthenticatedMerge({ ...f.options, packets: [{ ...f.packets[0], body: JSON.stringify(altered) }, ...f.packets.slice(1)] }), /signature/);
  await assert.rejects(planAuthenticatedMerge({ ...f.options, packets: [{ ...f.packets[0], publication: { ...f.packets[0].publication, revisionId: 'forged' } }] }), /identity mismatch/);
  await assert.rejects(planAuthenticatedMerge({ ...f.options, authorization: { ...f.options.authorization } }), /Verified/);
  await assert.rejects(planAuthenticatedMerge({ ...f.options, bytes: new Uint8Array(32) }));
  const changed = await createAuthorization({ ...f.genesis.payload, revision: 'new-auth', previous: f.options.authorization.hash }, f.signer.privateKey);
  const authorization = await verifyAuthorizationChain([f.genesis, changed], f.trust);
  await assert.rejects(planAuthenticatedMerge({ ...f.options, authorization }), /authorization/);
});
test('caller mutation during verification cannot replace packets or content key', async () => {
  const f = await fixture();
  const options = { ...f.options, packets: structuredClone(f.packets), bytes: Buffer.from(f.bytes) };
  const pending = planAuthenticatedMerge(options);
  options.packets[1].body = 'forged'; options.packets[0].publication.revisionId = 'forged'; options.bytes.fill(0);
  const p = await pending;
  assert.equal((await resolveThreeWayMerge(p, {}, p.identity)).entries[0].password, 'local secret');
});
test('session invalidation during verification and after preview prevents use', async () => {
  const f = await fixture(); let active = true;
  const guard = () => active;
  const pending = planAuthenticatedMerge({ ...f.options, assertCurrent: guard });
  active = false; await assert.rejects(pending, /context changed/);
  active = true; const p = await planAuthenticatedMerge({ ...f.options, assertCurrent: guard });
  active = false; await assert.rejects(resolveThreeWayMerge(p, {}, p.identity), /context changed/);
  await assert.rejects(planAuthenticatedMerge({ ...f.options, assertCurrent: async () => true }), /synchronous/);
});
test('history count and byte limits are checked before parsing or cryptographic work', async () => {
  const f = await fixture();
  await assert.rejects(planAuthenticatedMerge({ ...f.options, packets: Array(257).fill(f.packets[0]) }), /bounded/);
  await assert.rejects(planAuthenticatedMerge({ ...f.options, packets: [{ body: 'x'.repeat(32 * 1024 * 1024 + 1) }] }), /byte limit/);
  await assert.rejects(planAuthenticatedMerge({ ...f.options, packets: [{ body: 'à'.repeat(9 * 1024 * 1024) }, { body: 'à'.repeat(9 * 1024 * 1024) }] }), /byte limit/);
});
test('authenticated plaintext missing identities or dates cannot gain causal identity through import defaults', async () => {
  const f = await fixture();
  const key = await crypto.subtle.importKey('raw', f.bytes, 'AES-GCM', false, ['encrypt']);
  for (const field of ['id', 'createdAt', 'updatedAt']) {
    const incomplete = entry('a'); delete incomplete[field];
    const record = { ...f.left };
    record.data = await seal({ entries: [incomplete] }, key, JSON.stringify({ version: 2, vaultId: record.vaultId, revision: record.revision, parents: record.parents, keyEpoch: record.keyEpoch }));
    await assert.rejects(planAuthenticatedMerge({ ...f.options, packets: [f.packets[0], await f.packet(record), f.packets[2]] }), /complete authenticated/);
  }
});
