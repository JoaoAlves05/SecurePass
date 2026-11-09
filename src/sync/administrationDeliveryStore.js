import { getDB } from '../utils/storage.js';
import { DB_STORE_NAME } from '../constants.js';
import { PUBLICATION_STATE_KEY, sameBinding } from './publicationModel.js';
import { readAdministration } from './administrationStore.js';
import { canonicalAuthorizationChain, verifyAuthorizationChain } from './signedProtocol.js';
import { createAdministrationPublication } from './administrationProtocol.js';
import { validateUploadSession } from './publicationLimits.js';
import { verifyAuthorityGraph, authorityState, requireAuthorityState, authorityDigest } from './authorizationGraph.js';
import { canonicalAdministrationGraph, canonicalAdministrationMaterial, createAdministrationPublication2 } from './administrationProtocol2.js';
const enabled = state => state?.administrationEnabled ?? state?.enabled;
export function createAdministrationDeliveryStore(binding) {
  const pinned = structuredClone(binding);
  if (!pinned || !['accountId', 'vaultId', 'generation'].every(key => typeof pinned[key] === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(pinned[key])) || pinned.vaultId.length > 64) throw new Error('Invalid administrative binding.');
  async function access(operation, mutate, write = false) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE_NAME, write ? 'readwrite' : 'readonly'); const store = tx.objectStore(DB_STORE_NAME); let result; let failure;
      const administrative = store.get(`driveAdministration:${pinned.vaultId}`); const authority = store.get(`driveAuthorization:${pinned.vaultId}`); const publication = store.get(PUBLICATION_STATE_KEY);
      publication.onsuccess = () => {
        try {
          const state = publication.result; const journal = administrative.result;
          if (!enabled(state) || !sameBinding(state.binding, pinned)) throw new Error('Administrative binding changed or disabled.');
          const first = journal?.operations.find(value => value.phase !== 'published');
          if (!first || first.id !== operation.id || first.head !== operation.publication.revisionId || first.binding && !sameBinding(first.binding, pinned)) throw new Error('Administrative operation changed or belongs to another binding.');
          if (operation.protocol === 2) {
            if (authority.result?.format !== 2 || JSON.stringify(authority.result) !== operation.sourceAuthority || JSON.stringify(first.signed) !== operation.sourceSigned || JSON.stringify(first.material) !== operation.sourceMaterial) throw new Error('Administrative-v2 ancestry or material changed.');
          } else {
            const prefix = canonicalAuthorizationChain(authority.result?.chain || []).slice(0, operation.prefixLength);
            if (authority.result.rootFingerprint !== operation.rootFingerprint || JSON.stringify(prefix) !== JSON.stringify(operation.chain)) throw new Error('Administrative ancestry changed.');
          }
          const envelope = first.administrativeKey || journal.envelope;
          if (JSON.stringify(envelope) !== operation.sourceEnvelope) throw new Error('Administrative key envelope changed.');
          result = mutate(first, journal);
          if (write) store.put(journal, `driveAdministration:${pinned.vaultId}`);
        } catch (error) { failure = error; tx.abort(); }
      };
      tx.oncomplete = () => { db.close(); resolve(result); };
      tx.onerror = tx.onabort = () => { db.close(); reject(failure || tx.error || new Error('Administrative delivery transaction aborted.')); };
    });
  }
  return {
    async next() {
      const snapshot = await readAdministration(pinned.vaultId);
      if (!enabled(snapshot.publication) || !sameBinding(snapshot.publication.binding, pinned)) return null;
      const operation = snapshot.administration?.operations.find(value => value.phase !== 'published');
      if (!operation) return null;
      if (snapshot.authority?.format === 2) {
        const graph = await verifyAuthorityGraph(snapshot.authority.chain, { vaultId: pinned.vaultId, rootFingerprint: snapshot.authority.rootFingerprint, expectedHead: snapshot.authority.head });
        requireAuthorityState(authorityState(graph), { live: true });
        const canonical = canonicalAdministrationGraph(snapshot.authority.chain);
        const nodes = new Map(await Promise.all(canonical.map(async node => [await authorityDigest(node.payload), node])));
        const target = nodes.get(operation.head);
        if (!target || JSON.stringify(target) !== JSON.stringify(canonicalAdministrationGraph([operation.signed])[0])) throw new Error('Pending administrative-v2 state is absent from trusted ancestry.');
        const retained = new Set();
        const visit = hash => { if (retained.has(hash)) return; const node = nodes.get(hash); if (!node) throw new Error('Missing administrative-v2 ancestor.'); retained.add(hash); node.payload.parents.forEach(visit); };
        visit(operation.head);
        const chain = [...nodes].filter(([hash]) => retained.has(hash)).map(([, node]) => node);
        if (!operation.material) throw new Error('Pending administrative-v2 material is missing. Preserve the prototype journal for explicit migration.');
        const material = canonicalAdministrationMaterial(operation.material); const envelope = operation.administrativeKey;
        const publication = await createAdministrationPublication2(chain, envelope, material, { vaultId: pinned.vaultId, rootFingerprint: snapshot.authority.rootFingerprint, expectedHead: operation.head });
        const expectedDigest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(publication.body)))].map(value => value.toString(16).padStart(2, '0')).join('');
        return { ...operation, protocol: 2, binding: operation.binding || pinned, publication, chain, rootFingerprint: snapshot.authority.rootFingerprint, sourceEnvelope: JSON.stringify(envelope), sourceMaterial: JSON.stringify(operation.material), sourceAuthority: JSON.stringify(snapshot.authority), sourceSigned: JSON.stringify(operation.signed), expectedDigest };
      }
      await verifyAuthorizationChain(snapshot.authority?.chain, { vaultId: pinned.vaultId, rootFingerprint: snapshot.authority?.rootFingerprint, expectedHead: snapshot.authority?.head });
      const index = snapshot.authority.chain.findIndex(value => JSON.stringify(value) === JSON.stringify(operation.signed));
      if (index < 0) throw new Error('Pending administrative link is absent from trusted ancestry.');
      const chain = canonicalAuthorizationChain(snapshot.authority.chain.slice(0, index + 1));
      const envelope = operation.administrativeKey || snapshot.administration.envelope;
      const publication = await createAdministrationPublication(chain, envelope, { vaultId: pinned.vaultId, rootFingerprint: snapshot.authority.rootFingerprint, expectedHead: operation.head });
      const expectedDigest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(publication.body)))].map(value => value.toString(16).padStart(2, '0')).join('');
      return { ...operation, binding: operation.binding || pinned, publication, chain, prefixLength: chain.length, rootFingerprint: snapshot.authority.rootFingerprint, sourceEnvelope: JSON.stringify(envelope), expectedDigest };
    },
    assertCurrent(operation) { return access(operation, () => {}); },
    markSending(operation, values) {
      return access(operation, first => { first.binding ||= pinned; Object.assign(first, values, { phase: 'sending' }); }, true);
    },
    saveUploadSession(operation, session) {
      const value = session === null ? null : validateUploadSession(session);
      if (value && (value.total !== new TextEncoder().encode(operation.publication.body).length || value.digest !== operation.expectedDigest)) throw new Error('Administrative upload size or digest mismatch.');
      return access(operation, first => { if (value) first.uploadSession = value; else delete first.uploadSession; }, true);
    },
    recordFailure(operation, values) { return access(operation, first => { Object.assign(first, values, { phase: 'pending-publication' }); }, true); },
    acknowledge(operation, receipt) {
      if (receipt?.verified !== true || receipt.revisionId !== operation.publication.revisionId || receipt.digest !== operation.expectedDigest || !Array.isArray(receipt.fileIds) || !receipt.fileIds.length || receipt.fileIds.some(value => typeof value !== 'string' || !/^[A-Za-z0-9_-]{1,200}$/.test(value))) throw new Error('Administrative delivery was not verified.');
      return access(operation, first => { first.phase = 'published'; first.outcome = 'verified'; first.receipt = { binding: pinned, digest: receipt.digest, fileIds: [...receipt.fileIds] }; delete first.uploadSession; }, true);
    }
  };
}
