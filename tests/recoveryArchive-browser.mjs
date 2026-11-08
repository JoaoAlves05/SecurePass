import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdtemp, rm, open } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const profile = await mkdtemp(`${tmpdir()}/securepass-streamed-recovery-`);
const CURRENT = 'Fictional current archive master 123!'; const VERSION = 'Fictional historical archive master 456!';
let context;
try {
  context = await chromium.launchPersistentContext(profile, { channel: 'chromium', headless: true, args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`, '--no-sandbox'] });
  let [worker] = context.serviceWorkers(); if (!worker) worker = await context.waitForEvent('serviceworker');
  const page = await context.newPage(); await page.setViewportSize({ width: 1100, height: 850 }); await page.goto(`chrome-extension://${worker.url().split('/')[2]}/popup/popup.html?manage=1#backupsSection`);
  async function send(type, data = {}) { return page.evaluate(({ type, data }) => chrome.runtime.sendMessage({ type, ...data }), { type, data }); }
  async function title(text) { await page.waitForFunction(text => document.querySelector('#operationDialog').open && document.querySelector('#operationTitle').textContent === text, text); }
  async function confirm() { await page.locator('#operationConfirm').click(); }
  async function idle() { await page.waitForFunction(() => !document.querySelector('#managementActivity').textContent); }
  assert.equal((await send('INITIALIZE_VAULT', { passphrase: CURRENT })).created, true);
  assert.equal((await send('STORE_CREDENTIAL', { entry: { id: 'original', site: 'https://example.com', password: 'Fictional original password' } })).ok, true);
  const before = (await send('VAULT_STATUS')).status.revision;
  const records = await page.evaluate(async passphrase => {
    const { createRecord } = await import('../src/vault/crypto.js');
    const entries = Array.from({ length: 100 }, (_, i) => ({ id: `large-${i}`, site: 'https://example.com', username: `fictional-${i}`, password: 'Fictional historical password', notes: 'x'.repeat(4096) }));
    const large = await createRecord(entries, passphrase);
    const selected = await createRecord([{ id: 'selected', site: 'https://selected.example', password: 'Fictional selected password', notes: 'Chosen snapshot' }], passphrase);
    globalThis.archiveReadMetrics = { wholeReads: 0, largestSlice: 0 };
    const originalBuffer = File.prototype.arrayBuffer; const originalText = File.prototype.text; const originalSlice = File.prototype.slice;
    for (const [name, original] of [['arrayBuffer', originalBuffer], ['text', originalText]]) File.prototype[name] = function(...args) {
      if (this.size > 16 * 1024 * 1024) { archiveReadMetrics.wholeReads++; throw new Error('Large whole-file reads forbidden by this scenario'); }
      return original.apply(this, args);
    };
    File.prototype.slice = function(start, end, ...args) { if (this.size > 16 * 1024 * 1024) archiveReadMetrics.largestSlice = Math.max(archiveReadMetrics.largestSlice, end - start); return originalSlice.call(this, start, end, ...args); };
    return { large: large.record, selected: selected.record };
  }, VERSION);
  const buffer = Buffer.from(JSON.stringify({ kind: 'securepass-encrypted-recovery', version: 1, snapshots: [...Array(31).fill(records.large), records.selected], sync: [] }));
  assert.ok(buffer.length > 16 * 1024 * 1024 && buffer.length < 256 * 1024 * 1024);
  await page.locator('#importVaultFile').setInputFiles({ name: 'malformed-large.json', mimeType: 'application/json', buffer: Buffer.concat([buffer, Buffer.from(' trailing')]) });
  await idle(); assert.equal(await page.locator('#operationDialog').isVisible(), false); assert.equal((await send('VAULT_STATUS')).status.revision, before);

  const maximumPath = `${profile}/maximum-recovery.json`; const handle = await open(maximumPath, 'w');
  try {
    await handle.writeFile(buffer); const padding = Buffer.alloc(64 * 1024, 32);
    let remaining = 256 * 1024 * 1024 - buffer.length;
    while (remaining > 0) { const size = Math.min(remaining, padding.length); await handle.writeFile(padding.subarray(0, size)); remaining -= size; }
    assert.equal((await handle.stat()).size, 256 * 1024 * 1024);
  } finally { await handle.close(); }
  await page.locator('#importVaultFile').setInputFiles(maximumPath);
  await page.waitForFunction(() => document.querySelector('#operationDialog').open && document.querySelector('#operationTitle').textContent === 'Choose a recovery snapshot', undefined, { timeout: 60000 });
  assert.equal(await page.locator('#operationDialog select option').count(), 32);
  await page.locator('#operationCancel').click(); await idle(); assert.equal((await send('VAULT_STATUS')).status.revision, before);
  await page.locator('#importVaultFile').setInputFiles({ name: 'large-recovery.json', mimeType: 'application/json', buffer }); await title('Choose a recovery snapshot');
  assert.equal(await page.locator('#operationDialog select option').count(), 32);
  await page.locator('#operationCancel').click(); await idle(); assert.equal((await send('VAULT_STATUS')).status.revision, before);
  await page.locator('#importVaultFile').setInputFiles({ name: 'large-recovery.json', mimeType: 'application/json', buffer }); await title('Choose a recovery snapshot');
  const selection = page.locator('#operationDialog select[name="snapshot"]'); await selection.selectOption({ index: 31 });
  assert.match(await selection.inputValue(), /^snapshots:32:[a-f0-9]{64}$/);
  await confirm(); await title('Restore saved version');
  assert.ok((await page.locator('#operationSummary').innerText()).includes(records.selected.revision.slice(0, 8)));
  await page.locator('#operationDialog input[name="password"]').fill('Fictional wrong historical password'); await confirm(); await page.locator('#operationError:not([hidden])').waitFor();
  assert.equal((await send('VAULT_STATUS')).status.revision, before);
  await page.locator('#operationDialog input[name="password"]').fill(VERSION); await confirm(); await idle();
  const entries = (await send('LIST_CREDENTIALS')).entries; assert.deepEqual(entries.map(entry => entry.id), ['selected']);
  assert.equal((await send('LOAD_SETTINGS')).settings.useSync, false);
  await send('LOCK_VAULT'); assert.equal((await send('UNLOCK_VAULT', { passphrase: VERSION })).ok, false);
  assert.equal((await send('UNLOCK_VAULT', { passphrase: CURRENT })).ok, true);
  const metrics = await page.evaluate(() => archiveReadMetrics); assert.equal(metrics.wholeReads, 0); assert.ok(metrics.largestSlice <= 64 * 1024);
  console.log('Large recovery archive Chromium passed: >16 MiB and exact 256-MiB encrypted archives, 64-KiB inventory reads, stable selected version, malformed/cancel/wrong-password no effects, local restore and preserved destination master.');
} finally { if (context) await context.close(); await rm(profile, { recursive: true, force: true }); }
