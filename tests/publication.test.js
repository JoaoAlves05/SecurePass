import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPublicationCoordinator } from '../src/sync/publication.js';
function setup(publish) {
  const transitions = []; let current = true;
  const operation = { binding: { account: 'fictional-account', generation: 'one' }, publication: { revisionId: 'revision' }, attempts: 0 };
  const store = { next: async () => operation, assertCurrent: async () => { if (!current) throw new Error('changed'); }, markSending: async (_op, value) => transitions.push(['sending', value]), acknowledge: async () => transitions.push(['ack']), recordFailure: async (_op, value) => transitions.push(['failed', value]) };
  return { operation, transitions, disable: () => { current = false; }, coordinator: createPublicationCoordinator({ store, transport: { publish }, now: () => 1000, random: () => 0 }) };
}
test('coordinator persists uncertain sending before I/O and coalesces overlapping runs', async () => {
  let calls = 0; const state = setup(async () => { calls++; assert.equal(state.transitions[0][0], 'sending'); return { verified: true, revisionId: 'revision' }; });
  await Promise.all([state.coordinator.run(), state.coordinator.run()]);
  assert.equal(calls, 1); assert.equal(state.transitions[1][0], 'ack');
});
test('transient failures persist bounded retry timing and never provider messages', async () => {
  const state = setup(async () => { throw Object.assign(new Error('SECRET'), { code: 'temporarily-unavailable', retryable: true, retryAfter: 12000 }); });
  await state.coordinator.run();
  const failure = state.transitions[1][1]; assert.equal(failure.nextAttempt, 13000); assert.equal(failure.outcome, 'unknown');
  assert.equal(JSON.stringify(state.transitions).includes('SECRET'), false);
});
test('disabling while upload succeeds suspends acknowledgement rather than changing account', async () => {
  const state = setup(async () => { state.disable(); return { verified: true, revisionId: 'revision' }; });
  assert.deepEqual(await state.coordinator.run(), { suspended: true, outcome: 'unknown' });
  assert.deepEqual(state.transitions.map(item => item[0]), ['sending']);
});
test('permanent capacity errors block without retries and future retry deadlines avoid I/O', async () => {
  const state = setup(async () => { throw Object.assign(new Error('capacity'), { code: 'capacity', retryable: false }); });
  assert.equal((await state.coordinator.run()).blocked, true); assert.equal(state.transitions[1][1].nextAttempt, null);
  state.operation.nextAttempt = 9000; state.transitions.length = 0;
  assert.deepEqual(await state.coordinator.run(), { pending: true }); assert.equal(state.transitions.length, 0);
});

test('unverified success is never acknowledged and blocked persisted work remains idle', async () => {
  const state = setup(async () => ({ verified: false }));
  await state.coordinator.run();
  assert.equal(state.transitions[1][0], 'failed');
  state.operation.blocked = true; state.transitions.length = 0;
  assert.deepEqual(await state.coordinator.run(), { pending: true, blocked: true });
  assert.equal(state.transitions.length, 0);
});

test('persisted attempt limit stops network activity and retains uncertain work for explicit recovery', async () => {
  let calls = 0;
  const state = setup(async () => { calls++; return { verified: true, revisionId: 'revision' }; });
  state.operation.attempts = 20;
  assert.deepEqual(await state.coordinator.run(), { pending: true, blocked: true });
  assert.equal(calls, 0);
  assert.equal(state.transitions[0][1].code, 'retry-limit');
});
