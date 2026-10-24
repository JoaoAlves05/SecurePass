import { getStorage, setStorage, removeStorage } from '../utils/storage.js';
import { senderOrigin, matchesOrigin, extensionPage } from '../security/origins.js';
import { listCredentials, requireVault, storeCredential, updateCredential, vaultGeneration, assertVaultGeneration, vaultStatus } from '../cryptoVault.js';
import { validateEntry } from '../validation.js';

const PREFIX = 'autofill:';
const TTL = 120000;
export async function expireRequests() {
  const all = await getStorage('session', null);
  const keys = Object.keys(all).filter(key => key.startsWith(PREFIX));
  const expired = keys.filter(key => all[key].expires <= Date.now());
  if (expired.length) await removeStorage('session', expired);
  const active = keys.filter(key => !expired.includes(key));
  if (active.length) await chrome.alarms.create('authRequestCleanup', { when: Math.min(...active.map(key => all[key].expires)) });
}
async function prune() {
  const all = await getStorage('session', null);
  const old = Object.keys(all).filter(key => key.startsWith(PREFIX) && all[key].expires <= Date.now());
  if (old.length) await removeStorage('session', old);
  if (Object.keys(all).filter(key => key.startsWith(PREFIX)).length >= 8) throw new Error('Too many requests. Close an existing SecurePass window.');
}
export async function createRequest(message, sender, kind = 'fill') {
  const origin = senderOrigin(sender);
  await vaultStatus(); // Expire an old session before creating a new confirmation request.
  await prune();
  const requestId = crypto.randomUUID();
  const request = { kind, origin, tabId: sender.tab.id, documentId: sender.documentId, expires: Date.now() + TTL };
  if (kind === 'save') request.entry = validateEntry({ ...message.entry, site: origin });
  if (kind === 'fill') request.credentialId = message.credentialId || null;
  await setStorage('session', { [`${PREFIX}${requestId}`]: request });
  try {
    const window = await chrome.windows.create({ url: chrome.runtime.getURL(`auth/auth.html?requestId=${requestId}`), type: 'popup', width: 420, height: 620, focused: true });
    request.authTabId = window.tabs?.[0]?.id;
    if (!Number.isInteger(request.authTabId)) throw new Error('Unable to open secure confirmation.');
    await setStorage('session', { [`${PREFIX}${requestId}`]: request });
    await expireRequests();
    return { requestId };
  } catch (error) { await removeStorage('session', `${PREFIX}${requestId}`); throw error; }
}

async function trustedRequest(id, sender) {
  if (typeof id !== 'string' || !/^[\w-]{36}$/.test(id)) throw new Error('Invalid request.');
  const request = (await getStorage('session', `${PREFIX}${id}`))[`${PREFIX}${id}`];
  if (!request || request.expires <= Date.now()) throw new Error('Request expired. Return to the website and try again.');
  if (!extensionPage(sender, ['/auth/auth.html']) || request.authTabId !== sender.tab?.id) throw new Error('Request does not belong to this window.');
  return request;
}
async function assertDocument(request) {
  const reply = await chrome.tabs.sendMessage(request.tabId, { type: 'AUTOFILL_CHECK_DOCUMENT' }, { documentId: request.documentId });
  if (!reply?.ok || reply.origin !== request.origin) throw new Error('The original document is no longer active.');
}
export async function requestDetails(message, sender) {
  const request = await trustedRequest(message.requestId, sender);
  if (request.kind === 'fill') await assertDocument(request);
  let entries = [];
  try {
    entries = (await listCredentials()).filter(e => matchesOrigin(e.site, request.origin)).map(e => ({ id: e.id, username: e.username, site: e.site }));
  } catch (error) { if (!error.message.includes('not initialized')) throw error; }
  return { kind: request.kind, origin: request.origin, entries, candidate: request.entry ? { username: request.entry.username, site: request.origin } : null };
}
export async function completeRequest(message, sender) {
  const epoch = vaultGeneration();
  const request = await trustedRequest(message.requestId, sender);
  if (request.kind === 'fill') await assertDocument(request);
  await requireVault();
  if (request.kind === 'save') {
    const entries = await listCredentials();
    const match = entries.find(e => e.site === request.origin && e.username === request.entry.username);
    assertVaultGeneration(epoch);
    if (match) await updateCredential(match.id, request.entry);
    else await storeCredential(request.entry);
  } else {
    const entry = (await listCredentials()).find(e => e.id === message.credentialId && matchesOrigin(e.site, request.origin));
    if (!entry) throw new Error('Credential not available for this origin.');
    assertVaultGeneration(epoch);
    // Consume before delivery; only the original isolated world/document may receive this secret.
    await removeStorage('session', `${PREFIX}${message.requestId}`);
    assertVaultGeneration(epoch);
    await chrome.tabs.sendMessage(request.tabId, { type: 'AUTOFILL_RESULT', requestId: message.requestId, origin: request.origin, entry: { username: entry.username, password: entry.password } }, { documentId: request.documentId });
  }
  await removeStorage('session', `${PREFIX}${message.requestId}`);
}
export async function cancelRequest(message, sender) {
  await trustedRequest(message.requestId, sender);
  await removeStorage('session', `${PREFIX}${message.requestId}`);
}
export async function clearRequests() {
  const all = await getStorage('session', null);
  const keys = Object.keys(all).filter(k => k.startsWith(PREFIX));
  if (keys.length) await removeStorage('session', keys);
}
export async function listForOrigin(_message, sender) {
  const origin = senderOrigin(sender);
  try {
    const entries = (await requireVault()).entries.filter(e => matchesOrigin(e.site, origin));
    return { entries: entries.map(e => ({ id: e.id, username: e.username, site: e.site })), unlocked: true };
  } catch (error) {
    if (error.message.includes('locked') || error.message.includes('not initialized')) return { entries: [], unlocked: false };
    throw error;
  }
}
