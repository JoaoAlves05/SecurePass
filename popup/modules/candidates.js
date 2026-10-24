import { sendMessage } from './messaging.js';
import { showToast } from './toast.js';
export async function refreshCandidates() {
  const container = document.getElementById('saveCandidates');
  const response = await sendMessage('LIST_SAVE_CANDIDATES');
  container.replaceChildren();
  if (!response.ok) return;
  for (const candidate of response.candidates) {
    const row = document.createElement('div'); row.className = 'card';
    const text = document.createElement('p'); text.textContent = `Save or update ${candidate.username || 'account'} on ${candidate.site}?`;
    const review = document.createElement('button'); review.type = 'button'; review.textContent = 'Review saved account suggestion';
    review.addEventListener('click', async () => { const result = await sendMessage('REVIEW_SAVE_CANDIDATE', { candidateId: candidate.id }); if (!result.ok) showToast(result.error, 'error'); await refreshCandidates(); });
    const dismiss = document.createElement('button'); dismiss.type = 'button'; dismiss.textContent = 'Dismiss';
    dismiss.addEventListener('click', async () => { await sendMessage('DISMISS_SAVE_CANDIDATE', { candidateId: candidate.id }); await refreshCandidates(); });
    row.append(text, review, dismiss); container.append(row);
  }
}
