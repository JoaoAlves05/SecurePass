import { verifySignedPublication } from '../sync/signedProtocol.js';
import { decryptPayloadWithKey } from './crypto.js';
import { planThreeWayMerge } from './threeWayMerge.js';

export const MAX_HISTORY_RECORDS = 256;
export const MAX_HISTORY_BYTES = 32 * 1024 * 1024;
const encoder = new TextEncoder();
const validId = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(value);

function checkCurrent(guard) {
  const result = guard();
  if (result && typeof result.then === 'function') {
    Promise.resolve(result).catch(() => {});
    throw new Error('Merge context guard must be synchronous.');
  }
  if (result !== undefined && result !== true) throw new Error('Merge context changed. Review again.');
}

function commonBase(records, local, remote) {
  const ancestors = new Map();
  const visiting = new Set();
  function visit(id) {
    if (visiting.has(id)) throw new Error('Cyclic authenticated history.');
    if (ancestors.has(id)) return ancestors.get(id);
    const record = records.get(id);
    if (!record) throw new Error('Incomplete authenticated history. Preserve branches and retrieve missing revisions.');
    visiting.add(id);
    const result = new Set([id]);
    for (const parent of record.parents) for (const ancestor of visit(parent)) result.add(ancestor);
    visiting.delete(id); ancestors.set(id, result);
    return result;
  }
  // Validate every supplied branch; disconnected malformed history is not ignored.
  for (const id of records.keys()) visit(id);
  const left = visit(local); const right = visit(remote);
  const shared = [...left].filter(id => right.has(id));
  const nearest = shared.filter(id => !shared.some(other => other !== id && ancestors.get(other).has(id)));
  if (nearest.length !== 1) throw new Error('No unique authenticated common base. Preserve branches for explicit review.');
  return nearest[0];
}

// Internal same-authorization/same-epoch adapter. No storage or transport effects.
// The caller pins the current authorization/binding and session in assertCurrent.
export async function planAuthenticatedMerge({ packets, local, remote, authorization, bytes, assertCurrent }) {
  if (typeof assertCurrent !== 'function') throw new Error('A live authorization/session/revision guard is required.');
  checkCurrent(assertCurrent);
  if (!validId(local) || !validId(remote) || !Array.isArray(packets) || !packets.length || packets.length > MAX_HISTORY_RECORDS) throw new Error('A bounded authenticated history and exact head identities are required.');
  if (!(bytes instanceof Uint8Array) || bytes.length !== 32) throw new Error('An unlocked content key is required.');
  let size = 0;
  // Capture all caller-controlled inputs before the first asynchronous operation.
  const history = packets.map(packet => {
    if (typeof packet?.body !== 'string' || packet.body.length > MAX_HISTORY_BYTES) throw new Error('Authenticated history exceeds byte limit.');
    size += encoder.encode(packet.body).length;
    if (size > MAX_HISTORY_BYTES) throw new Error('Authenticated history exceeds byte limit.');
    return { body: packet.body, publication: { vaultId: packet.publication?.vaultId, revisionId: packet.publication?.revisionId } };
  });
  const key = new Uint8Array(bytes);
  try {
    const records = new Map();
    for (const packet of history) {
      const { record } = await verifySignedPublication(packet.body, packet.publication, authorization);
      checkCurrent(assertCurrent);
      const previous = records.get(record.revision);
      if (previous && JSON.stringify(previous) !== JSON.stringify(record)) throw new Error('Same authenticated revision has inconsistent contents.');
      records.set(record.revision, record);
    }
    const base = commonBase(records, local, remote);
    const snapshots = [];
    for (const id of [base, local, remote]) {
      snapshots.push(await decryptPayloadWithKey(records.get(id), key, { requireIdentity: true }));
      checkCurrent(assertCurrent);
    }
    // A compacted base may no longer contain an old ID. Its absence alone must
    // never turn a concurrent stale copy into a new credential.
    const baseIds = new Set(snapshots[0].entries.map(entry => entry.id));
    for (const [left, right] of [[snapshots[1], snapshots[2]], [snapshots[2], snapshots[1]]]) {
      const live = new Set(right.entries.map(entry => entry.id));
      const baseDeleted = new Map(snapshots[0].tombstones.map(item => [item.id, item.revision]));
      if (left.tombstones.some(item => live.has(item.id) && !baseIds.has(item.id) && baseDeleted.get(item.id) !== item.revision)) throw new Error('Unresolved deletion history. Preserve branches and restore the entry explicitly.');
    }
    const record = records.get(base);
    return planThreeWayMerge({ base: snapshots[0].entries, local: snapshots[1].entries, remote: snapshots[2].entries, identity: { vaultId: record.vaultId, keyEpoch: record.keyEpoch, base, local, remote }, assertCurrent });
  } finally {
    key.fill(0);
  }
}
