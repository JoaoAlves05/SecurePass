import { state } from '../state.js';
import { ensureVaultAccessible } from './vault.js';
import { showToast } from './toast.js';
import { MAX_IMPORT_BYTES } from '../../src/validation.js';
import { requestOperation } from './operationDialog.js';
import { checked, runManagement } from './management.js';
export function downloadJSON(data, name) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const password = (name = 'password', label = 'Master password') => ({ name, label, type: 'password' });
const snapshotLabel = item => `${item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'Legacy snapshot'} · ${(item.id || item.revision || '').slice(0, 8)}`;
async function accessibleDestination() {
  const { status } = await checked('VAULT_STATUS');
  if (status.initialized && !await ensureVaultAccessible('Unlock the current vault before changing its data.')) return null;
  // Unlocking a legacy vault can migrate its revision; capture the destination afterwards.
  return (await checked('VAULT_STATUS')).status;
}
async function restoreRecord(record) {
  const status = await accessibleDestination(); if (!status) return;
  const result = await requestOperation({ title: 'Restore on this device', description: 'The current encrypted vault is kept in recovery history. Automatic Sync will be turned off. Remote copies remain unchanged. Enter the password this snapshot used.', fields: [password()], confirmLabel: 'Restore locally', submit: values => checked('IMPORT_RECOVERY', { record, passphrase: values.password, expectedRevision: status.revision || null }) });
  if (result) showToast('Snapshot restored locally. Sync is off.', 'success');
}
async function importFile(input) {
  if (input.size > MAX_IMPORT_BYTES) throw new Error('This import supports files up to 16 MiB. Export individual snapshots for larger recovery archives.');
  const data = JSON.parse(await input.text());
  if (!data || typeof data !== 'object') throw new Error('Invalid backup file.');
  if (data.kind === 'securepass-encrypted-recovery') {
    if (data.version !== 1 || !Array.isArray(data.snapshots) || !Array.isArray(data.sync)) throw new Error('Invalid recovery archive.');
    const records = [...data.snapshots, ...data.sync];
    if (!records.length || records.length > 100) throw new Error('Choose an archive with 1–100 snapshots.');
    const choice = await requestOperation({ title: 'Choose a recovery snapshot', description: 'Snapshots use their historical master passwords. Select one to restore locally.', fields: [{ name: 'snapshot', label: 'Snapshot', options: records.map((record, index) => ({ value: String(index), label: snapshotLabel(record || {}) })) }], confirmLabel: 'Review snapshot' });
    if (choice) await restoreRecord(records[Number(choice.snapshot)]);
    return;
  }
  const status = await accessibleDestination(); if (!status) return;
  const encrypted = data.kind === 'securepass-encrypted-backup';
  const review = await requestOperation({
    title: encrypted ? 'Unlock your backup' : 'Review unencrypted backup',
    description: encrypted ? 'Use the backup password chosen when this file was exported. Your current vault’s master password will stay the same.' : 'This file contains unencrypted credentials. Import it only from a source you trust.',
    fields: [...(encrypted ? [password('backupPassword', 'Backup password')] : []), { name: 'strategy', label: 'If an account differs', options: [{ value: 'keep-both', label: 'Keep both versions' }, { value: 'skip', label: 'Keep current entries' }, { value: 'replace', label: 'Replace matching entries' }] }],
    confirmLabel: 'Preview import',
    submit: async values => ({ ...await checked('PREVIEW_BACKUP', { data, backupPassword: values.backupPassword, strategy: values.strategy }), backupPassword: values.backupPassword })
  });
  if (!review) return;
  try {
    const result = await requestOperation({
      title: review.destinationExists ? 'Confirm import' : 'Create a vault from backup',
      description: `${review.new} new · ${review.identical} identical · ${review.conflicts} conflicting accounts.\n${review.imported} entries will be imported. ${review.destinationExists ? 'A recovery copy of your current vault is kept.' : 'Choose a master password for the new local vault. This is separate from the backup password.'}`,
      fields: review.destinationExists ? [] : [password('masterPassword', 'New master password (at least 16 characters)'), password('confirmation', 'Confirm new master password')],
      confirmLabel: review.destinationExists ? 'Import entries' : 'Create local vault',
      submit: values => {
        if (!review.destinationExists && values.masterPassword !== values.confirmation) throw new Error('Master passwords do not match. No vault was created.');
        return checked('COMMIT_BACKUP', { data, backupPassword: review.backupPassword, token: review.token, newMasterPassword: values.masterPassword });
      }
    });
    if (result) showToast(`Imported ${result.count} entries.`, 'success');
  } finally { review.backupPassword = undefined; }
}
export function attachDataListeners() {
  const $ = id => document.getElementById(id); const file = $('importVaultFile');
  $('exportVault').addEventListener('click', () => runManagement(async () => {
    if (!await ensureVaultAccessible('Unlock your vault to export a backup.')) return;
    const result = await requestOperation({ title: 'Export encrypted backup', description: 'Choose a separate backup password of at least 12 characters. You will need it to restore this file. Store the file somewhere safe outside this device.', fields: [password('backupPassword', 'Backup password'), password('confirmation', 'Confirm backup password')], confirmLabel: 'Export backup', submit: values => {
      if (values.backupPassword !== values.confirmation) throw new Error('Backup passwords do not match.');
      return checked('EXPORT_VAULT', { backupPassword: values.backupPassword });
    } });
    if (result) { downloadJSON(result.data, `securepass-backup-${new Date().toISOString().slice(0, 10)}.json`); showToast('Encrypted backup download requested.', 'success'); }
  }));
  $('importVaultBtn').addEventListener('click', () => file.click());
  file.addEventListener('change', () => { const input = file.files[0]; file.value = ''; if (input) runManagement(() => importFile(input)); });
  $('clearVault').addEventListener('click', () => runManagement(async () => {
    if (!await ensureVaultAccessible('Unlock the current vault before clearing entries.')) return;
    const { status } = await checked('VAULT_STATUS');
    const result = await requestOperation({ title: 'Clear current entries', description: `All current entries will be removed. ${state.settings.useSync ? 'This deletion will also be published to legacy Chrome Sync.' : 'Sync is off; remote copies are unchanged.'} Encrypted recovery history remains.`, fields: [password()], confirmLabel: 'Clear entries', danger: true, submit: values => checked('CLEAR_VAULT_ENTRIES', { passphrase: values.password, expectedRevision: status.revision }) });
    if (result) showToast('Entries cleared; recovery history retained.', 'success');
  }));
  $('snapshotList').addEventListener('click', event => {
    const button = event.target.closest('button[data-snapshot-action]');
    if (!button || !$('snapshotList').contains(button)) return;
    const { snapshotId: id, snapshotAction: action } = button.dataset;
    runManagement(async () => {
      const { snapshots } = await checked('RECOVERY_ARCHIVE_STATUS');
      const selected = snapshots.find(item => item.id === id);
      if (!selected) throw new Error('This version is no longer available. Review the updated history.');
      if (action === 'export') {
        const result = await checked('EXPORT_RECOVERY_SNAPSHOT', { id });
        downloadJSON(result.data, `securepass-snapshot-${id.slice(0, 8)}.json`);
        showToast('Encrypted version download requested.', 'success');
        return;
      }
      if (action !== 'restore') return;
      if (selected.source !== 'Local') {
        const result = await checked('EXPORT_RECOVERY_SNAPSHOT', { id });
        await restoreRecord(result.data.snapshots[0]);
        return;
      }
      const status = await accessibleDestination(); if (!status) return;
      const result = await requestOperation({ title: 'Restore snapshot locally', description: 'Your current vault is kept in recovery history. Sync turns off; remote copies remain. Enter the master password used by this version.', fields: [password()], confirmLabel: 'Restore locally', submit: values => checked('RESTORE_RECOVERY', { id, passphrase: values.password, expectedRevision: status.revision || null }) });
      if (result) showToast('Snapshot restored locally. Sync is off.', 'success');
    });
  });
  $('wipeDevice').addEventListener('click', () => runManagement(async () => {
    const result = await requestOperation({ title: 'Erase only this device', description: 'Deletes the local vault, snapshots, biometric setup and preferences. Remote copies remain. If you cannot unlock damaged or forgotten data, choose erase without unlocking and type ERASE THIS DEVICE.', fields: [{ name: 'mode', label: 'Verification', options: [{ value: 'password', label: 'Verify current master password' }, { value: 'force', label: 'Erase without unlocking (irreversible)' }] }, { ...password(), required: false }, { name: 'confirmation', label: 'Type ERASE THIS DEVICE for erasure without unlocking', required: false }], confirmLabel: 'Erase this device', danger: true, submit: values => checked('WIPE_DEVICE', { passphrase: values.password, force: values.mode === 'force', confirmation: values.confirmation }) });
    if (result) location.reload();
  }));
}
