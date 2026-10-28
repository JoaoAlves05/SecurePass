import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { IDBObjectStore } from 'fake-indexeddb';
import { installChrome, resetStorage, areas, failWhen } from './helpers/chrome.js';
installChrome();
const vault = await import('../src/cryptoVault.js');
const candidates = await import('../src/autofill/candidates.js');
const requests = await import('../src/autofill/requests.js');
const storage = await import('../src/utils/storage.js');
const { authorizeMessage } = await import('../src/security/messages.js');
const { vaultHandlers } = await import('../src/messageHandlers/vaultHandlers.js');
const { utilHandlers } = await import('../src/messageHandlers/utilHandlers.js');
const { wipeDevice } = await import('../src/vault/recovery.js');
const PASS = 'Fictional account prompt master 123!';
const origin = 'https://fictional.example';
const sender = { id: chrome.runtime.id, tab: { id: 1 }, documentId: 'original-doc', frameId: 0, url: `${origin}/login`, origin };
const entry = (username = 'student', password = 'Fictional login value') => ({ site: origin, username, password, notes: 'Keep these notes exactly <> ' });
let windows; let sent; let badge; let nextTab;
const auth = tabId => ({ id: chrome.runtime.id, tab: { id: tabId }, url: chrome.runtime.getURL('auth/auth.html') });
async function saveRequest(value = entry()) {
  const { requestId } = await requests.createRequest({ entry: value }, sender, 'save');
  return { requestId, owner: auth(areas.session[`autofill:${requestId}`].authTabId) };
}
async function payload(request, extra = {}) {
  const details = await requests.requestDetails(request, request.owner);
  return { requestId: request.requestId, expectedRevision: details.revision, username: 'student', saveAction: 'create', ...extra };
}
beforeEach(async () => {
  await vault.lockVault(); resetStorage(); windows = []; sent = []; badge = ''; nextTab = 10;
  chrome.action = { setBadgeText: async value => { badge = value.text; } };
  chrome.windows = { create: async options => { const value = { id: nextTab, tabs: [{ id: nextTab++ }] }; windows.push({ ...value, options }); return value; }, update: async () => {} };
  chrome.tabs = { update: async () => {}, remove: async () => {}, sendMessage: async (tabId, message, options) => { sent.push({ tabId, message, options }); return { ok: true, origin }; } };
});
test('submission suggestions are temporary, exact-origin, deduplicated and metadata-only', async () => {
  await vault.initializeVault(PASS);
  const proposal = await candidates.proposeCandidate({ entry: { ...entry(), site: 'https://forged.example' } }, sender);
  assert.equal(proposal.proposed, true); assert.equal(badge, '1');
  const metadata = await candidates.listCandidates(); assert.equal(metadata.candidates.length, 1);
  assert.equal(metadata.candidates[0].site, origin); assert.equal(JSON.stringify(metadata).includes(entry().password), false);
  assert.equal((await vault.listCredentials()).length, 0);
  await Promise.all(Array.from({ length: 4 }, () => candidates.proposeCandidate({ entry: entry() }, sender)));
  assert.equal((await candidates.listCandidates()).candidates.length, 1);
  const key = `candidate:${proposal.candidateId}`; areas.session[key].expires = Date.now() - 1;
  assert.equal((await candidates.listCandidates()).candidates.length, 0); assert.equal(badge, '');
});
test('known identical logins do not create suggestions and another document cannot review or dismiss one', async () => {
  await vault.initializeVault(PASS); await vault.storeCredential(entry());
  assert.equal((await candidates.proposeCandidate({ entry: entry() }, sender)).proposed, false);
  const proposal = await candidates.proposeCandidate({ entry: entry('student', 'Fictional replacement') }, sender);
  for (const other of [{ ...sender, documentId: 'new-doc' }, { ...sender, tab: { id: 2 } }, { ...sender, url: 'https://other.example', origin: 'https://other.example' }]) {
    await assert.rejects(candidates.inlineCandidate({ candidateId: proposal.candidateId }, other), /different document/);
    await assert.rejects(candidates.inlineCandidate({ candidateId: proposal.candidateId }, other, true), /different document/);
  }
  assert.equal((await candidates.listCandidates()).candidates.length, 1); assert.equal(windows.length, 0);
});
test('review opens one window, cancellation preserves the proposal, dismiss closes its confirmation', async () => {
  await vault.initializeVault(PASS);
  const proposal = await candidates.proposeCandidate({ entry: entry() }, sender);
  const [one, two] = await Promise.all([candidates.reviewCandidate({ candidateId: proposal.candidateId }), candidates.reviewCandidate({ candidateId: proposal.candidateId })]);
  assert.equal(one.requestId, two.requestId); assert.equal(windows.length, 1);
  await requests.cancelRequest(one, auth(areas.session[`autofill:${one.requestId}`].authTabId));
  assert.equal((await candidates.listCandidates()).candidates.length, 1); assert.equal((await vault.listCredentials()).length, 0);
  const reopened = await candidates.reviewCandidate({ candidateId: proposal.candidateId });
  await candidates.dismissCandidate({ candidateId: proposal.candidateId });
  assert.equal((await candidates.listCandidates()).candidates.length, 0); assert.equal(areas.session[`autofill:${reopened.requestId}`], undefined);
});
test('locked review reveals origin and candidate metadata but never stored accounts or passwords', async () => {
  await vault.initializeVault(PASS); await vault.storeCredential(entry()); await vault.lockVault();
  const request = await saveRequest(entry('new'));
  const details = await requests.requestDetails(request, request.owner);
  assert.equal(details.origin, origin); assert.equal(details.candidate.username, 'new'); assert.deepEqual(details.entries, []); assert.equal(details.revision, null);
  assert.equal(JSON.stringify(details).includes(entry().password), false);
  await assert.rejects(requests.requestDetails(request, auth(99)), /does not belong/);
});
test('explicit update preserves notes, ID and creation time and retains the previous password in history', async () => {
  await vault.initializeVault(PASS); const original = await vault.storeCredential(entry());
  const request = await saveRequest(entry('student', ' Fictional changed <> password '));
  const details = await requests.requestDetails(request, request.owner); assert.equal(details.saveMode, 'update');
  await requests.completeRequest(await payload(request, { saveAction: 'update', credentialId: original.id }), request.owner);
  const [saved] = await vault.listCredentials(); assert.equal(saved.password, ' Fictional changed <> password '); assert.equal(saved.notes, original.notes); assert.equal(saved.id, original.id); assert.equal(saved.createdAt, original.createdAt);
  assert.ok((await storage.readRecoveryRecords()).length > 0);
});
test('save cannot overwrite a cross-origin account, skip a target or use stale destination revision', async () => {
  await vault.initializeVault(PASS); await vault.storeCredential(entry());
  const foreign = await vault.storeCredential({ ...entry('foreign'), site: 'https://other.example' });
  const request = await saveRequest();
  await assert.rejects(requests.completeRequest(await payload(request, { saveAction: 'update', credentialId: foreign.id }), request.owner), /no longer available/);
  await assert.rejects(requests.completeRequest(await payload(request, { saveAction: 'update' }), request.owner), /no longer available/);
  const stale = await payload(request); await vault.storeCredential(entry('another'));
  await assert.rejects(requests.completeRequest(stale, request.owner), /vault changed/);
  assert.equal((await vault.listCredentials()).length, 3);
});
test('a confirmed create consumes its request once even under simultaneous confirmations', async () => {
  await vault.initializeVault(PASS); const request = await saveRequest(); const values = await payload(request);
  const results = await Promise.allSettled([requests.completeRequest(values, request.owner), requests.completeRequest(values, request.owner)]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1); assert.equal((await vault.listCredentials()).length, 1);
  await assert.rejects(requests.completeRequest(values, request.owner), /expired/);
});
test('failed save transaction preserves the vault and allows a fresh retry without losing its proposal', async () => {
  await vault.initializeVault(PASS); const before = await storage.readLocalVaultRecordRaw(); const request = await saveRequest(); const values = await payload(request);
  const original = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function (...args) { const result = original.apply(this, args); if (args[1] === 'securepassVault') result.addEventListener('success', () => this.transaction.abort()); return result; };
  try { await assert.rejects(requests.completeRequest(values, request.owner), /aborted/); } finally { IDBObjectStore.prototype.put = original; }
  assert.deepEqual(await storage.readLocalVaultRecordRaw(), before); assert.ok(areas.session[`autofill:${request.requestId}`]);
  await requests.completeRequest(values, request.owner); assert.equal((await vault.listCredentials()).length, 1);
});
test('save completion removes the linked suggestion and keeps manually corrected username exact', async () => {
  await vault.initializeVault(PASS); const proposal = await candidates.proposeCandidate({ entry: entry() }, sender);
  const review = await candidates.reviewCandidate({ candidateId: proposal.candidateId }); const request = { ...review, owner: auth(areas.session[`autofill:${review.requestId}`].authTabId) };
  await requests.completeRequest(await payload(request, { username: ' Corrected <> user ' }), request.owner);
  assert.equal((await vault.listCredentials())[0].username, ' Corrected <> user '); assert.equal((await candidates.listCandidates()).candidates.length, 0); assert.equal(badge, '');
});
test('fill is document-bound, origin-bound and delivered only once under concurrent confirmation', async () => {
  await vault.initializeVault(PASS); const account = await vault.storeCredential(entry());
  const request = await requests.createRequest({}, sender); const owner = auth(areas.session[`autofill:${request.requestId}`].authTabId);
  const results = await Promise.allSettled([requests.completeRequest({ ...request, credentialId: account.id }, owner), requests.completeRequest({ ...request, credentialId: account.id }, owner)]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1); assert.equal(sent.filter(item => item.message.type === 'AUTOFILL_RESULT').length, 1);
  assert.equal(sent.find(item => item.message.type === 'AUTOFILL_RESULT').options.documentId, sender.documentId);
  const stale = await requests.createRequest({}, sender); const staleOwner = auth(areas.session[`autofill:${stale.requestId}`].authTabId);
  chrome.tabs.sendMessage = async () => ({ ok: true, origin: 'https://other.example' });
  await assert.rejects(requests.completeRequest({ ...stale, credentialId: account.id }, staleOwner), /no longer active/);
});
test('closing or expiring a confirmation revokes it and cancels the original page selection', async () => {
  await vault.initializeVault(PASS);
  const request = await requests.createRequest({}, sender); await requests.closeRequestsForTab(areas.session[`autofill:${request.requestId}`].authTabId);
  assert.equal(areas.session[`autofill:${request.requestId}`], undefined); assert.equal(sent.at(-1).message.type, 'AUTOFILL_CANCELLED');
  const expired = await requests.createRequest({}, sender); areas.session[`autofill:${expired.requestId}`].expires = Date.now() - 1; await requests.expireRequests();
  assert.equal(areas.session[`autofill:${expired.requestId}`], undefined); assert.equal(sent.at(-1).message.type, 'AUTOFILL_CANCELLED');
});
test('new inline review capabilities do not widen vault or settings access', () => {
  for (const type of ['REVIEW_INLINE_CANDIDATE', 'DISMISS_INLINE_CANDIDATE']) assert.equal(authorizeMessage({ type }, sender), 'content');
  assert.equal(authorizeMessage({ type: 'PUBLIC_SETTINGS' }, auth(10)), 'authentication');
  for (const type of ['LIST_SAVE_CANDIDATES', 'REVIEW_SAVE_CANDIDATE', 'DISMISS_SAVE_CANDIDATE', 'LIST_CREDENTIALS', 'LOAD_SETTINGS']) assert.throws(() => authorizeMessage({ type }, sender), /Forbidden/);
  for (const type of ['LOAD_SETTINGS', 'REVIEW_INLINE_CANDIDATE', 'LIST_CREDENTIALS']) assert.throws(() => authorizeMessage({ type }, auth(10)), /Forbidden/);
});

