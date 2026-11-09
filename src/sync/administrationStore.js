import { getDB, recordRevision } from '../utils/storage.js';
import { DB_STORE_NAME, VAULT_KEY } from '../constants.js';
import { PUBLICATION_STATE_KEY, sameBinding } from './publicationModel.js';
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
export async function commitAdministration({ record, previous, authority, administration, writer, validateCommit }) {
  validateId(record?.vaultId);
  if (new TextEncoder().encode(JSON.stringify({ authority, administration })).length > 4 * 1024 * 1024) throw new Error('Administrative history capacity reached. Preserve the current chain and review compaction.');
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE_NAME, 'readwrite'); const store = tx.objectStore(DB_STORE_NAME); let failure;
    const live = store.get(VAULT_KEY); const auth = store.get(authorityKey(record.vaultId)); const admin = store.get(adminKey(record.vaultId)); const publication = store.get(PUBLICATION_STATE_KEY);
    publication.onsuccess = () => {
      try {
        validateCommit();
        if (recordRevision(live.result) !== record.revision || live.result?.keyEpoch !== record.keyEpoch || live.result?.vaultId !== record.vaultId) throw new Error('Vault changed during administration.');
        if (JSON.stringify(auth.result || null) !== JSON.stringify(previous.authority) || JSON.stringify(admin.result || null) !== JSON.stringify(previous.administration)) throw new Error('Administration changed concurrently. Review again.');
        const state = publication.result || null;
        if (Boolean(state) !== Boolean(previous.publication) || state && (state.enabled !== previous.publication.enabled || state.administrationEnabled !== previous.publication.administrationEnabled || !sameBinding(state.binding, previous.publication.binding) && (state.binding || previous.publication.binding) || JSON.stringify(state.writer) !== JSON.stringify(previous.publication.writer))) throw new Error('Drive binding or writer changed during administration.');
        store.put(authority, authorityKey(record.vaultId)); store.put(administration, adminKey(record.vaultId));
        if (state?.binding?.vaultId === record.vaultId) {
          if (state.administrationEnabled === undefined) state.administrationEnabled = state.enabled;
          if (writer) state.writer = writer;
          if (state.writer && !authority.chain.at(-1).payload.devices.some(device => device.id === state.writer.author && device.publicKey === state.writer.envelope.publicKey)) { delete state.writer; state.enabled = false; }
          // Retain all operations, including old-authority work. The publisher's
          // current-head guard blocks it until authenticated rebase is complete.
          store.put(state, PUBLICATION_STATE_KEY);
        }
      } catch (error) { failure = error; tx.abort(); }
    };
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = tx.onabort = () => { db.close(); reject(failure || tx.error || new Error('Administrative commit aborted.')); };
  });
}
