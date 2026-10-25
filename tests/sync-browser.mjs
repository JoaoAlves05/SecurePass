// Two real extension profiles; the transport is emulated, not Google's authenticated Sync service.
import { chromium } from 'playwright';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const root = fileURLToPath(new URL('../', import.meta.url));
const profiles = [];
const contexts = [];
const passphrase = 'Two profile fictional master 123!';
async function profile() {
  const dir = await mkdtemp(`${tmpdir()}/securepass-sync-`); profiles.push(dir);
  const context = await chromium.launchPersistentContext(dir, { channel: 'chromium', headless: true, args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`, '--no-sandbox'] }); contexts.push(context);
  let [worker] = context.serviceWorkers(); if (!worker) worker = await context.waitForEvent('serviceworker');
  const page = await context.newPage(); await page.goto(`chrome-extension://${worker.url().split('/')[2]}/popup/popup.html`);
  await page.waitForFunction(() => document.getElementById('createMaster'));
  return page;
}
async function send(page, type, data = {}) {
  const result = await page.evaluate(({ type, data }) => chrome.runtime.sendMessage({ type, ...data }), { type, data });
  assert.equal(result.ok, true, `${type}: ${result.error}`); return result;
}
const entry = id => ({ id, site: 'https://fictional.example', username: id, password: `fictional ${id}` });
async function transport(from, to) {
  const snapshot = await from.evaluate(() => chrome.storage.sync.get(null));
  await to.evaluate(data => chrome.storage.sync.set(data), snapshot);
}
try {
  const a = await profile(); const b = await profile();
  await send(a, 'INITIALIZE_VAULT', { passphrase }); await send(a, 'STORE_CREDENTIAL', { entry: entry('shared') });
  await send(a, 'SET_SYNC_MODE_SAFE', { targetUseSync: true });
  await transport(a, b); await send(b, 'SET_SYNC_MODE_SAFE', { targetUseSync: true, passphrase });
  await send(a, 'UNLOCK_VAULT', { passphrase }); await send(b, 'UNLOCK_VAULT', { passphrase });
  await send(a, 'STORE_CREDENTIAL', { entry: entry('offline-a') }); await send(b, 'STORE_CREDENTIAL', { entry: entry('offline-b') });
  await transport(a, b); await transport(b, a);
  const status = (await send(a, 'SYNC_STATUS')).status; assert.equal(status.heads.length, 2);
  const denied = await a.evaluate(entry => chrome.runtime.sendMessage({ type: 'STORE_CREDENTIAL', entry }), entry('would-overwrite'));
  assert.equal(denied.ok, false); assert.match(denied.error, /Sync changed/);
  const remote = status.heads.find(head => !head.current);
  await send(a, 'SYNC_RESOLVE', { revision: remote.revision, passphrase, merge: true });
  await send(a, 'UNLOCK_VAULT', { passphrase });
  const ids = (await send(a, 'LIST_CREDENTIALS')).entries.map(e => e.id);
  for (const id of ['shared', 'offline-a', 'offline-b']) assert.ok(ids.includes(id));
  await transport(a, b); await send(b, 'SET_SYNC_MODE_SAFE', { targetUseSync: true, strategy: 'use-sync', passphrase }); await send(b, 'UNLOCK_VAULT', { passphrase });
  assert.deepEqual((await send(b, 'LIST_CREDENTIALS')).entries.map(e => e.id).sort(), ids.sort());
  await send(a, 'SYNC_COMPACT'); assert.equal((await send(a, 'SYNC_STATUS')).status.heads.length, 1);
  console.log('Two-profile Sync checks passed: first download, offline branches, conflict prevention, lossless merge, re-download and safe compaction (emulated transport).');
} finally { for (const context of contexts) await context.close(); for (const dir of profiles) await rm(dir, { recursive: true, force: true }); }
