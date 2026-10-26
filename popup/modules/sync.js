import { state } from '../state.js';
import { ensureVaultAccessible } from './vault.js';
import { syncSettingsView } from './settings.js';
import { showToast } from './toast.js';
import { requestOperation } from './operationDialog.js';
import { checked, runManagement } from './management.js';
import { renderCheckpoints } from './checkpoints.js';
const $ = id => document.getElementById(id);
let lastRemote = null;
let refreshSequence = 0;
const master = { name: 'password', label: 'Master password for the selected remote vault', type: 'password' };
export async function refreshSyncView(inspectRemote = false) {
  const sequence = ++refreshSequence;
  const [sync, recovery] = await Promise.allSettled([checked('SYNC_STATUS', { inspectRemote }), checked('RECOVERY_ARCHIVE_STATUS')]);
  if (sequence !== refreshSequence) return;
  if (sync.status === 'fulfilled') {
    const status = sync.value.status;
    if (status.remoteInspected) lastRemote = status;
    const remoteError = status.remoteError || (!status.remoteInspected && lastRemote?.remoteError);
    $('syncToggle').checked = status.enabled;
    $('syncStatus').textContent = `Sync is ${status.enabled ? 'on' : 'off'}. ${status.pending ? `Saved locally; upload pending. ${status.error || ''}` : status.enabled ? 'Legacy Chrome Sync is enabled.' : 'Your vault stays on this device. No automatic remote communication.'}${remoteError ? ` Could not inspect remote copies: ${remoteError}. Local backups and history remain available.` : ''}${status.issues.length ? ` ${status.issues.length} remote version(s) need attention; valid copies remain listed.` : ''}${status.restorePending ? ' Local recovery or erasure is incomplete; automatic publication is paused.' : ''}`;
    $('retrySync').disabled = !status.enabled || !status.pending;
    $('compactSync').disabled = !status.enabled || !status.heads.length || Boolean(status.issues.length);
    $('clearSyncArchive').disabled = !status.recoveryArchiveCount;
    $('clearSyncArchive').hidden = !status.recoveryArchiveCount;
    $('retrySync').hidden = !status.enabled || !status.pending;
    $('compactSync').hidden = $('compactSync').disabled;
    $('syncMaintenance').hidden = $('retrySync').hidden && $('compactSync').hidden;
    $('syncCapacity').textContent = status.bytesUsed === undefined ? 'Check existing copies to inspect legacy storage usage.' : `${status.bytesUsed.toLocaleString()} bytes in ${status.itemCount} legacy items. Another complete version needs additional space.`;
    const heads = lastRemote?.heads || []; const select = $('syncVersions'); const previous = select.value;
    select.replaceChildren();
    for (const head of heads) {
      const option = document.createElement('option'); option.value = head.revision;
      option.textContent = `${head.updatedAt ? new Date(head.updatedAt).toLocaleString() : 'Legacy vault'} · ${head.revision.slice(0, 8)}${head.current ? ' · this device' : ''}`; select.append(option);
    }
    if (heads.some(head => head.revision === previous)) select.value = previous;
    select.disabled = !heads.length; $('remoteVersionReview').hidden = !heads.length;
    $('downloadSync').disabled = !heads.length; $('mergeSync').disabled = !heads.length;
  } else $('syncStatus').textContent = `Could not check Sync: ${sync.reason.message}. Local recovery remains available.`;
  if (recovery.status === 'fulfilled') {
    const snapshots = [];
    for (const item of recovery.value.snapshots) {
      if (!snapshots.some(snapshot => snapshot.id === item.id && snapshot.source === item.source)) snapshots.push(item);
    }
    renderCheckpoints(snapshots);
  } else $('recoveryStatus').textContent = `Could not read local history: ${recovery.reason.message}`;
}
async function changeMode(payload) {
  try { return await checked('SET_SYNC_MODE_SAFE', payload); }
  catch (error) {
    if (payload.targetUseSync !== true || error.message !== 'Vault is locked') throw error;
    if (!await ensureVaultAccessible('Unlock your vault to enable legacy Chrome Sync.')) return null;
    return checked('SET_SYNC_MODE_SAFE', payload);
  }
}
export function attachSyncListeners() {
  document.addEventListener('management-refresh', () => refreshSyncView().catch(error => showToast(error.message, 'error')));
  document.addEventListener('vault-ui-state', () => refreshSyncView().catch(error => showToast(error.message, 'error')));
  $('refreshSync').addEventListener('click', () => runManagement(async () => { await refreshSyncView(true); }));
  $('syncToggle').addEventListener('change', () => {
    const targetUseSync = $('syncToggle').checked; $('syncToggle').disabled = true;
    runManagement(async () => {
      const { status } = await checked('VAULT_STATUS');
      let result;
      if (targetUseSync && !status.initialized) {
        await refreshSyncView(true);
        if (!lastRemote?.heads.length) throw new Error('Create a local vault or restore a backup first.');
        const head = lastRemote.heads.find(item => item.revision === $('syncVersions').value);
        result = await requestOperation({ title: 'Connect an existing legacy vault', description: 'Enter the password that opens the selected vault. A wrong password will not create or replace any data.', fields: [master], confirmLabel: 'Connect vault', submit: values => changeMode({ targetUseSync: true, strategy: 'use-sync', passphrase: values.password, revision: head.revision, expectedRevision: null }) });
      } else result = await changeMode({ targetUseSync, expectedRevision: status.revision });
      if (result?.requiresResolution) {
        const choice = await requestOperation({ title: 'Choose which vault to use', description: 'Local and remote copies differ. Review individual versions to combine them safely. Keeping the local copy will archive and retire all current remote versions.', fields: [{ name: 'strategy', label: 'Next step', options: [{ value: 'review', label: 'Review individual versions' }, { value: 'keep-local', label: 'Keep local and archive remote versions' }, { value: 'use-sync', label: 'Use the single remote version' }] }], confirmLabel: 'Continue' });
        if (!choice) return;
        if (choice.strategy === 'review') { await refreshSyncView(true); return; }
        if (choice.strategy === 'use-sync') result = await requestOperation({ title: 'Unlock the remote vault', description: 'This changes the active local vault. Its previous encrypted copy is kept in recovery history.', fields: [master], confirmLabel: 'Use remote vault', submit: values => changeMode({ targetUseSync, strategy: 'use-sync', passphrase: values.password, expectedRevision: status.revision }) });
        else result = await changeMode({ targetUseSync, strategy: 'keep-local', expectedRevision: status.revision });
      }
      if (result?.settings) { state.settings = result.settings; syncSettingsView(); showToast('Legacy Sync mode updated. Unlock the active vault again.', 'success'); }
    }).finally(() => { $('syncToggle').disabled = false; syncSettingsView(); });
  });
  $('retrySync').addEventListener('click', () => runManagement(async () => { await checked('SYNC_RETRY'); showToast('Current revision published to legacy storage.', 'success'); }));
  $('compactSync').addEventListener('click', () => runManagement(async () => {
    const result = await requestOperation({ title: 'Clean old remote history', description: 'Removes only published ancestor generations. Active versions and uploads in progress remain. Export recovery copies first. This may not free enough space for another version.', confirmLabel: 'Clean old history', danger: true, submit: () => checked('SYNC_COMPACT') });
    if (result) showToast(`Removed ${result.removed} old storage items.`, 'success');
  }));
  $('clearSyncArchive').addEventListener('click', () => runManagement(async () => {
    const result = await requestOperation({ title: 'Clear archived Sync copies', description: 'Deletes only the extra local conflict archive. Current vault, local snapshots and remote copies remain. Export the snapshots you need first.', fields: [{ ...master, label: 'Current local master password' }], confirmLabel: 'Clear local archive', danger: true, submit: values => checked('SYNC_CLEAR_ARCHIVE', { passphrase: values.password }) });
    if (result) showToast('Local conflict archive cleared.', 'success');
  }));
  for (const [id, merge] of [['downloadSync', false], ['mergeSync', true]]) $(id).addEventListener('click', () => runManagement(async () => {
    const revision = $('syncVersions').value;
    if (!revision) throw new Error('Check existing versions and select one first.');
    let { status } = await checked('VAULT_STATUS');
    if (status.initialized && !await ensureVaultAccessible('Unlock the destination vault before changing its contents.')) return;
    status = (await checked('VAULT_STATUS')).status;
    const result = await requestOperation({ title: merge ? 'Combine into the local vault' : 'Restore this version locally', description: merge ? 'The selected remote entries will be combined with the unlocked local vault. Conflicting copies are kept separately. The local master password stays the same; other remote versions are not resolved.' : `Current contents are kept in a checkpoint. Sync turns off; remote copies stay unchanged. ${status.initialized ? 'Your current master password and biometric setup stay the same.' : 'The selected version’s master password will unlock this new local vault.'}`, fields: [master], confirmLabel: merge ? 'Combine entries' : 'Restore locally', submit: values => checked('SYNC_RESOLVE', { revision, passphrase: values.password, merge, expectedRevision: status.revision || null }) });
    if (result) showToast(merge ? 'Combined entries. Unlock with the local master password.' : 'Restored locally. Sync is off.', 'success');
  }));
  refreshSyncView().catch(error => showToast(error.message, 'error'));
}
