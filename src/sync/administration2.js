import { createAdministrativeKey, createDeviceKey, unlockAdministrativeKey, unlockDeviceKey } from './signingKeyProtection.js';
import { signingKeyFingerprint } from './signedProtocol.js';
import { createAuthorityState, verifyAuthorityGraph, authorityState, authorityDigest, requireAuthorityState } from './authorizationGraph.js';
import { protectionDigest, canonicalRecord3, createSignedRevision2, verifySignedRevision2, revisionReference, anchorReferences } from './revisionProtocol2.js';
import { readSignedHistory } from './signedHistoryStore.js';
import { encryptEntries } from '../vault/crypto.js';

function append(previous, envelope, operation, writer) {
  const operations = previous.administration?.operations || [];
  if (operations.length >= 256 || operations.filter(value => value.phase !== 'published').length >= 32) throw new Error('Administrative queue is full. Preserve pending operations before continuing.');
  return { version: 2, envelope, operations: [...operations, operation], ...(writer ? { localWriter: writer } : {}) };
}
async function packetFor(record, writer, privateKey, state, parents = []) {
  const body = await createSignedRevision2(record, { author: writer.author, privateKey, state, parents });
  return { authorization: state.hash, publication: { vaultId: record.vaultId, revisionId: record.revision, body } };
}
export async function verifyAdministration2(snapshot, record) {
  if (snapshot.authority?.format !== 2 || snapshot.administration?.version !== 2 || !Array.isArray(snapshot.administration.operations) || snapshot.administration.operations.length > 256 || snapshot.administration.operations.filter(value => value.phase !== 'published').length > 32) throw new Error('Administrative-v2 state is damaged. Preserve it for recovery.');
  const graph = await verifyAuthorityGraph(snapshot.authority.chain, { vaultId: record.vaultId, rootFingerprint: snapshot.authority.rootFingerprint, expectedHead: snapshot.authority.head });
  const state = authorityState(graph);
  if (state.payload.keyEpoch !== record.keyEpoch || await protectionDigest(record) !== state.payload.protectionDigest) throw new Error('Administrative protection does not match the current vault.');
  return state;
}
export async function prepareBootstrap2(passphrase, input, record, active, previous) {
  if (record.parents.length) throw new Error('Unsigned ancestry requires explicit migration. No signed parent history was invented.');
  const admin = await createAdministrativeKey(passphrase, record); const device = await createDeviceKey(active.bytes, record);
  const payload = { kind: 'securepass-authorization', version: 2, vaultId: record.vaultId, keyEpoch: record.keyEpoch, revision: crypto.randomUUID(), parents: [], reason: 'bootstrap', adminKey: admin.envelope.publicKey, devices: [{ id: input.deviceId, publicKey: device.envelope.publicKey }], protectionDigest: await protectionDigest(record), keyHistoryDigest: null, recovery: null, contentAnchors: [], contentVersion: 3, writerVersion: 2 };
  const signed = await createAuthorityState(payload, [{ parent: null, role: 'admin', privateKey: admin.privateKey }]);
  const rootFingerprint = await signingKeyFingerprint(payload.adminKey); const chain = [signed];
  const state = authorityState(await verifyAuthorityGraph(chain, { vaultId: record.vaultId, rootFingerprint }));
  const writer = { author: input.deviceId, envelope: device.envelope };
  const operation = { id: input.operationId, kind: 'bootstrap', request: input, previousHead: null, head: state.hash, signed, administrativeKey: admin.envelope, phase: 'pending-publication' };
  return { state, operation, authority: { format: 2, rootFingerprint, head: state.hash, chain }, administration: append(previous, admin.envelope, operation, writer), writer, signedPacket: await packetFor(record, writer, device.privateKey, state) };
}
export async function prepareDeviceChange2(kind, passphrase, input, record, active, previous, state) {
  const protectedKey = previous.administration.envelope;
  if (protectedKey?.publicKey !== state.payload.adminKey) throw new Error('Current administrative private key unavailable. Use recovery.');
  const privateKey = await unlockAdministrativeKey(protectedKey, passphrase, record);
  let devices = [...state.payload.devices]; const found = devices.find(device => device.id === input.deviceId);
  if (kind === 'enroll') {
    if (found) throw new Error('Device identity already exists. Do not replace its key implicitly.');
    devices.push({ id: input.deviceId, publicKey: input.publicKey }); devices.sort((a, b) => a.id < b.id ? -1 : 1);
  } else {
    if (!found) throw new Error('This device is not currently enrolled.');
    if (devices.length === 1) throw new Error('Cannot revoke the last authorized device.');
    devices = devices.filter(device => device.id !== input.deviceId);
  }
  const history = await readSignedHistory(record.vaultId);
  const stored = history.packets.find(packet => packet.publication.revisionId === record.revision);
  if (!stored) throw new Error('Current signed content is unavailable. Preserve the branch and review rebase.');
  const reference = stored.authorization === state.hash ? undefined : anchorReferences(state).find(value => value.revision === record.revision);
  if (stored.authorization !== state.hash && !reference) throw new Error('Current historical content has no authenticated administrative anchor.');
  const original = await verifySignedRevision2(stored.publication.body, stored.publication, { graph: requireAuthorityState(state, { live: true }).graph, reference });
  if (JSON.stringify(original.record) !== JSON.stringify(canonicalRecord3(record))) throw new Error('Current signed content differs from the local record.');
  const parent = revisionReference(original); const anchors = [...state.payload.contentAnchors];
  const existing = anchors.find(value => value.revision === parent.revision);
  if (existing && JSON.stringify(existing) !== JSON.stringify(parent)) throw new Error('Conflicting authenticated content anchor.');
  if (!existing) anchors.push({ ...parent }); anchors.sort((a, b) => a.revision < b.revision ? -1 : 1);
  const signed = await createAuthorityState({ ...state.payload, revision: crypto.randomUUID(), parents: [state.hash], reason: kind, devices, contentAnchors: anchors }, [{ parent: state.hash, role: 'admin', privateKey }]);
  const chain = [...previous.authority.chain, signed];
  const next = authorityState(await verifyAuthorityGraph(chain, { vaultId: record.vaultId, rootFingerprint: previous.authority.rootFingerprint, checkpoint: state.hash, expectedHead: await authorityDigest(signed.payload) }));
  const operation = { id: input.operationId, kind, request: input, previousHead: state.hash, head: next.hash, signed, administrativeKey: protectedKey, phase: 'pending-publication' };
  const writer = previous.administration.localWriter;
  const retained = writer && devices.some(device => device.id === writer.author && device.publicKey === writer.envelope.publicKey) ? writer : null;
  const result = { state: next, operation, authority: { ...previous.authority, head: next.hash, chain }, administration: append(previous, protectedKey, operation, retained) };
  if (retained) {
    const signer = await unlockDeviceKey(retained.envelope, active.bytes, record);
    result.nextRecord = await encryptEntries(record, active.entries, active.bytes);
    result.signedPacket = await packetFor(result.nextRecord, retained, signer, next, [parent]);
  }
  return result;
}
