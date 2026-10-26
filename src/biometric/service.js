import { getStorage, setStorage, removeStorage } from '../utils/storage.js';
import { requireVault, unlockVault, unlockWithBiometricKey, vaultGeneration, assertVaultGeneration } from '../cryptoVault.js';
import { challenge, verifyClientData, verifyAssertion } from './webauthn.js';
import { decodeBytes, prfKey, seal, open } from '../vault/crypto.js';
import { withVaultLock } from '../vault/queue.js';
import { extensionPage } from '../security/origins.js';
import { masterAuthorizationOwner } from '../vault/masterAuthorization.js';

const KEY = 'securepassBiometric';
const PREFIX = 'webauthn:';
const origin = () => `chrome-extension://${chrome.runtime.id}`;
function owner(message, sender) {
  if (!extensionPage(sender, ['/popup/popup.html', '/auth/auth.html']) ||
      typeof message?.clientId !== 'string' ||
      !/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(message.clientId)) {
    throw new Error('A trusted document is required.');
  }
  return message.clientId;
}
const context = config => `SecurePass:biometric:${config.vaultId}:${config.keyEpoch}:${config.credentialId}`;

export async function revokeBiometric() {
  await removeStorage('local', [KEY, 'securepassTrustedDeviceKey']);
  await cancelCeremonies();
}
export async function cancelCeremonies() {
  const all = await getStorage('session', null);
  const keys = Object.keys(all).filter(k => k.startsWith(PREFIX));
  if (keys.length) await removeStorage('session', keys);
}
export async function expireCeremonies() {
  const all = await getStorage('session', null);
  const keys = Object.keys(all).filter(key => key.startsWith(PREFIX));
  const expired = keys.filter(key => all[key].expires <= Date.now());
  if (expired.length) await removeStorage('session', expired);
  const active = keys.filter(key => !expired.includes(key));
  if (active.length) await chrome.alarms.create('webauthnCleanup', { when: Math.min(...active.map(key => all[key].expires)) });
}
export async function biometricStatus() {
  const config = (await getStorage('local', KEY))[KEY];
  return { enabled: config?.version === 2, mode: config?.version === 2 ? 'prf-unlock' : null, requiresReconfiguration: Boolean(config && config.version !== 2) };
}

async function begin(type, clientId, extra = {}) {
  const all = await getStorage('session', null);
  const expired = Object.keys(all).filter(k => k.startsWith(PREFIX) && all[k].expires <= Date.now());
  if (expired.length) await removeStorage('session', expired);
  if (Object.keys(all).filter(k => k.startsWith(PREFIX) && all[k].expires > Date.now()).length > 10) throw new Error('Too many authentication requests.');
  const id = crypto.randomUUID();
  const revocation = (await getStorage('session', 'vaultRevocation')).vaultRevocation || null;
  const state = { type, owner: clientId, challenge: challenge(), expires: Date.now() + 90000, revocation, ...extra };
  await setStorage('session', { [`${PREFIX}${id}`]: state });
  await expireCeremonies();
  return { sessionId: id, challenge: state.challenge, rpId: chrome.runtime.id, credentialId: state.config?.credentialId };
}

async function consume(message, sender, type) {
  const clientId = owner(message, sender);
  const id = message.sessionId;
  if (typeof id !== 'string' || id.length > 64) throw new Error('Invalid authentication request.');
  const key = `${PREFIX}${id}`;
  const state = (await getStorage('session', key))[key];
  if (!state || state.owner !== clientId || state.expires <= Date.now() || state.type !== type) throw new Error('Authentication request expired or belongs to another document.');
  await removeStorage('session', key);
  if (state.revocation !== ((await getStorage('session', 'vaultRevocation')).vaultRevocation || null)) throw new Error('Authentication was revoked by a vault lock.');
  return state;
}

