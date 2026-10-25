import { generation, assertGeneration } from './session.js';
import { withOperationLock } from '../operationQueue.js';
export const withVaultLock = withOperationLock;
export function withVaultOperation(task) {
  const epoch = generation();
  return withOperationLock(async () => { assertGeneration(epoch); return task(epoch); });
}
