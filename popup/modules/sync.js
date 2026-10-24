import { state } from '../state.js';
import { refreshState } from './vaultSession.js';
import { sendMessage } from './messaging.js';
import { showToast } from './toast.js';
import { ensureVaultAccessible, promptForMasterPassword } from './vault.js';
import { syncSettingsView } from './settings.js';

const $ = id => document.getElementById(id);
const countLabel = (count, singular, plural = `${singular}s`) => `${count} ${count === 1 ? singular : plural}`;
async function checked(type, payload) {
  const response = await sendMessage(type, payload); if (!response.ok) throw new Error(response.error); return response;
}
async function changeSyncMode(payload) {
  try { return await checked('SET_SYNC_MODE_SAFE', payload); }
  catch (error) {
    if (payload.targetUseSync !== true || error.message !== 'Vault is locked') throw error;
    if (!await ensureVaultAccessible('Unlock your vault to enable Chrome Sync.')) return null;
    return checked('SET_SYNC_MODE_SAFE', payload);
  }
}
async function refreshSync() {
  const { status } = await checked('SYNC_STATUS');
  const recovery = await checked('RECOVERY_STATUS');
  const currentHeads = status.heads.filter(head => head.current).length;
  $('syncStatus').textContent = status.pending
    ? `Sync is ${status.enabled ? 'on' : 'off'}. Changes are saved locally; publication is pending: ${status.error}`
    : `Sync is ${status.enabled ? 'on' : 'off'}. ${countLabel(status.heads.length, 'remote version')}, ${currentHeads} matching this device.`;
  const select = $('syncVersions'); select.replaceChildren();
  if (!status.heads.length) {
    const option = document.createElement('option'); option.value = ''; option.textContent = 'No remote versions found'; select.append(option);
  }
  for (const head of status.heads) {
    const option = document.createElement('option'); option.value = head.revision; option.textContent = `${head.updatedAt || 'Legacy'} — ${head.current ? 'current' : head.revision.slice(0, 8)}`; select.append(option);
  }
  const hasHeads = status.heads.length > 0;
  select.disabled = !hasHeads;
  $('downloadSync').disabled = !hasHeads;
  $('mergeSync').disabled = !hasHeads;
  $('retrySync').disabled = !status.pending;
  $('compactSync').disabled = !status.enabled || !hasHeads;
  $('clearSyncArchive').disabled = !status.recoveryArchiveCount;
  $('restoreRecovery').disabled = !recovery.snapshots.length;
  $('recoveryStatus').textContent = `${countLabel(recovery.snapshots.length, 'local recovery snapshot')}; ${countLabel(status.recoveryArchiveCount, 'archived Sync version')}.`;
}
async function refreshSyncView() {
  try { await refreshSync(); }
  catch (error) {
    $('syncStatus').textContent = error.message;
    showToast(error.message, 'error');
  }
}
export function attachSyncListeners() {
  $('syncToggle').addEventListener('change', async () => {
    const targetUseSync = $('syncToggle').checked; $('syncToggle').disabled = true;
    try {
      let response = await changeSyncMode({ targetUseSync });
      if (!response) return;
      if (response.requiresResolution) {
        const choice = prompt('Sync differs from this local vault.\n1: Keep local and archive the remote versions.\n2: Download the single remote version.\nCancel: review/merge versions below.');
        if (!['1', '2'].includes(choice)) throw new Error('Sync switch cancelled.');
        response = await changeSyncMode({ targetUseSync, strategy: choice === '1' ? 'keep-local' : 'use-sync' });
        if (!response) return;
      }
      state.settings = response.settings; await refreshState(); await refreshSync(); showToast('Storage mode changed. Unlock the selected vault again.', 'success');
    } catch (error) { showToast(error.message, 'error'); }
    finally { $('syncToggle').disabled = false; syncSettingsView(); }
  });
  $('refreshSync').addEventListener('click', refreshSyncView);
  $('retrySync').addEventListener('click', async () => { try { await checked('SYNC_RETRY'); await refreshSync(); showToast('Sync published.', 'success'); } catch (error) { showToast(error.message, 'error'); } });
  $('compactSync').addEventListener('click', async () => {
    if (!confirm('Remove remote ancestor generations? Current remote heads remain intact and are preserved in the local vault or its encrypted archive. Export recovery snapshots first.')) return;
    try { await checked('SYNC_COMPACT'); await refreshSync(); showToast('Remote ancestor history compacted.', 'success'); } catch (error) { showToast(error.message, 'error'); }
  });
  $('clearSyncArchive').addEventListener('click', async () => {
    if (!confirm('Delete the local encrypted Sync recovery archive? Export recovery snapshots first. The live vault and its five local snapshots are preserved.')) return;
    try {
      const passphrase = await promptForMasterPassword('Re-enter the current master password to clear the exported archive.');
      if (passphrase === null) return;
      await checked('SYNC_CLEAR_ARCHIVE', { passphrase }); showToast('Sync recovery archive cleared.', 'success');
    } catch (error) { showToast(error.message, 'error'); }
  });
  for (const [id, merge] of [['downloadSync', false], ['mergeSync', true]]) $(id).addEventListener('click', async () => {
    try {
      if (!$('syncVersions').value) throw new Error('Refresh and choose a remote version.');
      if (!confirm(merge ? 'Merge the selected remote version with the unlocked local vault? Conflicting IDs are preserved as separate entries. The remote master password will protect the result.' : 'Replace the local vault with the selected remote version? Encrypted recovery copies are retained.')) return;
      const passphrase = await promptForMasterPassword('Enter the master password for the selected remote version.');
      if (passphrase === null) return;
      await checked('SYNC_RESOLVE', { revision: $('syncVersions').value, passphrase, merge });
      await refreshState(); await refreshSync(); showToast('Remote version resolved. Unlock with its master password.', 'success');
    } catch (error) { showToast(error.message, 'error'); }
  });
  refreshSyncView();
}
