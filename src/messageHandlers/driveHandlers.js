import { googleConnectionStatus, connectGoogle, disconnectGoogle, inspectGoogleFiles } from '../sync/googleConnection.js';

// authorizeMessage admits these only from the bundled management page. These
// routes authorize account access/read-only inspection, never vault adoption.
export const driveHandlers = new Map([
  ['GOOGLE_CONNECTION_STATUS', async () => ({ connection: await googleConnectionStatus() })],
  ['GOOGLE_CONNECT', async () => ({ connection: await connectGoogle() })],
  ['GOOGLE_DISCONNECT', async () => ({ connection: await disconnectGoogle() })],
  ['GOOGLE_INSPECT', inspectGoogleFiles]
]);
