import { test } from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
globalThis.crypto = webcrypto;
const crypt = await import('../src/vault/crypto.js');
const keys = await import('../src/sync/signingKeyProtection.js');
const context = { vaultId: 'fictional-vault', keyEpoch: 'epoch', version: 3 };
test('v3 writers use independent HKDF wrapping domains and return nonextractable keys', async () => {
  const root = crypt.newKey(); const a = await keys.createDeviceKey(root, context); const b = await keys.createDeviceKey(root, context);
  assert.equal(a.envelope.version, 2); assert.notEqual(a.envelope.keySalt, b.envelope.keySalt); assert.equal(a.privateKey.extractable, false);
  assert.equal((await keys.unlockDeviceKey(a.envelope, root, context)).extractable, false);
  await assert.rejects(crypto.subtle.exportKey('pkcs8', a.privateKey));
  assert.equal(root.length, 32); assert.ok(root.some(value => value !== 0));
});
test('wrong roots, substituted salts, identities and administrative roles cannot unwrap a writer', async () => {
  const root = crypt.newKey(); const a = await keys.createDeviceKey(root, context);
  await assert.rejects(keys.unlockDeviceKey(a.envelope, crypt.newKey(), context));
  await assert.rejects(keys.unlockDeviceKey({ ...a.envelope, keySalt: crypt.encodeKey(crypt.newKey()) }, root, context));
  await assert.rejects(keys.unlockDeviceKey(a.envelope, root, { ...context, keyEpoch: 'another-epoch' }), /context mismatch/);
  await assert.rejects(keys.unlockDeviceKey({ ...a.envelope, role: 'admin' }, root, context), /context mismatch/);
  await assert.rejects(keys.unlockAdministrativeKey(a.envelope, 'Fictional master password', context), /context mismatch/);
});
test('existing writer envelopes remain readable; malformed or aliased v2 data fails closed', async () => {
  const root = crypt.newKey(); const legacy = await keys.createDeviceKey(root, { vaultId: context.vaultId, keyEpoch: context.keyEpoch });
  assert.equal(legacy.envelope.version, 1); assert.equal((await keys.unlockDeviceKey(legacy.envelope, root, context)).extractable, false);
  const next = await keys.createDeviceKey(root, context);
  await assert.rejects(keys.unlockDeviceKey({ ...next.envelope, extra: true }, root, context), /context mismatch/);
  await assert.rejects(keys.unlockDeviceKey({ ...next.envelope, keySalt: next.envelope.keySalt.replace(/=$/, '') }, root, context), /encoding/);
});
