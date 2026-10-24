import { state } from '../state.js';
import { refreshState } from './vaultSession.js';
import { sendMessage } from './messaging.js';
import { showToast } from './toast.js';
import { promptForMasterPassword } from './vault.js';
import { syncSettingsView } from './settings.js';

const $ = id => document.getElementById(id);
async function checked(type, payload) {
  const response = await sendMessage(type, payload); if (!response.ok) throw new Error(response.error); return response;
}
async function refreshSync() {
  const { status } = await checked('SYNC_STATUS');
  $('syncStatus').textContent = status.pending ? `Saved locally; Sync pending: ${status.error}` : `${status.heads.length} remote version(s). Conflicting versions require an explicit choice.`;
  const select = $('syncVersions'); select.replaceChildren();
  for (const head of status.heads) {
    const option = document.createElement('option'); option.value = head.revision; option.textContent = `${head.updatedAt || 'Legacy'} — ${head.current ? 'current' : head.revision.slice(0, 8)}`; select.append(option);
  }
}
export function attachSyncListeners() {
  $('syncToggle').addEventListener('change', async () => {
    const targetUseSync = $('syncToggle').checked; $('syncToggle').disabled = true;
    try {
      let response = await checked('SET_SYNC_MODE_SAFE', { targetUseSync });
      if (response.requiresResolution) {
        const choice = prompt('Sync differs from this local vault.\n1: Keep local and archive the remote versions.\n2: Download the single remote version.\nCancel: review/merge versions below.');
        if (!['1', '2'].includes(choice)) throw new Error('Sync switch cancelled.');
        response = await checked('SET_SYNC_MODE_SAFE', { targetUseSync, strategy: choice === '1' ? 'keep-local' : 'use-sync' });
      }
      state.settings = response.settings; await refreshState(); await refreshSync(); showToast('Storage mode changed. Unlock the selected vault again.', 'success');
    } catch (error) { showToast(error.message, 'error'); }
    finally { $('syncToggle').disabled = false; syncSettingsView(); }
  });
  $('refreshSync').addEventListener('click', () => refreshSync().catch(error => showToast(error.message, 'error')));
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
}
