import { getStorage, setStorage, readLocalVaultRecordRaw } from './utils/storage.js';
import { withVaultOperation } from './vault/queue.js';
import { inspectSync } from './vault/sync.js';

const REQUEST = 'sp:device-test';
const RECEIPT = 'sp:device-receipt';
const LIFETIME = 5 * 60000;
const uuid = value => typeof value === 'string' && /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(value);
const digest = async record => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(record)))), byte => byte.toString(16).padStart(2, '0')).join('');
async function deviceId() {
  const { syncDeviceId } = await getStorage('local', 'syncDeviceId');
  if (uuid(syncDeviceId)) return syncDeviceId;
  const id = crypto.randomUUID(); await setStorage('local', { syncDeviceId: id }); return id;
}
function validRequest(value) {
  return value?.version === 1 && uuid(value.id) && uuid(value.source) &&
    Number.isFinite(value.createdAt) && value.createdAt <= Date.now() &&
    value.expiresAt === value.createdAt + LIFETIME && value.expiresAt > Date.now() &&
    (value.revision === null ? value.digest === null : typeof value.revision === 'string' && /^[\w-]{1,64}$/.test(value.revision) && typeof value.digest === 'string' && /^[\da-f]{64}$/.test(value.digest));
}
const code = request => request.id.replaceAll('-', '').slice(0, 8).toUpperCase();
async function requireTestedVersion(request) {
  if (!request.revision) return;
  const record = (await inspectSync()).heads.find(head => head.revision === request.revision);
  if (!record || await digest(record) !== request.digest) throw new Error('The tested vault version has not arrived completely. Wait and check again.');
}
export function startDeviceTest() {
  return withVaultOperation(async () => {
    const source = await deviceId();
    const current = await readLocalVaultRecordRaw();
    const snapshot = await getStorage('sync', null);
    const remote = await inspectSync(snapshot);
    const record = remote.heads.find(head => head.revision === current?.revision);
    const createdAt = Date.now();
    const request = { version: 1, id: crypto.randomUUID(), source, createdAt, expiresAt: createdAt + LIFETIME,
      revision: record ? current.revision : null, digest: record ? await digest(record) : null };
    // A single bounded diagnostic slot; starting a test replaces an older test.
    await setStorage('sync', { [REQUEST]: request });
    await setStorage('local', { syncDeviceTest: request });
    return { code: code(request), expiresAt: request.expiresAt };
  });
}
export function inspectDeviceTest() {
  return withVaultOperation(async () => {
    const request = (await getStorage('sync', REQUEST))[REQUEST];
    if (!validRequest(request)) throw new Error('No active test is available. Start a new test on the other device and try again.');
    if (request.source === await deviceId()) throw new Error('This test started in this Chrome profile. Receive it in a different profile or device.');
    await requireTestedVersion(request);
    return { id: request.id, code: code(request), expiresAt: request.expiresAt, includesVault: Boolean(request.revision) };
  });
}
export function confirmDeviceTest(id) {
  return withVaultOperation(async () => {
    const request = (await getStorage('sync', REQUEST))[REQUEST];
    const receiver = await deviceId();
    if (!validRequest(request) || request.id !== id || request.source === receiver) throw new Error('This test changed or expired. Receive the test again on a different device.');
    await requireTestedVersion(request);
    await setStorage('sync', { [RECEIPT]: { version: 1, id, source: request.source, receiver, revision: request.revision, digest: request.digest, receivedAt: Date.now() } });
    return {};
  });
}
export function deviceTestStatus() {
  return withVaultOperation(async () => {
    const stored = await getStorage('local', ['syncDeviceTest', 'syncDeviceReceipt']);
    const request = stored.syncDeviceTest;
    const previous = stored.syncDeviceReceipt;
    if (!request) return { state: previous ? 'confirmed' : 'none', receipt: previous };
    if (!validRequest(request)) return { state: 'expired', receipt: previous };
    const receipt = (await getStorage('sync', RECEIPT))[RECEIPT];
    if (receipt?.version === 1 && receipt.id === request.id && receipt.source === request.source &&
        uuid(receipt.receiver) && receipt.receiver !== request.source && receipt.revision === request.revision && receipt.digest === request.digest &&
        Number.isFinite(receipt.receivedAt) && receipt.receivedAt >= request.createdAt && receipt.receivedAt <= Date.now() && receipt.receivedAt < request.expiresAt) {
      await setStorage('local', { syncDeviceTest: null, syncDeviceReceipt: receipt });
      return { state: 'confirmed', receipt };
    }
    return { state: 'waiting', code: code(request), expiresAt: request.expiresAt, receipt: previous };
  });
}
