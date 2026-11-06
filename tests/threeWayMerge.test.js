import { test } from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { planThreeWayMerge, resolveThreeWayMerge, discardThreeWayMerge } from '../src/vault/threeWayMerge.js';
globalThis.crypto = webcrypto;
const identity = { vaultId: 'vault', keyEpoch: 'epoch', base: 'base', local: 'local', remote: 'remote' };
const entry = (id, password = 'fictional', extra = {}) => ({ id, site: 'https://example.com', username: id, password, notes: '', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z', ...extra });
const plan = (base, local, remote, extra = {}) => planThreeWayMerge({ base, local, remote, identity, assertCurrent: () => {}, ...extra });
test('independent edits combine and unchanged remote data cannot resurrect a local deletion', async () => {
  const base = [entry('a'), entry('b'), entry('c')];
  const p = plan(base, [entry('a', 'local change'), entry('b')], [entry('a'), entry('b', 'remote change'), entry('c')]);
  assert.deepEqual(p.conflicts, []);
  const merged = await resolveThreeWayMerge(p, {}, identity);
  assert.deepEqual(merged.entries.map(e => [e.id, e.password]), [['a', 'local change'], ['b', 'remote change']]);
  assert.deepEqual(merged.deletedIds, ['c']);
});
test('delete versus edit requires a decision; preview and missing decisions disclose no credentials', async () => {
  const p = plan([entry('a')], [], [entry('a', 'secret changed value')]);
  assert.deepEqual(p.conflicts, [{ id: 'a', type: 'delete-edit' }]);
  assert.equal(JSON.stringify(p).includes('secret changed value'), false);
  await assert.rejects(resolveThreeWayMerge(p, {}, identity), /every conflict/);
  await assert.rejects(resolveThreeWayMerge(p, { a: 'both' }, identity), /surviving entry/);
  assert.deepEqual((await resolveThreeWayMerge(p, { a: 'local' }, identity)).deletedIds, ['a']);
  assert.equal((await resolveThreeWayMerge(p, { a: 'remote' }, identity)).entries[0].password, 'secret changed value');
});
test('keep-both is deterministic under reversed sides, replay and maximal notes without altering user text', async () => {
  const base = [entry('a')]; const a = [entry('a', 'alpha', { notes: 'x'.repeat(4096) })]; const b = [entry('a', 'beta', { notes: 'y'.repeat(4096) })];
  const p = plan(base, a, b); const first = await resolveThreeWayMerge(p, { a: 'both' }, identity);
  assert.deepEqual(await resolveThreeWayMerge(p, { a: 'both' }, identity), first);
  const swapped = { ...identity, local: identity.remote, remote: identity.local };
  const other = plan(base, b, a, { identity: swapped });
  assert.deepEqual(await resolveThreeWayMerge(other, { a: 'both' }, swapped), first);
  assert.equal(first.entries.length, 2); assert.ok(first.entries.every(e => e.notes.length === 4096));
  assert.equal(first.provenance.length, 1); assert.equal(first.provenance[0].id.length, 64);
});
test('timestamp order never picks a winner or pairs fields from conflicting versions', async () => {
  const p = plan([entry('a')], [entry('a', 'local password', { username: 'local user', updatedAt: '2099-01-01T00:00:00.000Z' })], [entry('a', 'remote password', { username: 'remote user' })]);
  assert.equal(p.conflicts[0].type, 'edit-edit');
  const result = await resolveThreeWayMerge(p, { a: 'remote' }, identity);
  assert.equal(result.entries[0].username, 'remote user'); assert.equal(result.entries[0].password, 'remote password');
});
test('three independent writers converge in every delivery order with the same verified base', async () => {
  const base = [entry('a'), entry('b'), entry('c')];
  const branches = base.map((_, i) => base.map((e, j) => i === j ? { ...e, password: `writer-${i}` } : e));
  let expected;
  for (const order of [[0,1,2], [0,2,1], [1,0,2], [1,2,0], [2,0,1], [2,1,0]]) {
    let state = base;
    for (const index of order) state = (await resolveThreeWayMerge(plan(base, state, branches[index]), {}, identity)).entries;
    expected ||= state; assert.deepEqual(state, expected);
  }
});
test('review is immutable, bound to all revisions and invalidated by discard or lock', async () => {
  let locked = false; const base = [entry('a')]; const incoming = [entry('a', 'changed')];
  const p = plan(base, base, incoming, { assertCurrent: () => { if (locked) throw new Error('locked'); } });
  incoming[0].password = 'mutated after review';
  assert.equal((await resolveThreeWayMerge(p, {}, identity)).entries[0].password, 'changed');
  await assert.rejects(resolveThreeWayMerge(p, {}, { ...identity, base: 'different' }), /revisions changed/);
  await assert.rejects(resolveThreeWayMerge(structuredClone(p), {}, identity), /discarded/);
  locked = true; await assert.rejects(resolveThreeWayMerge(p, {}, identity), /locked/);
  locked = false; discardThreeWayMerge(p); await assert.rejects(resolveThreeWayMerge(p, {}, identity), /discarded/);
});
test('no common base, incomplete identity, invalid entries and async guards fail conservatively', () => {
  assert.throws(() => plan([], [], [], { identity: { ...identity, base: '' } }), /common base/);
  assert.throws(() => plan([{ site: 'https://example.com', password: 'fictional' }], [], []), /complete authenticated/);
  assert.throws(() => plan([], [entry('a'), entry('a')], []), /Duplicate/);
  assert.throws(() => plan([], [], [], { assertCurrent: async () => {} }), /synchronous/);
  assert.throws(() => plan([], [], [], { assertCurrent: () => false }), /context changed/);
});
test('review expires at the boundary and rejects wall-clock rollback', async () => {
  const now = Date.now; let clock = now(); Date.now = () => clock;
  try {
    const p = plan([], [], []); clock = p.expiresAt;
    await assert.rejects(resolveThreeWayMerge(p, {}, identity), /expired/);
    clock = p.expiresAt - 120001;
    await assert.rejects(resolveThreeWayMerge(p, {}, identity), /expired/);
  } finally { Date.now = now; }
});
test('capacity applies to the combined result before anything can be committed', async () => {
  const a = Array.from({ length: 2600 }, (_, i) => entry(`a-${i}`)); const b = Array.from({ length: 2600 }, (_, i) => entry(`b-${i}`));
  await assert.rejects(resolveThreeWayMerge(plan([], a, b), {}, identity), /Invalid backup entries/);
});
test('same immutable revision cannot describe two different entry sets', () => {
  assert.throws(() => plan([], [entry('a')], [entry('b')], { identity: { ...identity, remote: identity.local } }), /inconsistent contents/);
});
test('a conflicting copy ID can never overwrite an unrelated existing credential', async () => {
  const original = crypto.subtle.digest;
  crypto.subtle.digest = async () => new Uint8Array(32).buffer;
  try {
    const occupied = entry(`c-${'0'.repeat(62)}`, 'unrelated');
    const p = plan([occupied, entry('z')], [occupied, entry('z', 'alpha')], [occupied, entry('z', 'beta')]);
    await assert.rejects(resolveThreeWayMerge(p, { z: 'both' }, identity), /identity collision/);
    assert.equal(occupied.password, 'unrelated');
    const multiple = plan([entry('a'), entry('b')], [entry('a', 'alpha'), entry('b', 'alpha')], [entry('a', 'beta'), entry('b', 'beta')]);
    await assert.rejects(resolveThreeWayMerge(multiple, { a: 'both', b: 'both' }, identity), /identity collision/);
  } finally { crypto.subtle.digest = original; }
});
test('discard during asynchronous conflict-copy preparation prevents returning decrypted contents', async () => {
  const original = crypto.subtle.digest; let release; let started;
  const gate = new Promise(resolve => { release = resolve; }); const called = new Promise(resolve => { started = resolve; });
  crypto.subtle.digest = async (...args) => { started(); await gate; return original.apply(crypto.subtle, args); };
  try {
    const p = plan([entry('a')], [entry('a', 'alpha')], [entry('a', 'beta')]);
    const result = resolveThreeWayMerge(p, { a: 'both' }, identity); await called;
    discardThreeWayMerge(p); release(); await assert.rejects(result, /discarded/);
  } finally { release(); crypto.subtle.digest = original; }
});
