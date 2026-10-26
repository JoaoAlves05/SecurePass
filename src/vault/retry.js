import { retrySync } from './syncService.js';
import { loadSettings } from '../settings.js';
import { getStorage, setStorage, removeStorage, readSyncOutbox } from '../utils/storage.js';
import { generation } from './session.js';
import { reconcileLocalRecovery } from './recovery.js';
let running = false;
export async function retryPendingSync(now = Date.now()) {
  if (running) return;
  running = true;
  try {
    await reconcileLocalRecovery();
    if (!(await loadSettings()).useSync) return;
    const outbox = await readSyncOutbox(); if (!outbox) return;
    const previous = (await getStorage('local', 'syncRetryState')).syncRetryState;
    if (previous?.revision === outbox.revision && previous.nextAttempt > now) return;
    const epoch = generation();
    try {
      await retrySync();
      if (epoch === generation()) await removeStorage('local', 'syncRetryState');
    } catch {
      if (epoch !== generation() || !(await loadSettings()).useSync) return;
      const attempts = previous?.revision === outbox.revision ? Math.min(10, previous.attempts + 1) : 1;
      const delay = Math.min(60 * 60000, 60000 * 2 ** (attempts - 1));
      await setStorage('local', { syncRetryState: { revision: outbox.revision, attempts, nextAttempt: now + delay } });
    }
  } finally { running = false; }
}
