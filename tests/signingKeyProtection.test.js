import { test } from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
globalThis.crypto=webcrypto;
const keys=await import('../src/sync/signingKeyProtection.js');
const PASS='Fictional administrative master 123!';
const expected={vaultId:'fictional-vault',keyEpoch:'epoch'};
test('administrative keys round-trip under master password as nonextractable keys and reject wrong password/context',async()=>{
  const {envelope,privateKey}=await keys.createAdministrativeKey(PASS,expected);
  assert.equal(privateKey.extractable,false);
  assert.equal((await keys.unlockAdministrativeKey(envelope,PASS,expected)).extractable,false);
  await assert.rejects(keys.unlockAdministrativeKey(envelope,'wrong password',expected));
  await assert.rejects(keys.unlockAdministrativeKey(envelope,PASS,{...expected,vaultId:'other'}),/context mismatch/);
  assert.equal(JSON.stringify(envelope).includes(PASS),false);
  assert.equal('d' in envelope,false);
});
test('content-key/biometric capability unwraps device key but cannot unwrap administrative key',async()=>{
  const bytes=crypto.getRandomValues(new Uint8Array(32));
  const {envelope}=await keys.createDeviceKey(bytes,expected);
  assert.equal((await keys.unlockDeviceKey(envelope,bytes,expected)).extractable,false);
  await assert.rejects(keys.unlockDeviceKey(envelope,crypto.getRandomValues(new Uint8Array(32)),expected));
  const admin=await keys.createAdministrativeKey(PASS,expected);
  await assert.rejects(keys.unlockDeviceKey(admin.envelope,bytes,expected),/context mismatch/);
  const changed=structuredClone(envelope);changed.role='admin';
  await assert.rejects(keys.unlockAdministrativeKey(changed,PASS,expected),/KDF/);
});
test('key envelopes reject excessive KDF and tampered public/protected keys',async()=>{
  const {envelope}=await keys.createAdministrativeKey(PASS,expected);
  const hostile=structuredClone(envelope);hostile.kdf.iterations=2000001;
  await assert.rejects(keys.unlockAdministrativeKey(hostile,PASS,expected),/KDF/);
  const damaged=structuredClone(envelope);damaged.protectedKey.ciphertext=damaged.protectedKey.ciphertext.replace(/^./,value=>value==='A'?'B':'A');
  await assert.rejects(keys.unlockAdministrativeKey(damaged,PASS,expected));
});
