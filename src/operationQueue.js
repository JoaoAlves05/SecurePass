// Shared serialization without importing sessions/settings (avoids a dependency cycle).
let tail = Promise.resolve();
export function withOperationLock(task) {
  const run = () => globalThis.navigator?.locks
    ? navigator.locks.request('securepass-vault', { mode: 'exclusive' }, task)
    : task();
  const result = tail.then(run, run);
  tail = result.catch(() => {});
  return result;
}