export async function startRegistration(message, sender) {
  const clientId = owner(message, sender);
  await unlockVault(message.passphrase);
  const state = await requireVault();
  return begin('create', clientId, { vaultId: state.record.vaultId, keyEpoch: state.record.keyEpoch });
}

export function prepareRegistration(message, sender) {
  return withVaultLock(async () => {
    const state = await consume(message, sender, 'create');
    verifyClientData(message.clientDataJSON, state.challenge, 'webauthn.create', origin());
    decodeBytes(message.credentialId, 1, 1024);
    decodeBytes(message.publicKey, 32, 2048);
    if (![-7, -257].includes(message.algorithm)) throw new Error('Unsupported authenticator.');
    return begin('enroll', owner(message, sender), { config: { version: 2, vaultId: state.vaultId, keyEpoch: state.keyEpoch, credentialId: message.credentialId, publicKey: message.publicKey, algorithm: message.algorithm, counter: 0 } });
  });
}

export function finishRegistration(message, sender) {
  return withVaultLock(async () => {
    const epoch = vaultGeneration();
    const state = await consume(message, sender, 'enroll');
    const vault = await requireVault();
    if (vault.record.vaultId !== state.config.vaultId || vault.record.keyEpoch !== state.config.keyEpoch) throw new Error('Vault changed during setup.');
    state.config.counter = await verifyAssertion(message.assertion, state.config, state.challenge, origin(), chrome.runtime.id);
    if (!message.prfOutput) throw new Error('This authenticator does not support PRF. Use the master password; no insecure fallback is stored.');
    state.config.wrappedKey = await seal(vault.bytes, await prfKey(message.prfOutput), context(state.config));
    assertVaultGeneration(epoch);
    await setStorage('local', { [KEY]: state.config });
    assertVaultGeneration(epoch);
    return { mode: 'prf-unlock' };
  });
}

export async function startAuthentication(message, sender) {
  const clientId = owner(message, sender);
  if (message.purpose && message.purpose !== 'change-master-password') throw new Error('Invalid authentication purpose.');
  const authorizationOwner = message.purpose === 'change-master-password' ? masterAuthorizationOwner(message, sender) : null;
  const config = (await getStorage('local', KEY))[KEY];
  if (config?.version !== 2) throw new Error('Configure PRF biometric unlock first.');
  return begin('get', clientId, { config, authorizationOwner });
}

export async function finishAuthentication(message, sender) {
  // Consume and verify in the same queue before handing the key to the vault queue.
  const verified = await withVaultLock(async () => {
    const epoch = vaultGeneration();
    const state = await consume(message, sender, 'get');
    if (state.authorizationOwner && state.authorizationOwner !== masterAuthorizationOwner(message, sender)) throw new Error('Authentication belongs to another document.');
    const current = (await getStorage('local', KEY))[KEY];
    if (!current || JSON.stringify(current) !== JSON.stringify(state.config)) throw new Error('Biometric setup changed or was revoked.');
    const counter = await verifyAssertion(message.assertion, current, state.challenge, origin(), chrome.runtime.id);
    const bytes = new Uint8Array(await open(current.wrappedKey, await prfKey(message.prfOutput), context(current)));
    if (bytes.length !== 32) throw new Error('Invalid biometric key.');
    assertVaultGeneration(epoch);
    await setStorage('local', { [KEY]: { ...current, counter } });
    return { bytes, config: current, epoch, authorizationOwner: state.authorizationOwner };
  });
  assertVaultGeneration(verified.epoch);
  try { return await unlockWithBiometricKey(verified.bytes, verified.config.vaultId, verified.config.keyEpoch, verified.epoch, verified.config.credentialId, verified.authorizationOwner); }
  finally { verified.bytes.fill(0); }
}

export async function cancelAuthentication(message, sender) {
  const clientId = owner(message, sender);
  const key = `${PREFIX}${message.sessionId}`;
  const state = (await getStorage('session', key))[key];
  if (state?.owner === clientId) await removeStorage('session', key);
}
