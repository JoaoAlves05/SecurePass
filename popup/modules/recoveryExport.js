import { checked, runManagement } from './management.js';
import { requestOperation, cancelOperation } from './operationDialog.js';
import { showToast } from './toast.js';

export function attachRecoveryExport(downloadJSON) {
  const button = document.getElementById('exportRecoveryBatch');
  button.addEventListener('click', () => runManagement(async () => {
    let stopped = false; let requested = 0; let total = 0;
    const stop = () => { stopped = true; cancelOperation(); };
    document.addEventListener('vault-ui-locked', stop);
    window.addEventListener('pagehide', stop);
    try {
      const inventory = await checked('PREVIEW_RECOVERY_EXPORT');
      if (stopped) return;
      total = inventory.snapshots.length;
      if (!total) throw new Error(inventory.issues.length ? 'No saved versions can be exported. Review or remove the damaged history before trying again.' : 'There are no saved versions to export yet.');
      const proceed = await requestOperation({
        title: 'Export saved versions',
        description: `Export ${total} encrypted ${total === 1 ? 'version' : 'versions'}, one file at a time. Choose Download version for each file, or cancel to stop. Current entries are exported separately with Export backup.`,
        details: [{ label: 'Saved versions', value: String(total) }, { label: 'Total file size', value: `${(inventory.snapshots.reduce((sum, item) => sum + item.bytes, 0) / 1024 / 1024).toFixed(2)} MiB` }],
        changes: inventory.issues.map(item => ({ title: `${item.source} · version ${item.position} cannot be exported`, text: item.error })),
        changesLabel: 'Saved versions that cannot be exported',
        notice: { title: 'Keep the historical passwords', text: 'These files keep their existing encryption. Check your browser downloads after each request; SecurePass cannot confirm that files were saved.' },
        confirmLabel: inventory.issues.length ? 'Export available versions' : 'Start export'
      });
      if (!proceed || stopped) return;
      for (const [index, selected] of inventory.snapshots.entries()) {
        if (stopped) break;
        const result = await requestOperation({
          layout: 'recovery', title: `Saved version ${index + 1} of ${total}`,
          description: `${requested} download ${requested === 1 ? 'request' : 'requests'} sent. Download this version next, or cancel to stop the batch.`,
          details: [{ label: 'Source', value: selected.source === 'Local' ? 'This device' : 'Archived Chrome Sync' }, { label: 'Version', value: selected.id.slice(0, 8) }, { label: 'Saved', value: selected.updatedAt ? new Date(selected.updatedAt).toLocaleString() : 'Legacy version' }, { label: 'File size', value: `${Math.ceil(selected.bytes / 1024)} KiB` }],
          confirmLabel: 'Download version', busyLabel: 'Preparing…',
          submit: () => checked('EXPORT_RECOVERY_SNAPSHOT', { id: selected.id, source: selected.source, digest: selected.digest })
        });
        if (!result || stopped) break;
        downloadJSON(result.data, `securepass-snapshot-${selected.source === 'Local' ? 'local' : 'archive'}-${index + 1}-${selected.id.slice(0, 8)}.json`);
        requested++;
      }
      showToast(`${requested} of ${total} version download requests sent. Check your browser downloads.`, requested === total ? 'success' : 'warning');
    } finally {
      document.removeEventListener('vault-ui-locked', stop);
      window.removeEventListener('pagehide', stop);
      if (button.isConnected && !stopped) button.focus();
    }
  }));
}
