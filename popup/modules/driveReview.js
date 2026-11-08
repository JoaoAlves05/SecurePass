import { checked, runManagement } from './management.js';
import { showToast } from './toast.js';

const $ = id => document.getElementById(id);
const clientId = crypto.randomUUID();
let sequence = 0; let statusSequence = 0; let token = null; let busy = false; let committing = false; let review = null; let focusAfter = null;
const PAGE_SIZE = 8;
let conflictPage = 0; let choices = new Map();
const request = (type, payload = {}) => checked(type, { clientId, ...payload });
function matchingConflicts() {
  const query = $('driveConflictSearch').value.toLowerCase().trim();
  return (review?.conflicts || []).filter(item => !query || [item.local?.site, item.local?.username, item.remote?.site, item.remote?.username].join(' ').toLowerCase().includes(query));
}
function bulkCandidates() {
  const policy = $('driveBulkChoice').value;
  return matchingConflicts().filter(item => !choices.has(item.id) && (policy !== 'both' || item.local && item.remote));
}
function choiceStatus() {
  const matches = matchingConflicts();
  $('driveConflictRange').textContent = `${matches.length ? conflictPage * PAGE_SIZE + 1 : 0}–${Math.min((conflictPage + 1) * PAGE_SIZE, matches.length)} of ${matches.length} conflicts. ${choices.size} of ${review?.conflicts.length || 0} choices completed.`;
  $('driveConflictPrevious').disabled = busy || conflictPage === 0;
  $('driveConflictNext').disabled = busy || (conflictPage + 1) * PAGE_SIZE >= matches.length;
  const eligible = $('driveBulkChoice').value ? bulkCandidates().length : 0;
  $('driveBulkApply').textContent = eligible ? `Apply to ${eligible} ${eligible === 1 ? 'conflict' : 'conflicts'}` : 'Apply choice';
  $('driveBulkApply').disabled = busy || !eligible;
}
function message(text, error = false) {
  $('driveReviewMessage').textContent = text;
  $('driveReviewMessage').setAttribute('role', error ? 'alert' : 'status');
  if (error) { $('driveReviewMessage').tabIndex = -1; focusAfter = $('driveReviewMessage'); }
}
function controls() {
  $('inspectDriveCopies').disabled = busy;
  $('compareDriveCopy').disabled = busy;
  $('driveCopies').disabled = busy;
  $('commitDriveReview').disabled = busy;
  $('cancelDriveReview').disabled = committing;
  $('driveReviewPanel').setAttribute('aria-busy', String(busy));
  $('driveReviewForm').querySelectorAll('select').forEach(select => { select.disabled = busy; });
  $('driveConflictSearch').disabled = busy;
  choiceStatus();
}
function cancel({ focus = true, invalidate = true } = {}) {
  if (token) request('DRIVE_REVIEW_CANCEL', { token }).catch(() => {});
  token = null; review = null; choices = new Map(); conflictPage = 0; focusAfter = null; if (invalidate) sequence++;
  $('driveConflictSearch').value = ''; $('driveBulkChoice').value = ''; $('driveConflictTools').hidden = true;
  $('driveConflicts').replaceChildren(); $('driveCopies').replaceChildren(); $('driveReviewSummary').textContent = ''; $('driveConflictRange').textContent = '';
  $('driveReviewForm').hidden = true; $('driveCopySelection').hidden = true; $('driveReviewPanel').hidden = true;
  $('inspectDriveCopies').hidden = false; message('');
  if (focus && !$('driveMergeTools').hidden) { if (busy) focusAfter = $('inspectDriveCopies'); else $('inspectDriveCopies').focus(); }
}
async function refresh() {
  if (busy) return;
  const current = ++statusSequence;
  try {
    const result = await request('DRIVE_REVIEW_STATUS');
    if (current !== statusSequence || busy) return;
    $('driveMergeTools').hidden = !result.review.available;
    if (!result.review.available) cancel({ focus: false });
  } catch { if (current === statusSequence) { cancel({ focus: false }); $('driveMergeTools').hidden = true; } }
}
function run(kind, task) {
  return runManagement(async () => {
    busy = true; committing = kind === 'commit'; controls();
    const current = ++sequence;
    try { await task(current); }
    catch (error) { if (current === sequence) message(error.message || 'Could not review this copy. Cancel and inspect again.', true); }
    finally { busy = false; committing = false; controls(); if (focusAfter?.isConnected && !$('driveMergeTools').hidden) focusAfter.focus(); focusAfter = null; }
  });
}
function renderReview(value) {
  review = value; $('driveReviewForm').hidden = false; $('driveCopySelection').hidden = true;
  choices = new Map(); conflictPage = 0; $('driveConflictSearch').value = ''; $('driveBulkChoice').value = '';
  $('driveConflictTools').hidden = value.conflicts.length <= PAGE_SIZE;
  $('driveReviewSummary').textContent = `${value.automatic} ${value.automatic === 1 ? 'login combines' : 'logins combine'} automatically. ${value.deleted} ${value.deleted === 1 ? 'deletion is' : 'deletions are'} preserved. ${value.conflicts.length ? `${value.conflicts.length} ${value.conflicts.length === 1 ? 'conflict needs' : 'conflicts need'} your choice.` : 'No conflicts need a choice.'}`;
  renderConflicts();
  message('Choose what to keep, then save the combined vault.');
  focusAfter = $('driveReviewTitle');
}
function renderConflicts() {
  const matches = matchingConflicts(); conflictPage = Math.min(conflictPage, Math.max(0, Math.ceil(matches.length / PAGE_SIZE) - 1));
  const container = $('driveConflicts'); container.replaceChildren();
  for (const [index, conflict] of matches.slice(conflictPage * PAGE_SIZE, (conflictPage + 1) * PAGE_SIZE).entries()) {
    const group = document.createElement('fieldset'); group.className = 'drive-review-conflict';
    const legend = document.createElement('legend'); legend.textContent = conflict.local?.username || conflict.remote?.username || conflict.local?.site || conflict.remote?.site || 'Deleted login'; group.append(legend);
    for (const [side, title] of [['local', 'This device'], ['remote', 'Drive copy']]) {
      const details = document.createElement('p'); const label = document.createElement('strong'); label.textContent = `${title}: `;
      const entry = conflict[side]; details.append(label, document.createTextNode(entry ? `${entry.site} · ${entry.username || 'No username'}` : 'Deleted')); group.append(details);
    }
    const differences = document.createElement('p'); differences.className = 'settings-info';
    differences.textContent = [conflict.passwordChanged ? 'Passwords differ.' : '', conflict.notesChanged ? 'Notes differ.' : '', conflict.type === 'delete-edit' ? 'Choose the surviving login or keep the deletion.' : 'Each choice keeps one complete version.'].filter(Boolean).join(' '); group.append(differences);
    const label = document.createElement('label'); const select = document.createElement('select');
    select.id = `driveDecision-${index}`; select.dataset.entryId = conflict.id; select.required = true;
    label.htmlFor = select.id; label.textContent = 'Keep'; group.append(label);
    const options = [['', 'Choose a version…'], ['local', conflict.local ? 'This device’s version' : 'Deletion on this device'], ['remote', conflict.remote ? 'Drive version' : 'Deletion from Drive']];
    if (conflict.local && conflict.remote) options.push(['both', 'Both as separate logins']);
    for (const [value, text] of options) { const option = document.createElement('option'); option.value = value; option.textContent = text; select.append(option); }
    select.value = choices.get(conflict.id) || '';
    select.addEventListener('change', () => { if (select.value) choices.set(conflict.id, select.value); else choices.delete(conflict.id); choiceStatus(); });
    group.append(select); container.append(group);
  }
  if (!matches.length && review?.conflicts.length) { const empty = document.createElement('p'); empty.textContent = 'No matching conflicts. Your choices are kept.'; container.append(empty); }
  choiceStatus();
}
export function attachDriveReviewListeners() {
  $('inspectDriveCopies').addEventListener('click', () => run('inspect', async current => {
    cancel({ focus: false, invalidate: false });
    $('driveReviewPanel').hidden = false; $('inspectDriveCopies').hidden = true; $('driveReviewTitle').focus();
    message('Checking signed Drive copies…'); token = crypto.randomUUID();
    const result = await request('DRIVE_REVIEW_INSPECT', { token });
    if (current !== sequence) return;
    token = null;
    message(result.copies.length ? `${result.copies.length} verified ${result.copies.length === 1 ? 'copy is' : 'copies are'} available.${result.issues ? ` ${result.issues} unverified copies were skipped.` : ''}` : `No other verified copies found.${result.issues ? ` ${result.issues} copies could not be verified. Your local vault is unchanged.` : ''}`);
    for (const copy of result.copies) {
      const option = document.createElement('option'); option.value = copy.revision; option.textContent = `${copy.entryCount} ${copy.entryCount === 1 ? 'login' : 'logins'} · ${new Date(copy.updatedAt).toLocaleString()}`; $('driveCopies').append(option);
    }
    $('driveCopySelection').hidden = !result.copies.length;
    if (result.copies.length) focusAfter = $('driveCopies');
  }));
  $('compareDriveCopy').addEventListener('click', () => run('preview', async current => {
    if (!$('driveCopies').value) return;
    message('Comparing this copy with your vault…'); token = crypto.randomUUID();
    const value = await request('DRIVE_REVIEW_PREVIEW', { revision: $('driveCopies').value, token });
    if (current !== sequence) return;
    renderReview(value);
  }));
  $('driveReviewForm').addEventListener('submit', event => {
    event.preventDefault(); if (busy || !review || !$('driveReviewForm').reportValidity()) return;
    if (choices.size !== review.conflicts.length) {
      $('driveConflictSearch').value = '';
      conflictPage = Math.floor(review.conflicts.findIndex(item => !choices.has(item.id)) / PAGE_SIZE); renderConflicts();
      message('Choose what to keep for every conflict before saving.', true); $('driveConflicts').querySelector('select:invalid')?.focus(); return;
    }
    const decisions = Object.fromEntries(choices);
    run('commit', async current => {
      message('Saving your choices…');
      await request('DRIVE_REVIEW_COMMIT', { token, decisions });
      if (current !== sequence) return;
      token = null; cancel(); showToast('Combined vault saved. Changes are queued; Drive sending is paused.', 'success');
    });
  });
  $('driveConflictSearch').addEventListener('input', () => { conflictPage = 0; renderConflicts(); });
  $('driveConflictSearch').addEventListener('keydown', event => { if (event.key === 'Enter') event.preventDefault(); });
  $('driveBulkChoice').addEventListener('change', choiceStatus);
  $('driveBulkApply').addEventListener('click', () => { for (const item of bulkCandidates()) choices.set(item.id, $('driveBulkChoice').value); renderConflicts(); message('Choices applied to matching unresolved conflicts. Review them before saving.'); });
  for (const [id, step] of [['driveConflictPrevious', -1], ['driveConflictNext', 1]]) $(id).addEventListener('click', () => { conflictPage += step; renderConflicts(); $('driveConflicts').querySelector('select')?.focus(); });
  $('cancelDriveReview').addEventListener('click', () => { if (!committing) cancel(); });
  document.addEventListener('vault-ui-locked', () => { statusSequence++; cancel({ focus: false }); $('driveMergeTools').hidden = true; });
  document.addEventListener('management-refresh', () => refresh());
  document.addEventListener('vault-ui-state', () => refresh());
  document.addEventListener('settings-section-changed', event => { if (event.detail.id === 'advancedSection') refresh(); });
  document.addEventListener('google-connection-changed', event => { if (!event.detail.connected) { cancel({ focus: false }); $('driveMergeTools').hidden = true; } else refresh(); });
  chrome.storage.onChanged.addListener((changes, area) => { if (area === 'local' && changes.googleDriveConnection) { cancel({ focus: false }); $('driveMergeTools').hidden = true; refresh(); } });
  window.addEventListener('pagehide', () => cancel({ focus: false }));
  refresh();
}
