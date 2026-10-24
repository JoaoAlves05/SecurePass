import { getStorage, setStorage, removeStorage } from '../utils/storage.js';
import { senderOrigin } from '../security/origins.js';
import { validateEntry } from '../validation.js';
import { requireVault } from '../cryptoVault.js';
import { createRequest } from './requests.js';

const PREFIX = 'candidate:';
export async function listCandidates() {
  const all = await getStorage('session', null);
  const keys = Object.keys(all).filter(key => key.startsWith(PREFIX));
  const expired = keys.filter(key => all[key].expires <= Date.now());
  if (expired.length) await removeStorage('session', expired);
  const candidates = keys.filter(key => !expired.includes(key)).map(key => ({ id: key.slice(PREFIX.length), site: all[key].entry.site, username: all[key].entry.username }));
  await chrome.action.setBadgeText({ text: candidates.length ? String(candidates.length) : '' });
  if (candidates.length) await chrome.alarms.create('candidateCleanup', { when: Math.min(...keys.filter(key => !expired.includes(key)).map(key => all[key].expires)) });
  return { candidates };
}
export async function proposeCandidate(message, sender) {
  const origin = senderOrigin(sender);
  const entry = validateEntry({ ...message.entry, site: origin });
  try {
    const state = await requireVault();
    if (state.entries.some(e => e.site === origin && e.username === entry.username && e.password === entry.password)) return {};
  } catch (error) { if (!/locked|not initialized/.test(error.message)) throw error; }
  const current = (await listCandidates()).candidates;
  // Bound volatile secrets and replace older suggestions for this account.
  const previous = current.filter(e => e.site === entry.site && e.username === entry.username);
  if (previous.length) await removeStorage('session', previous.map(e => `${PREFIX}${e.id}`));
  if (current.length >= 8 && !previous.length) return {};
  const id = crypto.randomUUID();
  await setStorage('session', { [`${PREFIX}${id}`]: { entry, expires: Date.now() + 300000, sender: { id: sender.id, tab: { id: sender.tab.id }, frameId: sender.frameId, documentId: sender.documentId, url: sender.url, origin: sender.origin } } });
  await listCandidates();
  return {};
}
export async function reviewCandidate(message) {
  const key = `${PREFIX}${message.candidateId}`;
  const candidate = (await getStorage('session', key))[key];
  if (!candidate || candidate.expires <= Date.now()) throw new Error('Save suggestion expired.');
  const response = await createRequest({ entry: candidate.entry }, candidate.sender, 'save');
  await removeStorage('session', key); await listCandidates();
  return response;
}
export async function dismissCandidate(message) {
  await removeStorage('session', `${PREFIX}${message.candidateId}`); return listCandidates();
}
export async function clearCandidates() {
  const all = await getStorage('session', null);
  const keys = Object.keys(all).filter(key => key.startsWith(PREFIX));
  if (keys.length) await removeStorage('session', keys);
  await chrome.action.setBadgeText({ text: '' });
  await chrome.alarms.clear('candidateCleanup');
}
