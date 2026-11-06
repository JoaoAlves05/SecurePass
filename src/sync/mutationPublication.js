import { publicationStore } from './publicationStore.js';
import { loadAuthorization } from './authorizationStore.js';
import { unlockDeviceKey } from './signingKeyProtection.js';
import { prepareSignedPublication } from './signedPublication.js';
import { readLocalVaultRecordRaw, recordRevision } from '../utils/storage.js';
import * as session from '../vault/session.js';

function guardSession({ epoch, deadline, authenticatedAt }, recent = false) {
  return () => {
    session.assertGeneration(epoch);
    if (deadline <= Date.now()) throw new Error('Vault is locked');
    if (recent && !session.hasRecentAuthentication({ authenticatedAt })) throw new Error('Confirm your identity before enrolling this device.');
  };
}

// Internal enrollment entry point. The caller must first pin independently
// verified authority and explicitly configure the account/vault binding.
// No message route enables this prototype before protocol review.
export async function installLocalWriter(binding, author, envelope) {
  const pinned = structuredClone(binding); const protectedKey = structuredClone(envelope);
  const record = await readLocalVaultRecordRaw();
  if (record?.vaultId !== pinned?.vaultId) throw new Error('Writer vault mismatch.');
  const active = await session.current(record);
  try {
    if (!session.hasRecentAuthentication(active)) throw new Error('Confirm your identity before enrolling this device.');
    const authorization = await loadAuthorization(record.vaultId);
    const device = authorization?.payload.devices.find(value => value.id === author);
    if (!device || device.publicKey !== protectedKey?.publicKey || authorization.payload.keyEpoch !== record.keyEpoch) throw new Error('Device is not authorized for this vault epoch.');
    await unlockDeviceKey(protectedKey, active.bytes, record);
    session.assertGeneration(active.epoch);
    await publicationStore.installWriter(pinned, { author, envelope: protectedKey }, authorization.hash, guardSession(active, true));
  } finally { active.bytes.fill(0); }
}

export async function prepareMutationPublication(record, expectedRevision) {
  const context = await publicationStore.context();
  if (!context.enabled) return { binding: null };
  if (context.binding?.vaultId !== record?.vaultId || !context.writer) throw new Error('Drive writer is not enrolled for this vault.');
  const previous = await readLocalVaultRecordRaw();
  if (recordRevision(previous) !== expectedRevision) throw new Error('Vault changed before signing.');
  const active = await session.current(previous);
  try {
    const authorization = await loadAuthorization(record.vaultId);
    if (previous.keyEpoch !== record.keyEpoch || authorization?.payload.keyEpoch !== record.keyEpoch) throw new Error('Drive key rotation requires a reviewed administrative transition. No password was changed.');
    const privateKey = await unlockDeviceKey(context.writer.envelope, active.bytes, record);
    const packet = await prepareSignedPublication(record, { binding: context.binding, author: context.writer.author, privateKey, authorization });
    session.assertGeneration(active.epoch);
    return { binding: context.binding, packet, assertSession: guardSession(active) };
  } finally { active.bytes.fill(0); }
}
