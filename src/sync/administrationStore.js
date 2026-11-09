import { getDB, recordRevision } from '../utils/storage.js';
import { DB_STORE_NAME, VAULT_KEY } from '../constants.js';
import { PUBLICATION_STATE_KEY, sameBinding, preparePublication, enqueuePublication } from './publicationModel.js';
import { signedHistoryKey, appendSignedHistory } from './signedHistoryModel.js';
import { requireAuthorityState } from './authorizationGraph.js';
const adminKey = vaultId => `driveAdministration:${vaultId}`;
const authorityKey = vaultId => `driveAuthorization:${vaultId}`;
function validateId(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(value)) throw new Error('Invalid administrative vault.');
}
export async function readAdministration(vaultId) {
  validateId(vaultId);
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE_NAME, 'readonly'); const store = tx.objectStore(DB_STORE_NAME);
    const authority = store.get(authorityKey(vaultId)); const administration = store.get(adminKey(vaultId)); const publication = store.get(PUBLICATION_STATE_KEY);
    tx.oncomplete = () => { db.close(); resolve({ authority: authority.result || null, administration: administration.result || null, publication: publication.result || null }); };
    tx.onerror = tx.onabort = () => { db.close(); reject(tx.error || new Error('Administrative read failed.')); };
  });
}
// All cryptographic work finishes before entering IndexedDB. The synchronous
// guard executes inside the write transaction immediately before its puts.
export async function commitAdministration({ record, previous, authority, administration, writer, validateCommit, nextRecord, signedPacket, state: verifiedState }) {
  validateId(record?.vaultId);
  let devices;
  if (authority.format === 2) {
    const verified = requireAuthorityState(verifiedState, { live: true });
    if (verified.hash !== authority.head || verified.payload.vaultId !== record.vaultId || verified.payload.keyEpoch !== record.keyEpoch) throw new Error('Administrative-v2 transaction authority mismatch.');
    devices = verified.payload.devices;
  } else devices = authority.chain.at(-1).payload.devices;
  if (new TextEncoder().encode(JSON.stringify({ authority, administration })).length > 4 * 1024 * 1024) throw new Error('Administrative history capacity reached. Preserve the current chain and review compaction.');
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE_NAME, 'readwrite'); const store = tx.objectStore(DB_STORE_NAME); let failure;
    const live = store.get(VAULT_KEY); const auth = store.get(authorityKey(record.vaultId)); const admin = store.get(adminKey(record.vaultId)); const publication = store.get(PUBLICATION_STATE_KEY);
    publication.onsuccess = () => {
      try {
        validateCommit();
        if (recordRevision(live.result) !== record.revision || live.result?.keyEpoch !== record.keyEpoch || live.result?.vaultId !== record.vaultId) throw new Error('Vault changed during administration.');
        if (record.version === 3 && JSON.stringify(live.result) !== JSON.stringify(record)) throw new Error('Vault contents changed during administration.');
        if (JSON.stringify(auth.result || null) !== JSON.stringify(previous.authority) || JSON.stringify(admin.result || null) !== JSON.stringify(previous.administration)) throw new Error('Administration changed concurrently. Review again.');
        const state = publication.result || null;
        if (Boolean(state) !== Boolean(previous.publication) || state && (state.enabled !== previous.publication.enabled || state.administrationEnabled !== previous.publication.administrationEnabled || !sameBinding(state.binding, previous.publication.binding) && (state.binding || previous.publication.binding) || JSON.stringify(state.writer) !== JSON.stringify(previous.publication.writer))) throw new Error('Drive binding or writer changed during administration.');
        const apply = (history, checkpoints) => {
          try {
            validateCommit();
            if (signedPacket) {
              const target = nextRecord || record;
              if (record.version !== 3 || target.vaultId !== record.vaultId || target.keyEpoch !== record.keyEpoch || signedPacket.authorization !== authority.head || signedPacket.publication.vaultId !== record.vaultId || signedPacket.publication.revisionId !== target.revision) throw new Error('Administrative signed content mismatch.');
              store.put(appendSignedHistory(history, signedPacket), signedHistoryKey(record.vaultId));
            }
            if (nextRecord) {
              if (!signedPacket || nextRecord.revision === record.revision) throw new Error('Administrative content needs a new signed revision.');
              store.put([record, ...(checkpoints || [])].slice(0, 3), 'recovery'); store.put(nextRecord, VAULT_KEY);
            }
            store.put(authority, authorityKey(record.vaultId)); store.put(administration, adminKey(record.vaultId));
            if (state?.binding?.vaultId === record.vaultId) {
              if (state.administrationEnabled === undefined) state.administrationEnabled = state.enabled;
              if (writer) state.writer = writer;
              if (state.writer && !devices.some(device => device.id === state.writer.author && device.publicKey === state.writer.envelope.publicKey)) { delete state.writer; state.enabled = false; }
              if (signedPacket && state.enabled) enqueuePublication(state, preparePublication(state.binding, signedPacket.publication, signedPacket.authorization));
              // Retain all old-authority operations until explicit rebase.
              store.put(state, PUBLICATION_STATE_KEY);
            }
          } catch (error) { failure = error; tx.abort(); }
        };
        if (signedPacket || nextRecord) {
          const history = store.get(signedHistoryKey(record.vaultId)); const checkpoints = store.get('recovery');
          checkpoints.onsuccess = () => apply(history.result, checkpoints.result);
        } else apply();
      } catch (error) { failure = error; tx.abort(); }
    };
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = tx.onabort = () => { db.close(); reject(failure || tx.error || new Error('Administrative commit aborted.')); };
  });
}
