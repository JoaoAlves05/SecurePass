import { loadSettings } from './settings.js';
import { getStorage, setStorage, removeStorage } from './utils/storage.js';

const inFlight = new Map();
let cacheWrites = Promise.resolve();
let cacheGeneration = 0;
const MAX_BYTES = 1024 * 1024;
async function hash(value) {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-1', new TextEncoder().encode(value))), b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}
async function range(prefix, ttl, expectedGeneration) {
  const cache = (await getStorage('local', 'hibpCache')).hibpCache || {};
  if (typeof cache[prefix]?.payload === 'string' && Date.now() - cache[prefix].timestamp < ttl) return cache[prefix].payload;
  if (!inFlight.has(prefix)) {
    const work = (async () => {
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, { headers: { 'Add-Padding': 'true' }, signal: AbortSignal.timeout(8000), credentials: 'omit', cache: 'no-store' });
      if (!response.ok) throw new Error(`HIBP unavailable (${response.status}).`);
      const payload = await response.text();
      if (payload.length > 256000 || !payload.trim().split(/\r?\n/).every(line => /^[A-F0-9]{35}:\d+$/.test(line))) throw new Error('Invalid HIBP response.');
      cacheWrites = cacheWrites.catch(() => {}).then(async () => {
        if (expectedGeneration !== cacheGeneration) return;
        const latest = (await getStorage('local', 'hibpCache')).hibpCache || {};
        latest[prefix] = { timestamp: Date.now(), payload };
        const keys = Object.keys(latest).sort((a, b) => latest[b].timestamp - latest[a].timestamp);
        const pruned = {};
        let size = 0;
        for (const key of keys) {
          if (Date.now() - latest[key].timestamp >= ttl || Object.keys(pruned).length >= 32 || size + latest[key].payload.length > MAX_BYTES) continue;
          pruned[key] = latest[key]; size += latest[key].payload.length;
        }
        if (expectedGeneration === cacheGeneration) await setStorage('local', { hibpCache: pruned });
      });
      // A successful network check remains usable if optional cache storage is full.
      await cacheWrites.catch(() => {});
      return payload;
    })().finally(() => inFlight.delete(prefix));
    inFlight.set(prefix, work);
  }
  return inFlight.get(prefix);
}
export async function checkPassword(password) {
  if (typeof password !== 'string' || !password.length || password.length > 1024) throw new Error('Enter a password (up to 1024 characters).');
  const expectedGeneration = cacheGeneration;
  const digest = await hash(password);
  const ttl = (await loadSettings()).hibpCacheTtlHours * 3600000;
  const result = await range(digest.slice(0, 5), ttl, expectedGeneration);
  const suffix = digest.slice(5);
  const line = result.split(/\r?\n/).find(item => item.startsWith(`${suffix}:`));
  const count = line ? Number(line.split(':')[1]) : 0;
  return { compromised: count > 0, count };
}

export async function clearHibpCache() {
  cacheGeneration++;
  await cacheWrites.catch(() => {});
  await removeStorage('local', 'hibpCache');
}
export async function hibpCacheStatus() {
  const cache = (await getStorage('local', 'hibpCache')).hibpCache || {};
  return { entries: Object.keys(cache).length, bytes: new TextEncoder().encode(JSON.stringify(cache)).length };
}
