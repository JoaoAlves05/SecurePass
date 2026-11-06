import { test } from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { createDriveTransport } from '../src/sync/driveTransport.js';
import { UPLOAD_CHUNK_BYTES } from '../src/sync/publicationLimits.js';
globalThis.crypto = webcrypto;
const publication = { vaultId: 'vault', revisionId: 'revision', body: JSON.stringify({ ciphertext: 'é'.repeat(3 * 1024 * 1024) }) };
const uri = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&upload_id=fictional';
function fixture() {
  let session = null; let offset = 0; let complete = false; let initiations = 0; let failAfter; let badRange; let enabled = true;
  const requests = []; const chunks = [];
  const options = { getToken: async () => 'fictional-token', assertBinding: async () => {}, assertWritable: async () => { if (!enabled) throw new Error('disabled'); }, validatePublication: async () => {}, fetchImpl: async (url, init) => {
    requests.push({ url, method: init.method, range: init.headers['Content-Range'] });
    if (init.method === 'POST') { initiations++; return new Response('', { headers: { location: uri } }); }
    if (init.method === 'PUT') {
      assert.ok(session, 'session is persisted before uploading bytes');
      const range = init.headers['Content-Range'];
      if (!range.startsWith('bytes */')) {
        const [, start, end, total] = /^bytes (\d+)-(\d+)\/(\d+)$/.exec(range).map(Number);
        assert.equal(start, offset); assert.equal(init.body.byteLength, end - start + 1);
        assert.ok(init.body.byteLength <= UPLOAD_CHUNK_BYTES);
        chunks.push(init.body); offset = end + 1;
        complete = offset === total;
        if (failAfter && offset >= failAfter) { failAfter = null; throw new Error('lost response including private URL'); }
      }
      if (complete) return Response.json({ id: 'file' });
      return new Response('', { status: 308, headers: offset ? { Range: badRange || `bytes=0-${offset - 1}` } : {} });
    }
    if (url.includes('alt=media')) return new Response(new Blob(chunks));
    return Response.json({ files: complete ? [{ id: 'file', appProperties: { vaultId: 'vault', revisionId: 'revision' } }] : [] });
  } };
  return { create: () => createDriveTransport(options), options, requests, chunks, session: () => session, initiations: () => initiations,
    publishOptions: () => ({ uploadSession: session, saveUploadSession: async value => { session = value; } }),
    failAt: value => { failAfter = value; }, badRange: value => { badRange = value; }, disable: () => { enabled = false; } };
}
test('large UTF-8 packets use bounded byte ranges and verify the completed bytes', async () => {
  const state = fixture();
  assert.equal((await state.create().publish({}, publication, state.publishOptions())).verified, true);
  assert.equal(state.initiations(), 1);
  assert.equal(state.session().total, new TextEncoder().encode(publication.body).length);
  assert.equal(state.chunks.length, 7);
});
test('a restarted transport probes the persisted session after an accepted chunk loses its response', async () => {
  const state = fixture(); state.failAt(UPLOAD_CHUNK_BYTES);
  await assert.rejects(state.create().publish({}, publication, state.publishOptions()), /connection-interrupted/);
  const result = await state.create().publish({}, publication, state.publishOptions());
  assert.equal(result.verified, true); assert.equal(state.initiations(), 1);
  assert.equal(state.requests.filter(value => value.range?.startsWith('bytes */')).length, 1);
  assert.equal(state.chunks.length, 7);
});
test('a lost completion response is recovered by full enumeration without another upload', async () => {
  const state = fixture(); state.failAt(new TextEncoder().encode(publication.body).length);
  await assert.rejects(state.create().publish({}, publication, state.publishOptions()), /connection-interrupted/);
  assert.equal((await state.create().publish({}, publication, state.publishOptions())).reused, true);
  assert.equal(state.initiations(), 1);
});
test('hostile upload locations never receive the token or media', async () => {
  const state = fixture(); const original = state.options.fetchImpl;
  state.options.fetchImpl = (url, init) => init.method === 'POST' ? new Response('', { headers: { location: 'https://attacker.invalid/upload?upload_id=stolen' } }) : original(url, init);
  await assert.rejects(state.create().publish({}, publication, state.publishOptions()), /invalid-upload-session/);
  assert.equal(state.requests.some(value => value.method === 'PUT'), false);
});
test('failed session persistence prevents any media upload', async () => {
  const state = fixture();
  await assert.rejects(state.create().publish({}, publication, { saveUploadSession: async () => { throw new Error('storage failed'); } }), /storage failed/);
  assert.equal(state.requests.some(value => value.method === 'PUT'), false);
});
test('provider progress cannot acknowledge bytes that were never sent', async () => {
  const state = fixture(); state.badRange('bytes=0-999999999');
  await assert.rejects(state.create().publish({}, publication, state.publishOptions()), /invalid-upload-progress/);
  assert.equal(state.chunks.length, 1);
});
test('switching off between chunks prevents further writes', async () => {
  const state = fixture(); const original = state.options.fetchImpl;
  state.options.fetchImpl = async (url, init) => {
    const result = await original(url, init);
    if (init.method === 'PUT') state.disable();
    return result;
  };
  await assert.rejects(state.create().publish({}, publication, state.publishOptions()));
  assert.equal(state.chunks.length, 1);
});
