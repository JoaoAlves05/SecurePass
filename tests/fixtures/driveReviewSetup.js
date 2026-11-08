// Disposable Chromium fixture: copied only into the configured test installation.
import * as crypt from '../../src/vault/crypto.js';
import * as storage from '../../src/utils/storage.js';
import * as session from '../../src/vault/session.js';
import * as protocol from '../../src/sync/signedProtocol.js';
import { createDeviceKey } from '../../src/sync/signingKeyProtection.js';
import { pinAuthorization } from '../../src/sync/authorizationStore.js';
import { installLocalWriter } from '../../src/sync/mutationPublication.js';
import { publicationStore as store } from '../../src/sync/publicationStore.js';
import { lockVault, overwriteVaultEntries, requireVault } from '../../src/cryptoVault.js';
globalThis.installDriveReviewFixture = async () => {
    const entry = (id, password = 'fictional') => ({ id, site: 'https://accounts.example.com', username: id === 'a' ? 'fictional.user.with.a.long.name@example.com' : id, password, notes: 'Original fictional notes', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' });
    const { record: base, bytes } = await crypt.createRecord([entry('a'), entry('b')], 'Fictional UI merge master 123!'); await storage.writeLocalVaultRecordRaw(base, null);
    const localEntries = [entry('a', 'alpha-not-in-preview')]; const local = await crypt.encryptEntries(base, localEntries, bytes);
    const remote = await crypt.encryptEntries(base, [entry('a', 'beta-not-in-preview'), entry('b'), entry('c')], bytes);
    await storage.writeLocalVaultRecordRaw(local, base.revision); await session.activate(local, localEntries, bytes, session.generation(), { authenticated: true });
    const admin = await protocol.generateSigningKey(); const writer = await createDeviceKey(bytes, local);
    const genesis = await protocol.createAuthorization({ kind: 'securepass-authorization', version: 1, vaultId: base.vaultId, keyEpoch: base.keyEpoch, revision: 'auth', previous: null, adminKey: admin.publicKey, devices: [{ id: 'writer', publicKey: writer.envelope.publicKey }] }, admin.privateKey);
    const authorization = await pinAuthorization([genesis], { vaultId: base.vaultId, rootFingerprint: await protocol.signingKeyFingerprint(admin.publicKey) });
    const binding = { accountId: 'fictional-account', vaultId: base.vaultId, generation: 'one' }; await store.configure(binding, true); await installLocalWriter(binding, 'writer', writer.envelope);
    await storage.setStorage('local', { googleDriveConnection: { state: 'connected', ...binding, email: 'fictional@example.com' } });
    const packets = await Promise.all([base, local, remote].map(async record => ({ body: await protocol.createSignedRevision(record, 'writer', writer.privateKey, authorization), publication: { vaultId: record.vaultId, revisionId: record.revision } })));
    const files = packets.map((p, i) => ({ id: `file-${i}`, appProperties: { ...p.publication } })); globalThis.driveFixture = { bytes, local, remote, files, packets };
    globalThis.addDriveReviewCopy = async () => {
      const extra = Array.from({ length: 17 }, (_, i) => entry(`many-${i}`, `local fictional ${i}`));
      await overwriteVaultEntries([...(await requireVault()).entries, ...extra]);
      const record = await crypt.encryptEntries(remote, [entry('a', 'gamma-not-in-preview'), entry('b'), entry('c'), entry('d'), ...extra.map(item => ({ ...item, password: `remote fictional ${item.id}` }))], bytes);
      const packet = { body: await protocol.createSignedRevision(record, 'writer', writer.privateKey, authorization), publication: { vaultId: record.vaultId, revisionId: record.revision } };
      files.push({ id: `file-${packets.length}`, appProperties: { ...packet.publication } }); packets.push(packet);
      return record.revision;
    };
    chrome.identity.getAuthToken = async () => ({ token: 'fictional-private-token', grantedScopes: ['https://www.googleapis.com/auth/drive.appdata'] });
    globalThis.providerMethods = [];
    globalThis.fetch = async (url, options) => {
      providerMethods.push(options.method);
      if (url.includes('/about?')) return Response.json({ user: { permissionId: binding.accountId, emailAddress: 'fictional@example.com' } });
      if (url.includes('alt=media')) return new Response(packets[Number(new URL(url).pathname.split('/').pop().slice(5))].body);
      if (globalThis.holdDriveList) {
        globalThis.holdDriveList = false; globalThis.heldDriveList = true; globalThis.onDriveHold?.();
        await new Promise((resolve, reject) => { globalThis.releaseDriveList = resolve; options.signal.addEventListener('abort', () => reject(new DOMException('Cancelled', 'AbortError')), { once: true }); });
      }
      return Response.json({ files });
    };
    return { local: local.revision, remote: remote.revision };
};
globalThis.inspectDriveReviewFixture = async () => {
  const record = await storage.readLocalVaultRecordRaw();
  const payload = await crypt.decryptPayloadWithKey(record, driveFixture.bytes);
  return { revision: record.revision, entries: payload.entries.length, tombstones: payload.tombstones.length, copies: payload.provenance.length, onlyReads: providerMethods.every(method => method === 'GET'), tokensPersisted: JSON.stringify(await chrome.storage.local.get(null)).includes('fictional-private-token') };
};
globalThis.lockDriveReviewFixture = lockVault;
