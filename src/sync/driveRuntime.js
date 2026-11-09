import { publicationStore } from './publicationStore.js';
import { createPublicationCoordinator } from './publication.js';
import { createDriveTransport, DriveError } from './driveTransport.js';
import { getBoundGoogleToken, assertGoogleBinding } from './googleConnection.js';
import { loadAuthorization } from './authorizationStore.js';
import { verifySignedPublication } from './signedProtocol.js';
import { getStorage } from '../utils/storage.js';
import { loadSettings } from '../settings.js';
import { readAdministration } from './administrationStore.js';
import { createAdministrationRuntime } from './administrationRuntime.js';
import { requireAuthorityState } from './authorizationGraph.js';
import { verifySignedRevision2 } from './revisionProtocol2.js';

// This is a source-level release gate, not a preference that a website or a
// stale saved setting can enable. Remove only after the documented review.
const reviewedForProduction = () => false;
export function createDriveRuntime({ store = publicationStore, getToken = getBoundGoogleToken, assertAccount = assertGoogleBinding, writesReviewed = reviewedForProduction, fetchImpl } = {}) {
  let running;
  const administrative = createAdministrationRuntime({ getContext: () => store.context?.(), getToken, assertAccount, writesReviewed, fetchImpl });
  async function run() {
    if (!writesReviewed()) return { blockedByReview: true };
    if ((await loadSettings()).useSync || (await getStorage('local', 'localRestorePending')).localRestorePending) return { suspended: true };
    const delivered = await administrative.run();
    if (!delivered.idle) return { ...delivered, administrative: true };
    const operation = await store.next();
    if (!operation) return { idle: true };
    const administrationPending = async () => (await readAdministration(operation.publication.vaultId)).administration?.operations.some(value => value.phase !== 'published');
    if (await administrationPending()) return { administrationPending: true };
    const currentAuthority = await loadAuthorization(operation.publication.vaultId);
    if (operation.authorization !== undefined && currentAuthority?.hash !== operation.authorization) return { rebaseRequired: true, revisionId: operation.publication.revisionId };
    const assertCurrent = async binding => {
      if (!writesReviewed() || (await loadSettings()).useSync || (await getStorage('local', 'localRestorePending')).localRestorePending) throw new DriveError('binding-changed');
      if (await administrationPending()) throw new DriveError('administration-pending');
      await assertAccount(binding); await store.assertCurrent(operation);
    };
    const transport = createDriveTransport({ getToken, assertBinding: assertCurrent, assertWritable: assertCurrent, fetchImpl,
      validatePublication: async (body, identity) => {
        const state = await loadAuthorization(identity.vaultId);
        if (!state || operation.authorization !== state.hash) throw new DriveError('authorization-changed');
        if (state.payload.version === 2) return verifySignedRevision2(body, identity, { graph: requireAuthorityState(state, { live: true }).graph });
        return verifySignedPublication(body, identity, state);
      }
    });
    // Pin the exact chosen operation for this run, including its resume URI.
    return createPublicationCoordinator({ store: { ...store, next: async () => operation }, transport }).run();
  }
  return { run() { if (!running) running = run().finally(() => { running = null; }); return running; } };
}
export const driveRuntime = createDriveRuntime();
