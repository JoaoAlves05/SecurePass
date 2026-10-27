import { state } from '../state.js';
import { checked, runManagement } from './management.js';
import { ensureVaultAccessible } from './vault.js';
import { requestOperation } from './operationDialog.js';
import { showToast } from './toast.js';

const $ = id => document.getElementById(id);
const clientId = crypto.randomUUID();
const request = (type, data = {}) => checked(type, { ...data, clientId });
const account = entry => `${entry.site}${entry.username ? ` · ${entry.username}` : ''}`;
const website = value => { try { return new URL(value).hostname; } catch { return value; } };
const date = value => value && Number.isFinite(new Date(value).getTime()) ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'medium' }).format(new Date(value)) : 'Date unavailable';
const changedFields = entry => entry.fields.join(', ');
let review = null;
let generation = 0;

function closeReview(focus = false) {
  generation++;
  const previous = review;
  review = null;
  $('checkpointReview').hidden = true;
  delete $('backupsSection').dataset.checkpointReview;
  $('checkpointReviewEntries').replaceChildren();
  for (const id of ['checkpointReviewDate', 'checkpointReviewSummary', 'checkpointReviewEmpty', 'checkpointReviewWarningText', 'checkpointMatchingCount']) $(id).textContent = '';
  $('checkpointReviewSearch').value = '';
  $('checkpointShowMatching').checked = false;
  if (!previous) return;
  const scroller = $('backupsSection').closest('.settings-scroll-container');
  scroller.scrollTop = previous.returnScroll;
  if (focus) requestAnimationFrame(() => {
    const buttons = [...$('snapshotList').querySelectorAll('[data-snapshot-action="review"]')];
    const target = buttons.find(button => button.dataset.snapshotId === previous.selected.id) || buttons[0] || $('settingsTitle');
    target.focus({ preventScroll: true }); target.scrollIntoView({ block: 'nearest' });
  });
}

function setBusy(current, busy) {
  if (review !== current) return;
  current.busy = busy;
  $('checkpointReview').setAttribute('aria-busy', String(busy));
  for (const button of $('checkpointReview').querySelectorAll('button')) button.disabled = busy;
  for (const input of $('checkpointReview').querySelectorAll('input')) input.disabled = busy;
  for (const button of $('checkpointReviewEntries').querySelectorAll('[data-recover-entry]')) button.disabled = busy || current.stale;
  $('checkpointReviewFullRestore').disabled = busy || current.stale || !hasDifferences(current.data);
}

function hasDifferences(data) { return Boolean(data.missing || data.changed || data.newer); }

function warn(current, message) {
  if (review !== current) return;
  current.stale = true;
  $('checkpointReviewWarningText').textContent = message;
  $('checkpointReviewWarning').hidden = false;
  setBusy(current, current.busy);
}

async function checkFreshness() {
  const current = review;
  if (!current || current.busy) return;
  try {
    const { status } = await checked('VAULT_STATUS');
    if (review !== current) return;
    if (!status.unlocked) { closeReview(); return; }
    if (status.revision !== current.data.revision) warn(current, 'Your vault changed. Refresh this comparison before recovering anything.');
  } catch (error) { warn(current, error.message); }
}

