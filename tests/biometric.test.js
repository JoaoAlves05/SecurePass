import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { installChrome, resetStorage, areas } from './helpers/chrome.js';
installChrome();
const vault = await import('../src/cryptoVault.js');
const service = await import('../src/biometric/service.js');
const { fromBase64url } = await import('../src/biometric/webauthn.js');
const { encodeKey } = await import('../src/vault/crypto.js');
const PASS = 'Fictional master 123!';
const sender = { documentId: 'trusted-document' };
const b64 = value => Buffer.from(value).toString('base64');
const client = (challenge, type = 'webauthn.get', origin = `chrome-extension://${chrome.runtime.id}`) => b64(new TextEncoder().encode(JSON.stringify({ challenge, type, origin, crossOrigin: false })));
function der(signature) {
  const bytes = new Uint8Array(signature);
  const integers = [bytes.slice(0, 32), bytes.slice(32)].map(input => {
    let value = [...input]; while (value.length > 1 && value[0] === 0) value.shift(); if (value[0] & 128) value.unshift(0);
    return [2, value.length, ...value];
  });
  return new Uint8Array([0x30, integers.flat().length, ...integers.flat()]);
}
async function assertion(session, pair, counter = 0) {
  const data = client(session.challenge);
  const auth = new Uint8Array(37); auth.set(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`chrome-extension://${chrome.runtime.id}`)))); auth[32] = 5; new DataView(auth.buffer).setUint32(33, counter);
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', Buffer.from(data, 'base64')));
  const signed = new Uint8Array(69); signed.set(auth); signed.set(hash, 37);
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, pair.privateKey, signed);
  return { credentialId: session.credentialId, clientDataJSON: data, authenticatorData: b64(auth), signature: b64(der(sig)) };
}
async function registration() {
  const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const start = await service.startRegistration({ passphrase: PASS }, sender);
  const prepared = await service.prepareRegistration({ sessionId: start.sessionId, clientDataJSON: client(start.challenge, 'webauthn.create'), credentialId: b64(new Uint8Array([1, 2, 3])), publicKey: b64(await crypto.subtle.exportKey('spki', pair.publicKey)), algorithm: -7 }, sender);
  return { pair, prepared };
}
beforeEach(async () => { await vault.lockVault(); resetStorage(); await vault.initializeVault(PASS); });
test('verified enrollment, PRF key wrapping, unlock and revocation', async () => {
  const { pair, prepared } = await registration(); const prfOutput = b64(crypto.getRandomValues(new Uint8Array(32)));
  await service.finishRegistration({ sessionId: prepared.sessionId, assertion: await assertion(prepared, pair, 1), prfOutput }, sender);
  assert.equal((await service.biometricStatus()).enabled, true);
  assert.equal(JSON.stringify(areas.local).includes(PASS), false);
  await vault.lockVault();
  const start = await service.startAuthentication({}, sender);
  await service.finishAuthentication({ sessionId: start.sessionId, assertion: await assertion(start, pair, 2), prfOutput }, sender);
  assert.equal((await vault.vaultStatus()).unlocked, true);
  await service.revokeBiometric(); assert.equal((await service.biometricStatus()).enabled, false);
});
test('non-PRF hardware never creates an insecure fallback', async () => {
  const { pair, prepared } = await registration();
  await assert.rejects(service.finishRegistration({ sessionId: prepared.sessionId, assertion: await assertion(prepared, pair), prfOutput: null }, sender), /does not support PRF/);
  assert.equal((await service.biometricStatus()).enabled, false);
});
test('forged completion, wrong owner, challenge and replay are rejected', async () => {
  const { pair, prepared } = await registration(); const prfOutput = encodeKey(crypto.getRandomValues(new Uint8Array(32)));
  await assert.rejects(service.finishRegistration({ sessionId: prepared.sessionId }, { documentId: 'foreign' }), /another document/);
  const bad = await assertion({ ...prepared, challenge: 'wrong' }, pair);
  await assert.rejects(service.finishRegistration({ sessionId: prepared.sessionId, assertion: bad, prfOutput }, sender), /challenge/);
  await assert.rejects(service.finishRegistration({ sessionId: prepared.sessionId, assertion: await assertion(prepared, pair), prfOutput }, sender), /expired/);
  assert.equal((await service.biometricStatus()).enabled, false);
});
test('expired enrollment cannot save a wrapper', async () => {
  const { pair, prepared } = await registration();
  areas.session[`webauthn:${prepared.sessionId}`].expires = Date.now() - 1;
  await assert.rejects(service.finishRegistration({ sessionId: prepared.sessionId, assertion: await assertion(prepared, pair), prfOutput: b64(new Uint8Array(32)) }, sender), /expired/);
});

test('locking invalidates a previously issued challenge even if cleanup missed it', async () => {
  const { pair, prepared } = await registration(); const prfOutput = b64(new Uint8Array(32));
  await vault.lockVault();
  await assert.rejects(service.finishRegistration({ sessionId: prepared.sessionId, assertion: await assertion(prepared, pair), prfOutput }, sender), /revoked/);
  assert.equal((await service.biometricStatus()).enabled, false);
});
