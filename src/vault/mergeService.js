import { withVaultOperation } from './queue.js';
import { readLocalVaultRecordRaw } from '../utils/storage.js';
import * as session from './session.js';
import { authenticatedMergeContext } from './authenticatedMerge.js';
import { resolveThreeWayPayload, discardThreeWayMerge } from './threeWayMerge.js';
import { encryptMergedPayload } from './crypto.js';
import { commitRecord } from './repository.js';
import { loadAuthorization } from '../sync/authorizationStore.js';
import { publicationStore } from '../sync/publicationStore.js';
import { sameBinding } from '../sync/publicationModel.js';

// Internal application of a signed Drive review, with no message route yet.
export function applyAuthenticatedMerge(plan, decisions) {
  const choices = structuredClone(decisions);
  return withVaultOperation(async epoch => {
    const context = authenticatedMergeContext(plan);
    const current = await readLocalVaultRecordRaw();
    const active = await session.current(current);
    try {
      const drive = await publicationStore.context();
      if (!context.binding || !drive.enabled || !drive.writer || !sameBinding(drive.binding, context.binding)) throw new Error('Drive merge binding changed or writer is unavailable.');
      const authorization = await loadAuthorization(current.vaultId);
      if (!authorization || authorization.hash !== context.authorization) throw new Error('Merge authorization changed. Review again.');
      const identity = { ...plan.identity, local: current.revision, vaultId: current.vaultId, keyEpoch: current.keyEpoch };
      const revision = crypto.randomUUID();
      const payload = await resolveThreeWayPayload(plan, choices, identity, revision);
      session.assertGeneration(epoch);
      const record = await encryptMergedPayload(current, payload, active.bytes, [plan.identity.local, plan.identity.remote], revision);
      session.assertGeneration(epoch);
      // commitRecord prepares the normal signed mutation; its transaction
      // rechecks writer binding, authorization, session and expected revision.
      await commitRecord(record, current.revision, { requireDriveContext: context });
      discardThreeWayMerge(plan);
      await session.activate(record, payload.entries, active.bytes, epoch);
      return { revision: record.revision, count: payload.entries.length };
    } finally {
      active.bytes.fill(0);
    }
  });
}
