import { state } from '../state.js';
import { refreshState } from './vaultSession.js';
import { promptForMasterPassword, requireUnlockedVault } from './vault.js';
import { sendMessage } from './messaging.js';
import { showToast } from './toast.js';
import { MAX_IMPORT_BYTES } from '../../src/validation.js';

export function downloadJSON(data, name) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function password(label) {
  const value = await promptForMasterPassword(label);
  if (value === null) throw new Error('Cancelled.');
  return value;
}
async function checked(type, payload) {
  const response = await sendMessage(type, payload);
  if (!response.ok) throw new Error(response.error);
  return response;
}
export function attachDataListeners() {
  const file = document.getElementById('importVaultFile');
  document.getElementById('exportVault').addEventListener('click', async () => {
    if (!requireUnlockedVault()) return;
    try {
      const pass = await password('Choose a backup password (at least 12 characters). Keep it separately.');
      const confirm = await password('Confirm the backup password.');
      if (pass !== confirm) throw new Error('Backup passwords do not match.');
      const response = await checked('EXPORT_VAULT', { backupPassword: pass });
      downloadJSON(response.data, `securepass-${new Date().toISOString().slice(0, 10)}.json`);
      showToast('Encrypted backup downloaded.', 'success');
    } catch (error) { showToast(error.message, 'error'); }
  });
  document.getElementById('importVaultBtn').addEventListener('click', () => file.click());
  file.addEventListener('change', async () => {
    try {
      const input = file.files[0]; if (!input) return;
      if (input.size > MAX_IMPORT_BYTES) throw new Error('Backup exceeds 5 MB.');
      const data = JSON.parse(await input.text());
      if (data.kind === 'securepass-encrypted-recovery') {
        if (data.version !== 1 || !Array.isArray(data.snapshots) || !Array.isArray(data.sync)) throw new Error('Invalid recovery archive.');
        const records = [...data.snapshots, ...data.sync];
        const choice = prompt(records.map((r, i) => `${i}: ${r.updatedAt || 'Legacy snapshot'}`).join('\n') + '\nChoose the encrypted snapshot to restore locally.');
        if (choice === null) return;
        if (!/^\d+$/.test(choice) || !records[Number(choice)]) throw new Error('Invalid snapshot number.');
        if (!confirm('Restore the selected encrypted snapshot locally? Current data is retained in recovery history and Sync is disabled.')) return;
        await checked('IMPORT_RECOVERY', { record: records[Number(choice)], passphrase: await password('Master password for this encrypted snapshot.') });
        const settings = await checked('LOAD_SETTINGS'); state.settings = settings.settings;
        await refreshState(); showToast('Encrypted recovery snapshot restored.', 'success'); return;
      }
      const backupPassword = data.kind === 'securepass-encrypted-backup' ? await password('Enter the backup password.') : undefined;
      if (!backupPassword && !confirm('This is an unencrypted legacy backup. Import it only if you trust its source.')) return;
      const preview = await checked('IMPORT_VAULT', { data, backupPassword, preview: true });
      if (!confirm(`Import ${preview.count} entries? Existing account/ID matches will be skipped.`)) return;
      const result = await checked('IMPORT_VAULT', { data, backupPassword, strategy: 'skip' });
      await refreshState(); showToast(`Imported ${result.count} entries.`, 'success');
    } catch (error) { showToast(error.message, 'error'); }
    finally { file.value = ''; }
  });
  document.getElementById('clearVault').addEventListener('click', async () => {
    if (!requireUnlockedVault() || !confirm('Delete all current entries? Export a backup first. The encrypted recovery history remains available.')) return;
    try { await checked('CLEAR_VAULT_ENTRIES', { passphrase: await password('Re-enter the master password to clear all entries.') }); await refreshState(); showToast('Current entries cleared; recovery snapshots retained.', 'success'); }
    catch (error) { showToast(error.message, 'error'); }
  });
  document.getElementById('exportRecovery').addEventListener('click', async () => {
    try { const result = await checked('EXPORT_RECOVERY'); downloadJSON(result.data, 'securepass-encrypted-recovery.json'); showToast('Encrypted recovery snapshots downloaded.', 'success'); }
    catch (error) { showToast(error.message, 'error'); }
  });
  document.getElementById('restoreRecovery').addEventListener('click', async () => {
    try {
      const { snapshots } = await checked('RECOVERY_STATUS');
      if (!snapshots.length) throw new Error('No recovery snapshots available.');
      const index = prompt(snapshots.map(item => `${item.index}: ${item.updatedAt || 'Legacy snapshot'}`).join('\n') + '\n\nEnter the snapshot number.');
      if (index === null) return;
      if (!/^\d+$/.test(index)) throw new Error('Invalid snapshot number.');
      if (!confirm('Restore this snapshot locally? The current encrypted record is kept as a recovery copy; Sync will be disabled.')) return;
      await checked('RESTORE_RECOVERY', { index: Number(index), passphrase: await password('Enter the master password for this snapshot.') });
      const settings = await checked('LOAD_SETTINGS'); state.settings = settings.settings;
      await refreshState(); showToast('Recovery snapshot restored locally.', 'success');
    } catch (error) { showToast(error.message, 'error'); }
  });
  document.getElementById('wipeDevice').addEventListener('click', async () => {
    if (!confirm('Delete this device’s vault, encrypted recovery history, biometric setup and preferences? Remote Sync copies remain. Export a backup first.')) return;
    try {
      const passphrase = await password('Re-enter the current master password to erase this device.');
      await checked('WIPE_DEVICE', { passphrase }); location.reload();
    } catch (error) { showToast(error.message, 'error'); }
  });

}
