import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installChrome } from './helpers/chrome.js';
installChrome();
const { authorizeMessage } = await import('../src/security/messages.js');
const { matchesOrigin, normalizeSite, senderOrigin } = await import('../src/security/origins.js');
const content = { id: chrome.runtime.id, tab: { id: 1 }, frameId: 0, documentId: 'doc', url: 'https://bank.example/login', origin: 'https://bank.example' };
test('content cannot list vault, unlock or forge biometric completion', () => {
  for (const type of ['LIST_CREDENTIALS', 'GET_CREDENTIAL', 'UNLOCK_VAULT', 'UNLOCK_AND_FILL', 'BIOMETRIC_AUTH_COMPLETE', 'STORE_CREDENTIAL', 'SAVE_SETTINGS']) assert.throws(() => authorizeMessage({ type }, content), /Forbidden/);
  assert.equal(authorizeMessage({ type: 'REQUEST_AUTOFILL' }, content), 'content');
});
test('extension management page in a tab is trusted but auth window has limited capabilities', () => {
  const sender = { id: chrome.runtime.id, url: chrome.runtime.getURL('popup/popup.html'), tab: { id: 2 } };
  assert.equal(authorizeMessage({ type: 'INITIALIZE_VAULT' }, sender), 'management');
  sender.url = chrome.runtime.getURL('auth/auth.html?requestId=example');
  assert.throws(() => authorizeMessage({ type: 'LIST_CREDENTIALS' }, sender), /Forbidden/);
});
test('origin matching never crosses scheme, port or subdomain', () => {
  assert.equal(normalizeSite('bank.example/path'), 'https://bank.example');
  for (const site of ['http://bank.example', 'https://sub.bank.example', 'https://bank.example:8443', 'https://other.example']) assert.equal(matchesOrigin(site, 'https://bank.example'), false);
  assert.throws(() => normalizeSite('javascript:alert(1)')); assert.throws(() => normalizeSite('https://user:pass@bank.example'));
});
test('malformed envelopes and unbound documents are rejected', () => {
  assert.throws(() => authorizeMessage(null, content)); assert.throws(() => authorizeMessage({ type: 'REQUEST_AUTOFILL' }, { ...content, documentId: undefined }));
});
test('sender origin ignores long paths and queries but rejects unsafe origins', () => {
  const longPage = { ...content, url: `https://bank.example/${'x'.repeat(300)}?return=${'y'.repeat(300)}` };
  assert.equal(senderOrigin(longPage), 'https://bank.example');
  assert.throws(() => senderOrigin({ ...content, url: 'javascript:alert(1)' }), /Only HTTP and HTTPS/);
  assert.throws(() => senderOrigin({ ...content, url: 'https://user:pass@bank.example/login' }), /Only HTTP and HTTPS/);
  assert.throws(() => senderOrigin({ ...content, url: 'https://bank.example/login', origin: 'https://other.example' }), /mismatched/);
});

test('SC56: new backup/cache/recovery management handlers remain forbidden to content and auth contexts', () => {
  const content = { id: chrome.runtime.id, url: 'https://example.com/', origin: 'https://example.com', tab: { id: 1 }, frameId: 0, documentId: 'document' };
  const auth = { id: chrome.runtime.id, url: chrome.runtime.getURL('auth/auth.html'), tab: { id: 2 } };
  for (const type of ['PREVIEW_BACKUP', 'COMMIT_BACKUP', 'EXPORT_RECOVERY_SNAPSHOT', 'RECOVERY_ARCHIVE_STATUS', 'HIBP_CACHE_STATUS', 'HIBP_CLEAR_CACHE', 'WIPE_DEVICE', 'SYNC_SETUP_CHECK', 'OPEN_CHROME_SYNC_SETTINGS', 'SYNC_PREVIEW', 'SYNC_COMMIT_REVIEW', 'SYNC_DEVICE_TEST_START', 'SYNC_DEVICE_TEST_INSPECT', 'SYNC_DEVICE_TEST_CONFIRM', 'SYNC_DEVICE_TEST_STATUS']) {
    assert.throws(() => authorizeMessage({ type }, content), /Forbidden/);
    assert.throws(() => authorizeMessage({ type }, auth), /Forbidden/);
  }
  assert.equal(authorizeMessage({ type: 'COMMIT_BACKUP' }, { id: chrome.runtime.id, url: chrome.runtime.getURL('popup/popup.html?manage=1') }), 'management');
});
