import { getStorage, setStorage } from '../utils/storage.js';
import { withOperationLock } from '../operationQueue.js';
import { publicationStore } from './publicationStore.js';
import { createDriveReader, DriveError } from './driveTransport.js';
export const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const KEY = 'googleDriveConnection';
const read = async () => (await getStorage('local', KEY))[KEY] || { state: 'disconnected', generation: null };
export function googleConfigured() {
  const manifest = chrome.runtime.getManifest();
  return Boolean(chrome.identity?.getAuthToken && manifest.permissions?.includes('identity') &&
    /^[0-9]+-[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$/.test(manifest.oauth2?.client_id || '') &&
    manifest.oauth2?.scopes?.length === 1 && manifest.oauth2.scopes[0] === GOOGLE_SCOPE);
}
async function authToken(interactive) {
  if (!googleConfigured()) throw new DriveError('oauth-not-configured');
  let result;
  try { result = await chrome.identity.getAuthToken({ interactive, scopes: [GOOGLE_SCOPE], enableGranularPermissions: true }); }
  catch { throw new DriveError('authentication-required'); }
  if (typeof result?.token !== 'string' || !result.token || /[\r\n]/.test(result.token) || result.grantedScopes && !result.grantedScopes.includes(GOOGLE_SCOPE)) throw new DriveError('authentication-required');
  return result.token;
}
async function assertGeneration(generation) {
  const connection = await read();
  if (!generation || connection.generation !== generation || !['connecting', 'connected'].includes(connection.state)) throw new DriveError('binding-changed');
  return connection;
}
export async function googleConnectionStatus() {
  const connection = await read();
  return { configured: googleConfigured(), connected: connection.state === 'connected', connecting: connection.state === 'connecting', email: connection.state === 'connected' ? connection.email || '' : '', errorCode: connection.errorCode, writesAvailable: false };
}
export async function connectGoogle() {
  if (!googleConfigured()) throw new DriveError('oauth-not-configured');
  const generation = crypto.randomUUID();
  await withOperationLock(async () => {
    await publicationStore.disable();
    await setStorage('local', { [KEY]: { state: 'connecting', generation } });
  });
  try {
    const token = await authToken(true);
    const reader = createDriveReader({ getToken: async () => token, assertBinding: () => assertGeneration(generation) });
    const account = await reader.account({ generation });
    await withOperationLock(async () => {
      await assertGeneration(generation);
      await setStorage('local', { [KEY]: { state: 'connected', generation, ...account } });
    });
    return googleConnectionStatus();
  } catch (error) {
    await withOperationLock(async () => {
      if ((await read()).generation === generation) await setStorage('local', { [KEY]: { state: 'disconnected', generation, errorCode: error instanceof DriveError ? error.code : 'connection-failed' } });
    });
    throw error instanceof DriveError ? error : new DriveError('connection-failed');
  }
}
export async function disconnectGoogle() {
  await withOperationLock(async () => {
    await publicationStore.disable();
    await setStorage('local', { [KEY]: { state: 'disconnected', generation: crypto.randomUUID() } });
  });
  // Forget extension-local cached tokens. This does not claim remote revocation
  // or delete Drive files. No token ever enters extension storage/messages.
  if (googleConfigured()) await chrome.identity.clearAllCachedAuthTokens().catch(() => {});
  return googleConnectionStatus();
}
export async function assertGoogleBinding(binding) {
  const connection = await assertGeneration(binding?.generation);
  if (connection.state !== 'connected' || connection.accountId !== binding.accountId ||
    (await getStorage('local', 'localRestorePending')).localRestorePending) throw new DriveError('binding-changed');
}
export async function getBoundGoogleToken(binding, { signal, assertCurrent = async () => {} } = {}) {
  const guard = async () => { signal?.throwIfAborted(); await assertGoogleBinding(binding); await assertCurrent(binding); signal?.throwIfAborted(); };
  await guard();
  const token = await authToken(false);
  await guard();
  // A cached token can belong to a different signed-in Chrome account. Verify
  // its provider identity before returning it for any bound list/upload request.
  const reader = createDriveReader({ getToken: async () => token, assertBinding: guard });
  let account;
  try { account = await reader.account(binding, { signal }); }
  catch (error) {
    if (error.code === 'authentication-required') await chrome.identity.removeCachedAuthToken({ token }).catch(() => {});
    throw error;
  }
  if (account.accountId !== binding.accountId) throw new DriveError('account-changed');
  await guard();
  return token;
}
export async function inspectGoogleFiles() {
  const connection = await read();
  const binding = { accountId: connection.accountId, generation: connection.generation };
  const reader = createDriveReader({ getToken: getBoundGoogleToken, assertBinding: assertGoogleBinding });
  const files = await reader.list(binding);
  await assertGoogleBinding(binding);
  return { fileCount: files.length, checkedAt: Date.now(), authenticatedVaults: false };
}
