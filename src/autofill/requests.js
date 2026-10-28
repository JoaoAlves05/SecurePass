import { getStorage, setStorage, removeStorage, readLocalVaultRecordRaw } from '../utils/storage.js';
import { senderOrigin, matchesOrigin, extensionPage } from '../security/origins.js';
import { listCredentials, requireVault, vaultGeneration, assertVaultGeneration, vaultStatus } from '../cryptoVault.js';
import { validateEntry, validateString } from '../validation.js';
import { withVaultOperation, withVaultLock } from '../vault/queue.js';
import { assertCurrent, commitRecord } from '../vault/repository.js';
import { encryptEntries } from '../vault/crypto.js';
import { activate } from '../vault/session.js';
import { removeCandidate } from './candidateStore.js';
const PREFIX = 'autofill:';
const TTL = 120000;
async function notifyCancellation(request, requestId, reason = 'cancelled') {
  if (request.kind === 'fill') await chrome.tabs.sendMessage(request.tabId, { type: 'AUTOFILL_CANCELLED', requestId, targetId: request.targetId, reason }, { documentId: request.documentId }).catch(() => {});
}
export async function expireRequests() {
  const all = await getStorage('session', null);
  const keys = Object.keys(all).filter(key => key.startsWith(PREFIX));
  const expired = keys.filter(key => all[key].expires <= Date.now());
  if (expired.length) {
    await removeStorage('session', expired);
    await Promise.allSettled(expired.map(key => notifyCancellation(all[key], key.slice(PREFIX.length), 'expired')));
  }
  const active = keys.filter(key => !expired.includes(key));
  if (active.length) await chrome.alarms.create('authRequestCleanup', { when: Math.min(...active.map(key => all[key].expires)) });
}
async function prune() {
  await expireRequests();
  const all = await getStorage('session', null);
  if (Object.keys(all).filter(key => key.startsWith(PREFIX)).length >= 8) throw new Error('Too many requests. Close an existing SecurePass window.');
}
export async function createRequest(message, sender, kind = 'fill', { candidateId } = {}) {
  const origin = senderOrigin(sender);
  if (kind === 'fill' && message.existingRequestId) {
    const existing = (await getStorage('session', `${PREFIX}${message.existingRequestId}`))[`${PREFIX}${message.existingRequestId}`];
    if (!existing || existing.kind !== 'fill' || existing.expires <= Date.now() || existing.tabId !== sender.tab.id || existing.documentId !== sender.documentId || existing.origin !== origin || existing.targetId !== message.targetId) throw new Error('Selection expired. Open SecurePass again.');
    await chrome.windows.update(existing.authWindowId, { focused: true });
    return { requestId: message.existingRequestId };
  }
  const requestId = crypto.randomUUID();
  const request = { kind, origin, tabId: sender.tab.id, documentId: sender.documentId, expires: Date.now() + TTL };
  if (kind === 'save') request.entry = validateEntry({ site: origin, username: message.entry?.username ?? '', password: message.entry?.password, notes: '' });
  if (candidateId) request.candidateId = candidateId;
  if (kind === 'fill') {
    if (message.targetId !== undefined && (typeof message.targetId !== 'string' || !/^[\w-]{36}$/.test(message.targetId))) throw new Error('Invalid field target.');
    request.targetId = message.targetId || null;
    request.hasPassword = message.hasPassword === true;
  }
  let epoch;
  await withVaultLock(async () => {
    await vaultStatus(); await prune(); epoch = vaultGeneration();
    await setStorage('session', { [`${PREFIX}${requestId}`]: request });
  });
  let window;
  try {
    window = await chrome.windows.create({ url: 'about:blank', type: 'popup', width: 420, height: 560, focused: true });
    request.authTabId = window.tabs?.[0]?.id; request.authWindowId = window.id;
    if (!Number.isInteger(request.authTabId)) throw new Error('Unable to open secure confirmation.');
    assertVaultGeneration(epoch);
    await setStorage('session', { [`${PREFIX}${requestId}`]: request });
    assertVaultGeneration(epoch);
    await chrome.tabs.update(request.authTabId, { url: chrome.runtime.getURL(`auth/auth.html?requestId=${requestId}`) });
    await expireRequests(); return { requestId };
  } catch (error) {
    await removeStorage('session', `${PREFIX}${requestId}`);
    if (window?.tabs?.[0]?.id) await chrome.tabs.remove(window.tabs[0].id).catch(() => {});
    throw error;
  }
}
async function trustedRequest(id, sender) {
  if (typeof id !== 'string' || !/^[\w-]{36}$/.test(id)) throw new Error('Invalid request.');
  const request = (await getStorage('session', `${PREFIX}${id}`))[`${PREFIX}${id}`];
  if (!request || request.expires <= Date.now()) throw new Error('Request expired. Return to the website and try again.');
  if (!extensionPage(sender, ['/auth/auth.html']) || request.authTabId !== sender.tab?.id) throw new Error('Request does not belong to this window.');
  return request;
}
async function assertDocument(request) {
  const reply = await chrome.tabs.sendMessage(request.tabId, { type: 'AUTOFILL_CHECK_DOCUMENT', targetId: request.targetId }, { documentId: request.documentId });
  if (!reply?.ok || reply.origin !== request.origin) throw new Error('The original document is no longer active.');
}
export function requestDetails(message, sender) {
  return withVaultOperation(async () => {
    const request = await trustedRequest(message.requestId, sender);
    if (request.kind === 'fill') await assertDocument(request);
    let active = null;
    try { active = await requireVault(); }
    catch (error) { if (!/locked|not initialized/.test(error.message)) throw error; }
    const entries = active?.entries.filter(entry => matchesOrigin(entry.site, request.origin)) || [];
    const matches = request.entry ? entries.filter(entry => entry.username === request.entry.username) : [];
    const saveMode = matches.some(entry => entry.password === request.entry?.password) ? 'unchanged' : matches.length ? 'update' : 'create';
    if (request.kind === 'save' && active && saveMode === 'unchanged' && request.candidateId) await removeCandidate(request.candidateId).catch(() => {});
    return { kind: request.kind, origin: request.origin, expires: request.expires, revision: active?.record.revision || null, hasPassword: request.hasPassword === true,
      entries: entries.map(entry => ({ id: entry.id, username: entry.username, site: entry.site, updatedAt: entry.updatedAt })),
      saveMode, matchingIds: matches.map(entry => entry.id), candidate: request.entry ? { username: request.entry.username, site: request.origin } : null };
  });
}
function completeSave(message, sender, manual = false) {
  return withVaultOperation(async epoch => {
    const request = await trustedRequest(message.requestId, sender);
    let captured = request.entry;
    if (manual) {
      if (request.kind !== 'fill' || message.saveAction !== 'create') throw new Error('Choose a new login to add.');
      await assertDocument(request);
      captured = validateEntry({ site: request.origin, username: message.username ?? '', password: message.password, notes: '' });
    }
    const state = await requireVault();
    if (message.expectedRevision !== state.record.revision) throw new Error('Your vault changed. Review the saved accounts again before confirming.');
    const username = validateString(message.username ?? captured.username, 255, 'username');
    if (!['create', 'update'].includes(message.saveAction)) throw new Error('Choose whether to save a new login or update an existing one.');
    const entries = structuredClone(state.entries); const now = new Date().toISOString();
    if (message.saveAction === 'update') {
      const index = entries.findIndex(entry => entry.id === message.credentialId && matchesOrigin(entry.site, request.origin));
      if (index < 0) throw new Error('The selected account is no longer available for this website. Review again.');
      entries[index] = { ...entries[index], username, password: captured.password, updatedAt: now };
    } else {
      if (entries.some(entry => matchesOrigin(entry.site, request.origin) && entry.username === username && entry.password === captured.password)) throw new Error('This login is already saved. You can close this suggestion.');
      entries.push({ id: crypto.randomUUID(), site: request.origin, username, password: captured.password, notes: '', createdAt: now, updatedAt: now });
    }
    await assertCurrent(state.record);
    const next = await encryptEntries(state.record, entries, state.bytes);
    assertVaultGeneration(epoch); await trustedRequest(message.requestId, sender);
    if (manual) await assertDocument(request);
    // Serialize consumption and the local mutation; repeated confirmation cannot save twice.
    await removeStorage('session', `${PREFIX}${message.requestId}`);
    try { await commitRecord(next, state.record.revision); await activate(next, entries, state.bytes, epoch); }
    catch (error) {
      // A post-commit session/publication error must not resurrect a save grant.
      if ((await readLocalVaultRecordRaw().catch(() => null))?.revision === next.revision) {
        if (request.candidateId) await removeCandidate(request.candidateId).catch(() => {});
        if (manual) await notifyCancellation(request, message.requestId, 'saved');
        return { saved: true, action: message.saveAction, unlockRequired: true };
      }
      if (vaultGeneration() === epoch && request.expires > Date.now()) await setStorage('session', { [`${PREFIX}${message.requestId}`]: request }).catch(() => {});
      throw error;
    }
    if (request.candidateId) await removeCandidate(request.candidateId).catch(() => {});
    if (manual) await notifyCancellation(request, message.requestId, 'saved');
    return { saved: true, action: message.saveAction };
  });
}
export async function completeRequest(message, sender) {
  const request = await trustedRequest(message.requestId, sender);
  if (request.kind === 'save') return completeSave(message, sender);
  if (message.action === 'add') return completeSave(message, sender, true);
  return withVaultOperation(async epoch => {
    const current = await trustedRequest(message.requestId, sender);
    await assertDocument(current);
    if (message.action && message.action !== 'fill') {
      if (!['generate', 'copy', 'save-entered'].includes(message.action)) throw new Error('Unknown password tool.');
      if (['copy', 'save-entered'].includes(message.action) && !current.hasPassword) throw new Error('Enter a password on the website first.');
      await removeStorage('session', `${PREFIX}${message.requestId}`);
      assertVaultGeneration(epoch);
      const reply = await chrome.tabs.sendMessage(current.tabId, { type: 'AUTOFILL_TOOL', requestId: message.requestId, targetId: current.targetId, origin: current.origin, tool: message.action }, { documentId: current.documentId });
      if (!reply?.ok) throw new Error('The original field is no longer available. Open SecurePass again.');
      return { tool: message.action };
    }
    await requireVault();
    const entry = (await listCredentials()).find(entry => entry.id === message.credentialId && matchesOrigin(entry.site, current.origin));
    if (!entry) throw new Error('Credential not available for this origin.');
    await trustedRequest(message.requestId, sender);
    assertVaultGeneration(epoch);
    await removeStorage('session', `${PREFIX}${message.requestId}`);
    assertVaultGeneration(epoch);
    const reply = await chrome.tabs.sendMessage(current.tabId, { type: 'AUTOFILL_RESULT', requestId: message.requestId, targetId: current.targetId, origin: current.origin, entry: { username: entry.username, password: entry.password } }, { documentId: current.documentId });
    if (!reply?.ok) throw new Error('The original field is no longer available. Open SecurePass again.');
  });
}
export async function cancelRequest(message, sender) {
  const request = await trustedRequest(message.requestId, sender);
  await removeStorage('session', `${PREFIX}${message.requestId}`); await notifyCancellation(request, message.requestId);
}
export async function closeRequestsForTab(tabId) {
  const all = await getStorage('session', null);
  for (const [key, request] of Object.entries(all)) if (key.startsWith(PREFIX) && request.authTabId === tabId) {
    await removeStorage('session', key); await notifyCancellation(request, key.slice(PREFIX.length));
  }
}
export async function clearRequests() {
  const all = await getStorage('session', null); const keys = Object.keys(all).filter(key => key.startsWith(PREFIX));
  if (keys.length) await removeStorage('session', keys);
}
export function listForOrigin(_message, sender) {
  return withVaultLock(async () => {
    const origin = senderOrigin(sender);
    try {
      const entries = (await requireVault()).entries.filter(entry => matchesOrigin(entry.site, origin));
      return { entries: entries.map(entry => ({ id: entry.id, username: entry.username, site: entry.site })), unlocked: true };
    } catch (error) {
      if (error.message.includes('locked') || error.message.includes('not initialized')) return { entries: [], unlocked: false };
      throw error;
    }
  });
}
