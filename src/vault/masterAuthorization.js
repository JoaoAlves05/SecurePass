import { getStorage, setStorage, removeStorage } from '../utils/storage.js';
import { extensionPage } from '../security/origins.js';

const PREFIX = 'masterAuthorization:';
const LIFETIME = 2 * 60 * 1000;

export function masterAuthorizationOwner(message, sender) {
  if (!extensionPage(sender, ['/popup/popup.html']) ||
      typeof message.clientId !== 'string' ||
      !/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(message.clientId)) {
    throw new Error('A trusted management document is required.');
  }
  // clientId also binds popup instances for Chrome senders without documentId.
  return JSON.stringify([message.clientId, sender.documentId || null, sender.tab?.id ?? null]);
}

// Call under the vault operation lock, immediately after fresh authentication.
export async function issueMasterAuthorization(record, owner) {
  const all = await getStorage('session', null);
  const obsolete = Object.keys(all).filter(key => key.startsWith(PREFIX) &&
    (all[key].owner === owner || all[key].expiresAt <= Date.now()));
  if (obsolete.length) await removeStorage('session', obsolete);
  if (Object.keys(all).filter(key => key.startsWith(PREFIX) && !obsolete.includes(key)).length >= 16) {
    throw new Error('Too many password change requests. Try again shortly.');
  }
  const authorization = crypto.randomUUID();
  const expiresAt = Date.now() + LIFETIME;
  await setStorage('session', { [`${PREFIX}${authorization}`]: {
    owner, purpose: 'change-master-password', expiresAt,
    vaultId: record.vaultId, revision: record.revision, keyEpoch: record.keyEpoch,
    revocation: all.vaultRevocation || null
  } });
  return { authorization, expiresAt };
}

// Consumption and rotation share the vault operation lock: concurrent reuse fails.
export async function consumeMasterAuthorization(record, authorization, owner) {
  if (typeof authorization !== 'string' || authorization.length > 64) throw new Error('Confirm your identity again.');
  const key = `${PREFIX}${authorization}`;
  const stored = (await getStorage('session', key))[key];
  if (!stored || stored.owner !== owner) throw new Error('Confirm your identity again.');
  await removeStorage('session', key);
  const revocation = (await getStorage('session', 'vaultRevocation')).vaultRevocation || null;
  if (stored.purpose !== 'change-master-password' || stored.expiresAt <= Date.now() ||
      stored.revocation !== revocation || stored.vaultId !== record.vaultId ||
      stored.revision !== record.revision || stored.keyEpoch !== record.keyEpoch) {
    throw new Error('Authorization expired or the vault changed. Confirm your identity again.');
  }
}

export async function cancelMasterAuthorization(owner, authorization) {
  const all = await getStorage('session', null);
  const keys = Object.keys(all).filter(key => key.startsWith(PREFIX) && (!owner || all[key].owner === owner) &&
    (!authorization || key === `${PREFIX}${authorization}`));
  if (keys.length) await removeStorage('session', keys);
}
