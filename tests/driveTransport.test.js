import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDriveReader } from '../src/sync/driveTransport.js';
const json = value => new Response(JSON.stringify(value), { headers: { 'content-type': 'application/json' } });
const setup = (fetchImpl, options = {}) => createDriveReader({ getToken: async () => 'fictional-token', assertBinding: async () => {}, fetchImpl, ...options });
test('Drive discovery follows every page, restricts appData and never forwards credentials through redirects', async () => {
  const urls = [];
  const reader = setup(async (url, init) => {
    urls.push(new URL(url)); assert.equal(init.redirect, 'error'); assert.equal(init.credentials, 'omit');
    return urls.length === 1 ? json({ files: [{ id: 'first' }], nextPageToken: 'next' }) : json({ files: [{ id: 'second' }] });
  });
  assert.deepEqual((await reader.list({})).map(file => file.id), ['first', 'second']);
  assert.equal(urls[0].searchParams.get('spaces'), 'appDataFolder'); assert.equal(urls[1].searchParams.get('pageToken'), 'next');
});
test('Drive incomplete, looping and bounded discovery never becomes an empty successful result', async () => {
  for (const result of [{ files: [], incompleteSearch: true }, { files: [], nextPageToken: 'repeated' }, null]) {
    await assert.rejects(setup(async () => json(result)).list({}), /incomplete-discovery/);
  }
  await assert.rejects(setup(async () => json({ files: [{ id: 'one' }, { id: 'two' }] }), { maxFiles: 1 }).list({}), /discovery-limit/);
});
test('Drive reads recheck the account binding after token acquisition and after response', async () => {
  let valid = true; let fetched = false;
  const assertBinding = async () => { if (!valid) throw new Error('Binding changed'); };
  await assert.rejects(setup(async () => { fetched = true; }, { assertBinding, getToken: async () => { valid = false; return 'token'; } }).list({}), /binding-changed/);
  assert.equal(fetched, false);
  valid = true;
  await assert.rejects(setup(async () => { valid = false; return json({ files: [] }); }, { assertBinding }).list({}));
});
test('Drive errors distinguish authentication, capacity and temporary throttling without echoing provider secrets', async () => {
  for (const [status, reason, code, retryable] of [[401, '', 'authentication-required', false], [403, 'storageQuotaExceeded', 'capacity', false], [403, 'rateLimitExceeded', 'temporarily-unavailable', true], [404, '', 'missing', false], [429, '', 'temporarily-unavailable', true], [503, '', 'temporarily-unavailable', true]]) {
    await assert.rejects(setup(async () => new Response(JSON.stringify({ error: { message: 'SECRET', errors: [{ reason }] } }), { status, headers: { 'retry-after': '12' } })).download({}, 'id'), error => error.code === code && error.retryable === retryable && error.retryAfter === 12000 && !error.message.includes('SECRET'));
  }
});
test('Drive rejects unsafe IDs and oversized streamed content before returning it', async () => {
  let calls = 0; const reader = setup(async () => { calls++; return new Response('x', { headers: { 'content-length': String(17 * 1024 * 1024) } }); });
  await assert.rejects(reader.download({}, '../other'), /invalid-file-id/); assert.equal(calls, 0);
  await assert.rejects(reader.download({}, 'valid'), /response-too-large/);
  const stream = new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(17 * 1024 * 1024)); controller.close(); } });
  await assert.rejects(setup(async () => new Response(stream)).download({}, 'valid'), /response-too-large/);
});
