import { before, test } from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
globalThis.crypto = webcrypto;
const crypt = await import('../src/vault/crypto.js');
const kits = await import('../src/sync/recoveryKit.js');
const auth = await import('../src/sync/authorizationGraph.js');
const { generateSigningKey } = await import('../src/sync/signedProtocol.js');
const { protectionDigest } = await import('../src/sync/revisionProtocol2.js');
const { materialKey, materialDigest } = await import('../src/sync/keyMaterial.js');
const { fixture, successor, PASS, entry } = await import('./helpers/protocolV2.js');
let f; let candidate; let enrolled; let state; let head;
before(async () => {
  f = await fixture(); candidate = await kits.createRecoveryKit(f.record, f.bytes, f.state);
  enrolled = await successor(f, { reason: 'recovery-set', recovery: candidate.policy });
  head = await auth.authorityDigest(enrolled.payload);
  state = auth.authorityState(await auth.verifyAuthorityGraph([enrolled, f.signed], { ...f.trust, expectedHead: head }));
});
test('kit candidate needs explicit authenticated enrollment and proves both separate private key pairs', async () => {
  assert.match(candidate.code, /^SPREC1:/);
  assert.deepEqual(await kits.recoveryPolicy(candidate.material), candidate.policy);
  assert.notEqual(candidate.policy.signingKey, f.payload.adminKey);
  await assert.rejects(kits.openRecoveryKit(candidate.code, candidate.material, f.record, f.state), /not bound/);
  const recovered = await kits.openRecoveryKit(candidate.code, candidate.material, f.record, state);
  try {
    assert.deepEqual(recovered.bytes, f.bytes); assert.equal(recovered.privateKey.extractable, false);
    await assert.rejects(crypto.subtle.exportKey('pkcs8', recovered.privateKey));
    const admin = await generateSigningKey();
    const transition = await auth.createAuthorityState({ ...enrolled.payload, revision: 'recovered', parents: [head], reason: 'recover', keyEpoch: 'recovered-epoch', adminKey: admin.publicKey, protectionDigest: 'a'.repeat(64), recovery: null }, [{ parent: head, role: 'recovery', privateKey: recovered.privateKey }]);
    assert.equal(auth.authorityState(await auth.verifyAuthorityGraph([transition, enrolled, f.signed], f.trust)).payload.recovery, null);
    await assert.rejects(auth.createAuthorityState({ ...enrolled.payload, revision: 'fake-admin', parents: [head], reason: 'checkpoint' }, [{ parent: head, role: 'admin', privateKey: recovered.privateKey }]).then(node => auth.verifyAuthorityGraph([node, enrolled, f.signed], f.trust)), /signature/);
  } finally { recovered.bytes.fill(0); }
});
test('wrong, aliased, oversized and transplanted codes fail without changing encrypted material', async () => {
  const original = JSON.stringify(candidate.material);
  const wrong = candidate.code.slice(0, -1) + (candidate.code.endsWith('0') ? '1' : '0');
  for (const code of [wrong, candidate.code + ' ', 'x'.repeat(257), candidate.code.replace(f.record.vaultId, 'other-vault')]) await assert.rejects(kits.openRecoveryKit(code, candidate.material, f.record, state), /code/);
  assert.equal(JSON.stringify(candidate.material), original);
  assert.ok(f.bytes.some(byte => byte));
});
test('envelope changes and look-alike authority never become recovery grants', async () => {
  for (const change of [value => { value.rootEnvelope.keyEpoch = 'another-epoch'; }, value => { value.privateEnvelope.keySalt = crypt.encodeKey(crypt.newKey()); }, value => { value.rootEnvelope.ciphertext = crypt.encodeKey(crypto.getRandomValues(new Uint8Array(384))); }, value => { value.privateEnvelope.extra = true; }]) {
    const value = structuredClone(candidate.material); change(value);
    await assert.rejects(kits.openRecoveryKit(candidate.code, value, f.record, state));
  }
  await assert.rejects(kits.openRecoveryKit(candidate.code, candidate.material, f.record, { ...state }), /Verified live/);
  const wrongRecord = await crypt.createRecord([entry()], PASS, { version: 3, vaultId: f.record.vaultId, keyEpoch: f.record.keyEpoch });
  await assert.rejects(kits.openRecoveryKit(candidate.code, candidate.material, wrongRecord.record, state), /epoch\/protection/);
});
test('rotation rewraps only the root using public recovery encryption; the printed code stays usable', async () => {
  const next = await crypt.createRecord([entry('rotated')], PASS + ' new', { version: 3, vaultId: f.record.vaultId, keyEpoch: 'new-epoch' });
  const admin = await generateSigningKey();
  const wrapped = await kits.rewrapRecoveryRoot(candidate.material, next.record, next.bytes, state);
  assert.deepEqual(wrapped.material.privateEnvelope, candidate.material.privateEnvelope);
  assert.equal(wrapped.policy.privateEnvelopeDigest, candidate.policy.privateEnvelopeDigest);
  assert.notEqual(wrapped.policy.rootEnvelopeDigest, candidate.policy.rootEnvelopeDigest);
  const signed = await auth.createAuthorityState({ ...enrolled.payload, revision: 'rotated', parents: [head], reason: 'rotate', keyEpoch: next.record.keyEpoch, adminKey: admin.publicKey, protectionDigest: await protectionDigest(next.record), recovery: wrapped.policy }, [{ parent: head, role: 'admin', privateKey: f.admin.privateKey }]);
  const nextState = auth.authorityState(await auth.verifyAuthorityGraph([signed, enrolled, f.signed], f.trust));
  const recovered = await kits.openRecoveryKit(candidate.code, wrapped.material, next.record, nextState);
  try { assert.deepEqual(recovered.bytes, next.bytes); } finally { recovered.bytes.fill(0); next.bytes.fill(0); }
  await assert.rejects(kits.openRecoveryKit(candidate.code, candidate.material, f.record, nextState), /not bound/);
  await assert.rejects(kits.rewrapRecoveryRoot(candidate.material, f.record, f.bytes, state), /epoch\/protection/);
});
test('cleared and forked authority reject a previously valid kit', async () => {
  const clear = await auth.createAuthorityState({ ...enrolled.payload, revision: 'clear', parents: [head], reason: 'recovery-clear', recovery: null }, [{ parent: head, role: 'admin', privateKey: f.admin.privateKey }]);
  const checkpoint = await auth.createAuthorityState({ ...enrolled.payload, revision: 'concurrent', parents: [head], reason: 'checkpoint' }, [{ parent: head, role: 'admin', privateKey: f.admin.privateKey }]);
  const cleared = auth.authorityState(await auth.verifyAuthorityGraph([clear, enrolled, f.signed], f.trust));
  await assert.rejects(kits.openRecoveryKit(candidate.code, candidate.material, f.record, cleared), /not bound/);
  const fork = await auth.verifyAuthorityGraph([clear, checkpoint, enrolled, f.signed], f.trust);
  for (const hash of fork.heads) await assert.rejects(kits.openRecoveryKit(candidate.code, candidate.material, f.record, auth.authorityState(fork, hash)), /unresolved forks/);
});
test('in-flight caller mutation cannot retarget a recovery attempt', async () => {
  const material = structuredClone(candidate.material); const record = structuredClone(f.record);
  const opening = kits.openRecoveryKit(candidate.code, material, record, state);
  material.rootEnvelope.keyEpoch = 'retargeted'; record.keyEpoch = 'retargeted';
  const recovered = await opening;
  try { assert.deepEqual(recovered.bytes, f.bytes); } finally { recovered.bytes.fill(0); }
});
test('a checksum-valid wrong secret fails authenticated decryption', async () => {
  const parts = candidate.code.split(':'); parts[3] = crypt.encodeKey(crypt.newKey()).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const prefix = parts.slice(0, 4).join(':'); parts[4] = (await materialDigest('SecurePass:recovery-code:1', prefix)).slice(0, 16);
  await assert.rejects(kits.openRecoveryKit(parts.join(':'), candidate.material, f.record, state));
  await assert.rejects(kits.createRecoveryKit(f.record, crypt.newKey(), f.state));
});
test('authenticated but faulty private key material fails key-pair proofs', async () => {
  const material = structuredClone(candidate.material); const envelope = material.privateEnvelope;
  const codeSecret = new Uint8Array(Buffer.from(candidate.code.split(':')[3], 'base64url'));
  const context = JSON.stringify(['SecurePass:recovery-private:1', envelope.vaultId, envelope.recoveryId, envelope.signingKey, envelope.encryptionKey, envelope.keySalt]);
  const key = await materialKey(codeSecret, envelope.keySalt, context);
  const plaintext = new Uint8Array(await crypt.open(envelope.protectedKeys, key, context));
  try {
    const keys = JSON.parse(new TextDecoder().decode(plaintext));
    const wrong = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
    keys.signing = crypt.encodeKey(new Uint8Array(await crypto.subtle.exportKey('pkcs8', wrong.privateKey)));
    envelope.protectedKeys = await crypt.seal(keys, key, context);
    const signed = await successor(f, { reason: 'recovery-set', recovery: await kits.recoveryPolicy(material) });
    const faultyState = auth.authorityState(await auth.verifyAuthorityGraph([signed, f.signed], f.trust));
    await assert.rejects(kits.openRecoveryKit(candidate.code, material, f.record, faultyState), /signing key pair mismatch/);
  } finally { codeSecret.fill(0); plaintext.fill(0); }
});
