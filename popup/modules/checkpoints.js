import { state } from '../state.js';
import { checked, runManagement } from './management.js';
import { requestOperation } from './operationDialog.js';
import { ensureVaultAccessible } from './vault.js';
import { showToast } from './toast.js';

const clientId = crypto.randomUUID();
const request = (type, data = {}) => checked(type, { ...data, clientId });
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
      ? [...(item.needsPassword && !locked ? [['unlock', 'Unlock older checkpoint']] : [['recover', locked ? 'Unlock to review' : 'Recover an entry'], ['restore', 'Restore whole vault']]), ['export', 'Export'], ['remove', 'Remove']]
      : [['restore', 'Restore archived copy'], ['export', 'Export']];
    for (const [action, label] of choices) {
      const button = document.createElement('button'); button.type = 'button'; button.className = `${action === 'recover' || action === 'unlock' ? 'primary' : 'secondary'} compact-btn`;
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

async function unlockOlderCheckpoint(selected) {
  if (!await ensureVaultAccessible('Unlock your current vault to manage its checkpoints.')) return false;
  const { status } = await checked('VAULT_STATUS');
  return requestOperation({
    title: 'Unlock older checkpoint', description: 'Enter the master password used by this checkpoint. It will then use your current vault protection, including future password changes.',
    details: [{ label: 'Checkpoint', value: date(selected.updatedAt) }],
    fields: [{ name: 'password', label: 'Checkpoint’s previous master password', type: 'password' }],
    confirmLabel: 'Update checkpoint protection', busyLabel: 'Updating protection…',
    submit: values => checked('UNLOCK_CHECKPOINT', { id: selected.id, passphrase: values.password, expectedRevision: status.revision })
  });
}

export async function reviewCheckpoint(selected, mode = 'entry') {
  if (!await ensureVaultAccessible('Unlock your current vault to review this checkpoint.')) return;
  const latest = (await checked('RECOVERY_ARCHIVE_STATUS')).snapshots.find(item => item.id === selected.id);
  if (!latest) throw new Error('This checkpoint is no longer available. Refresh the history.');
  if (latest.needsPassword) {
    if (!await unlockOlderCheckpoint(latest)) return;
    showToast('Checkpoint now uses your current vault protection.', 'success');
    return;
  }
  const preview = await request('PREVIEW_CHECKPOINT', { id: selected.id, mode });
  try {
    const recoverable = preview.entries.filter(entry => entry.change !== 'unchanged');
    const result = await requestOperation({
      layout: 'checkpoint',
      title: mode === 'entry' ? 'Recover an entry' : 'Restore whole vault',
      description: mode === 'entry'
        ? recoverable.length ? 'Choose an entry to recover. Other entries and your master password stay the same.' : 'There are no deleted or changed entries to recover from this checkpoint.'
        : 'Review the differences before replacing your current vault contents. Your master password and biometric setup stay the same.',
      details: [{ label: 'Checkpoint', value: date(selected.updatedAt) }, { label: 'Saved entries', value: String(preview.count) }, { label: 'To recover', value: String(preview.missing) }, { label: 'Older details', value: String(preview.changed) }, ...(mode === 'vault' ? [{ label: 'To remove', value: String(preview.newer) }] : [])],
      changes: [...preview.entries.filter(entry => entry.change !== 'unchanged').map(entry => ({ title: account(entry), text: entry.change === 'missing' ? 'Deleted from your current vault' : `Older ${entry.fields.join(', ')}` })), ...(mode === 'vault' ? preview.newerEntries.map(entry => ({ title: account(entry), text: 'Will be removed by full restore' })) : [])].slice(0, 20),
      fields: mode === 'entry' && recoverable.length ? [{ name: 'entryId', label: 'Entry to recover', options: recoverable.map(entry => ({ value: entry.id, label: `${account(entry)} — ${entry.change === 'missing' ? 'deleted' : `older ${entry.fields.join(', ')}`}` })) }] : [],
      notice: mode === 'vault' ? { title: 'Before you restore', text: 'Your current contents become a checkpoint. Automatic Sync turns off; remote copies stay unchanged.' } : { title: 'Only the selected entry changes', text: 'Its saved details will be restored. A checkpoint of your current contents is kept. Your existing Sync setting applies.' },
      confirmLabel: mode === 'entry' ? recoverable.length ? 'Recover selected entry' : 'Done' : 'Restore whole vault',
      busyLabel: 'Recovering…', danger: mode === 'vault' && preview.newer > 0,
      submit: values => mode === 'entry' && !recoverable.length ? { unchanged: true } : request('RECOVER_CHECKPOINT', { token: preview.token, entryId: values.entryId })
    });
    if (result) showToast(result.unchanged ? 'Your vault contents are unchanged.' : mode === 'entry' ? 'Entry recovered. Your other entries are unchanged.' : 'Vault contents restored. Your master password is unchanged; Sync is off.', 'success');
  } finally { await request('CANCEL_CHECKPOINT_PREVIEW', { token: preview.token }).catch(() => {}); }
}

export async function handleCheckpointAction(selected, action) {
  if (action === 'recover' || action === 'restore') return reviewCheckpoint(selected, action === 'recover' ? 'entry' : 'vault');
  if (action === 'unlock') return unlockOlderCheckpoint(selected);
  if (action !== 'remove') return;
  return deleteHistory(selected);
}

async function deleteHistory(selected) {
  if (!await ensureVaultAccessible('Unlock your vault before removing recovery history.')) return;
  const { status } = await checked('VAULT_STATUS');
  const result = await requestOperation({
    title: selected ? 'Remove checkpoint' : 'Clear checkpoint history',
    description: selected ? 'Delete this local recovery point. Your current vault is kept.' : 'Delete all local checkpoints. Your current vault, exported backups and archived Sync copies are kept. Future changes will create new checkpoints.',
    fields: [{ name: 'password', label: 'Current master password', type: 'password' }], danger: true,
    confirmLabel: selected ? 'Remove checkpoint' : 'Clear local history',
    submit: values => checked('REMOVE_CHECKPOINTS', { passphrase: values.password, expectedRevision: status.revision, id: selected?.id })
  });
  if (result) showToast(selected ? 'Checkpoint removed.' : 'Local checkpoint history cleared.', 'success');
}

export function attachCheckpointListeners() {
  $('clearCheckpointHistory').addEventListener('click', () => runManagement(() => deleteHistory()));
  document.addEventListener('vault-ui-locked', () => { $('snapshotList').replaceChildren(); $('clearCheckpointHistory').hidden = true; });
}
