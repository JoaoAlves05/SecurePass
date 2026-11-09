import { test } from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { hkdfSync, createCipheriv } from 'node:crypto';
globalThis.crypto = webcrypto;
const crypt = await import('../src/vault/crypto.js');
const PASS = 'Fictional vault-v3 master password 123!';
const entries = [{ id: 'one', site: 'https://example.com', password: 'Fictional secret', notes: '汉'.repeat(4096) }];
test('vault-v3 round trips exact content while existing default creation remains vault-v2', async () => {
  const current = await crypt.createRecord(entries, PASS); assert.equal(current.record.version, 2);
  assert.deepEqual((await crypt.decryptRecord(current.record, PASS)).entries, (await crypt.decryptWithKey(current.record, current.bytes)));
  const next = await crypt.createRecord(entries, PASS, { version: 3 }); assert.equal(next.record.version, 3);
  assert.equal((await crypt.decryptRecord(next.record, PASS)).entries[0].notes, entries[0].notes);
  await assert.rejects(crypt.decryptRecord(next.record, 'Wrong fictional password'));
});
test('each mutation derives a fresh encryption domain and retains direct digest-ready parent identities', async () => {
  const first = await crypt.createRecord(entries, PASS, { version: 3 });
  const next = await crypt.encryptEntries(first.record, entries, first.bytes);
  const third = await crypt.encryptEntries(next, entries, first.bytes);
  assert.notEqual(next.keySalt, first.record.keySalt); assert.notEqual(third.keySalt, next.keySalt);
  assert.deepEqual(next.parents, [first.record.revision]); assert.deepEqual(third.parents, [next.revision]);
  assert.equal((await crypt.decryptWithKey(third, first.bytes))[0].notes, entries[0].notes);
  const payload = await crypt.decryptPayloadWithKey(third, first.bytes);
  const merged = await crypt.encryptMergedPayload(third, payload, first.bytes, [third.revision, 'remote-parent'], crypto.randomUUID());
  assert.notEqual(merged.keySalt, third.keySalt); assert.deepEqual(await crypt.decryptPayloadWithKey(merged, first.bytes), payload);
});
test('salt, revision, epoch, ancestry and ciphertext tampering fail authenticated decryption', async () => {
  const { record, bytes } = await crypt.createRecord(entries, PASS, { version: 3 });
  for (const changed of [{ ...record, keySalt: crypt.encodeKey(crypto.getRandomValues(new Uint8Array(32))) }, { ...record, revision: crypto.randomUUID() }, { ...record, keyEpoch: crypto.randomUUID() }, { ...record, parents: ['other-parent'] }, { ...record, data: { ...record.data, ciphertext: crypt.encodeKey(crypto.getRandomValues(new Uint8Array(48))) } }]) await assert.rejects(crypt.decryptWithKey(changed, bytes));
});
test('strict v3 schema rejects unknown fields, noncanonical base64 and invalid direct ancestry', async () => {
  const { record } = await crypt.createRecord(entries, PASS, { version: 3 });
  for (const changed of [{ ...record, extra: true }, { ...record, keySalt: record.keySalt.replace(/=$/, '') }, { ...record, parents: ['a', 'a'] }, { ...record, parents: ['z', 'a'] }, { ...record, parents: [record.revision] }, { ...record, parents: ['a', 'b', 'c'] }, { ...record, kdf: { ...record.kdf, extra: true } }]) assert.throws(() => crypt.validateRecord(changed));
});
test('checkpoint reprotection under the same content ID generates fresh domains and preserves encrypted history', async () => {
  const first = await crypt.createRecord(entries, PASS, { version: 3 }); const payload = await crypt.decryptPayloadWithKey(first.record, first.bytes);
  const a = await crypt.protectCheckpoint(first.record, payload.entries, first.record, first.bytes, payload);
  const b = await crypt.protectCheckpoint(first.record, payload.entries, first.record, first.bytes, payload);
  assert.equal(a.revision, b.revision); assert.notEqual(a.keySalt, b.keySalt); assert.notEqual(a.data.ciphertext, b.data.ciphertext);
  assert.deepEqual(await crypt.decryptPayloadWithKey(a, first.bytes), await crypt.decryptPayloadWithKey(b, first.bytes));
});
test('unsupported creation versions fail rather than silently downgrading', async () => {
  await assert.rejects(crypt.createRecord(entries, PASS, { version: 4 }), /Unsupported vault/);
  for (const passphrase of [undefined, '', {}, 'x'.repeat(1025)]) await assert.rejects(crypt.createRecord(entries, passphrase, { version: 3 }), /master password/);
});
test('per-object HKDF/GCM decrypts an independently produced Node crypto vector', async () => {
  const root = Uint8Array.from({ length: 32 }, (_, index) => index); const salt = Buffer.alloc(32, 0xa5); const iv = Buffer.alloc(12, 0x5a);
  const record = { kind: 'securepass-vault', version: 3, vaultId: 'kat-vault', revision: 'kat-revision', parents: [], keyEpoch: 'kat-epoch', updatedAt: '2026-01-01T00:00:00.000Z', keySalt: salt.toString('base64'), kdf: { name: 'PBKDF2', iterations: 600000, salt: Buffer.alloc(16).toString('base64') }, wrappedKey: { iv: Buffer.alloc(12).toString('base64'), ciphertext: Buffer.alloc(48).toString('base64') } };
  const info = Buffer.from(JSON.stringify(['SecurePass:data-key:3', record.vaultId, record.keyEpoch, record.revision]));
  const key = Buffer.from(hkdfSync('sha256', root, salt, info, 32)); const cipher = createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(Buffer.from(JSON.stringify({ version: 3, vaultId: record.vaultId, revision: record.revision, parents: [], keyEpoch: record.keyEpoch, keySalt: record.keySalt })));
  const plaintext = { kind: 'securepass-vault-state', version: 1, entries: [{ id: 'kat-entry', site: 'https://example.com', username: 'kat', password: 'Fictional vector secret', notes: 'Node crypto reference', createdAt: record.updatedAt, updatedAt: record.updatedAt }], tombstones: [], provenance: [] };
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(plaintext), 'utf8'), cipher.final(), cipher.getAuthTag()]);
  record.data = { iv: iv.toString('base64'), ciphertext: encrypted.toString('base64') };
  assert.equal((await crypt.decryptWithKey(record, root))[0].notes, plaintext.entries[0].notes);
  await assert.rejects(crypt.decryptWithKey(record, new Uint8Array(16)), /256-bit/);
});