function renderEntries(current) {
  if (review !== current) return;
  const list = $('checkpointReviewEntries'); list.replaceChildren();
  const query = current.query.toLocaleLowerCase();
  const priority = { missing: 0, changed: 1, newer: 2, unchanged: 3 };
  const entries = [...current.data.entries, ...current.data.newerEntries.map(entry => ({ ...entry, change: 'newer', fields: [] }))]
    .filter(entry => (current.matching || entry.change !== 'unchanged') && account(entry).toLocaleLowerCase().includes(query))
    .sort((a, b) => priority[a.change] - priority[b.change] || account(a).localeCompare(account(b)));
  for (const entry of entries.slice(0, current.limit)) {
    const row = document.createElement('article'); row.className = 'checkpoint-review-entry'; row.dataset.reviewEntryId = entry.id; row.dataset.change = entry.change;
    const copy = document.createElement('div'); copy.className = 'checkpoint-review-entry-copy';
    const title = document.createElement('h5'); title.textContent = website(entry.site); title.title = entry.site; title.tabIndex = -1;
    const username = document.createElement('p'); username.className = 'row-sub'; username.textContent = entry.username || 'No username';
    const description = document.createElement('p'); description.className = 'checkpoint-entry-state';
    description.textContent = entry.change === 'missing' ? 'Deleted entry'
      : entry.change === 'changed' ? `Different ${changedFields(entry)}`
        : entry.change === 'newer' ? 'Added later · removed by full restore' : 'Matches your current vault';
    copy.append(title, username, description); row.append(copy);
    if (['missing', 'changed'].includes(entry.change)) {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'secondary compact-btn'; button.dataset.recoverEntry = entry.id;
      button.textContent = entry.change === 'missing' ? 'Recover entry' : 'Restore details';
      button.setAttribute('aria-label', `${button.textContent} for ${account(entry)}`);
      button.disabled = current.stale || current.busy;
      button.addEventListener('click', () => recoverEntry(current, entry)); row.append(button);
    }
    list.append(row);
  }
  const empty = $('checkpointReviewEmpty'); empty.hidden = Boolean(entries.length);
  empty.textContent = current.query ? 'No entries match your search.' : hasDifferences(current.data)
    ? 'No differing saved entries to recover.' : 'This checkpoint matches your current vault. There is nothing to recover.';
  $('checkpointReviewMore').hidden = entries.length <= current.limit;
  $('checkpointReviewMore').textContent = `Show ${Math.min(50, Math.max(0, entries.length - current.limit))} more entries`;
}

async function unlockOlder(selected) {
  const { status } = await checked('VAULT_STATUS');
  return requestOperation({
    layout: 'recovery', title: 'Unlock older checkpoint', description: 'Use its previous master password once to update its protection. You can then review it with your current vault.',
    details: [{ label: 'Checkpoint', value: date(selected.updatedAt) }],
    fields: [{ name: 'password', label: 'Previous master password', type: 'password' }],
    confirmLabel: 'Unlock checkpoint', busyLabel: 'Updating protection…',
    submit: values => checked('UNLOCK_CHECKPOINT', { id: selected.id, passphrase: values.password, expectedRevision: status.revision })
  });
}

export async function reviewCheckpoint(selected, options = {}) {
  const expected = ++generation;
  if (!await ensureVaultAccessible('Unlock your current vault to review this checkpoint.')) return;
  if (expected !== generation) return;
  let latest = (await checked('RECOVERY_ARCHIVE_STATUS')).snapshots.find(item => item.id === selected.id && item.source === 'Local');
  if (!latest) throw new Error('This checkpoint is no longer available. Return to the saved checkpoints.');
  if (latest.needsPassword) {
    const unlocked = await unlockOlder(latest);
    if (!unlocked || expected !== generation) return;
    latest = { ...latest, id: unlocked.id };
  }
  const preview = await request('PREVIEW_CHECKPOINT', { id: latest.id, mode: 'entry' });
  try {
    if (expected !== generation || !state.vaultUnlocked) return;
    if (typeof preview.revision !== 'string' || typeof preview.sourceDigest !== 'string') throw new Error('Reload SecurePass before reviewing checkpoints.');
    const { token: _token, ...data } = preview;
    const scroller = $('backupsSection').closest('.settings-scroll-container');
    const returnScroll = options.returnScroll ?? review?.returnScroll ?? scroller.scrollTop;
    review = { selected: latest, data, query: options.query || '', matching: Boolean(options.matching), limit: options.limit || 50, returnScroll, busy: false, stale: false, openingManaged: Boolean(options.managed) };
    $('backupsSection').dataset.checkpointReview = 'true'; $('checkpointReview').hidden = false;
    $('checkpointReviewDate').textContent = date(latest.updatedAt);
    $('checkpointReviewSummary').textContent = [`${data.count} saved`, data.missing && `${data.missing} deleted`, data.changed && `${data.changed} with different details`, data.newer && `${data.newer} added later`].filter(Boolean).join(' · ');
    $('checkpointReviewWarning').hidden = true;
    $('checkpointReviewSearch').value = review.query;
    const matching = data.entries.filter(entry => entry.change === 'unchanged').length;
    $('checkpointMatchingLabel').hidden = !matching;
    $('checkpointMatchingCount').textContent = `(${matching})`;
    $('checkpointShowMatching').checked = review.matching;
    $('checkpointReviewFullHelp').hidden = hasDifferences(data);
    renderEntries(review); setBusy(review, review.openingManaged);
    if (options.focus !== false) { scroller.scrollTop = 0; $('checkpointReviewTitle').focus({ preventScroll: true }); }
  } finally { await request('CANCEL_CHECKPOINT_PREVIEW', { token: preview.token }).catch(() => {}); }
}

