import { getDB } from '../utils/storage.js';
import { DB_STORE_NAME } from '../constants.js';
import { PUBLICATION_STATE_KEY as KEY, sameBinding, preparePublication, enqueuePublication } from './publicationModel.js';
import { validateUploadSession } from './publicationLimits.js';
function current(state, operation, authorizationHead) {
  if (!state.enabled || !sameBinding(state.binding, operation.binding)) throw new Error('Drive binding changed or disabled.');
  const found = state.operations.find(value => value.id === operation.id && sameBinding(value.binding, operation.binding));
  if (!found || found.publication.revisionId !== operation.publication.revisionId || found.publication.body !== operation.publication.body) throw new Error('Publication operation changed.');
  if (found.authorization !== undefined && found.authorization !== authorizationHead) throw new Error('Drive authorization changed or revoked.');
  return found;
}
async function access(mutate, write = false) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE_NAME, write ? 'readwrite' : 'readonly');
    const store = tx.objectStore(DB_STORE_NAME); let value; let failure;
    const request = store.get(KEY);
    request.onsuccess = () => {
      const state = request.result || { enabled: false, binding: null, operations: [] };
      const finish = head => {
        try {
          value = mutate(state, head);
          if (write) store.put(state, KEY);
        } catch (error) { failure = error; tx.abort(); }
      };
      if (state.binding) {
        const authorization = store.get(`driveAuthorization:${state.binding.vaultId}`);
        authorization.onsuccess = () => finish(authorization.result?.head);
      } else finish(undefined);
    };
    tx.oncomplete = () => { db.close(); resolve(value); };
    tx.onerror = tx.onabort = () => { db.close(); reject(failure || tx.error || new Error('Drive state transaction failed.')); };
  });
}
export const publicationStore = {
  // Administrative callers must authenticate before configuring a binding. This
  // module is not a message handler and cannot authorize account enrollment.
  configure(binding, enabled = false) {
    if (typeof enabled !== 'boolean' || !binding || !['accountId', 'vaultId', 'generation'].every(key => typeof binding[key] === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(binding[key]))) throw new Error('Invalid Drive binding.');
    const pinned = { accountId: binding.accountId, vaultId: binding.vaultId, generation: binding.generation };
    return access(state => {
      if (!sameBinding(state.binding, pinned)) delete state.writer;
      state.binding = pinned; state.enabled = enabled; state.administrationEnabled = enabled;
    }, true);
  },
  disable() { return access(state => { state.enabled = false; state.administrationEnabled = false; }, true); },
  context() { return access(state => ({ enabled: state.enabled, binding: state.binding, writer: state.writer || null })); },
  pendingPackets(binding) {
    return access((state, head) => {
      if (!state.enabled || !sameBinding(state.binding, binding)) throw new Error('Drive binding changed or disabled.');
      return state.operations.filter(operation => typeof head === 'string' && sameBinding(operation.binding, binding) && operation.authorization === head).map(operation => ({ body: operation.publication.body, publication: { vaultId: operation.publication.vaultId, revisionId: operation.publication.revisionId } }));
    });
  },
  installWriter(binding, writer, authorization, validateCommit) {
    const pinned = structuredClone(writer);
    return access((state, head) => {
      validateCommit?.();
      if (!state.enabled || !sameBinding(state.binding, binding) || head !== authorization) throw new Error('Drive binding or authorization changed.');
      state.writer = pinned;
    }, true);
  },
  enqueue(binding, publication) {
    const prepared = preparePublication(binding, publication);
    return access(state => enqueuePublication(state, prepared), true);
  },
  next() { return access(state => state.enabled ? state.operations.find(value => sameBinding(value.binding, state.binding)) || null : null); },
  assertCurrent(operation) { return access((state, head) => { current(state, operation, head); }); },
  markSending(operation, values) { return access((state, head) => { Object.assign(current(state, operation, head), { attempts: values.attempts, outcome: values.outcome }); }, true); },
  saveUploadSession(operation, session) {
    const pinned = session === null ? null : validateUploadSession(session);
    return access((state, head) => {
      const found = current(state, operation, head);
      if (pinned && pinned.total !== new TextEncoder().encode(found.publication.body).length) throw new Error('Upload size mismatch.');
      if (pinned) found.uploadSession = pinned;
      else delete found.uploadSession;
    }, true);
  },
  recordFailure(operation, values) { return access((state, head) => { Object.assign(current(state, operation, head), { attempts: values.attempts, code: values.code, nextAttempt: values.nextAttempt, outcome: values.outcome, blocked: values.blocked }); }, true); },
  acknowledge(operation, result) {
    return access((state, head) => {
      current(state, operation, head);
      if (result?.verified !== true || result.revisionId !== operation.publication.revisionId) throw new Error('Unverified publication.');
      state.operations = state.operations.filter(value => value.id !== operation.id);
      state.lastAcknowledged = { id: operation.id, revisionId: result.revisionId, binding: operation.binding };
    }, true);
  }
};
