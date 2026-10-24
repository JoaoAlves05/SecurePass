import { generation, assertGeneration } from './session.js';

let tail = Promise.resolve();
export function withVaultLock(task) {
  const run = () => globalThis.navigator?.locks
    ? navigator.locks.request('securepass-vault', { mode: 'exclusive' }, task)
    : task();
  const result = tail.then(run, run);
  tail = result.catch(() => {});
  return result;
}

export function withVaultOperation(task) {
  const epoch = generation();
  return withVaultLock(async () => { assertGeneration(epoch); return task(epoch); });
}
