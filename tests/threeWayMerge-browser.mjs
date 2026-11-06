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
  console.log('Chromium internal three-way merge passed: Node-compatible UTF-8 copy identity, unchanged maximal notes, replay, secret-free preview and discard. No transport or production merge activated.');
} finally { if (context) await context.close(); await rm(profile, { recursive: true, force: true }); }
