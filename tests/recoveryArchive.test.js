import { test } from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { scanRecoveryArchive, readImportFile, MAX_RECOVERY_ARCHIVE_BYTES, MAX_RECOVERY_SNAPSHOTS } from '../src/recoveryArchive.js';
import { MAX_IMPORT_BYTES } from '../src/validation.js';
globalThis.crypto = webcrypto;
const b64 = size => Buffer.alloc(size).toString('base64');
const record = (revision = 'first', extra = {}) => ({ kind: 'securepass-vault', version: 2, vaultId: 'vault', revision, parents: [], keyEpoch: 'epoch', updatedAt: '2026-01-01T00:00:00.000Z', kdf: { name: 'PBKDF2', iterations: 600000, salt: b64(16) }, wrappedKey: { iv: b64(12), ciphertext: b64(48) }, data: { iv: b64(12), ciphertext: b64(16) }, ...extra });
const archive = (snapshots = [record()], sync = []) => ({ kind: 'securepass-encrypted-recovery', version: 1, snapshots, sync });
const blob = data => new Blob([JSON.stringify(data)]);
test('inventory preserves source ordering and selects by immutable digest identity after public metadata is reordered', async () => {
  const a = record('local'); const b = record('remote');
  const input = new Blob([`{"sync":[${JSON.stringify(b)}],"version":1,"snapshots":[${JSON.stringify(a)}],"kind":"securepass-encrypted-recovery"}`]);
  const inventory = await scanRecoveryArchive(input);
  assert.deepEqual(inventory.snapshots.map(item => item.revision), ['local', 'remote']);
  const selected = inventory.snapshots[1].id; inventory.snapshots.reverse(); inventory.snapshots[0].revision = 'changed display';
  assert.deepEqual(await inventory.readSnapshot(selected), b);
  await assert.rejects(inventory.readSnapshot(0), /Choose a snapshot/);
  await assert.rejects(inventory.readSnapshot('not-in-the-archive'), /Choose a snapshot/);
  assert.equal(JSON.stringify(inventory.snapshots).includes('ciphertext'), false);
  const legacy = { salt: b64(16), iv: b64(12), ciphertext: b64(16), iterations: 600000, revision: { malformed: true } };
  const old = await scanRecoveryArchive(blob(archive([legacy])));
  assert.equal(old.snapshots[0].revision, undefined);
  assert.deepEqual(await old.readSnapshot(old.snapshots[0].id), legacy);
});
test('archives above 16 MiB are scanned in bounded windows and only the selected record is reread', async () => {
  const large = record('large', { padding: 'x'.repeat(600000) });
  const input = blob(archive(Array.from({ length: 30 }, () => large)));
  assert.ok(input.size > MAX_IMPORT_BYTES);
  const ranges = [];
  const file = { size: input.size, arrayBuffer() { throw new Error('Whole-file read forbidden'); }, slice(start, end) { ranges.push(end - start); return input.slice(start, end); } };
  const inventory = await readImportFile(file);
  assert.equal(inventory.snapshots.length, 30); assert.ok(ranges.every(size => size <= 64 * 1024));
  const before = ranges.length;
  assert.deepEqual(await inventory.readSnapshot(inventory.snapshots.at(-1).id), large);
  assert.equal(ranges.length, before + 1); assert.ok(ranges.at(-1) < MAX_IMPORT_BYTES);
});
test('UTF-8, BOM, escapes and braces inside strings retain byte-correct selected ranges', async () => {
  const a = record('unicode', { text: '汉🙂 çãο [ { " \\ } ]'.repeat(5000) });
  const input = new Blob([new Uint8Array([239, 187, 191]), JSON.stringify(archive([a]))]);
  const inventory = await scanRecoveryArchive(input);
  assert.deepEqual(await inventory.readSnapshot(inventory.snapshots[0].id), a);
});
test('a changed file between inventory and selection is rejected before returning a record', async () => {
  let current = blob(archive());
  const file = { size: current.size, slice: (start, end) => current.slice(start, end) };
  const inventory = await scanRecoveryArchive(file);
  current = blob(archive([record('other')]));
  await assert.rejects(inventory.readSnapshot(inventory.snapshots[0].id), /changed after review/);
  file.slice = () => { throw new Error('sensitive-local-path'); };
  await assert.rejects(inventory.readSnapshot(inventory.snapshots[0].id), error => error.message.includes('Choose the file again') && !error.message.includes('sensitive-local-path'));
});
test('invalid encrypted envelopes are isolated; malformed JSON, duplicate root keys and trailing content reject the archive', async () => {
  const inventory = await scanRecoveryArchive(blob(archive([null, {}, record()])));
  assert.equal(inventory.issues, 2); assert.equal(inventory.snapshots.length, 1);
  const text = JSON.stringify(archive());
  for (const source of [text + '{}', text.slice(0, -1), text.replace('"version":1', '"version":1,"version":1'), text.replace('"snapshots":[', '"snapshots":[').replace('],"sync"', ',],"sync"'), text.replace('"revision":"first"', '"revision":broken')]) {
    await assert.rejects(scanRecoveryArchive(new Blob([source])), /not valid JSON/);
  }
  await assert.rejects(scanRecoveryArchive(blob(archive([null, {}]))), /no readable/);
});
test('count, record, archive, header and nesting limits fail without truncation', async () => {
  assert.equal((await scanRecoveryArchive(blob(archive(Array.from({ length: MAX_RECOVERY_SNAPSHOTS }, () => record()))))).snapshots.length, MAX_RECOVERY_SNAPSHOTS);
  await assert.rejects(scanRecoveryArchive(blob(archive(Array.from({ length: MAX_RECOVERY_SNAPSHOTS + 1 }, () => record())))), /at most 100/);
  let read = false;
  await assert.rejects(scanRecoveryArchive({ size: MAX_RECOVERY_ARCHIVE_BYTES + 1, slice() { read = true; } }), /256 MiB/); assert.equal(read, false);
  const prefix = new TextEncoder().encode(JSON.stringify(archive())); let largestRead = 0;
  const exact = { size: MAX_RECOVERY_ARCHIVE_BYTES, slice(start, end) {
    largestRead = Math.max(largestRead, end - start);
    const bytes = new Uint8Array(end - start).fill(32);
    if (start < prefix.length) bytes.set(prefix.subarray(start, Math.min(end, prefix.length)));
    return new Blob([bytes]);
  } };
  assert.equal((await scanRecoveryArchive(exact)).snapshots.length, 1);
  assert.ok(largestRead <= 64 * 1024);
  await assert.rejects(scanRecoveryArchive(blob(archive([record('huge', { padding: 'x'.repeat(MAX_IMPORT_BYTES) })]))), /16 MiB/);
  await assert.rejects(scanRecoveryArchive(new Blob([`{"${'x'.repeat(257)}":1}`])), /oversized header/);
  const nested = `{"kind":"securepass-encrypted-recovery","version":1,"snapshots":[{"padding":${'['.repeat(65)}0${']'.repeat(65)}}],"sync":[]}`;
  await assert.rejects(scanRecoveryArchive(new Blob([nested])), /nested too deeply/);
});
test('normal backup limits and decoding remain unchanged; invalid UTF-8 is rejected', async () => {
  const data = { entries: [{ site: 'https://example.com', password: 'fictional' }] };
  assert.deepEqual(await readImportFile(blob(data)), { kind: 'backup', data });
  await assert.rejects(readImportFile(blob({ kind: 'securepass-encrypted-backup', version: 1, padding: 'x'.repeat(MAX_IMPORT_BYTES) })), /16 MiB/);
  const before = new TextEncoder().encode('{"kind":"securepass-encrypted-recovery","version":1,"snapshots":[{"label":"');
  const after = new TextEncoder().encode('"}],"sync":[]}');
  await assert.rejects(scanRecoveryArchive(new Blob([before, new Uint8Array([195, 40]), after])), /not valid JSON/);
});
test('abort before or during inventory and after inventory prevents reading or returning a selected record', async () => {
  const input = blob(archive()); const controller = new AbortController(); controller.abort();
  await assert.rejects(scanRecoveryArchive(input, { signal: controller.signal }), { name: 'AbortError' });
  const during = new AbortController(); const file = { size: input.size, slice(start, end) { during.abort(); return input.slice(start, end); } };
  await assert.rejects(scanRecoveryArchive(file, { signal: during.signal }), { name: 'AbortError' });
  const after = new AbortController(); const inventory = await scanRecoveryArchive(input, { signal: after.signal }); after.abort();
  await assert.rejects(inventory.readSnapshot(inventory.snapshots[0].id), { name: 'AbortError' });
});
