import { getStorage, removeStorage } from '../utils/storage.js';
export const CANDIDATE_PREFIX = 'candidate:';
export async function listCandidateMetadata() {
  const all = await getStorage('session', null);
  const keys = Object.keys(all).filter(key => key.startsWith(CANDIDATE_PREFIX));
  const expired = keys.filter(key => !all[key]?.entry || !Number.isFinite(all[key].expires) || all[key].expires <= Date.now());
  if (expired.length) await removeStorage('session', expired);
  const active = keys.filter(key => !expired.includes(key));
  const candidates = active.map(key => ({ id: key.slice(CANDIDATE_PREFIX.length), site: all[key].entry.site, username: all[key].entry.username, expires: all[key].expires })).sort((a, b) => b.expires - a.expires);
  await chrome.action.setBadgeText({ text: candidates.length ? String(candidates.length) : '' });
  if (candidates.length) await chrome.alarms.create('candidateCleanup', { when: Math.min(...candidates.map(candidate => candidate.expires)) });
  else await chrome.alarms.clear('candidateCleanup');
  return { candidates };
}
export async function removeCandidate(id) {
  await removeStorage('session', `${CANDIDATE_PREFIX}${id}`);
  return listCandidateMetadata();
}
