import { getDB } from '../utils/storage.js';
import { DB_STORE_NAME } from '../constants.js';
import { verifyAuthorizationChain } from './signedProtocol.js';
import { verifyAuthorityGraph, authorityState } from './authorizationGraph.js';
function key(vaultId) {
  if (typeof vaultId !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(vaultId)) throw new Error('Invalid authorization vault.');
  return `driveAuthorization:${vaultId}`;
}
async function read(vaultId) {
  const storageKey = key(vaultId);
  const db = await getDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(DB_STORE_NAME,'readonly');const request=tx.objectStore(DB_STORE_NAME).get(storageKey);
    tx.oncomplete=()=>{db.close();resolve(request.result || null);};
    tx.onabort=tx.onerror=()=>{db.close();reject(tx.error || new Error('Authorization read failed.'));};
  });
}
async function write(vaultId, expected, value) {
  const storageKey=key(vaultId);
  const db=await getDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(DB_STORE_NAME,'readwrite');const store=tx.objectStore(DB_STORE_NAME);let failure;
    const request=store.get(storageKey);
    request.onsuccess=()=>{
      const previous=request.result || null;
      if ((previous?.head || null)!==expected) {failure=new Error('Authorization changed concurrently. Review again.');tx.abort();return;}
      store.put(value,storageKey);
    };
    tx.oncomplete=()=>{db.close();resolve();};
    tx.onabort=tx.onerror=()=>{db.close();reject(failure || tx.error || new Error('Authorization write failed.'));};
  });
}
// Pinning requires independent user/device trust confirmation by its administrative
// caller. It is intentionally not exposed as a website or public message handler.
export async function pinAuthorization(chain, trust) {
  const pinned=structuredClone(trust);const snapshot=structuredClone(chain);
  const verified=await verifyAuthorizationChain(snapshot,pinned);
  await write(pinned.vaultId,null,{rootFingerprint:pinned.rootFingerprint,head:verified.hash,chain:snapshot});
  return verified;
}
export async function loadAuthorization(vaultId) {
  const stored=await read(vaultId);if(!stored)return null;
  if (stored.format === 2) return authorityState(await verifyAuthorityGraph(stored.chain, { vaultId, rootFingerprint: stored.rootFingerprint, expectedHead: stored.head }));
  return verifyAuthorizationChain(stored.chain,{vaultId,rootFingerprint:stored.rootFingerprint,expectedHead:stored.head});
}
export async function advanceAuthorization(vaultId, chain) {
  const snapshot=structuredClone(chain);const stored=await read(vaultId);
  if(!stored)throw new Error('Pin an independently verified authorization root first.');
  await verifyAuthorizationChain(stored.chain,{vaultId,rootFingerprint:stored.rootFingerprint,expectedHead:stored.head});
  const verified=await verifyAuthorizationChain(snapshot,{vaultId,rootFingerprint:stored.rootFingerprint,checkpoint:stored.head});
  await write(vaultId,stored.head,{rootFingerprint:stored.rootFingerprint,head:verified.hash,chain:snapshot});
  return verified;
}
