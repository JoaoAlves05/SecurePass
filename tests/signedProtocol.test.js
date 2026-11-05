import { test } from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
globalThis.crypto = webcrypto;
const protocol = await import('../src/sync/signedProtocol.js');
const { createRecord } = await import('../src/vault/crypto.js');
async function setup() {
  const admin = await protocol.generateSigningKey(); const device = await protocol.generateSigningKey();
  const { record } = await createRecord([], 'Fictional signed protocol master 123!');
  const payload = { kind: 'securepass-authorization', version: 1, vaultId: record.vaultId, keyEpoch: record.keyEpoch, revision: crypto.randomUUID(), previous: null, adminKey: admin.publicKey, devices: [{ id: 'writer', publicKey: device.publicKey }] };
  const genesis = await protocol.createAuthorization(payload, admin.privateKey);
  const trust = { vaultId: record.vaultId, rootFingerprint: await protocol.signingKeyFingerprint(admin.publicKey) };
  const state = await protocol.verifyAuthorizationChain([genesis], trust);
  return { admin, device, record, payload, genesis, trust, state, publication: { vaultId: record.vaultId, revisionId: record.revision } };
}
test('independent root verifies authorization and signed encrypted revision without private material', async () => {
  const f = await setup();
  const body = await protocol.createSignedRevision(f.record, 'writer', f.device.privateKey, f.state);
  assert.deepEqual((await protocol.verifySignedPublication(body, f.publication, f.state)).record, f.record);
  assert.equal(f.state.freshness, 'unproven');
  assert.equal((await protocol.verifyAuthorizationChain([f.genesis], { ...f.trust, expectedHead: f.state.hash })).freshness, 'matches-checkpoint');
  assert.equal(body.includes('Fictional signed protocol master'), false);
});
test('untrusted roots, replay, missing predecessors and stale trusted checkpoints are refused', async () => {
  const f = await setup();
  await assert.rejects(protocol.verifyAuthorizationChain([f.genesis], { ...f.trust, rootFingerprint: '0'.repeat(64) }), /Untrusted/);
  await assert.rejects(protocol.verifyAuthorizationChain([f.genesis, f.genesis], f.trust), /replay/);
  const next = await protocol.createAuthorization({ ...f.payload, revision: crypto.randomUUID(), previous: f.state.hash }, f.admin.privateKey);
  const state = await protocol.verifyAuthorizationChain([f.genesis, next], f.trust);
  await assert.rejects(protocol.verifyAuthorizationChain([f.genesis], { ...f.trust, expectedHead: state.hash }), /checkpoint mismatch/);
  await assert.rejects(protocol.verifyAuthorizationChain([next], f.trust), /Untrusted/);
});
test('a revoked writer cannot sign or publish under the new authorization state', async () => {
  const f = await setup(); const replacement = await protocol.generateSigningKey();
  const old = await protocol.createSignedRevision(f.record, 'writer', f.device.privateKey, f.state);
  const change = await protocol.createAuthorization({ ...f.payload, revision: crypto.randomUUID(), previous: f.state.hash, devices: [{ id: 'replacement', publicKey: replacement.publicKey }] }, f.admin.privateKey);
  const state = await protocol.verifyAuthorizationChain([f.genesis, change], f.trust);
  await assert.rejects(protocol.verifySignedPublication(old, f.publication, state), /authorization/);
  await assert.rejects(protocol.createSignedRevision(f.record, 'writer', f.device.privateKey, state), /not authorized/);
});
test('wrong signer, modified ciphertext and cleartext extra fields fail before use', async () => {
  const f = await setup(); const wrong = await protocol.generateSigningKey();
  await assert.rejects(protocol.createSignedRevision(f.record, 'writer', wrong.privateKey, f.state), /signature/);
  const body = await protocol.createSignedRevision(f.record, 'writer', f.device.privateKey, f.state);
  const altered = JSON.parse(body); altered.payload.record.data.ciphertext = altered.payload.record.data.ciphertext.replace(/^./, value => value === 'A' ? 'B' : 'A');
  await assert.rejects(protocol.verifySignedPublication(JSON.stringify(altered), f.publication, f.state), /signature/);
  const extra = JSON.parse(body); extra.payload.record.password = 'must not be cleartext';
  await assert.rejects(protocol.verifySignedPublication(JSON.stringify(extra), f.publication, f.state), /structure/);
  await assert.rejects(protocol.createSignedRevision(f.record, 'writer', f.device.privateKey, { ...f.state }), /Verified/);
});
test('unknown fields, duplicate JSON keys, changed identities and noncanonical serialization are rejected', async () => {
  const f = await setup();
  const body = await protocol.createSignedRevision(f.record, 'writer', f.device.privateKey, f.state);
  await assert.rejects(protocol.verifySignedPublication(' '+body, f.publication, f.state), /Noncanonical/);
  await assert.rejects(protocol.verifySignedPublication(body.replace('"signature":', '"signature":"ignored","signature":'), f.publication, f.state), /Noncanonical/);
  await assert.rejects(protocol.verifySignedPublication(body, { ...f.publication, revisionId: 'different' }, f.state), /identity mismatch/);
  await assert.rejects(protocol.createAuthorization({ ...f.payload, devices: [f.payload.devices[0], f.payload.devices[0]] }, f.admin.privateKey), /unique and sorted/);
});
test('administrative key rotation requires predecessor authority and concurrent branches do not form one chain', async () => {
  const f = await setup(); const nextAdmin = await protocol.generateSigningKey();
  const payload = { ...f.payload, revision: crypto.randomUUID(), previous: f.state.hash, adminKey: nextAdmin.publicKey };
  const authorized = await protocol.createAuthorization(payload, f.admin.privateKey);
  const wrong = await protocol.createAuthorization(payload, nextAdmin.privateKey);
  await assert.rejects(protocol.verifyAuthorizationChain([f.genesis, wrong], f.trust), /signature/);
  const branch = await protocol.createAuthorization({ ...f.payload, revision: crypto.randomUUID(), previous: f.state.hash }, f.admin.privateKey);
  await assert.rejects(protocol.verifyAuthorizationChain([f.genesis, authorized, branch], f.trust), /Divergent/);
});

test('fixed public vector verifies against its pinned root, state digest and ciphertext identity', async () => {
  const { readFile } = await import('node:fs/promises');
  const vector = JSON.parse(await readFile(new URL('./fixtures/signedProtocolVector.json', import.meta.url), 'utf8'));
  const state = await protocol.verifyAuthorizationChain([vector.genesis], { ...vector.trust, expectedHead: vector.authorizationHash });
  assert.equal(state.hash, vector.authorizationHash);
  assert.equal((await protocol.verifySignedPublication(vector.body, vector.publication, state)).author, 'fixed-vector-writer');
});
