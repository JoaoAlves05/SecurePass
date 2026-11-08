import { withVaultOperation } from './queue.js';
import { readLocalVaultRecordRaw } from '../utils/storage.js';
import * as session from './session.js';
import { publicationStore } from '../sync/publicationStore.js';
import { sameBinding } from '../sync/publicationModel.js';
import { loadAuthorization } from '../sync/authorizationStore.js';
import { createDriveReader, DriveError } from '../sync/driveTransport.js';
import { googleConfigured, assertGoogleBinding, getBoundGoogleToken } from '../sync/googleConnection.js';
import { verifySignedPublication } from '../sync/signedProtocol.js';
import { planDriveMerge } from './driveMerge.js';
import { MAX_HISTORY_BYTES, MAX_HISTORY_RECORDS } from './authenticatedMerge.js';
import { describeThreeWayMerge, discardThreeWayMerge } from './threeWayMerge.js';
import { applyAuthenticatedMerge } from './mergeService.js';
import { decryptPayloadWithKey } from './crypto.js';

const validId = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(value);
const uuid = value => typeof value === 'string' && /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(value);
const encoder = new TextEncoder();
async function defaultReader(binding, { signal } = {}) {
  const token = await getBoundGoogleToken(binding, { signal });
  return createDriveReader({ getToken: async () => token, assertBinding: assertGoogleBinding });
}
function inventory(files, vaultId) {
  if (!Array.isArray(files) || files.length > 10000) throw new Error('Incomplete Drive inventory. Retry inspection.');
  const ids = new Set(); const selected = [];
  for (const file of files) {
    if (typeof file?.id !== 'string' || !/^[A-Za-z0-9_-]{1,200}$/.test(file.id) || ids.has(file.id)) throw new Error('Inconsistent Drive inventory. Retry inspection.');
    ids.add(file.id);
    if (file.appProperties?.vaultId !== vaultId) continue;
    if (!validId(file.appProperties.revisionId) || selected.length >= MAX_HISTORY_RECORDS) throw new Error('Drive history exceeds supported inspection limits.');
    selected.push({ id: file.id, revision: file.appProperties.revisionId });
  }
  return selected.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}