async function freshPreview(current, mode) {
  let preview;
  try { preview = await request('PREVIEW_CHECKPOINT', { id: current.selected.id, mode }); }
  catch (error) { warn(current, error.message); return null; }
  if (review !== current || current.data.revision !== preview.revision || current.data.sourceDigest !== preview.sourceDigest) {
    await request('CANCEL_CHECKPOINT_PREVIEW', { token: preview.token }).catch(() => {});
    if (review === current) warn(current, 'Your vault or checkpoint changed. Refresh this comparison before recovering anything.');
    return null;
  }
  return preview;
}

async function recoverEntry(current, entry) {
  if (review !== current || current.busy || current.stale) return;
  setBusy(current, true);
  let result;
  try {
    result = await runManagement(async () => {
      const preview = await freshPreview(current, 'entry'); if (!preview) return;
      try {
        return await requestOperation({
          layout: 'checkpoint', title: entry.change === 'missing' ? 'Recover deleted entry' : 'Restore saved entry',
          description: 'Only this entry will change. Your other entries, master password and biometric setup stay the same.',
          details: [{ label: 'Website', value: entry.site }, { label: 'Username', value: entry.username || 'None' }, { label: 'Changes', value: entry.change === 'missing' ? 'Add this deleted entry' : changedFields(entry) }],
          notice: { title: 'Before you recover', text: 'Your current contents are kept in a checkpoint. Your existing Sync setting applies.' },
          confirmLabel: entry.change === 'missing' ? 'Recover entry' : 'Restore saved details', busyLabel: 'Recovering…',
          submit: () => request('RECOVER_CHECKPOINT', { token: preview.token, entryId: entry.id })
        });
      } finally { await request('CANCEL_CHECKPOINT_PREVIEW', { token: preview.token }).catch(() => {}); }
    });
    if (result && review === current) {
      showToast(result.unchanged ? 'This entry already matches your vault.' : 'Entry recovered. Your other entries are unchanged.', 'success');
      const scroller = $('backupsSection').closest('.settings-scroll-container'); const top = scroller.scrollTop;
      try {
        await reviewCheckpoint(current.selected, { ...current, focus: false });
        if (review) {
          scroller.scrollTop = top;
          ($('checkpointReviewEntries').querySelector('button') || $('checkpointReviewTitle')).focus({ preventScroll: true });
        }
      } catch { closeReview(true); }
    }
  } catch (error) { warn(current, error.message); }
  finally {
    if (review === current) {
      setBusy(current, false);
      if (!result) (current.stale ? $('checkpointReviewRefresh') : $('checkpointReviewEntries').querySelector(`[data-recover-entry="${CSS.escape(entry.id)}"]`) || $('checkpointReviewSearch')).focus({ preventScroll: true });
      checkFreshness();
    }
  }
}

