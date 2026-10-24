import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installChrome } from './helpers/chrome.js';
installChrome();
const { generatePassword } = await import('../src/passwordGenerator.js');
const { validateConstraints, validateEntry } = await import('../src/validation.js');
const { encryptBackupPayload, decryptBackupPayload } = await import('../src/backupCrypto.js');
test('all selected groups and exclusions hold across repeated generation', async () => {
  for (let i = 0; i < 100; i++) {
    const pass = await generatePassword({ length: 24, overrides: { avoidSimilar: true } });
    assert.equal(pass.length, 24); for (const re of [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/]) assert.match(pass, re); assert.doesNotMatch(pass, /[Il1O0]/);
  }
});
test('DTO preserves site constraints and overrides; bounds and impossible patterns fail', async () => {
  const c = validateConstraints({ length: 40, minLength: 30, maxLength: 40, overrides: { includeSymbols: false } });
  assert.equal(c.maxLength, 40); assert.equal(c.overrides.includeSymbols, false);
  assert.equal((await generatePassword(c)).length, 40);
  await assert.rejects(generatePassword({ minLength: 40, maxLength: 20 }));
  await assert.rejects(generatePassword({ pattern: '(a+)+$' }), /unsupported pattern/);
  for (const value of [NaN, Infinity, 1.5, -1]) assert.throws(() => validateConstraints({ length: value }));
});
test('encrypted backups preserve exact secrets and reject tampering and unsupported formats', async () => {
  const original = { entries: [{ site: 'https://a.example', password: ' a<>秘密 ', notes: 'two words\nthree' }] };
  assert.equal(validateEntry(original.entries[0]).password, original.entries[0].password);
  const backup = await encryptBackupPayload(original, 'fictional backup password');
  assert.deepEqual(await decryptBackupPayload(backup, 'fictional backup password'), original);
  await assert.rejects(decryptBackupPayload(backup, 'wrong'));
  await assert.rejects(decryptBackupPayload({ ...backup, version: 99 }, 'fictional backup password'));
  await assert.rejects(decryptBackupPayload({ ...backup, kdf: { ...backup.kdf, iterations: 0xffffffff } }, 'fictional backup password'));
});
