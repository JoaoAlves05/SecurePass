import { state } from '../state.js';
import { checked, runManagement } from './management.js';
import { requestOperation } from './operationDialog.js';
import { ensureVaultAccessible } from './vault.js';
import { showToast } from './toast.js';
import { reviewCheckpoint, attachCheckpointReviewListeners } from './checkpointReview.js';

const $ = id => document.getElementById(id);
const date = value => value && Number.isFinite(new Date(value).getTime()) ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'medium' }).format(new Date(value)) : 'Date unavailable';
const plural = (count, word) => `${count} ${count === 1 ? word : word.endsWith('entry') ? word.replace(/entry$/, 'entries') : `${word}s`}`;
const account = entry => `${entry.site}${entry.username ? ` · ${entry.username}` : ''}`;

export function renderCheckpoints(snapshots) {
  const list = $('snapshotList');
  const focused = list.contains(document.activeElement) ? { id: document.activeElement.dataset.snapshotId, action: document.activeElement.dataset.snapshotAction, source: document.activeElement.dataset.snapshotSource } : null;
  list.replaceChildren();
  const localCount = snapshots.filter(item => item.source === 'Local').length;
  $('clearCheckpointHistory').hidden = !localCount;
  $('recoveryStatus').textContent = localCount
    ? `${plural(localCount, 'automatic checkpoint')}. Up to 3 previous states are kept on this device.`
    : 'No checkpoints yet. They are saved automatically when your vault contents change.';
  let archiveHeading = false;
  for (const [index, item] of snapshots.entries()) {
    const local = item.source === 'Local';
    if (!local && !archiveHeading) {
      archiveHeading = true;
      const heading = document.createElement('div'); heading.className = 'settings-group-heading';
      const title = document.createElement('h4'); title.textContent = 'Archived Sync copies';
      const text = document.createElement('p'); text.className = 'row-sub'; text.textContent = 'Separate from automatic checkpoints. These copies may keep older master passwords.';
      heading.append(title, text); list.append(heading);
    }
    const locked = local && (!state.vaultUnlocked || item.locked);
    const row = document.createElement('article'); row.className = 'snapshot-item card'; row.dataset.checkpointId = item.id;
    const heading = document.createElement('div'); heading.className = 'checkpoint-heading';
    const title = document.createElement('h4'); title.textContent = date(item.updatedAt);
    const tag = document.createElement('span'); tag.className = 'checkpoint-tag';
    tag.textContent = local ? index === 0 ? 'Latest checkpoint' : `${index + 1} states back` : 'Archived Chrome Sync';
    heading.append(title, tag);
    const description = document.createElement('p'); description.className = 'row-sub checkpoint-summary';
    description.textContent = !local ? 'Separate archived copy. It may require an older master password.'
      : locked ? 'Unlock your vault to see entry counts and compare this checkpoint.'
        : item.needsPassword ? 'Older protection or damaged data. Unlock with its previous master password before recovery or a password change.'
          : `${plural(item.count, 'entry')} saved${!item.count ? ' · Empty vault' : ''}`;
    row.append(heading, description);
    if (local && !locked && !item.needsPassword) {
      const differences = document.createElement('ul'); differences.className = 'checkpoint-differences';
      const lines = [item.missing ? `${plural(item.missing, 'deleted entry')} available to recover` : '', item.changed ? `${plural(item.changed, 'entry')} with older details` : '', item.newer ? `${plural(item.newer, 'entry')} added since this checkpoint` : ''].filter(Boolean);
      if (!lines.length) lines.push('Same contents as your current vault');
      for (const line of lines) { const li = document.createElement('li'); li.textContent = line; differences.append(li); }
      row.append(differences);
      if (item.examples?.length) {
        const examples = document.createElement('p'); examples.className = 'checkpoint-examples row-sub';
        examples.textContent = item.examples.map(entry => `${account(entry)}${entry.change === 'changed' ? ` (${entry.fields.join(', ')})` : ''}`).join(' · '); row.append(examples);
      }
    }
    const actions = document.createElement('div'); actions.className = 'snapshot-actions';
    const choices = local
      ? [['review', locked ? 'Unlock to review' : 'Review checkpoint'], ['export', 'Export'], ['remove', 'Remove']]
      : [['restore', 'Restore archived copy'], ['export', 'Export']];
    for (const [action, label] of choices) {
      const button = document.createElement('button'); button.type = 'button'; button.className = `${action === 'review' ? 'primary' : 'secondary'} compact-btn`;
      button.textContent = label; button.dataset.snapshotId = item.id; button.dataset.snapshotAction = action;
      button.dataset.snapshotSource = item.source;
      button.setAttribute('aria-label', `${label} · ${date(item.updatedAt)} · ${item.id.slice(0, 8)}`);
      if (focused?.id === item.id && focused.action === action && focused.source === item.source) button.dataset.restoreFocus = 'true';
      actions.append(button);
    }
    row.append(actions); list.append(row);
  }
  list.querySelector('[data-restore-focus]')?.focus({ preventScroll: true });
}

export async function handleCheckpointAction(selected, action) {
  if (action === 'review') return reviewCheckpoint(selected, { managed: true });
  if (action !== 'remove') return;
  return deleteHistory(selected);
}

async function deleteHistory(selected) {
  if (!await ensureVaultAccessible('Unlock your vault before removing recovery history.')) return;
  const { status } = await checked('VAULT_STATUS');
  const result = await requestOperation({
    layout: 'recovery',
    title: selected ? 'Remove checkpoint' : 'Clear checkpoint history',
    description: selected ? 'Delete this local recovery point. Your current vault is kept.' : 'Delete all local checkpoints. Your current vault, exported backups and archived Sync copies are kept. Future changes will create new checkpoints.',
    fields: [{ name: 'password', label: 'Current master password', type: 'password' }], danger: true,
    confirmLabel: selected ? 'Remove checkpoint' : 'Clear local history',
    submit: values => checked('REMOVE_CHECKPOINTS', { passphrase: values.password, expectedRevision: status.revision, id: selected?.id })
  });
  if (result) showToast(selected ? 'Checkpoint removed.' : 'Local checkpoint history cleared.', 'success');
}

export function attachCheckpointListeners() {
  attachCheckpointReviewListeners();
  $('clearCheckpointHistory').addEventListener('click', () => runManagement(() => deleteHistory()));
  document.addEventListener('vault-ui-locked', () => { $('snapshotList').replaceChildren(); $('clearCheckpointHistory').hidden = true; });
}
