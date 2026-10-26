import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { installChrome, resetStorage, areas } from './helpers/chrome.js';
installChrome();
const vault = await import('../src/cryptoVault.js');
const { vaultHandlers } = await import('../src/messageHandlers/vaultHandlers.js');
const { authorizeMessage } = await import('../src/security/messages.js');
const PASS = 'Fictional current master 123!';
const NEXT = 'Fictional replacement master 456!';
const clientId = crypto.randomUUID();
const sender = { id: chrome.runtime.id, documentId: 'management-document', url: chrome.runtime.getURL('popup/popup.html?manage=1') };
const call = (type, data = {}, source = sender) => vaultHandlers.get(type)({ clientId, ...data }, source);
const authorize = () => call('AUTHORIZE_MASTER_PASSWORD', { passphrase: PASS });
const grantKeys = () => Object.keys(areas.session).filter(key => key.startsWith('masterAuthorization:'));
beforeEach(async () => { await vault.lockVault(); resetStorage(); await vault.initializeVault(PASS); });

test('fresh password authentication unlocks once and authorizes a preserving rotation', async () => {
  await vault.storeCredential({ site: 'https://example.com', password: 'Fictional entry 123!' });
  const entries = await vault.listCredentials();
  areas.local.securepassBiometric = { version: 2 };
  await vault.lockVault();
  const grant = await authorize();
  assert.ok(grant.expiresAt > Date.now());
  assert.equal((await vault.vaultStatus()).unlocked, true);
  assert.equal(JSON.stringify(areas.session).includes(PASS), false);
  assert.equal(Object.hasOwn(areas.session[grantKeys()[0]], 'key'), false);
  await call('CHANGE_MASTER_PASSWORD', { authorization: grant.authorization, newPassphrase: NEXT });
  assert.equal(grantKeys().length, 0);
  assert.equal(areas.local.securepassBiometric, undefined);
  await vault.lockVault();
  await assert.rejects(vault.unlockVault(PASS));
  await vault.unlockVault(NEXT);
  assert.deepEqual(await vault.listCredentials(), entries);
});

test('an unlocked vault and the legacy message payload cannot bypass authorization', async () => {
  await assert.rejects(call('CHANGE_MASTER_PASSWORD', { oldPassphrase: PASS, newPassphrase: NEXT }), /identity/);
  await assert.rejects(call('AUTHORIZE_MASTER_PASSWORD', { passphrase: 'wrong password' }), /Invalid master/);
  assert.equal(grantKeys().length, 0);
});

test('authorizations are bound to the document and client and cannot be stolen or replayed', async () => {
  const grant = await authorize();
  const payload = { authorization: grant.authorization, newPassphrase: NEXT };
  await assert.rejects(call('CHANGE_MASTER_PASSWORD', payload, { ...sender, documentId: 'another-document' }), /identity/);
  await assert.rejects(call('CHANGE_MASTER_PASSWORD', { ...payload, clientId: crypto.randomUUID() }), /identity/);
  await call('CHANGE_MASTER_PASSWORD', payload);
  await assert.rejects(call('CHANGE_MASTER_PASSWORD', payload), /identity/);
});

test('concurrent use of one authorization commits exactly one rotation', async () => {
  const grant = await authorize();
  const results = await Promise.allSettled([NEXT, 'Another fictional password 789!'].map(newPassphrase =>
    call('CHANGE_MASTER_PASSWORD', { authorization: grant.authorization, newPassphrase })));
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(results.filter(result => result.status === 'rejected').length, 1);
});

test('expiry, changed vault, explicit cancellation and a lock invalidate authorization', async () => {
  let grant = await authorize();
  areas.session[grantKeys()[0]].expiresAt = Date.now() - 1;
  await assert.rejects(call('CHANGE_MASTER_PASSWORD', { authorization: grant.authorization, newPassphrase: NEXT }), /expired/);
  grant = await authorize();
  await vault.storeCredential({ site: 'https://example.com', password: 'Example password' });
  await assert.rejects(call('CHANGE_MASTER_PASSWORD', { authorization: grant.authorization, newPassphrase: NEXT }), /vault changed/);
  grant = await authorize();
  await call('CANCEL_MASTER_PASSWORD', { authorization: grant.authorization });
  await assert.rejects(call('CHANGE_MASTER_PASSWORD', { authorization: grant.authorization, newPassphrase: NEXT }), /identity/);
  grant = await authorize();
  await vault.lockVault();
  await vault.unlockVault(PASS);
  await assert.rejects(call('CHANGE_MASTER_PASSWORD', { authorization: grant.authorization, newPassphrase: NEXT }), /expired/);
});

test('a new confirmation replaces the previous grant; cancelling the old one preserves the new', async () => {
  const first = await authorize();
  const second = await authorize();
  await call('CANCEL_MASTER_PASSWORD', { authorization: first.authorization });
  assert.equal(grantKeys().length, 1);
  await call('CHANGE_MASTER_PASSWORD', { authorization: second.authorization, newPassphrase: NEXT });
});

test('content and authentication pages cannot obtain or consume password-change grants', async () => {
  for (const url of ['https://example.com', chrome.runtime.getURL('auth/auth.html')]) {
    for (const type of ['AUTHORIZE_MASTER_PASSWORD', 'CHANGE_MASTER_PASSWORD', 'CANCEL_MASTER_PASSWORD']) {
      assert.throws(() => authorizeMessage({ type }, { ...sender, url }), /Forbidden/);
    }
    await assert.rejects(call('AUTHORIZE_MASTER_PASSWORD', { passphrase: PASS }, { ...sender, url }), /trusted management/);
  }
});
