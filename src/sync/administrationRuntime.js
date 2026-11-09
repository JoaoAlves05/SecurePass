import { publicationStore } from './publicationStore.js';
import { createAdministrationDeliveryStore } from './administrationDeliveryStore.js';
import { createPublicationCoordinator } from './publication.js';
import { createDriveTransport, DriveError } from './driveTransport.js';
import { getBoundGoogleToken, assertGoogleBinding } from './googleConnection.js';
import { verifyAdministrationPublication } from './administrationProtocol.js';
import { getStorage } from '../utils/storage.js';
import { loadSettings } from '../settings.js';
export function createAdministrationRuntime({ getContext = () => publicationStore.context(), getToken = getBoundGoogleToken, assertAccount = assertGoogleBinding, writesReviewed = () => false, fetchImpl, now = Date.now, random = Math.random } = {}) {
  let running;
  async function run() {
    if (!writesReviewed()) return { blockedByReview: true };
    if ((await loadSettings()).useSync || (await getStorage('local', 'localRestorePending')).localRestorePending) return { suspended: true };
    const context = await getContext();
    if (!context?.binding) return { idle: true };
    const store = createAdministrationDeliveryStore(context.binding); const operation = await store.next();
    if (!operation) return { idle: true };
    const guard = async binding => {
      if (!writesReviewed() || (await loadSettings()).useSync || (await getStorage('local', 'localRestorePending')).localRestorePending) throw new DriveError('binding-changed');
      await assertAccount(binding); await store.assertCurrent(operation);
    };
    const transport = createDriveTransport({ namespace: 'authorization', getToken, assertBinding: guard, assertWritable: guard, fetchImpl,
      validatePublication: (body, identity) => verifyAdministrationPublication(body, identity, { vaultId: operation.publication.vaultId, rootFingerprint: operation.rootFingerprint, expectedHead: operation.publication.revisionId })
    });
    return createPublicationCoordinator({ store: { ...store, next: async () => operation }, transport, now, random }).run();
  }
  return { run() { if (!running) running = run().finally(() => { running = null; }); return running; } };
}
