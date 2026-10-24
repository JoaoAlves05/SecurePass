import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installChrome, resetStorage, areas, failWhen } from './helpers/chrome.js';
installChrome();
const { checkPassword } = await import('../src/hibp.js');
test('HIBP only transmits a padded prefix, respects exact password and ignores padding counts', async () => {
  resetStorage(); const original = fetch; const password = ' Fictional check <> ';
  const hash = Buffer.from(await crypto.subtle.digest('SHA-1', new TextEncoder().encode(password))).toString('hex').toUpperCase();
  let calls = 0;
  globalThis.fetch = async (url, options) => {
    calls++; assert.equal(url, `https://api.pwnedpasswords.com/range/${hash.slice(0, 5)}`); assert.equal(options.headers['Add-Padding'], 'true');
    return { ok: true, text: async () => `${hash.slice(5)}:0\r\n${'A'.repeat(35)}:123` };
  };
  try { assert.equal((await checkPassword(password)).compromised, false); await checkPassword(password); assert.equal(calls, 1); }
  finally { globalThis.fetch = original; }
});
test('HIBP network success remains valid when optional cache write fails', async () => {
  resetStorage(); const original = fetch;
  globalThis.fetch = async () => ({ ok: true, text: async () => `${'B'.repeat(35)}:8` });
  failWhen(area => area === 'local');
  try { assert.equal((await checkPassword('different fictional password')).compromised, false); }
  finally { globalThis.fetch = original; failWhen(null); }
});
