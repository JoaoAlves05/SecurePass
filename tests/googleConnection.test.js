import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { installChrome, resetStorage, areas } from './helpers/chrome.js';
installChrome();
const google = await import('../src/sync/googleConnection.js');
const { publicationStore: store } = await import('../src/sync/publicationStore.js');
const { createDriveReader } = await import('../src/sync/driveTransport.js');
const originalFetch = globalThis.fetch;
let calls; let accountId; let tokenCalls; let cleared;
beforeEach(() => {
  resetStorage(); calls = []; tokenCalls = []; accountId = 'account-one'; cleared = 0;
  chrome.runtime.getManifest = () => ({ permissions: ['identity'], oauth2: { client_id: '123456-fictional.apps.googleusercontent.com', scopes: [google.GOOGLE_SCOPE] } });
  chrome.identity = {
    getAuthToken: async options => { tokenCalls.push(options); return { token: 'fictional-private-token', grantedScopes: [google.GOOGLE_SCOPE] }; },
    clearAllCachedAuthTokens: async () => { cleared++; }, removeCachedAuthToken: async () => {}
  };
  globalThis.fetch = async (url, options) => {
    calls.push({ url, method: options.method });
    if (url.includes('/about?')) return Response.json({ user: { permissionId: accountId, emailAddress: 'fictional@example.com' } });
    return Response.json({ files: [] });
  };
});
afterEach(() => { globalThis.fetch = originalFetch; });
test('an unconfigured installation reports unavailable and never prompts or contacts Google', async () => {
  chrome.runtime.getManifest = () => ({ permissions: [] });
  assert.equal((await google.googleConnectionStatus()).configured, false);
  await assert.rejects(google.connectGoogle(), /oauth-not-configured/);
  assert.equal(tokenCalls.length, 0); assert.equal(calls.length, 0);
});
test('explicit account connection and complete read-only inspection persist no OAuth token', async () => {
  const status = await google.connectGoogle();
  assert.equal(status.connected, true); assert.equal(status.writesAvailable, false);
  const inspection = await google.inspectGoogleFiles();
  assert.equal(inspection.fileCount, 0); assert.equal(inspection.authenticatedVaults, false); assert.ok(Number.isFinite(inspection.checkedAt));
  assert.equal(tokenCalls[0].interactive, true); assert.ok(tokenCalls.slice(1).every(value => value.interactive === false));
  assert.ok(calls.every(value => value.method === 'GET'));
  assert.equal(JSON.stringify(areas).includes('fictional-private-token'), false);
  assert.equal((await store.context()).enabled, false);
});
test('a token from a different account is rejected before accessing app files', async () => {
  await google.connectGoogle(); accountId = 'different-account'; calls.length = 0;
  await assert.rejects(google.inspectGoogleFiles(), /account-changed/);
  assert.ok(calls.every(value => value.url.includes('/about?')));
});
test('disconnect invalidates an outstanding OAuth result and does not restore its connection', async () => {
  let complete; let requested;
  const pending = new Promise(resolve => { requested = resolve; });
  chrome.identity.getAuthToken = () => { requested(); return new Promise(resolve => { complete = resolve; }); };
  const connection = google.connectGoogle(); await pending;
  await google.disconnectGoogle(); complete({ token: 'late-private-token' });
  await assert.rejects(connection, /binding-changed/);
  assert.equal((await google.googleConnectionStatus()).connected, false); assert.equal(cleared, 1);
  assert.equal(calls.length, 0);
});
test('disconnect suspends the account-bound queue and leaves queued encrypted data intact', async () => {
  await google.connectGoogle();
  const { generation, accountId } = areas.local.googleDriveConnection;
  const binding = { generation, accountId, vaultId: 'vault' };
  await store.configure(binding, true);
  await store.enqueue(binding, { vaultId: 'vault', revisionId: 'revision', body: 'fictional-ciphertext' });
  const operation = await store.next(); await google.disconnectGoogle();
  assert.equal((await store.context()).enabled, false);
  await assert.rejects(store.acknowledge(operation, { verified: true, revisionId: 'revision' }), /disabled/);
  await store.configure(binding, true); assert.equal((await store.next()).id, operation.id);
  await assert.rejects(google.getBoundGoogleToken(binding), /binding-changed/);
});
test('incomplete discovery cannot report an empty app folder', async () => {
  await google.connectGoogle(); const fetch = globalThis.fetch;
  globalThis.fetch = (url, options) => url.includes('/about?') ? fetch(url, options) : Response.json({ files: [], incompleteSearch: true });
  await assert.rejects(google.inspectGoogleFiles(), /incomplete-discovery/);
});
test('OAuth failure details and tokens cannot enter persisted state or public errors', async () => {
  chrome.identity.getAuthToken = async () => { throw new Error('secret-provider-error-token'); };
  await assert.rejects(google.connectGoogle(), error => error.code === 'authentication-required' && !error.message.includes('secret'));
  assert.equal(JSON.stringify(areas).includes('secret'), false);
  assert.equal((await google.googleConnectionStatus()).connected, false);
});
test('denied required scope prevents account requests', async () => {
  chrome.identity.getAuthToken = async () => ({ token: 'private', grantedScopes: [] });
  await assert.rejects(google.connectGoogle(), /authentication-required/); assert.equal(calls.length, 0);
});
test('account verification failure remains distinct from successful empty discovery', async () => {
  const reader = createDriveReader({ getToken: async () => 'fictional', assertBinding: async () => {}, fetchImpl: async () => Response.json({ user: { emailAddress: 'only-email@example.com' } }) });
  await assert.rejects(reader.account({}), /invalid-account/);
});
