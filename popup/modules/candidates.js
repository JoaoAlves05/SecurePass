import { sendMessage } from './messaging.js';
import { showToast } from './toast.js';
let sequence = 0; let attached = false;
export async function refreshCandidates() {
  const ticket = ++sequence; const container = document.getElementById('saveCandidates');
  const response = await sendMessage('LIST_SAVE_CANDIDATES'); if (ticket !== sequence) return;
  const focused = container.contains(document.activeElement) ? { id: document.activeElement.closest('[data-candidate-id]')?.dataset.candidateId, action: document.activeElement.dataset.action } : null;
  container.replaceChildren(); if (!response.ok) return;
  for (const candidate of response.candidates) {
    const row = document.createElement('article'); row.className = 'save-candidate card'; row.dataset.candidateId = candidate.id;
    const heading = document.createElement('h2'); heading.textContent = 'Save this login?';
    const site = document.createElement('p'); site.className = 'save-candidate-site'; site.textContent = candidate.site;
    const account = document.createElement('p'); account.className = 'save-candidate-account'; account.textContent = candidate.username || 'No username detected';
    const note = document.createElement('p'); note.className = 'save-candidate-note'; note.textContent = 'Detected on form submission. No changes saved yet.';
    const actions = document.createElement('div'); actions.className = 'save-candidate-actions';
    const review = document.createElement('button'); review.type = 'button'; review.className = 'primary compact-btn'; review.textContent = 'Review login'; review.dataset.action = 'review';
    const dismiss = document.createElement('button'); dismiss.type = 'button'; dismiss.className = 'secondary compact-btn'; dismiss.textContent = 'Not now'; dismiss.dataset.action = 'dismiss';
    const act = async type => {
      review.disabled = dismiss.disabled = true; row.setAttribute('aria-busy', 'true');
      try {
        const result = await sendMessage(type, { candidateId: candidate.id }); if (!result.ok) throw new Error(result.error);
        if (type === 'REVIEW_SAVE_CANDIDATE') note.textContent = 'Continue in the SecurePass window. Confirm only if the login worked.';
        else { await refreshCandidates(); (container.querySelector('button') || document.querySelector('.nav-item[aria-selected="true"]'))?.focus(); }
      } catch (error) { showToast(error.message, 'error'); await refreshCandidates(); }
      finally { review.disabled = dismiss.disabled = false; row.removeAttribute('aria-busy'); }
    };
    review.addEventListener('click', () => act('REVIEW_SAVE_CANDIDATE')); dismiss.addEventListener('click', () => act('DISMISS_SAVE_CANDIDATE'));
    actions.append(dismiss, review); row.append(heading, site, account, note, actions); container.append(row);
    if (focused?.id === candidate.id) actions.querySelector(`[data-action="${focused.action}"]`)?.focus();
  }
}
export function attachCandidateListeners() {
  if (attached) return; attached = true;
  chrome.storage.onChanged.addListener((changes, area) => { if (area === 'session' && Object.keys(changes).some(key => key.startsWith('candidate:'))) refreshCandidates().catch(() => {}); });
  document.addEventListener('vault-ui-state', () => refreshCandidates().catch(() => {}));
}