test('concurrent proposals stay bounded and known logins found after unlock clear the redundant suggestion', async () => {
  await vault.initializeVault(PASS);
  await Promise.all(Array.from({ length: 12 }, (_, index) => candidates.proposeCandidate({ entry: entry(`account-${index}`) }, sender)));
  assert.equal((await candidates.listCandidates()).candidates.length, 8);
  await candidates.clearCandidates(); assert.equal(badge, '');
  await vault.storeCredential(entry()); await vault.lockVault();
  const proposal = await candidates.proposeCandidate({ entry: entry() }, sender);
  const review = await candidates.reviewCandidate({ candidateId: proposal.candidateId });
  await vault.unlockVault(PASS);
  const details = await requests.requestDetails(review, auth(areas.session[`autofill:${review.requestId}`].authTabId));
  assert.equal(details.saveMode, 'unchanged'); assert.equal((await candidates.listCandidates()).candidates.length, 0);
  assert.equal((await vault.listCredentials()).length, 1);
});

test('a post-commit session failure never revives a consumed save request', async () => {
  await vault.initializeVault(PASS); const request = await saveRequest(); const values = await payload(request);
  failWhen((area, items) => area === 'session' && Object.hasOwn(items, 'vaultSessionV2'));
  let result;
  try { result = await requests.completeRequest(values, request.owner); } finally { failWhen(null); }
  assert.equal(result.saved, true); assert.equal(result.unlockRequired, true);
  assert.equal(areas.session[`autofill:${request.requestId}`], undefined);
  await vault.unlockVault(PASS); assert.equal((await vault.listCredentials()).length, 1);
  await assert.rejects(requests.completeRequest(values, request.owner), /expired/);
});

