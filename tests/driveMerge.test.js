import { test } from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { planDriveMerge } from '../src/vault/driveMerge.js';
import { resolveThreeWayMerge } from '../src/vault/threeWayMerge.js';
import { createDriveReader } from '../src/sync/driveTransport.js';
import { fixture } from './helpers/signedHistory.js';
globalThis.crypto = webcrypto;
const binding = { accountId: 'fictional-account', vaultId: '', generation: 'connection-one' };
async function setup() {
  const f = await fixture(); const calls = []; const downloads = [];
  const files = f.packets.map((p, i) => ({ id: `file-${i}`, appProperties: { vaultId: f.root.vaultId, revisionId: p.publication.revisionId } }));
  const reader = {
    list: async () => { calls.push('list'); return structuredClone(files); },
    download: async (pinned, id) => { assert.equal(Object.isFrozen(pinned), true); downloads.push(id); return f.packets[Number(id.slice(5))].body; }
  };
  const options = { ...f.options, localPackets: [], reader, binding: { ...binding, vaultId: f.root.vaultId } };
  return { ...f, files, reader, options, calls, downloads };
}
test('Drive reader collects signed ancestry, validates duplicate copies and returns a guarded opaque merge', async () => {
  const f = await setup();
  f.files.push({ id: 'duplicate', appProperties: { ...f.files[0].appProperties } }, { id: 'unrelated', appProperties: { vaultId: 'different-vault', revisionId: 'ignored' } });
  const original = f.reader.download;
  f.reader.download = async (binding, id) => id === 'duplicate' ? (await f.packet(f.root)).body : original(binding, id);
  const p = await planDriveMerge(f.options);
  assert.equal(p.identity.base, f.root.revision);
  assert.deepEqual(f.calls, ['list', 'list']);
  assert.deepEqual([...f.downloads].sort(), ['file-0', 'file-1', 'file-2']);
  assert.equal(JSON.stringify(p).includes('secret'), false);
  assert.deepEqual((await resolveThreeWayMerge(p, {}, p.identity)).entries.map(e => e.password), ['local secret', 'remote secret']);
});
test('pending local branch participates without remote upload or local mutation', async () => {
  const f = await setup(); f.files.splice(1, 1);
  const p = await planDriveMerge({ ...f.options, localPackets: [f.packets[1]] });
  assert.equal(p.identity.base, f.root.revision);
  assert.equal(f.downloads.includes('file-1'), false);
  assert.equal((await resolveThreeWayMerge(p, {}, p.identity)).entries[0].password, 'local secret');
  f.files.splice(1, 1);
  await assert.rejects(planDriveMerge({ ...f.options, localPackets: f.packets }), /remote revision is missing/);
});
test('incomplete downloads, forged metadata and contradicting copies cannot create a review', async () => {
  const f = await setup();
  const first = f.reader.download;
  f.reader.download = async () => { throw new Error('missing'); };
  await assert.rejects(planDriveMerge(f.options), /missing/);
  f.reader.download = first; f.files.splice(0, 1);
  await assert.rejects(planDriveMerge(f.options), /Incomplete/);
  f.files.unshift({ id: 'forged', appProperties: { vaultId: f.root.vaultId, revisionId: f.root.revision } });
  f.reader.download = async (b, id) => id === 'forged' ? f.packets[1].body : first(b, id);
  await assert.rejects(planDriveMerge(f.options), /identity mismatch/);
  f.files[0].id = 'file-0'; f.reader.download = first;
  f.files.push({ id: 'duplicate', appProperties: { ...f.files[0].appProperties } });
  const divergent = (await f.packet({ ...f.root, updatedAt: '2026-02-01T00:00:00.000Z' })).body;
  f.reader.download = async (b, id) => id === 'duplicate' ? divergent : first(b, id);
  await assert.rejects(planDriveMerge(f.options), /inconsistent/);
});
test('reenumeration detects additions, removal or reassignment for this vault; ordering is immaterial', async () => {
  const f = await setup();
  for (const mutate of [files => files.push({ id: 'new-file', appProperties: { ...files[0].appProperties } }), files => files.pop(), files => { files[0].appProperties.revisionId = 'different'; }]) {
    let count = 0;
    f.reader.list = async () => { const files = structuredClone(f.files); if (count++) mutate(files); return files; };
    await assert.rejects(planDriveMerge(f.options), /history changed/);
  }
  let count = 0;
  f.reader.list = async () => count++ ? [...f.files].reverse() : f.files;
  assert.equal((await planDriveMerge(f.options)).identity.base, f.root.revision);
});
test('binding/key/packet snapshots and session/cancellation checks span all asynchronous boundaries', async () => {
  const f = await setup(); f.files.splice(1, 1);
  const options = { ...f.options, localPackets: [structuredClone(f.packets[1])], binding: { ...f.options.binding }, bytes: Buffer.from(f.bytes) };
  const pending = planDriveMerge(options);
  options.localPackets[0].body = 'forged'; options.bytes.fill(0); options.binding.vaultId = 'different';
  assert.equal((await pending).identity.base, f.root.revision);
  let active = true;
  f.reader.list = async () => { active = false; return f.files; };
  await assert.rejects(planDriveMerge({ ...f.options, assertCurrent: () => active }), /context changed/);
  const controller = new AbortController();
  f.reader.list = async () => { controller.abort(); return f.files; };
  await assert.rejects(planDriveMerge({ ...f.options, signal: controller.signal }), { name: 'AbortError' });
  assert.equal(f.downloads.length, 2);
  const duringDownload = new AbortController(); let attempted = 0;
  f.reader.list = async () => f.files;
  f.reader.download = async () => { attempted++; duringDownload.abort(); return f.packets[2].body; };
  await assert.rejects(planDriveMerge({ ...f.options, localPackets: [f.packets[1]], signal: duringDownload.signal }), { name: 'AbortError' });
  assert.equal(attempted, 1);
  let lists = 0; active = true;
  f.reader.list = async () => { if (++lists === 2) active = false; return f.files; };
  f.reader.download = async (b, id) => f.packets[Number(id.slice(5))].body;
  await assert.rejects(planDriveMerge({ ...f.options, localPackets: [f.packets[1]], assertCurrent: () => active }), /context changed/);
  await assert.rejects(planDriveMerge({ ...f.options, assertCurrent: async () => {} }), /synchronous/);
});
test('reader pagination and missing-file errors propagate through the actual bounded transport', async () => {
  const f = await setup(); let lists = 0;
  const reader = createDriveReader({ getToken: async () => 'fictional-token', assertBinding: async pinned => assert.equal(pinned.accountId, f.options.binding.accountId), fetchImpl: async url => {
    if (url.includes('alt=media')) return new Response(f.packets[Number(new URL(url).pathname.split('/').pop().slice(5))].body);
    const token = new URL(url).searchParams.get('pageToken'); lists++;
    return Response.json(token ? { files: f.files.slice(1) } : { files: f.files.slice(0, 1), nextPageToken: 'page-two' });
  } });
  assert.equal((await planDriveMerge({ ...f.options, reader })).identity.base, f.root.revision);
  assert.equal(lists, 4);
  const missing = createDriveReader({ getToken: async () => 'fictional-token', assertBinding: async () => {}, fetchImpl: async url => url.includes('alt=media') ? new Response('{}', { status: 404 }) : Response.json({ files: f.files }) });
  await assert.rejects(planDriveMerge({ ...f.options, reader: missing }), error => error.code === 'missing');
});
test('discovery/count/byte limits reject before excessive downloads', async () => {
  const f = await setup();
  f.reader.list = async () => Array(10001).fill(f.files[0]);
  await assert.rejects(planDriveMerge(f.options), /oversized/);
  f.reader.list = async () => [f.files[0], f.files[0]];
  await assert.rejects(planDriveMerge(f.options), /Inconsistent/);
  f.reader.list = async () => [{ ...f.files[0], appProperties: { vaultId: f.root.vaultId, revisionId: '../forged' } }];
  await assert.rejects(planDriveMerge(f.options), /Invalid Drive revision/);
  await assert.rejects(planDriveMerge({ ...f.options, binding: { ...f.options.binding, vaultId: 'wrong-vault' }, localPackets: [f.packets[0]] }), /bound vault/);
  assert.equal(f.downloads.length, 0);
  await assert.rejects(planDriveMerge({ ...f.options, localPackets: Array(257).fill(f.packets[0]) }), /Bounded/);
  await assert.rejects(planDriveMerge({ ...f.options, localPackets: [{ ...f.packets[0], body: 'x'.repeat(32 * 1024 * 1024 + 1) }] }), /limit/);
  f.reader.list = async () => [f.files[0], ...Array.from({ length: 256 }, (_, i) => ({ id: `copy-${i}`, appProperties: { ...f.files[0].appProperties } })), ...f.files.slice(1)];
  let count = 0; f.reader.download = async () => { count++; return f.packets[0].body; };
  await assert.rejects(planDriveMerge({ ...f.options, local: f.root.revision, remote: f.root.revision }), /limit/);
  assert.equal(count, 256);
});
