import { getDB } from '../utils/storage.js';
import { DB_STORE_NAME } from '../constants.js';
import { signedHistoryKey } from './signedHistoryModel.js';
export async function readSignedHistory(vaultId) {
  const key = signedHistoryKey(vaultId); const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE_NAME, 'readonly'); const request = tx.objectStore(DB_STORE_NAME).get(key);
    tx.oncomplete = () => { db.close(); resolve(request.result || { version: 2, packets: [] }); };
    tx.onabort = tx.onerror = () => { db.close(); reject(tx.error || new Error('Signed history read failed.')); };
  });
}
