import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const profile = await mkdtemp(`${tmpdir()}/securepass-three-way-`);
let context;
try {
  context = await chromium.launchPersistentContext(profile, { channel: 'chromium', headless: true, args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`, '--no-sandbox'] });
  let [worker] = context.serviceWorkers(); if (!worker) worker = await context.waitForEvent('serviceworker');
  const page = await context.newPage(); await page.goto(`chrome-extension://${worker.url().split('/')[2]}/popup/popup.html`);
  const result = await page.evaluate(async () => {
    const { planThreeWayMerge, resolveThreeWayMerge, discardThreeWayMerge } = await import('../src/vault/threeWayMerge.js');
    const identity = { vaultId: 'vault', keyEpoch: 'epoch', base: 'base', local: 'local', remote: 'remote' };
    const entry = password => ({ id: 'credential', site: 'https://example.com', username: 'fictional', password, notes: 'à'.repeat(4096), createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' });
    const plan = planThreeWayMerge({ base: [entry('original')], local: [entry('alpha')], remote: [entry('βeta')], identity, assertCurrent: () => {} });
    const first = await resolveThreeWayMerge(plan, { credential: 'both' }, identity);
    const replay = await resolveThreeWayMerge(plan, { credential: 'both' }, identity);
    discardThreeWayMerge(plan); let discarded = false;
    try { await resolveThreeWayMerge(plan, { credential: 'both' }, identity); } catch { discarded = true; }
    return { copy: first.provenance[0].id, notes: first.entries.every(entry => entry.notes === 'à'.repeat(4096)), replay: JSON.stringify(first) === JSON.stringify(replay), previewSecret: JSON.stringify(plan).includes('βeta'), discarded };
  });
  const contents = JSON.stringify(['https://example.com', 'fictional', 'βeta', 'à'.repeat(4096)]);
  const expected = `c-${createHash('sha256').update(JSON.stringify(['SecurePass:merge-copy:1', 'vault', 'credential', contents])).digest('hex').slice(0, 62)}`;
  assert.deepEqual(result, { copy: expected, notes: true, replay: true, previewSecret: false, discarded: true });
  const authenticated = await page.evaluate(async () => {
    const { createRecord, encryptEntries } = await import('../src/vault/crypto.js');
    const protocol = await import('../src/sync/signedProtocol.js');
    const { planAuthenticatedMerge } = await import('../src/vault/authenticatedMerge.js');
    const { planDriveMerge } = await import('../src/vault/driveMerge.js');
    const { createDriveReader } = await import('../src/sync/driveTransport.js');
    const { resolveThreeWayMerge } = await import('../src/vault/threeWayMerge.js');
    const entry = password => ({ id: 'credential', site: 'https://example.com', username: 'fictional', password, notes: '', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' });
    const { record, bytes } = await createRecord([entry('original')], 'Fictional browser history master 123!');
    const signer = await protocol.generateSigningKey();
    const genesis = await protocol.createAuthorization({ kind: 'securepass-authorization', version: 1, vaultId: record.vaultId, keyEpoch: record.keyEpoch, revision: 'auth', previous: null, adminKey: signer.publicKey, devices: [{ id: 'writer', publicKey: signer.publicKey }] }, signer.privateKey);
    const trust = { vaultId: record.vaultId, rootFingerprint: await protocol.signingKeyFingerprint(signer.publicKey) };
    const initial = await protocol.verifyAuthorizationChain([genesis], trust);
    const authorization = await protocol.verifyAuthorizationChain([genesis], { ...trust, expectedHead: initial.hash });
    const left = await encryptEntries(record, [], bytes);
    const right = await encryptEntries(record, [entry('changed secret')], bytes);
    const packets = await Promise.all([record, left, right].map(async value => ({ body: await protocol.createSignedRevision(value, 'writer', signer.privateKey, authorization), publication: { vaultId: value.vaultId, revisionId: value.revision } })));
    let active = true;
    const options = { packets, local: left.revision, remote: right.revision, authorization, bytes, assertCurrent: () => active };
    const p = await planAuthenticatedMerge(options);
    const deleted = await resolveThreeWayMerge(p, { credential: 'local' }, p.identity);
    let downloads = 0; let listings = 0;
    const files = packets.map((packet, i) => ({ id: `file-${i}`, appProperties: { ...packet.publication } }));
    const reader = createDriveReader({ getToken: async () => 'fictional-token', assertBinding: async () => {}, fetchImpl: async url => {
      if (url.includes('alt=media')) {
        downloads++;
        return new Response(packets[Number(new URL(url).pathname.split('/').pop().slice(5))].body);
      }
      listings++; return Response.json({ files });
    } });
    const drivePlan = await planDriveMerge({ ...options, reader, binding: { accountId: 'fictional-account', vaultId: record.vaultId, generation: 'one' } });
    const driveResult = await resolveThreeWayMerge(drivePlan, { credential: 'remote' }, drivePlan.identity);
    let incomplete = false; let tampered = false; let locked = false;
    try { await planAuthenticatedMerge({ ...options, packets: packets.slice(1) }); } catch { incomplete = true; }
    const bad = JSON.parse(packets[0].body); bad.payload.record.parents = ['forged'];
    try { await planAuthenticatedMerge({ ...options, packets: [{ ...packets[0], body: JSON.stringify(bad) }, ...packets.slice(1)] }); } catch { tampered = true; }
    active = false;
    try { await resolveThreeWayMerge(p, { credential: 'remote' }, p.identity); } catch { locked = true; }
    return { base: p.identity.base === record.revision, conflict: p.conflicts[0].type, deleted: deleted.deletedIds, previewSecret: JSON.stringify(p).includes('changed secret'), incomplete, tampered, locked, drive: drivePlan.identity.base === record.revision && driveResult.entries[0].password === 'changed secret', downloads, listings };
  });
  assert.deepEqual(authenticated, { base: true, conflict: 'delete-edit', deleted: ['credential'], previewSecret: false, incomplete: true, tampered: true, locked: true, drive: true, downloads: 3, listings: 2 });
  console.log('Chromium authenticated history passed: signed ancestry, common base, decryption, deletion conflict, tampering, incomplete history and lock guards.');
  console.log('Chromium internal three-way merge passed: Node-compatible UTF-8 copy identity, unchanged maximal notes, replay, secret-free preview and discard. No transport or production merge activated.');
} finally { if (context) await context.close(); await rm(profile, { recursive: true, force: true }); }