export function createDriveReviewService({ makeReader = defaultReader } = {}) {
  const requests = new Map();
  function discard(token, owner) {
    const item = requests.get(token);
    if (!item || owner !== undefined && owner !== item.owner) return;
    requests.delete(token); item.controller.abort(); clearTimeout(item.timer);
    if (item.plan) discardThreeWayMerge(item.plan);
  }
  function clear(owner) { for (const [token, item] of requests) if (owner === undefined || item.owner === owner) discard(token, owner); }
  function prune() { for (const [token, item] of requests) if (Date.now() < item.createdAt || item.expiresAt <= Date.now()) discard(token); }
  function register(owner, token) {
    if (typeof owner !== 'string' || !owner || !uuid(token)) throw new Error('Invalid Drive review request.');
    prune();
    if (requests.has(token) && requests.get(token).owner !== owner) throw new Error('Drive review belongs to another management document.');
    clear(owner);
    if (requests.size >= 8) throw new Error('Too many Drive reviews. Close another review and try again.');
    const item = { owner, controller: new AbortController(), createdAt: Date.now(), expiresAt: Date.now() + 120000 };
    item.timer = setTimeout(() => { if (requests.get(token) === item) discard(token, owner); }, 120000);
    requests.set(token, item); return item;
  }
  async function context() {
    if (!googleConfigured()) throw new Error('Google is not configured in this installation.');
    const drive = await publicationStore.context();
    if (!drive.enabled || !drive.writer) throw new Error('Drive review is not available for this installation.');
    const record = await readLocalVaultRecordRaw(); const active = await session.current(record);
    try {
      const authorization = await loadAuthorization(record.vaultId);
      if (!authorization || authorization.payload.keyEpoch !== record.keyEpoch || drive.binding?.vaultId !== record.vaultId || !authorization.payload.devices.some(device => device.id === drive.writer.author && device.publicKey === drive.writer.envelope.publicKey)) throw new Error('Drive authorization changed. Reconnect this device before reviewing.');
      await assertGoogleBinding(drive.binding); session.assertGeneration(active.epoch);
      delete active.entries;
      active.record = { vaultId: record.vaultId, revision: record.revision, keyEpoch: record.keyEpoch, parents: [...record.parents] };
      return { active, authorization, binding: Object.freeze({ ...drive.binding }) };
    } catch (error) { active.bytes.fill(0); throw error; }
  }
  function guard(value, item) {
    item?.controller.signal.throwIfAborted(); session.assertGeneration(value.active.epoch);
    if (value.active.deadline <= Date.now()) throw new Error('Vault is locked');
  }
  async function recheck(value, item) {
    guard(value, item); await assertGoogleBinding(value.binding);
    const drive = await publicationStore.context(); const authorization = await loadAuthorization(value.binding.vaultId);
    if (!drive.enabled || !sameBinding(drive.binding, value.binding) || authorization?.hash !== value.authorization.hash || (await readLocalVaultRecordRaw())?.revision !== value.active.record.revision) throw new Error('Drive review context changed. Review again.');
    guard(value, item);
  }
  async function status() {
    return withVaultOperation(async () => {
      try { const value = await context(); value.active.bytes.fill(0); return { available: true }; }
      catch { return { available: false }; }
    });
  }
  async function inspect(owner, token) {
    const item = register(owner, token);
    return (async () => {
      item.controller.signal.throwIfAborted();
      const value = await withVaultOperation(() => context());
      try {
        guard(value, item);
        const reader = await makeReader(value.binding, { signal: item.controller.signal }); guard(value, item);
        const files = inventory(await reader.list(value.binding, { signal: item.controller.signal }), value.binding.vaultId);
        const records = new Map(); const blocked = new Set(); let size = 0;
        for (const file of files) {
          guard(value, item);
          try {
            const body = await reader.download(value.binding, file.id, { signal: item.controller.signal }); guard(value, item);
            if (typeof body !== 'string' || body.length > MAX_HISTORY_BYTES) throw new DriveError('response-too-large');
            size += encoder.encode(body).length;
            if (size > MAX_HISTORY_BYTES) throw new DriveError('response-too-large');
            const { record } = await verifySignedPublication(body, { vaultId: value.binding.vaultId, revisionId: file.revision }, value.authorization);
            guard(value, item);
            const previous = records.get(record.revision);
            if (previous && JSON.stringify(previous) !== JSON.stringify(record)) blocked.add(record.revision);
            records.set(record.revision, record);
          } catch (error) {
            if (error instanceof DriveError && error.code !== 'missing') throw error;
            guard(value, item); blocked.add(file.revision);
          }
        }
        const visiting = new Set(); const checked = new Set();
        function cyclic(id) {
          if (visiting.has(id)) return true;
          if (checked.has(id)) return blocked.has(id);
          visiting.add(id);
          const invalid = records.get(id).parents.some(parent => records.has(parent) && cyclic(parent));
          visiting.delete(id); checked.add(id);
          if (invalid) blocked.add(id);
          return invalid;
        }
        for (const id of records.keys()) cyclic(id);
        for (const id of blocked) records.delete(id);
        const parents = new Set([...records.values()].flatMap(record => record.parents));
        const copies = [];
        for (const record of records.values()) if (!parents.has(record.revision) && record.revision !== value.active.record.revision && !value.active.record.parents.includes(record.revision)) {
          try {
            const payload = await decryptPayloadWithKey(record, value.active.bytes, { requireIdentity: true }); guard(value, item);
            copies.push({ revision: record.revision, updatedAt: record.updatedAt, entryCount: payload.entries.length });
          } catch { guard(value, item); blocked.add(record.revision); }
        }
        copies.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.revision.localeCompare(b.revision));
        const after = inventory(await reader.list(value.binding, { signal: item.controller.signal }), value.binding.vaultId);
        if (JSON.stringify(files) !== JSON.stringify(after)) throw new Error('Drive inventory changed. Inspect again.');
        await recheck(value, item);
        return { copies, issues: blocked.size };
      } finally { value.active.bytes.fill(0); }
    })().finally(() => { if (requests.get(token) === item) discard(token, owner); });
  }
  function preview(revision, owner, token) {
    if (!validId(revision)) return Promise.reject(new Error('Invalid Drive review request.'));
    let item;
    try { item = register(owner, token); } catch (error) { return Promise.reject(error); }
    return (async () => {
      item.controller.signal.throwIfAborted();
      const value = await withVaultOperation(() => context());
      try {
        item.binding = value.binding;
        guard(value, item);
        const reader = await makeReader(value.binding, { signal: item.controller.signal }); guard(value, item);
        const localPackets = await publicationStore.pendingPackets(value.binding); guard(value, item);
        item.plan = await planDriveMerge({ reader, binding: value.binding, localPackets, local: value.active.record.revision, remote: revision, authorization: value.authorization, bytes: value.active.bytes, assertCurrent: () => guard(value, item), signal: item.controller.signal });
        await recheck(value, item);
        clearTimeout(item.timer); item.createdAt = Date.now(); item.expiresAt = item.plan.expiresAt;
        item.timer = setTimeout(() => { if (requests.get(token) === item) discard(token, owner); }, Math.max(0, item.expiresAt - Date.now()));
        return { token, ...describeThreeWayMerge(item.plan) };
      } finally { value.active.bytes.fill(0); }
    })().catch(error => { if (requests.get(token) === item) discard(token, owner); throw error; });
  }
  async function commit(token, owner, decisions) {
    prune(); const item = requests.get(token);
    if (!item || item.owner !== owner || !item.plan || item.committing) throw new Error('Drive review expired or belongs to another management document.');
    item.committing = true;
    try { await assertGoogleBinding(item.binding); const result = await applyAuthenticatedMerge(item.plan, decisions); discard(token, owner); return result; }
    finally { item.committing = false; }
  }
  return { status, inspect, preview, commit, cancel: discard, clear };
}

export const driveReview = createDriveReviewService();
