import { getStorage, setStorage, removeStorage } from '../utils/storage.js';
import { senderOrigin } from '../security/origins.js';
import { validateEntry } from '../validation.js';
import { requireVault, vaultGeneration, assertVaultGeneration } from '../cryptoVault.js';
import { createRequest } from './requests.js';
import { CANDIDATE_PREFIX as PREFIX, listCandidateMetadata, removeCandidate } from './candidateStore.js';
import { withVaultLock } from '../vault/queue.js';
let writes = Promise.resolve();
const reviewing = new Map();
export const listCandidates = listCandidateMetadata;
export async function proposeCandidate(message, sender) {
  const origin = senderOrigin(sender);
  const entry = validateEntry({ site: origin, username: message.entry?.username ?? '', password: message.entry?.password, notes: '' });
  try {
    const state = await withVaultLock(() => requireVault());
    if (state.entries.some(saved => saved.site === origin && saved.username === entry.username && saved.password === entry.password)) return { proposed: false };
  } catch (error) { if (!/locked|not initialized/.test(error.message)) throw error; }
  const epoch = vaultGeneration();
  const work = writes.catch(() => {}).then(async () => {
    assertVaultGeneration(epoch);
    const current = (await listCandidates()).candidates;
    const previous = current.filter(candidate => candidate.site === entry.site && candidate.username === entry.username);
    for (const candidate of previous) {
      const stored = (await getStorage('session', `${PREFIX}${candidate.id}`))[`${PREFIX}${candidate.id}`];
      if (stored?.entry.password === entry.password) return { proposed: false, candidateId: candidate.id };
    }
    if (previous.length) await removeStorage('session', previous.map(candidate => `${PREFIX}${candidate.id}`));
    if (current.length >= 8 && !previous.length) return { proposed: false };
    const id = crypto.randomUUID();
    assertVaultGeneration(epoch);
    await setStorage('session', { [`${PREFIX}${id}`]: { entry, expires: Date.now() + 300000, sender: { id: sender.id, tab: { id: sender.tab.id }, frameId: sender.frameId, documentId: sender.documentId, url: origin, origin } } });
    try { assertVaultGeneration(epoch); } catch (error) { await removeStorage('session', `${PREFIX}${id}`); throw error; }
    await listCandidates(); return { proposed: true, candidateId: id };
  });
  writes = work.catch(() => {}); return work;
}
export function reviewCandidate(message) {
  if (reviewing.has(message.candidateId)) return reviewing.get(message.candidateId);
  const work = (async () => {
    const all = await getStorage('session', null);
    const candidate = all[`${PREFIX}${message.candidateId}`];
    if (!candidate || candidate.expires <= Date.now()) throw new Error('This suggestion expired. Submit the login again or save it from the website’s key button.');
    const existing = Object.entries(all).find(([key, request]) => key.startsWith('autofill:') && request.candidateId === message.candidateId && request.expires > Date.now());
    if (existing) {
      try {
        await chrome.tabs.update(existing[1].authTabId, { active: true });
        if (existing[1].authWindowId) await chrome.windows.update(existing[1].authWindowId, { focused: true });
        return { requestId: existing[0].slice('autofill:'.length) };
      } catch { await removeStorage('session', existing[0]); }
    }
    return createRequest({ entry: candidate.entry }, candidate.sender, 'save', { candidateId: message.candidateId });
  })();
  reviewing.set(message.candidateId, work);
  work.finally(() => reviewing.delete(message.candidateId)).catch(() => {}); return work;
}
export async function dismissCandidate(message) {
  const all = await getStorage('session', null);
  for (const [key, request] of Object.entries(all)) if (key.startsWith('autofill:') && request.candidateId === message.candidateId) {
    await removeStorage('session', key);
    await chrome.tabs.remove(request.authTabId).catch(() => {});
  }
  return removeCandidate(message.candidateId);
}
export async function inlineCandidate(message, sender, dismiss = false) {
  const origin = senderOrigin(sender);
  const candidate = (await getStorage('session', `${PREFIX}${message.candidateId}`))[`${PREFIX}${message.candidateId}`];
  if (!candidate || candidate.expires <= Date.now()) throw new Error('This suggestion expired. Submit the login again to review it.');
  if (candidate.entry.site !== origin || candidate.sender.tab.id !== sender.tab.id || candidate.sender.documentId !== sender.documentId) throw new Error('This suggestion belongs to a different document.');
  return dismiss ? dismissCandidate(message) : reviewCandidate(message);
}
export function clearCandidates() {
  const work = writes.catch(() => {}).then(async () => {
    const all = await getStorage('session', null);
    const keys = Object.keys(all).filter(key => key.startsWith(PREFIX));
    if (keys.length) await removeStorage('session', keys);
    await chrome.action.setBadgeText({ text: '' }); await chrome.alarms.clear('candidateCleanup');
  });
  writes = work.catch(() => {}); return work;
}
