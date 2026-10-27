import { state } from '../state.js';
import { ensureVaultAccessible } from './vault.js';
import { syncSettingsView } from './settings.js';
import { showToast } from './toast.js';
import { requestOperation } from './operationDialog.js';
import { checked, runManagement } from './management.js';
import { renderCheckpoints } from './checkpoints.js';
const $ = id => document.getElementById(id);
const clientId = crypto.randomUUID();
const master = { name: 'password', label: 'Master password for the selected Chrome Sync copy', type: 'password' };
const time = value => new Date(value).toLocaleString();
const count = (value, singular, plural = `${singular}s`) => `${value} ${value === 1 ? singular : plural}`;
let lastRemote = null; let refreshSequence = 0; let setup = null; let polling = null;

export async function refreshSyncView(inspectRemote = false) {
  const sequence = ++refreshSequence;
  const [sync, recovery] = await Promise.allSettled([checked('SYNC_STATUS', { inspectRemote }), checked('RECOVERY_ARCHIVE_STATUS')]);
  if (sequence !== refreshSequence) return;
  if (sync.status === 'fulfilled') {
    const status = sync.value.status;
    if (status.remoteInspected) lastRemote = status;
    const remoteError = status.remoteError || (!status.remoteInspected && lastRemote?.remoteError);
    $('syncToggle').checked = status.enabled;
    $('syncSendingControl').hidden = !status.setupComplete;
    const sending = status.enabled ? status.storing ? 'Saving this version in Chrome storage… Your changes are saved locally.' : status.pending ? 'Saved locally; sending is pending.' : status.storedAt ? `Version saved in Chrome storage at ${time(status.storedAt)}. Delivery to another device is not yet confirmed for this version.` : 'Automatic sending is on. Delivery to another device has not been confirmed.' : 'Automatic sending is off. Your local vault remains available.';
    $('syncStatus').textContent = `${sending}${status.error ? ` ${status.error}` : ''}${remoteError ? ` Could not inspect remote copies: ${remoteError}. Local backups and history remain available.` : ''}${status.issues.length ? ` ${count(status.issues.length, 'incomplete or damaged copy', 'incomplete or damaged copies')}. Complete copies can still be restored locally; combining and sending are paused until all copies can be read.` : ''}${status.restorePending ? ' Local recovery or erasure is incomplete; automatic sending is paused.' : ''}`;
    $('syncStatus').dataset.state = status.storing ? 'saving' : status.pending ? 'pending' : status.enabled ? 'stored' : 'off';
    const retryable = status.enabled && status.pending && (status.errorCode !== 'capacity' || status.capacity?.canPublish) && !status.issues.length;
    $('retrySync').disabled = !retryable; $('retrySync').hidden = !retryable;
    $('compactSync').disabled = !status.heads.length || Boolean(status.issues.length) || Boolean(remoteError);
    $('compactSync').hidden = $('compactSync').disabled;
    $('syncMaintenance').hidden = $('retrySync').hidden && $('compactSync').hidden;
    $('clearSyncArchive').disabled = !status.recoveryArchiveCount; $('clearSyncArchive').hidden = !status.recoveryArchiveCount;
    $('syncCapacity').hidden = !status.capacity && status.bytesUsed === undefined;
    $('syncCapacity').textContent = status.capacity ? status.capacity.fits ? 'Space checked for today’s vault and one more complete version. A larger vault or other copies can require another check.' : status.capacity.reason : status.bytesUsed !== undefined ? 'Chrome storage is available. Create or restore a local vault to check space for automatic sending.' : '';
    const receipt = status.receipt;
    $('syncReceiptStatus').hidden = !receipt;
    $('syncReceiptStatus').textContent = receipt ? receipt.revision && receipt.revision === status.localRevision ? `This vault version was received by another installation during a device test at ${time(receipt.receivedAt)}.` : `A device test was confirmed at ${time(receipt.receivedAt)}. This does not confirm delivery of later vault changes.` : '';
    if (receipt?.revision && receipt.revision === status.localRevision && status.enabled && !status.pending && !remoteError && !status.issues.length && !status.restorePending) $('syncStatus').textContent = `Version saved in Chrome storage. Reception of this version was confirmed during a device test at ${time(receipt.receivedAt)}.`;
    const heads = lastRemote?.heads || []; const select = $('syncVersions'); const previous = select.value;
    select.replaceChildren();
    for (const head of heads) {
      const option = document.createElement('option'); option.value = head.revision;
      option.textContent = `${head.updatedAt ? time(head.updatedAt) : 'Older copy'} · ${head.revision.slice(0, 8)}${head.current ? ' · matches this device' : ''}`; select.append(option);
    }
    if (heads.some(head => head.revision === previous)) select.value = previous;
    select.disabled = !heads.length; $('remoteVersionReview').hidden = !heads.length;
    $('downloadSync').disabled = !heads.length; $('mergeSync').disabled = !heads.length || !status.initialized || Boolean(lastRemote?.issues.length);
    if (inspectRemote) {
      $('syncDiscoveryStatus').hidden = false;
      $('syncDiscoveryStatus').textContent = remoteError ? 'Copies could not be checked. Try again when Chrome storage is available.' : heads.length ? `${count(heads.length, 'complete copy', 'complete copies')} available. Review a copy before changing your vault.` : status.issues.length ? 'No complete copies found. Some data is still arriving or damaged.' : 'No existing Chrome Sync copies found.';
    }
  } else $('syncStatus').textContent = `Could not check automatic sending: ${sync.reason.message}. Local recovery remains available.`;
  if (recovery.status === 'fulfilled') {
    const snapshots = [];
    for (const item of recovery.value.snapshots) if (!snapshots.some(snapshot => snapshot.id === item.id && snapshot.source === item.source)) snapshots.push(item);
    renderCheckpoints(snapshots);
  } else $('recoveryStatus').textContent = `Could not read local history: ${recovery.reason.message}`;
}
function startSetup() {
  setup = null; $('syncToggle').checked = Boolean(state.settings.useSync);
  $('syncSetupPanel').hidden = false; $('syncSetupPreparation').hidden = false; $('syncSetupSummary').hidden = true;
  $('enableSyncSending').hidden = true; $('checkSyncSetup').hidden = false; $('checkSyncSetup').textContent = 'Check copies and space'; $('checkSyncSetup').classList.replace('secondary', 'primary');
  $('syncSetupTitle').textContent = 'Prepare Chrome'; $('syncSetupTitle').focus();
}
function closeSetup() { setup = null; $('syncSetupPanel').hidden = true; $('configureSync').focus(); }
async function checkSetup() {
  setup = null; $('enableSyncSending').hidden = true;
  $('syncSetupSummary').hidden = false; $('syncSetupSummary').textContent = 'Checking copies and space…';
  const { status } = await checked('VAULT_STATUS');
  if (status.initialized && !await ensureVaultAccessible('Unlock your vault to check Chrome Sync setup.')) { $('syncSetupSummary').textContent = 'Setup check cancelled. Unlock to check copies and space.'; return; }
  setup = await checked('SYNC_SETUP_CHECK');
  await refreshSyncView(true);
  $('syncSetupPreparation').hidden = true; $('syncSetupTitle').textContent = 'Review setup';
  $('syncSetupSummary').hidden = false;
  $('syncSetupSummary').textContent = !setup.status.initialized ? 'Create a local vault in Backups & recovery, or restore an existing copy below, before enabling automatic sending.' : `${count(setup.currentCount, 'local entry', 'local entries')}. ${count(setup.status.heads.length, 'complete Chrome Sync copy', 'complete Chrome Sync copies')}. ${setup.divergent ? `Review ${count(setup.divergent, 'different copy', 'different copies')} before sending. ` : ''}${setup.status.capacity?.fits ? 'There is space for today’s vault and one more version. Chrome’s delivery to other devices still needs a separate test.' : setup.status.capacity?.reason || 'Space could not be checked.'}`;
  $('enableSyncSending').hidden = !setup.status.initialized || !setup.status.capacity?.fits;
  $('checkSyncSetup').textContent = 'Check again'; $('checkSyncSetup').classList.replace('primary', 'secondary'); $('syncSetupTitle').focus();
}
async function enableSending() {
  if (!setup) throw new Error('Check copies and space first.');
  const selected = setup;
  const result = await requestOperation({
    title: 'Enable automatic sending',
    description: selected.divergent ? `${count(selected.divergent, 'Chrome Sync copy differs', 'Chrome Sync copies differ')} from your vault. You can review a selected copy first. Keeping your local vault archives all other active copies on this device and retires them when the new version is stored.` : 'Changes to this vault will be saved as encrypted versions in Chrome Sync storage. Receiving and applying them on another device are separate steps. This does not change Chrome’s browser settings.',
    details: [{ label: 'Local entries', value: String(selected.currentCount) }, { label: 'Existing copies', value: String(selected.status.heads.length) }],
    fields: selected.divergent ? [{ name: 'strategy', label: 'Different copies', options: [{ value: 'review', label: 'Review a selected copy first' }, { value: 'keep-local', label: 'Keep local vault and archive the other copies' }] }] : [],
    confirmLabel: selected.divergent ? 'Continue' : 'Enable automatic sending',
    submit: async values => values.strategy === 'review' ? { review: true } : checked('SET_SYNC_MODE_SAFE', { targetUseSync: true, strategy: values.strategy, expectedRevision: selected.expectedRevision, expectedHeads: selected.expectedHeads })
  });
  if (!result) return;
  closeSetup();
  if (result.review) { await refreshSyncView(true); $('syncVersions').focus(); return; }
  state.settings = result.settings; syncSettingsView(); showToast('Automatic sending enabled. Use the device test to confirm reception.', 'success');
}
async function reviewRemote(merge) {
  const revision = $('syncVersions').value;
  if (!revision) throw new Error('Check existing copies and select one first.');
  const { status } = await checked('VAULT_STATUS');
  if (status.initialized && !await ensureVaultAccessible('Unlock the destination vault before reviewing changes.')) return;
  const preview = await requestOperation({ title: 'Unlock Chrome Sync copy', description: 'Open this encrypted copy to compare entry counts before making changes. Your vault and automatic sending remain unchanged.', fields: [master], confirmLabel: 'Compare entries', submit: async values => ({ ...await checked('SYNC_PREVIEW', { revision, passphrase: values.password, merge, clientId }), passphrase: values.password }) });
  if (!preview) return;
  try {
    const result = await requestOperation({
      title: merge ? 'Combine into the local vault' : 'Restore this version locally',
      description: merge ? `Keep ${count(preview.current, 'current entry', 'current entries')} and add ${count(preview.added, 'new entry', 'new entries')} plus ${count(preview.conflicts, 'separate conflict copy', 'separate conflict copies')}. The local master password stays the same. ${state.settings.useSync ? 'The result will be sent automatically.' : 'Automatic sending stays off.'} Other remote versions are not resolved.` : `This copy’s ${count(preview.incoming, 'entry', 'entries')} will become your local vault contents. ${count(preview.removed, 'current entry is', 'current entries are')} absent or different in this copy. Current contents become a checkpoint. Automatic sending turns off; remote copies stay unchanged. ${preview.destinationExists ? 'Your current master password and biometric setup stay the same.' : 'Use this copy’s master password to unlock the new local vault.'}`,
      details: [{ label: 'Current entries', value: String(preview.current) }, { label: 'Selected copy', value: count(preview.incoming, 'entry', 'entries') }, { label: 'Identical entries', value: String(preview.identical) }, ...(merge ? [{ label: 'New entries', value: String(preview.added) }, { label: 'Conflict copies', value: String(preview.conflicts) }] : [{ label: 'Absent or different current entries', value: String(preview.removed), danger: Boolean(preview.removed) }])],
      confirmLabel: merge ? 'Combine entries' : 'Restore locally', danger: !merge && Boolean(preview.removed),
      submit: () => checked('SYNC_COMMIT_REVIEW', { revision, passphrase: preview.passphrase, merge, expectedRevision: preview.expectedRevision, token: preview.token, clientId })
    });
    if (result) showToast(merge ? 'Combined entries. Unlock with the local master password.' : 'Restored locally. Automatic sending is off.', 'success');
  } finally { preview.passphrase = undefined; }
}
async function checkDeviceTest() {
  const result = await checked('SYNC_DEVICE_TEST_STATUS');
  $('syncDeviceTestStatus').textContent = result.state === 'waiting' ? `Test code ${result.code}. Waiting for confirmation from another device. This test expires at ${time(result.expiresAt)}.` : result.state === 'expired' ? 'Test expired without confirmation. This does not prove that Chrome Sync is disabled. Start a new test or review Chrome settings.' : result.state === 'confirmed' ? `Test exchange confirmed at ${time(result.receipt.receivedAt)}.${result.receipt.revision ? ' The tested vault version was complete on the receiving installation.' : ' This test did not include a vault version.'}` : 'No test started. Start here or receive a test from your other device.';
  if (result.state !== 'waiting') { clearInterval(polling); polling = null; }
  return result;
}
export function attachSyncListeners() {
  document.addEventListener('management-refresh', () => refreshSyncView().catch(error => showToast(error.message, 'error')));
  document.addEventListener('vault-ui-state', () => refreshSyncView().catch(error => showToast(error.message, 'error')));
  $('configureSync').addEventListener('click', startSetup);
  $('cancelSyncSetup').addEventListener('click', closeSetup);
  $('openChromeSyncSettings').addEventListener('click', () => checked('OPEN_CHROME_SYNC_SETTINGS').catch(error => showToast(error.message, 'error')));
  $('checkSyncSetup').addEventListener('click', () => runManagement(checkSetup));
  $('enableSyncSending').addEventListener('click', () => runManagement(enableSending));
  $('refreshSync').addEventListener('click', () => runManagement(() => refreshSyncView(true)));
  $('syncToggle').addEventListener('change', () => {
    if ($('syncToggle').checked) { startSetup(); return; }
    $('syncToggle').disabled = true;
    runManagement(async () => {
      const result = await checked('SET_SYNC_MODE_SAFE', { targetUseSync: false });
      state.settings = result.settings; syncSettingsView(); closeSetup();
      showToast('Automatic sending is off. Existing Chrome Sync copies are kept.', 'success');
    }).finally(() => { $('syncToggle').disabled = false; syncSettingsView(); });
  });
  $('retrySync').addEventListener('click', () => runManagement(async () => { await checked('SYNC_RETRY'); showToast('Version saved in Chrome storage. Delivery to another device is not yet confirmed.', 'success'); }));
  $('compactSync').addEventListener('click', () => runManagement(async () => {
    const result = await requestOperation({ title: 'Clean old remote history', description: 'Removes published ancestor versions only, even when automatic sending is off. Active copies and uploads in progress remain. Export recovery copies first. A vault that is too large for two complete versions still needs to stay local.', confirmLabel: 'Clean old history', danger: true, submit: () => checked('SYNC_COMPACT', { manual: true }) });
    if (result) { showToast(`Removed ${result.removed} old storage items. Check copies and space again.`, 'success'); if (setup) { setup = null; $('enableSyncSending').hidden = true; } }
  }));
  $('clearSyncArchive').addEventListener('click', () => runManagement(async () => {
    const result = await requestOperation({ title: 'Clear archived Sync copies', description: 'Deletes only the extra local conflict archive. Current vault, local snapshots and remote copies remain. Export the snapshots you need first.', fields: [{ ...master, label: 'Current local master password' }], confirmLabel: 'Clear local archive', danger: true, submit: values => checked('SYNC_CLEAR_ARCHIVE', { passphrase: values.password }) });
    if (result) showToast('Local conflict archive cleared.', 'success');
  }));
  for (const [id, merge] of [['downloadSync', false], ['mergeSync', true]]) $(id).addEventListener('click', () => runManagement(() => reviewRemote(merge)));
  $('showSyncDeviceTest').addEventListener('click', () => {
    const open = $('syncDeviceTestPanel').hidden; $('syncDeviceTestPanel').hidden = !open; $('showSyncDeviceTest').setAttribute('aria-expanded', String(open));
    if (open) { $('syncDeviceTestTitle').focus(); runManagement(checkDeviceTest); }
    else { clearInterval(polling); polling = null; }
  });
  $('startSyncDeviceTest').addEventListener('click', () => runManagement(async () => {
    await checked('SYNC_DEVICE_TEST_START'); await checkDeviceTest();
    clearInterval(polling); polling = setInterval(() => {
      if (!document.hidden && !$('advancedSection').hidden && !$('syncDeviceTestPanel').hidden) checkDeviceTest().then(() => refreshSyncView()).catch(error => { clearInterval(polling); polling = null; showToast(error.message, 'error'); });
    }, 5000);
  }));
  $('receiveSyncDeviceTest').addEventListener('click', () => runManagement(async () => {
    const test = await checked('SYNC_DEVICE_TEST_INSPECT');
    const result = await requestOperation({ title: 'Confirm test reception', description: `Compare code ${test.code} with the code shown on the sending device. Confirm only if they match. ${test.includesVault ? 'The tested encrypted vault version is complete on this device.' : 'This test checks transport only; it does not include a vault version.'}`, confirmLabel: 'Confirm matching code', submit: () => checked('SYNC_DEVICE_TEST_CONFIRM', { id: test.id }) });
    if (result) $('syncDeviceTestStatus').textContent = 'Confirmation saved in Chrome storage. Check confirmation on the sending device.';
  }));
  $('checkSyncDeviceTest').addEventListener('click', () => runManagement(checkDeviceTest));
  window.addEventListener('pagehide', () => clearInterval(polling));
  refreshSyncView().catch(error => showToast(error.message, 'error'));
}
