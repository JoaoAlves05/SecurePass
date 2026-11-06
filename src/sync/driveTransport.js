// Bounded Drive transport. Production activation requires the reviewed signed protocol.
import { MAX_PUBLICATION_BYTES, MULTIPART_BYTES, UPLOAD_CHUNK_BYTES, validateUploadSession } from './publicationLimits.js';
const API = 'https://www.googleapis.com/drive/v3/files';
const MAX_RESPONSE = 16 * 1024 * 1024;
const MAX_LIST = 1024 * 1024;
const idPattern = /^[A-Za-z0-9_-]{1,200}$/;
export class DriveError extends Error {
  constructor(code, { retryable = false, retryAfter = 0 } = {}) {
    super(`Drive request failed: ${code}`); this.name = 'DriveError';
    this.code = code; this.retryable = retryable; this.retryAfter = retryAfter;
  }
}
async function bounded(response, limit) {
  const declared = Number(response.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > limit) { await response.body?.cancel(); throw new DriveError('response-too-large'); }
  if (!response.body) return '';
  const reader = response.body.getReader(); const chunks = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > limit) throw new DriveError('response-too-large');
      chunks.push(value);
    }
  } catch (error) { await reader.cancel().catch(() => {}); throw error; }
  finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
  catch { throw new DriveError('invalid-encoding'); }
}
function parse(text) {
  try { return JSON.parse(text); } catch { throw new DriveError('invalid-response'); }
}
function classify(response, body) {
  const reason = body?.error?.errors?.[0]?.reason;
  const retryable = response.status === 429 || response.status >= 500 || ['rateLimitExceeded', 'userRateLimitExceeded'].includes(reason);
  const code = response.status === 401 ? 'authentication-required' : response.status === 404 ? 'missing' : retryable ? 'temporarily-unavailable' : reason === 'storageQuotaExceeded' ? 'capacity' : response.status === 403 ? 'permission-denied' : 'request-rejected';
  const header = response.headers.get('retry-after'); const seconds = header === null ? 0 : Number(header);
  const retryAfter = Number.isFinite(seconds) ? Math.max(0, seconds * 1000) : Math.max(0, Date.parse(header) - Date.now()) || 0;
  return new DriveError(code, { retryable, retryAfter: Math.min(retryAfter, 24 * 60 * 60 * 1000) });
}
function createDriveClient({ getToken, assertBinding, assertWritable, validatePublication, fetchImpl = fetch, maxPages = 100, maxFiles = 10000, timeoutMs = 30000 }, writable = false) {
  if (typeof getToken !== 'function' || typeof assertBinding !== 'function') throw new Error('A token provider and binding guard are required.');
  if (!Number.isInteger(maxPages) || maxPages < 1 || maxPages > 100 || !Number.isInteger(maxFiles) || maxFiles < 1 || maxFiles > 10000 || !Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 60000) throw new Error('Invalid Drive limits.');
  async function guard(binding) {
    try { await assertBinding(binding); } catch { throw new DriveError('binding-changed'); }
  }
  async function request(url, binding, limit, signal, init = {}, details = false) {
    const writing = init.method === 'POST' || init.method === 'PUT';
    const writeGuard = async () => { if (writing) await assertWritable(binding); };
    await writeGuard();
    signal?.throwIfAborted(); await guard(binding);
    const token = await getToken(binding); signal?.throwIfAborted(); await guard(binding); await writeGuard();
    if (typeof token !== 'string' || !token || /[\r\n]/.test(token)) throw new DriveError('authentication-required');
    const controller = new AbortController();
    const cancel = () => controller.abort(); signal?.addEventListener('abort', cancel, { once: true });
    if (signal?.aborted) cancel();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(url, { ...init, method: init.method || 'GET', headers: { ...init.headers, Authorization: `Bearer ${token}` }, signal: controller.signal, redirect: 'error', credentials: 'omit', cache: 'no-store' });
      const text = await bounded(response, response.ok ? limit : Math.min(limit, 65536));
      signal?.throwIfAborted(); await guard(binding);
      if (!response.ok && !(details && response.status === 308)) { let error; try { error = JSON.parse(text); } catch {} throw classify(response, error); }
      await writeGuard();
      return details ? { text, status: response.status, location: response.headers.get('location'), range: response.headers.get('range') } : text;
    } catch (error) {
      if (signal?.aborted) throw signal.reason || new DOMException('Cancelled', 'AbortError');
      if (error instanceof DriveError) throw error;
      // Never expose token, URL, provider response text or network exception to diagnostics.
      throw new DriveError('connection-interrupted', { retryable: true });
    } finally { clearTimeout(timer); signal?.removeEventListener('abort', cancel); }
  }
  const reader = {
    async account(binding, { signal } = {}) {
      const result = parse(await request('https://www.googleapis.com/drive/v3/about?fields=user(permissionId,emailAddress)', binding, 65536, signal));
      if (typeof result?.user?.permissionId !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(result.user.permissionId)) throw new DriveError('invalid-account');
      return { accountId: result.user.permissionId, email: typeof result.user.emailAddress === 'string' ? result.user.emailAddress.slice(0, 254) : '' };
    },
    async list(binding, { signal } = {}) {
      const files = []; const ids = new Set(); const tokens = new Set(); let pageToken;
      for (let page = 0; page < maxPages; page++) {
        const url = new URL(API);
        url.search = new URLSearchParams({ spaces: 'appDataFolder', q: "trashed = false and 'appDataFolder' in parents", pageSize: '100', fields: 'nextPageToken,incompleteSearch,files(id,name,size,appProperties)', ...(pageToken ? { pageToken } : {}) });
        const result = parse(await request(url.href, binding, MAX_LIST, signal));
        if (!result || result.incompleteSearch || !Array.isArray(result.files)) throw new DriveError('incomplete-discovery');
        for (const file of result.files) {
          if (!file || !idPattern.test(file.id || '') || ids.has(file.id)) throw new DriveError('inconsistent-discovery');
          if (files.length >= maxFiles) throw new DriveError('discovery-limit');
          ids.add(file.id); files.push({ id: file.id, name: typeof file.name === 'string' ? file.name : '', size: file.size, appProperties: file.appProperties });
        }
        pageToken = result.nextPageToken;
        if (!pageToken) return files;
        if (typeof pageToken !== 'string' || pageToken.length > 8192 || tokens.has(pageToken)) throw new DriveError('incomplete-discovery');
        tokens.add(pageToken);
      }
      throw new DriveError('discovery-limit');
    },
    async download(binding, fileId, { signal } = {}) {
      if (typeof fileId !== 'string' || !idPattern.test(fileId)) throw new DriveError('invalid-file-id');
      return request(`${API}/${fileId}?alt=media`, binding, MAX_RESPONSE, signal);
    }
  };
  if (!writable) return reader;
  if (typeof assertWritable !== 'function' || typeof validatePublication !== 'function') throw new Error('Publication needs a write guard and a protocol validator.');
  async function uploadResumable(binding, metadata, data, digest, { signal, uploadSession, saveUploadSession } = {}) {
    let session;
    if (uploadSession) {
      try { session = validateUploadSession(uploadSession); } catch { throw new DriveError('invalid-upload-session'); }
      if (session.total !== data.length || session.digest !== digest) throw new DriveError('invalid-upload-session');
    }
    let offset = 0;
    const persist = async value => { if (saveUploadSession) await saveUploadSession(value); };
    const acceptedOffset = (result, maximum) => {
      if (!result.range) return 0;
      const match = /^bytes=0-(\d+)$/.exec(result.range);
      const next = match ? Number(match[1]) + 1 : NaN;
      if (!Number.isSafeInteger(next) || next < 1 || next > maximum) throw new DriveError('invalid-upload-progress');
      return next;
    };
    if (session) {
      try {
        const result = await request(session.url, binding, 65536, signal, { method: 'PUT', headers: { 'Content-Range': `bytes */${data.length}` }, body: new Uint8Array() }, true);
        if (result.status !== 308) return parse(result.text);
        offset = acceptedOffset(result, data.length);
      } catch (error) {
        if (error.code !== 'missing') throw error;
        // An expired session has no authority to complete a new revision. The
        // caller already enumerated complete revisions before this status probe.
        await persist(null); session = null;
      }
    }
    if (!session) {
      const result = await request('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id', binding, 65536, signal, {
        method: 'POST', headers: { 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': 'application/json', 'X-Upload-Content-Length': String(data.length) }, body: metadata
      }, true);
      try { session = validateUploadSession({ url: result.location, total: data.length, digest }); }
      catch { throw new DriveError('invalid-upload-session'); }
      // No data bytes leave before the URI is durable. On worker restart query
      // the provider's offset, never assume that a previous PUT failed remotely.
      await persist(session);
    }
    for (let part = 0; part < 128 && offset < data.length; part++) {
      const end = Math.min(offset + UPLOAD_CHUNK_BYTES, data.length);
      const result = await request(session.url, binding, 65536, signal, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Content-Range': `bytes ${offset}-${end - 1}/${data.length}` }, body: data.slice(offset, end) }, true);
      if (result.status !== 308) {
        if (end !== data.length) throw new DriveError('invalid-upload-progress');
        return parse(result.text);
      }
      const next = acceptedOffset(result, end);
      if (next <= offset) throw new DriveError('upload-stalled', { retryable: true });
      offset = next;
    }
    throw new DriveError('publication-unconfirmed', { retryable: true });
  }
  let pending = Promise.resolve();
  async function publish(binding, publication, options = {}) {
    const { signal } = options;
    const { vaultId, revisionId, body } = publication || {};
    if (![vaultId, revisionId].every(id => typeof id === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(id)) || typeof body !== 'string') throw new DriveError('invalid-publication');
    // The transport only handles an immutable serialized ciphertext packet. The caller
    // verifies the signed format; it must never pass plaintext entries here.
    if (body.length > MAX_PUBLICATION_BYTES) throw new DriveError('publication-too-large');
    const data = new TextEncoder().encode(body);
    if (data.length > MAX_PUBLICATION_BYTES) throw new DriveError('publication-too-large');
    const pinned = Object.freeze({ vaultId, revisionId });
    await validatePublication(body, pinned);
    signal?.throwIfAborted(); await guard(binding); await assertWritable(binding);
    const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', data))].map(value => value.toString(16).padStart(2, '0')).join('');
    const verify = async files => {
      const matches = files.filter(file => file.appProperties?.vaultId === vaultId && file.appProperties?.revisionId === revisionId);
      for (const file of matches) {
        if (await reader.download(binding, file.id, { signal }) !== body) throw new DriveError('revision-content-conflict');
      }
      return matches.map(file => file.id).sort();
    };
    const existing = await verify(await reader.list(binding, { signal }));
    if (existing.length) {
      await guard(binding); await assertWritable(binding);
      return { revisionId, digest, fileIds: existing, verified: true, reused: true };
    }
    const boundary = `securepass_${crypto.randomUUID()}`;
    const metadata = JSON.stringify({ name: revisionId, parents: ['appDataFolder'], mimeType: 'application/json', appProperties: { vaultId, revisionId, digest } });
    const multipart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${boundary}--`;
    const created = data.length > MULTIPART_BYTES || options.uploadSession
      ? await uploadResumable(binding, metadata, data, digest, options)
      : parse(await request('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', binding, 65536, signal, { method: 'POST', headers: { 'Content-Type': `multipart/related; boundary=${boundary}` }, body: multipart }));
    if (!idPattern.test(created?.id || '')) throw new DriveError('publication-unconfirmed', { retryable: true });
    if (await reader.download(binding, created.id, { signal }) !== body) throw new DriveError('revision-content-conflict');
    // Re-enumerate before acknowledgement so conflicting duplicates cannot be hidden
    // by the response to files.create. Delayed discovery leaves publication pending.
    const confirmed = await verify(await reader.list(binding, { signal }));
    if (!confirmed.includes(created.id)) throw new DriveError('publication-unconfirmed', { retryable: true });
    await guard(binding); await assertWritable(binding);
    return { revisionId, digest, fileIds: confirmed, verified: true, reused: false };
  }
  return { ...reader, publish(binding, publication, options) {
    const task = pending.then(() => publish(binding, publication, options));
    pending = task.catch(() => {}); return task;
  } };
}
export const createDriveReader = options => createDriveClient(options);
export const createDriveTransport = options => createDriveClient(options, true);
