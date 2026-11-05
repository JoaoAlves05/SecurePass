import { test } from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { createDriveTransport } from '../src/sync/driveTransport.js';
globalThis.crypto = webcrypto;
const packet = { vaultId: 'fictional-vault', revisionId: 'fictional-revision', body: '{"ciphertext":"fictional-encrypted-packet"}' };
function fixture() {
  const files = []; let enabled = true; let uploads = 0; let lostResponse = false;
  const client = createDriveTransport({ getToken: async () => 'fictional-token', assertBinding: async () => {}, assertWritable: async () => { if (!enabled) throw new Error('Publication disabled'); }, validatePublication: async body => { if (!body.includes('ciphertext')) throw new Error('Unsigned or invalid packet'); }, fetchImpl: async (url, options) => {
    if (options.method === 'POST') {
      uploads++; const file = { id: `file-${uploads}`, appProperties: { vaultId: packet.vaultId, revisionId: packet.revisionId }, body: packet.body }; files.push(file);
      if (lostResponse) { lostResponse = false; throw new Error('Provider accepted but response lost'); }
      return Response.json({ id: file.id });
    }
    if (url.includes('alt=media')) return new Response(files.find(file => url.includes(`/${file.id}?`))?.body || '');
    return Response.json({ files });
  } });
  return { client, files, uploads: () => uploads, disable: () => { enabled = false; }, loseResponse: () => { lostResponse = true; } };
}
test('immutable publication verifies contents, reuses repeated revisions and serializes concurrent retries', async () => {
  const { client, uploads } = fixture();
  const results = await Promise.all([client.publish({}, packet), client.publish({}, packet)]);
  assert.equal(uploads(), 1); assert.equal(results[0].verified, true); assert.equal(results[1].reused, true);
});
test('lost create response is recovered by revision identity without another upload', async () => {
  const state = fixture(); state.loseResponse();
  await assert.rejects(state.client.publish({}, packet), /connection-interrupted/);
  const result = await state.client.publish({}, packet);
  assert.equal(result.reused, true); assert.equal(state.uploads(), 1);
});
test('same logical revision with different bytes is an integrity error before publication', async () => {
  const state = fixture(); state.files.push({ id: 'existing', appProperties: { vaultId: packet.vaultId, revisionId: packet.revisionId }, body: 'different contents' });
  await assert.rejects(state.client.publish({}, packet), /revision-content-conflict/); assert.equal(state.uploads(), 0);
});
test('off-mode and invalid protocol reject before any upload', async () => {
  const state = fixture(); state.disable();
  await assert.rejects(state.client.publish({}, packet), /disabled/); assert.equal(state.uploads(), 0);
  await assert.rejects(fixture().client.publish({}, { ...packet, body: 'plaintext' }), /invalid packet/);
});
test('oversized packets are rejected before validation or network', async () => {
  const state = fixture();
  await assert.rejects(state.client.publish({}, { ...packet, body: 'x'.repeat(5 * 1024 * 1024) }), /publication-too-large/);
  assert.equal(state.uploads(), 0);
});
test('all duplicate file IDs must match the selected immutable contents', async () => {
  const state = fixture();
  state.files.push({ id: 'one', appProperties: { vaultId: packet.vaultId, revisionId: packet.revisionId }, body: packet.body });
  state.files.push({ id: 'two', appProperties: { vaultId: packet.vaultId, revisionId: packet.revisionId }, body: packet.body });
  assert.deepEqual((await state.client.publish({}, packet)).fileIds, ['one', 'two']);
  state.files[1].body = 'conflicting';
  await assert.rejects(state.client.publish({}, packet), /revision-content-conflict/);
});
