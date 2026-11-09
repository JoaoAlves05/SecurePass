import { test } from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto, hkdfSync, createDecipheriv } from 'node:crypto';
globalThis.crypto = webcrypto;
const crypt = await import('../src/vault/crypto.js');
const history = await import('../src/sync/keyHistory.js');
const auth = await import('../src/sync/authorizationGraph.js');
const { materialKey } = await import('../src/sync/keyMaterial.js');
const { generateSigningKey } = await import('../src/sync/signedProtocol.js');
const { protectionDigest } = await import('../src/sync/revisionProtocol2.js');
const { fixture, PASS, entry } = await import('./helpers/protocolV2.js');
async function setup() {
  const f = await fixture(); const next = await crypt.createRecord([entry('next')], PASS + ' new', { version: 3, vaultId: f.record.vaultId, keyEpoch: 'new-epoch' });
  const envelope = await history.createKeyHistory([{ keyEpoch: f.record.keyEpoch, bytes: f.bytes }], next.bytes, next.record);
  const admin = await generateSigningKey();
  async function stateFor(value) {
    const node = await auth.createAuthorityState({ ...f.payload, revision: 'rotation', parents: [f.head], reason: 'rotate', keyEpoch: next.record.keyEpoch, adminKey: admin.publicKey, protectionDigest: await protectionDigest(next.record), keyHistoryDigest: await history.keyHistoryDigest(value) }, [{ parent: f.head, role: 'admin', privateKey: f.admin.privateKey }]);
    return auth.authorityState(await auth.verifyAuthorityGraph([node, f.signed], f.trust));
  }
  return { f, next, envelope, stateFor, state: await stateFor(envelope) };
}
test('only the new root opens authenticated historical roots; old ciphertext remains readable', async () => {
  const { f, next, envelope, state } = await setup();
  const opened = await history.openKeyHistory(envelope, next.bytes, state);
  try {
    assert.deepEqual(opened[0].bytes, f.bytes);
    assert.equal((await crypt.decryptWithKey(f.record, opened[0].bytes))[0].username, 'one');
    await assert.rejects(history.openKeyHistory(envelope, f.bytes, state));
    await assert.rejects(crypt.decryptWithKey(next.record, f.bytes));
  } finally { opened.forEach(value => value.bytes.fill(0)); }
});
test('wrong digests, context, schema and forged authority reject historical keys', async () => {
  const { f, next, envelope, state } = await setup();
  await assert.rejects(history.openKeyHistory(envelope, next.bytes, f.state), /context/);
  await assert.rejects(history.openKeyHistory({ ...envelope, keySalt: crypt.encodeKey(crypt.newKey()) }, next.bytes, state), /not bound/);
  await assert.rejects(history.openKeyHistory({ ...envelope, extra: true }, next.bytes, state), /fields/);
  await assert.rejects(history.openKeyHistory(envelope, next.bytes, { ...state }), /Verified live/);
  await assert.rejects(history.createKeyHistory([{ keyEpoch: next.record.keyEpoch, bytes: f.bytes }], next.bytes, next.record), /exclude/);
  await assert.rejects(history.createKeyHistory(Array.from({ length: 65 }, () => ({ keyEpoch: 'old', bytes: f.bytes })), next.bytes, next.record), /budget/);
  await assert.rejects(history.createKeyHistory([{ keyEpoch: 'old', bytes: f.bytes }, { keyEpoch: 'old', bytes: f.bytes }], next.bytes, next.record), /unique/);
});
test('authenticated malformed plaintext is rejected after decryption', async () => {
  const { f, next, envelope, stateFor } = await setup();
  const context = JSON.stringify(['SecurePass:key-history:1', envelope.vaultId, envelope.keyEpoch, envelope.keySalt]);
  const key = await materialKey(next.bytes, envelope.keySalt, context);
  for (const entries of [[], [{ keyEpoch: next.record.keyEpoch, root: crypt.encodeKey(f.bytes) }], [{ keyEpoch: 'old', root: crypt.encodeKey(f.bytes), extra: true }], [{ keyEpoch: 'old', root: crypt.encodeKey(f.bytes) }, { keyEpoch: 'old', root: crypt.encodeKey(f.bytes) }]]) {
    const malformed = { ...envelope, protectedKeys: await crypt.seal(entries, key, context) };
    await assert.rejects(history.openKeyHistory(malformed, next.bytes, await stateFor(malformed)));
  }
});
test('candidate generation snapshots caller roots and epochs before asynchronous derivation', async () => {
  const { f, next, stateFor } = await setup(); const original = new Uint8Array(f.bytes); const source = new Uint8Array(f.bytes); const active = new Uint8Array(next.bytes); const expected = { ...next.record };
  const task = history.createKeyHistory([{ keyEpoch: 'original', bytes: source }], active, expected);
  source.fill(0); active.fill(0); expected.keyEpoch = 'retargeted';
  const envelope = await task; const opened = await history.openKeyHistory(envelope, next.bytes, await stateFor(envelope));
  try { assert.equal(opened[0].keyEpoch, 'original'); assert.deepEqual(opened[0].bytes, original); } finally { opened[0].bytes.fill(0); }
});
test('independent Node HKDF/GCM opens the exact documented history context', async () => {
  const root = crypt.newKey(); const old = crypt.newKey();
  const envelope = await history.createKeyHistory([{ keyEpoch: 'previous', bytes: old }], root, { vaultId: 'fictional-vault', keyEpoch: 'current' });
  const context = JSON.stringify(['SecurePass:key-history:1', envelope.vaultId, envelope.keyEpoch, envelope.keySalt]);
  const key = hkdfSync('sha256', root, Buffer.from(envelope.keySalt, 'base64'), Buffer.from(context), 32);
  const ciphertext = Buffer.from(envelope.protectedKeys.ciphertext, 'base64');
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(envelope.protectedKeys.iv, 'base64'));
  decipher.setAAD(Buffer.from(context)); decipher.setAuthTag(ciphertext.subarray(-16));
  const plaintext = Buffer.concat([decipher.update(ciphertext.subarray(0, -16)), decipher.final()]);
  try { assert.deepEqual(JSON.parse(plaintext.toString()), [{ keyEpoch: 'previous', root: crypt.encodeKey(old) }]); } finally { plaintext.fill(0); root.fill(0); old.fill(0); }
});