test('concurrent UI reads cannot revoke a save between local commit and session activation', async () => {
  await vault.initializeVault(PASS); await vault.changeSyncMode(true); await vault.unlockVault(PASS);
  const request = await saveRequest(); const values = await payload(request);
  const original = chrome.storage.sync.set; let started; let release; let paused = false;
  const reached = new Promise(resolve => { started = resolve; }); const gate = new Promise(resolve => { release = resolve; });
  chrome.storage.sync.set = (items, callback) => {
    if (!paused) { paused = true; started(); gate.then(() => original(items, callback)); }
    else original(items, callback);
  };
  try {
    const saving = requests.completeRequest(values, request.owner); await reached;
    const reading = vaultHandlers.get('LIST_CREDENTIALS')({});
    const status = vaultHandlers.get('VAULT_STATUS')({});
    const syncStatus = utilHandlers.get('SYNC_STATUS')({});
    await new Promise(resolve => setImmediate(resolve)); release();
    const [result, view, current, remote] = await Promise.all([saving, reading, status, syncStatus]);
    assert.equal(result.saved, true); assert.equal(result.unlockRequired, undefined);
    assert.equal(view.unlocked, true); assert.equal(view.entries.length, 1); assert.equal(current.status.unlocked, true); assert.equal(remote.status.pending, false);
  } finally { release(); chrome.storage.sync.set = original; }
});
test('local erasure can finish while management views concurrently request vault and Sync status', async () => {
  await vault.initializeVault(PASS); await vault.storeCredential(entry());
  const erasing = wipeDevice(undefined, { force: true, confirmation: 'ERASE THIS DEVICE' });
  const [_, current, remote] = await Promise.all([erasing, vaultHandlers.get('VAULT_STATUS')({}), utilHandlers.get('SYNC_STATUS')({})]);
  assert.equal(current.status.initialized, false); assert.equal(remote.status.initialized, false); assert.equal(remote.status.enabled, false);
});

