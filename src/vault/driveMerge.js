import { verifySignedPublication } from '../sync/signedProtocol.js';
import { planAuthenticatedMerge, MAX_HISTORY_RECORDS, MAX_HISTORY_BYTES } from './authenticatedMerge.js';

const encoder = new TextEncoder();
const validId = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(value);

// Read-only internal preparation; production callers must pin current trust,
// binding and heads in the guard. Listing cannot prove provider freshness.
export async function planDriveMerge({ reader, binding, localPackets = [], local, remote, authorization, bytes, assertCurrent, signal }) {
  if (typeof reader?.list !== 'function' || typeof reader?.download !== 'function' || typeof assertCurrent !== 'function') throw new Error('A bounded Drive reader and live context guard are required.');
  if (!binding || !['accountId', 'generation'].every(key => typeof binding[key] === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(binding[key])) || !validId(binding.vaultId) || !validId(local) || !validId(remote)) throw new Error('Exact Drive binding and merge heads are required.');
  if (!Array.isArray(localPackets) || localPackets.length > MAX_HISTORY_RECORDS || !(bytes instanceof Uint8Array) || bytes.length !== 32) throw new Error('Bounded local packets and an unlocked content key are required.');
  const pinned = Object.freeze({ accountId: binding.accountId, vaultId: binding.vaultId, generation: binding.generation });
  function guard() {
    signal?.throwIfAborted();
    const result = assertCurrent();
    if (result && typeof result.then === 'function') {
      Promise.resolve(result).catch(() => {});
      throw new Error('Merge context guard must be synchronous.');
    }
    if (result !== undefined && result !== true) throw new Error('Merge context changed. Review again.');
  }
  guard();
  let size = 0;
  const packets = []; const records = new Map();
  function snapshot(packet) {
    if (packets.length >= MAX_HISTORY_RECORDS || typeof packet?.body !== 'string' || packet.body.length > MAX_HISTORY_BYTES) throw new Error('Authenticated history exceeds limit.');
    size += encoder.encode(packet.body).length;
    if (size > MAX_HISTORY_BYTES) throw new Error('Authenticated history exceeds byte limit.');
    const copy = { body: packet.body, publication: { vaultId: packet.publication?.vaultId, revisionId: packet.publication?.revisionId } };
    packets.push(copy);
    return copy;
  }
  // Capture caller packets/key before the first asynchronous reader operation.
  const supplied = localPackets.map(snapshot); const key = new Uint8Array(bytes);
  function inventory(files) {
    if (!Array.isArray(files) || files.length > 10000) throw new Error('Incomplete or oversized Drive discovery.');
    const ids = new Set(); const groups = new Map();
    for (const file of files) {
      if (typeof file?.id !== 'string' || !/^[A-Za-z0-9_-]{1,200}$/.test(file.id) || ids.has(file.id)) throw new Error('Inconsistent Drive discovery.');
      ids.add(file.id);
      if (file.appProperties?.vaultId !== pinned.vaultId) continue;
      const revision = file.appProperties.revisionId;
      if (!validId(revision)) throw new Error('Invalid Drive revision identity.');
      if (!groups.has(revision)) groups.set(revision, []);
      groups.get(revision).push(file.id);
    }
    return groups;
  }
  const inventoryKey = groups => JSON.stringify([...groups].map(([id, files]) => [id, [...files].sort()]).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
  async function verify(packet) {
    if (packet.publication.vaultId !== pinned.vaultId) throw new Error('History does not match the bound vault.');
    const { record } = await verifySignedPublication(packet.body, packet.publication, authorization);
    guard();
    const previous = records.get(record.revision);
    if (previous && JSON.stringify(previous) !== JSON.stringify(record)) throw new Error('Same authenticated revision has inconsistent contents.');
    records.set(record.revision, record);
  }
  try {
    for (const packet of supplied) await verify(packet);
    const files = inventory(await reader.list(pinned, { signal })); guard();
    if (!files.has(remote)) throw new Error('Selected remote revision is missing. Preserve branches and review discovery again.');
    const seen = new Set();
    async function visit(id) {
      if (seen.has(id)) return;
      seen.add(id);
      for (const fileId of files.get(id) || []) {
        guard();
        if (packets.length >= MAX_HISTORY_RECORDS) throw new Error('Authenticated history exceeds limit.');
        const body = await reader.download(pinned, fileId, { signal }); guard();
        await verify(snapshot({ body, publication: { vaultId: pinned.vaultId, revisionId: id } }));
      }
      const record = records.get(id);
      if (!record) throw new Error('Incomplete authenticated history. Preserve branches and retrieve missing revisions.');
      for (const parent of record.parents) await visit(parent);
    }
    for (const id of [...records.keys(), local, remote]) await visit(id);
    const after = inventory(await reader.list(pinned, { signal })); guard();
    if (inventoryKey(files) !== inventoryKey(after)) throw new Error('Drive history changed. Review again.');
    return await planAuthenticatedMerge({ packets, local, remote, authorization, bytes: key, assertCurrent: guard, binding: pinned });
  } finally {
    key.fill(0);
  }
}