async function restoreWhole(current) {
  if (review !== current || current.busy || current.stale || !hasDifferences(current.data)) return;
  setBusy(current, true);
  try {
    const result = await runManagement(async () => {
      const preview = await freshPreview(current, 'vault'); if (!preview) return;
      try {
        return await requestOperation({
          layout: 'checkpoint', title: 'Restore whole vault',
          description: 'Replace all current entries with this checkpoint. Your master password and biometric setup stay the same.',
          details: [{ label: 'Checkpoint', value: date(current.selected.updatedAt) }, { label: 'Saved entries', value: String(preview.count) }, { label: 'To recover', value: String(preview.missing) }, { label: 'Older details', value: String(preview.changed) }, { label: 'To remove', value: String(preview.newer), danger: preview.newer > 0 }],
          changes: [...preview.entries.filter(entry => entry.change !== 'unchanged').map(entry => ({ title: account(entry), text: entry.change === 'missing' ? 'Will be recovered' : `Will restore saved ${changedFields(entry)}` })), ...preview.newerEntries.map(entry => ({ title: account(entry), text: 'Will be removed by full restore' }))].slice(0, 20),
          notice: { title: 'Before you restore', text: 'Your current contents become a checkpoint. Automatic Sync turns off; remote copies stay unchanged.' },
          confirmLabel: 'Restore whole vault', busyLabel: 'Restoring…', danger: true,
          submit: () => request('RECOVER_CHECKPOINT', { token: preview.token })
        });
      } finally { await request('CANCEL_CHECKPOINT_PREVIEW', { token: preview.token }).catch(() => {}); }
    });
    if (result && review === current) {
      closeReview(true);
      showToast(result.unchanged ? 'Your vault contents are unchanged.' : 'Vault contents restored. Your master password is unchanged; Sync is off.', 'success');
    }
  } catch (error) { warn(current, error.message); }
  finally { if (review === current) { setBusy(current, false); (current.stale ? $('checkpointReviewRefresh') : $('checkpointReviewFullRestore')).focus({ preventScroll: true }); checkFreshness(); } }
}

export function attachCheckpointReviewListeners() {
  $('checkpointReviewBack').addEventListener('click', () => closeReview(true));
  $('checkpointReviewSearch').addEventListener('input', event => { if (review) { review.query = event.target.value; review.limit = 50; renderEntries(review); } });
  $('checkpointReviewSearch').addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !event.target.value || !review) return;
    event.preventDefault(); event.stopPropagation(); event.target.value = ''; review.query = ''; renderEntries(review);
  });
  $('checkpointShowMatching').addEventListener('change', event => { if (review) { review.matching = event.target.checked; review.limit = 50; renderEntries(review); } });
  $('checkpointReviewMore').addEventListener('click', () => {
    if (!review) return;
    const previous = review.limit; review.limit += 50; renderEntries(review);
    const rows = $('checkpointReviewEntries').querySelectorAll('h5'); rows[previous]?.focus({ preventScroll: true });
  });
  $('checkpointReviewFullRestore').addEventListener('click', () => { if (review) restoreWhole(review); });
  $('checkpointReviewRefresh').addEventListener('click', async () => {
    const current = review; if (!current || current.busy) return;
    setBusy(current, true);
    await runManagement(async () => {
      try { await reviewCheckpoint(current.selected, { ...current, managed: true }); }
      catch (error) { warn(current, error.message); }
      finally { if (review === current) setBusy(current, false); }
    });
  });
  document.addEventListener('settings-back', event => {
    if (!review) return;
    event.preventDefault(); event.stopImmediatePropagation(); closeReview(true);
  });
  document.addEventListener('settings-section-changed', event => { if (event.detail.id !== 'backupsSection') closeReview(); });
  document.addEventListener('settings-closed', () => closeReview());
  document.addEventListener('vault-ui-locked', () => closeReview());
  document.addEventListener('management-refresh', () => {
    if (review?.openingManaged) { review.openingManaged = false; setBusy(review, false); }
    checkFreshness();
  });
  document.addEventListener('vault-ui-state', checkFreshness);
  window.addEventListener('pagehide', () => closeReview());
}
