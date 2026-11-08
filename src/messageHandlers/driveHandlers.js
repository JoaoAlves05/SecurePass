import { googleConnectionStatus, connectGoogle, disconnectGoogle, inspectGoogleFiles } from '../sync/googleConnection.js';
import { driveReview } from '../vault/driveReview.js';
import { masterAuthorizationOwner } from '../vault/masterAuthorization.js';
import { validateString } from '../validation.js';

// authorizeMessage admits these only from the bundled management page. These
// account routes only read Drive. Review routes may commit locally and queue
// signed revisions; they never enable production cloud publication.
export const driveHandlers = new Map([
  ['GOOGLE_CONNECTION_STATUS', async () => ({ connection: await googleConnectionStatus() })],
  ['GOOGLE_CONNECT', async () => ({ connection: await connectGoogle() })],
  ['GOOGLE_DISCONNECT', async () => { driveReview.clear(); return { connection: await disconnectGoogle() }; }],
  ['GOOGLE_INSPECT', inspectGoogleFiles],
  ['DRIVE_REVIEW_STATUS', async () => ({ review: await driveReview.status() })],
  ['DRIVE_REVIEW_INSPECT', async (m, s) => driveReview.inspect(masterAuthorizationOwner(m, s), m.token)],
  ['DRIVE_REVIEW_PREVIEW', async (m, s) => driveReview.preview(validateString(m.revision, 64, 'revision', true), masterAuthorizationOwner(m, s), m.token)],
  ['DRIVE_REVIEW_COMMIT', async (m, s) => driveReview.commit(validateString(m.token, 64, 'review', true), masterAuthorizationOwner(m, s), m.decisions)],
  ['DRIVE_REVIEW_CANCEL', async (m, s) => { driveReview.cancel(validateString(m.token, 64, 'review', true), masterAuthorizationOwner(m, s)); return {}; }]
]);
