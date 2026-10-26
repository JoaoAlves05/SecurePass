import * as biometric from '../biometric/service.js';
import { withVaultLock } from '../vault/queue.js';
export const biometricHandlers = new Map([
  ['BIOMETRIC_STATUS', biometric.biometricStatus],
  ['DISABLE_BIOMETRIC', () => withVaultLock(async () => { await biometric.revokeBiometric(); return {}; })],
  ['BIOMETRIC_REGISTER_START', biometric.startRegistration],
  ['BIOMETRIC_REGISTER_PREPARE', biometric.prepareRegistration],
  ['BIOMETRIC_REGISTER_COMPLETE', biometric.finishRegistration],
  ['BIOMETRIC_AUTH_START', biometric.startAuthentication],
  ['BIOMETRIC_AUTH_COMPLETE', async (m, s) => biometric.finishAuthentication(m, s)],
  ['BIOMETRIC_CANCELLED', async (m, s) => { await biometric.cancelAuthentication(m, s); return {}; }]
]);