test('direct key reserves the native window identity before loading auth and refocuses only its original target', async () => {
  const targetId = crypto.randomUUID(); let bound = false;
  chrome.tabs.update = async (tabId, options) => {
    if (options.url) bound = Object.values(areas.session).some(value => value?.authTabId === tabId && value.targetId === targetId);
  };
  const request = await requests.createRequest({ targetId, hasPassword: true }, sender);
  assert.equal(windows[0].options.url, 'about:blank'); assert.equal(bound, true);
  assert.equal((await requests.requestDetails(request, auth(10))).hasPassword, true);
  await requests.createRequest({ existingRequestId: request.requestId, targetId }, sender);
  assert.equal(windows.length, 1);
  for (const other of [{ ...sender, documentId: 'another-doc' }, { ...sender, tab: { id: 2 } }, { ...sender, url: 'https://other.example', origin: 'https://other.example' }]) {
    await assert.rejects(requests.createRequest({ existingRequestId: request.requestId, targetId }, other), /expired/);
  }
  await assert.rejects(requests.createRequest({ existingRequestId: request.requestId, targetId: crypto.randomUUID() }, sender), /expired/);
});
test('secondary tools are one-shot, window/document-bound and do not require an unlocked vault', async () => {
  const targetId = crypto.randomUUID();
  const request = await requests.createRequest({ targetId, hasPassword: true }, sender); const owner = auth(10);
  await assert.rejects(requests.completeRequest({ ...request, action: 'generate' }, auth(99)), /does not belong/);
  await assert.rejects(requests.completeRequest({ ...request, action: 'unknown' }, owner), /Unknown password tool/);
  const results = await Promise.allSettled([requests.completeRequest({ ...request, action: 'generate' }, owner), requests.completeRequest({ ...request, action: 'generate' }, owner)]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  const delivered = sent.filter(item => item.message.type === 'AUTOFILL_TOOL'); assert.equal(delivered.length, 1);
  assert.equal(delivered[0].message.targetId, targetId); assert.equal(delivered[0].options.documentId, sender.documentId);
  assert.equal((await vault.vaultStatus()).initialized, false);
});
test('empty, stale and unacknowledged source fields cannot silently complete password tools or fill', async () => {
  const request = await requests.createRequest({}, sender); const owner = auth(10);
  for (const action of ['copy', 'save-entered']) await assert.rejects(requests.completeRequest({ ...request, action }, owner), /Enter a password/);
  const originalSend = chrome.tabs.sendMessage;
  chrome.tabs.sendMessage = async () => ({ ok: false, origin });
  await assert.rejects(requests.completeRequest({ ...request, action: 'generate' }, owner), /no longer active/);
  chrome.tabs.sendMessage = async (tab, message, options) => message.type === 'AUTOFILL_CHECK_DOCUMENT' ? { ok: true, origin } : { ok: false };
  await assert.rejects(requests.completeRequest({ ...request, action: 'generate' }, owner), /original field/);
  await assert.rejects(requests.completeRequest({ ...request, action: 'generate' }, owner), /expired/);
  chrome.tabs.sendMessage = originalSend;
  await vault.initializeVault(PASS); const account = await vault.storeCredential(entry());
  const fill = await requests.createRequest({}, sender); const fillOwner = auth(11);
  chrome.tabs.sendMessage = async (_tab, message) => message.type === 'AUTOFILL_CHECK_DOCUMENT' ? { ok: true, origin } : undefined;
  await assert.rejects(requests.completeRequest({ ...fill, credentialId: account.id }, fillOwner), /original field/);
});
test('adding a login from the empty selector is explicit, revision-checked and restricted to its website', async () => {
  await vault.initializeVault(PASS);
  const request = await requests.createRequest({}, sender); const owner = auth(10);
  const revision = (await requests.requestDetails(request, owner)).revision;
  const message = { ...request, action: 'add', saveAction: 'create', expectedRevision: revision, username: ' Manual <> user ', password: ' Manual <> secret ', site: 'https://forged.example', notes: 'ignored' };
  await assert.rejects(requests.completeRequest({ ...message, saveAction: 'update' }, owner), /new login/);
  await assert.rejects(requests.completeRequest({ ...message, expectedRevision: 'stale' }, owner), /vault changed/);
  assert.equal((await vault.listCredentials()).length, 0);
  await requests.completeRequest(message, owner);
  const [saved] = await vault.listCredentials(); assert.equal(saved.site, origin); assert.equal(saved.username, message.username); assert.equal(saved.password, message.password); assert.equal(saved.notes, '');
  assert.equal(sent.filter(item => item.message.type === 'AUTOFILL_RESULT').length, 0);
  assert.equal(sent.at(-1).message.reason, 'saved');
  await assert.rejects(requests.completeRequest(message, owner), /expired/);
});
test('failed manual save does not persist its draft password or replace the active vault', async () => {
  await vault.initializeVault(PASS); const request = await requests.createRequest({}, sender); const owner = auth(10);
  const revision = (await requests.requestDetails(request, owner)).revision;
  const message = { ...request, action: 'add', saveAction: 'create', expectedRevision: revision, username: 'manual', password: 'Fictional manual draft secret' };
  const original = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function (...args) { const result = original.apply(this, args); if (args[1] === 'securepassVault') result.addEventListener('success', () => this.transaction.abort()); return result; };
  try { await assert.rejects(requests.completeRequest(message, owner), /aborted/); } finally { IDBObjectStore.prototype.put = original; }
  assert.equal(JSON.stringify(areas.session).includes(message.password), false); assert.equal((await vault.listCredentials()).length, 0);
  await requests.completeRequest(message, owner); assert.equal((await vault.listCredentials()).length, 1);
});
