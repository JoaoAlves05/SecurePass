export const MAX_PUBLICATION_BYTES = 16 * 1024 * 1024;
export const MULTIPART_BYTES = 5 * 1024 * 1024 - 4096;
export const UPLOAD_CHUNK_BYTES = 1024 * 1024;

// A resumable URI is a bearer capability. Keep it in trusted IndexedDB only,
// never in diagnostics, and never send an OAuth token to a provider-chosen host.
export function validateUploadSession(session) {
  if (!session || Object.keys(session).sort().join(',') !== 'digest,total,url' ||
    typeof session.url !== 'string' || session.url.length > 8192 ||
    !/^[a-f0-9]{64}$/.test(session.digest || '') ||
    !Number.isInteger(session.total) || session.total < 1 || session.total > MAX_PUBLICATION_BYTES) throw new Error('Invalid upload session.');
  const url = new URL(session.url);
  if (url.origin !== 'https://www.googleapis.com' || url.username || url.password || url.hash ||
    url.pathname !== '/upload/drive/v3/files' || url.searchParams.get('uploadType') !== 'resumable' ||
    !url.searchParams.get('upload_id')) throw new Error('Invalid upload session.');
  return { url: session.url, digest: session.digest, total: session.total };
}
