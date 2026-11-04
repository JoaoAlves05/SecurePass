import { test } from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
globalThis.crypto = webcrypto;
const { authenticateBiometric } = await import('../src/biometric/client.js');

test('aborting during biometric start cancels the ceremony without requesting an assertion', async () => {
  const controller = new AbortController(); const calls = [];
  globalThis.chrome = { runtime: { sendMessage: async message => {
    calls.push(message.type);
    if (message.type === 'BIOMETRIC_AUTH_START') controller.abort();
    return { ok: true, sessionId: 'fictional-session' };
  } } };
  await assert.rejects(authenticateBiometric(controller.signal), { name: 'AbortError' });
  assert.deepEqual(calls, ['BIOMETRIC_AUTH_START', 'BIOMETRIC_CANCELLED']);
});

test('late authenticator result after cancellation never reaches authentication completion', async () => {
  const controller = new AbortController(); const calls = [];
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { credentials: { get: async () => {
    controller.abort();
    return { rawId: new ArrayBuffer(1), response: { clientDataJSON: new ArrayBuffer(1), authenticatorData: new ArrayBuffer(1), signature: new ArrayBuffer(1) }, getClientExtensionResults: () => ({ prf: { results: { first: new ArrayBuffer(32) } } }) };
  } } } });
  globalThis.chrome = { runtime: { sendMessage: async message => {
    calls.push(message.type);
    return { ok: true, sessionId: 'fictional-session', challenge: 'AA', credentialId: 'AA==', rpId: 'fictional.example' };
  } } };
  try {
    await assert.rejects(authenticateBiometric(controller.signal), { name: 'AbortError' });
    assert.deepEqual(calls, ['BIOMETRIC_AUTH_START', 'BIOMETRIC_CANCELLED']);
  } finally {
    if (previous) Object.defineProperty(globalThis, 'navigator', previous);
    else delete globalThis.navigator;
  }
});

test('cancellation settles before a stalled start and revokes its late ceremony', async () => {
  const controller = new AbortController(); const calls = []; let finishStart;
  globalThis.chrome = { runtime: { sendMessage: async message => {
    calls.push(message.type);
    if (message.type === 'BIOMETRIC_AUTH_START') return new Promise(resolve => { finishStart = resolve; });
    return { ok: true };
  } } };
  const pending = authenticateBiometric(controller.signal);
  controller.abort();
  await assert.rejects(pending, { name: 'AbortError' });
  finishStart({ ok: true, sessionId: 'late-fictional-session' });
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(calls, ['BIOMETRIC_AUTH_START', 'BIOMETRIC_CANCELLED']);
});
