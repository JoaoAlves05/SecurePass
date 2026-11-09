import { readLocalVaultRecordRaw } from '../utils/storage.js';
import { validateMaster } from '../validation.js';
import { decryptRecord } from '../vault/crypto.js';
import { withVaultOperation } from '../vault/queue.js';
import * as session from '../vault/session.js';
import { createAdministrativeKey, createDeviceKey, unlockAdministrativeKey } from './signingKeyProtection.js';
import { createAuthorization, verifyAuthorizationChain, signingKeyFingerprint } from './signedProtocol.js';
import { readAdministration, commitAdministration } from './administrationStore.js';
import { verifyAdministration2, prepareBootstrap2, prepareDeviceChange2 } from './administration2.js';
import { loadSettings } from '../settings.js';
const id = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(value);
const head = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
function request(value, kind) {
  if (!value || !id(value.operationId) || !id(value.deviceId) || kind !== 'bootstrap' && !head(value.expectedHead)) throw new Error('A stable operation ID, device and reviewed head are required.');
  if (kind === 'enroll' && (typeof value.publicKey !== 'string' || value.publicKey.length > 128)) throw new Error('Invalid enrollment public key.');
  return { operationId: value.operationId, deviceId: value.deviceId, ...(kind === 'bootstrap' ? {} : { expectedHead: value.expectedHead }), ...(kind === 'enroll' ? { publicKey: value.publicKey } : {}) };
}
const summary = (state, operation, replayed = false) => ({ head: state.hash, vaultId: state.payload.vaultId, keyEpoch: state.payload.keyEpoch, devices: state.payload.devices.map(device => ({ id: device.id, publicKey: device.publicKey })), operationId: operation.id, operationHead: operation.head, phase: operation.phase, replayed });
async function verified(snapshot, record) {
  const authority = snapshot.authority;
  if (!authority) throw new Error('Initialize or adopt independently verified vault authority first.');
  if (record.version === 3) return verifyAdministration2(snapshot, record);
  if (snapshot.administration && (snapshot.administration.version !== 1 || !Array.isArray(snapshot.administration.operations) || snapshot.administration.operations.length > 256 || snapshot.administration.operations.filter(value => value.phase !== 'published').length > 32)) throw new Error('Administrative state is damaged. Preserve it for recovery.');
  const state = await verifyAuthorizationChain(authority.chain, { vaultId: record.vaultId, rootFingerprint: authority.rootFingerprint, expectedHead: authority.head });
  if (state.payload.keyEpoch !== record.keyEpoch) throw new Error('Administrative epoch does not match the current vault.');
  return state;
}
async function authenticate(passphrase) {
  validateMaster(passphrase);
  const record = await readLocalVaultRecordRaw();
  if (![2, 3].includes(record?.version)) throw new Error('Unlock a supported local vault before administration.');
  if (record.version === 3 && (await loadSettings()).useSync) throw new Error('Pause legacy Chrome Sync before protocol-v2 administration.');
  const active = await session.current(record);
  try {
    const proof = await decryptRecord(record, passphrase);
    proof.bytes.fill(0);
    const assertCurrent = () => { session.assertGeneration(active.epoch); if (active.deadline <= Date.now()) throw new Error('Vault is locked'); };
    assertCurrent(); return { record, active, assertCurrent };
  } catch (error) { active.bytes.fill(0); throw error; }
}
function replay(snapshot, state, kind, input) {
  const found = snapshot.administration?.operations.find(operation => operation.id === input.operationId);
  if (!found) return null;
  if (found.kind !== kind || JSON.stringify(found.request) !== JSON.stringify(input)) throw new Error('Administrative operation ID was reused with different inputs.');
  return summary(state, found, true);
}
function append(snapshot, envelope, operation) {
  const operations = snapshot.administration?.operations || [];
  if (operations.filter(value => value.phase !== 'published').length >= 32) throw new Error('Administrative queue is full. Preserve pending operations before continuing.');
  return { version: 1, envelope, operations: [...operations, operation] };
}
export function bootstrapAdministration(passphrase, values) {
  const input = request(values, 'bootstrap');
  return withVaultOperation(async () => {
    const { record, active, assertCurrent } = await authenticate(passphrase);
    try {
      const previous = await readAdministration(record.vaultId);
      if (previous.authority) {
        const state = await verified(previous, record); const repeated = replay(previous, state, 'bootstrap', input);
        if (repeated) return repeated;
        throw new Error('This vault already has authority. Review its current registry.');
      }
      if (previous.administration) throw new Error('Administrative state is incomplete. Preserve it for recovery.');
      if (record.version === 3) {
        const prepared = await prepareBootstrap2(passphrase, input, record, active, previous);
        await commitAdministration({ record, previous, ...prepared, validateCommit: assertCurrent });
        return summary(prepared.state, prepared.operation);
      }
      const admin = await createAdministrativeKey(passphrase, record);
      const device = await createDeviceKey(active.bytes, record);
      const signed = await createAuthorization({ kind: 'securepass-authorization', version: 1, vaultId: record.vaultId, keyEpoch: record.keyEpoch, revision: crypto.randomUUID(), previous: null, adminKey: admin.envelope.publicKey, devices: [{ id: input.deviceId, publicKey: device.envelope.publicKey }] }, admin.privateKey);
      const rootFingerprint = await signingKeyFingerprint(admin.envelope.publicKey); const chain = [signed];
      const state = await verifyAuthorizationChain(chain, { vaultId: record.vaultId, rootFingerprint });
      const operation = { id: input.operationId, kind: 'bootstrap', request: input, previousHead: null, head: state.hash, signed, administrativeKey: admin.envelope, phase: 'pending-publication' };
      const administration = append(previous, admin.envelope, operation);
      // Retain the encrypted local device key even before an account is linked.
      administration.localWriter = { author: input.deviceId, envelope: device.envelope };
      await commitAdministration({ record, previous, authority: { rootFingerprint, head: state.hash, chain }, administration, writer: administration.localWriter, validateCommit: assertCurrent });
      return summary(state, operation);
    } finally { active.bytes.fill(0); }
  });
}
async function change(kind, passphrase, values) {
  const input = request(values, kind);
  return withVaultOperation(async () => {
    const { record, active, assertCurrent } = await authenticate(passphrase);
    try {
      const previous = await readAdministration(record.vaultId); const state = await verified(previous, record);
      const repeated = replay(previous, state, kind, input); if (repeated) return repeated;
      if (state.hash !== input.expectedHead) throw new Error('Administrative head changed. Review again.');
      if (record.version === 3) {
        const prepared = await prepareDeviceChange2(kind, passphrase, input, record, active, previous, state);
        await commitAdministration({ record, previous, ...prepared, validateCommit: assertCurrent });
        if (prepared.nextRecord) await session.activate(prepared.nextRecord, active.entries, active.bytes, active.epoch);
        return summary(prepared.state, prepared.operation);
      }
      const protectedKey = previous.administration?.envelope;
      if (!protectedKey || protectedKey.publicKey !== state.payload.adminKey) throw new Error('The current administrative private key is unavailable. Use the recovery procedure.');
      const privateKey = await unlockAdministrativeKey(protectedKey, passphrase, record);
      let devices = [...state.payload.devices]; const found = devices.find(device => device.id === input.deviceId);
      if (kind === 'enroll') {
        if (found) throw new Error('Device identity already exists. Do not replace its key implicitly.');
        devices.push({ id: input.deviceId, publicKey: input.publicKey });
        devices.sort((a, b) => a.id < b.id ? -1 : 1);
      } else {
        if (!found) throw new Error('This device is not currently enrolled.');
        if (devices.length === 1) throw new Error('Cannot revoke the last authorized device.');
        devices = devices.filter(device => device.id !== input.deviceId);
      }
      const signed = await createAuthorization({ ...state.payload, revision: crypto.randomUUID(), previous: state.hash, devices }, privateKey);
      const chain = [...previous.authority.chain, signed];
      const next = await verifyAuthorizationChain(chain, { vaultId: record.vaultId, rootFingerprint: previous.authority.rootFingerprint, checkpoint: state.hash });
      const operation = { id: input.operationId, kind, request: input, previousHead: state.hash, head: next.hash, signed, administrativeKey: protectedKey, phase: 'pending-publication' };
      const administration = append(previous, protectedKey, operation);
      const localWriter = previous.administration.localWriter;
      if (localWriter && devices.some(device => device.id === localWriter.author && device.publicKey === localWriter.envelope.publicKey)) administration.localWriter = localWriter;
      await commitAdministration({ record, previous, authority: { ...previous.authority, head: next.hash, chain }, administration, validateCommit: assertCurrent });
      return summary(next, operation);
    } finally { active.bytes.fill(0); }
  });
}
export const enrollDevice = (passphrase, values) => change('enroll', passphrase, values);
export const revokeDevice = (passphrase, values) => change('revoke', passphrase, values);
export function retryAdministrativeDelivery(passphrase, values) {
  if (!values || !id(values.operationId) || !head(values.expectedHead)) throw new Error('Review the administrative operation and current head before retrying.');
  const input = { operationId: values.operationId, expectedHead: values.expectedHead };
  return withVaultOperation(async () => {
    const { record, active, assertCurrent } = await authenticate(passphrase);
    try {
      const previous = await readAdministration(record.vaultId); const state = await verified(previous, record);
      if (state.hash !== input.expectedHead) throw new Error('Administrative head changed. Review again.');
      const operation = previous.administration?.operations.find(value => value.id === input.operationId);
      if (!operation || operation.phase === 'published') throw new Error('This administrative operation is missing or already delivered.');
      const context = previous.publication;
      if (!(context?.administrationEnabled ?? context?.enabled) || context.binding?.vaultId !== record.vaultId) throw new Error('Explicitly enable this administrative binding before retrying.');
      if (operation.binding && operation.binding.accountId !== context.binding.accountId) throw new Error('An administrative operation cannot be transferred to another account.');
      if (!previous.authority.chain.some(value => JSON.stringify(value) === JSON.stringify(operation.signed))) throw new Error('Administrative operation is absent from trusted ancestry.');
      const administration = structuredClone(previous.administration); const retry = administration.operations.find(value => value.id === input.operationId);
      Object.assign(retry, { binding: context.binding, phase: 'pending-publication', attempts: 0, nextAttempt: 0, blocked: false, outcome: 'unknown' }); delete retry.code;
      await commitAdministration({ record, previous, authority: previous.authority, administration, state, validateCommit: assertCurrent });
      return summary(state, retry);
    } finally { active.bytes.fill(0); }
  });
}
export async function administrationStatus() {
  const record = await readLocalVaultRecordRaw();
  if (!record?.vaultId) return { initialized: false };
  const snapshot = await readAdministration(record.vaultId);
  if (!snapshot.authority) return { initialized: false };
  const state = await verified(snapshot, record);
  const operations = snapshot.administration?.operations || [];
  return { initialized: true, head: state.hash, vaultId: state.payload.vaultId, keyEpoch: state.payload.keyEpoch, devices: state.payload.devices.map(device => ({ ...device })), deliveryEnabled: Boolean(snapshot.publication?.administrationEnabled ?? snapshot.publication?.enabled), contentEnabled: Boolean(snapshot.publication?.enabled), pending: operations.filter(value => value.phase !== 'published').map(({ id, kind, head, phase, code, attempts, outcome, nextAttempt, blocked }) => ({ id, kind, head, phase, code, attempts, outcome, nextAttempt, blocked })), publishedCount: operations.filter(value => value.phase === 'published').length };
}
