import { webcrypto } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { IDBFactory } from 'fake-indexeddb';
export const areas = { local: {}, sync: {}, session: {} };
export const alarms = new Map();
export let fault = null;
export function failWhen(predicate) { fault = predicate; }
const event = () => ({ addListener() {}, removeListener() {} });
export function installChrome() {
  // Keep simulated sessions stable if the host adjusts its wall clock. Tests
  // exercising rollback/expiry override Date.now explicitly and still cover it.
  const timeOrigin = Date.now(); const monotonicOrigin = performance.now();
  Date.now = () => timeOrigin + Math.floor(performance.now() - monotonicOrigin);
  globalThis.crypto = webcrypto;
  globalThis.indexedDB = new IDBFactory();
  const area = name => ({
    setAccessLevel: async () => {},
    get(keys, callback) {
      const result = keys === null ? structuredClone(areas[name]) : Object.fromEntries((Array.isArray(keys) ? keys : [keys]).filter(k => k in areas[name]).map(k => [k, structuredClone(areas[name][k])]));
      queueMicrotask(() => callback(result));
    },
    set(items, callback) {
      queueMicrotask(() => {
        if (fault?.(name, items)) {
          chrome.runtime.lastError = { message: 'Injected storage failure' }; callback(); delete chrome.runtime.lastError;
        } else { Object.assign(areas[name], structuredClone(items)); callback(); }
      });
    },
    remove(keys, callback) { for (const key of Array.isArray(keys) ? keys : [keys]) delete areas[name][key]; queueMicrotask(callback); },
    clear(callback) { areas[name] = {}; queueMicrotask(callback); }
  });
  globalThis.chrome = {
    runtime: { id: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', getURL: path => `chrome-extension://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/${path}`, sendMessage: async () => ({}), onMessage: event() },
    storage: { local: area('local'), sync: area('sync'), session: area('session'), onChanged: event() },
    alarms: { create: async (key, value) => { alarms.set(key, value); }, clear: async key => alarms.delete(key) }, idle: { setDetectionInterval() {} }
  };
}
export function resetStorage() {
  for (const key of Object.keys(areas)) areas[key] = {};
  globalThis.indexedDB = new IDBFactory(); alarms.clear(); fault = null;
}
