// Bounded, read-only Drive inspection. Activation/publication requires the signed protocol.
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
export function createDriveReader({ getToken, assertBinding, fetchImpl = fetch, maxPages = 100, maxFiles = 10000, timeoutMs = 30000 }) {
  if (typeof getToken !== 'function' || typeof assertBinding !== 'function') throw new Error('A token provider and binding guard are required.');
  if (!Number.isInteger(maxPages) || maxPages < 1 || maxPages > 100 || !Number.isInteger(maxFiles) || maxFiles < 1 || maxFiles > 10000 || !Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 60000) throw new Error('Invalid Drive limits.');
  async function guard(binding) {
    try { await assertBinding(binding); } catch { throw new DriveError('binding-changed'); }
  }
  async function request(url, binding, limit, signal) {
    signal?.throwIfAborted(); await guard(binding);
    const token = await getToken(binding); signal?.throwIfAborted(); await guard(binding);
    if (typeof token !== 'string' || !token || /[\r\n]/.test(token)) throw new DriveError('authentication-required');
    const controller = new AbortController();
    const cancel = () => controller.abort(); signal?.addEventListener('abort', cancel, { once: true });
    if (signal?.aborted) cancel();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(url, { method: 'GET', headers: { Authorization: `Bearer ${token}` }, signal: controller.signal, redirect: 'error', credentials: 'omit', cache: 'no-store' });
      const text = await bounded(response, response.ok ? limit : Math.min(limit, 65536));
      signal?.throwIfAborted(); await guard(binding);
      if (!response.ok) { let error; try { error = JSON.parse(text); } catch {} throw classify(response, error); }
      return text;
    } catch (error) {
      if (signal?.aborted) throw signal.reason || new DOMException('Cancelled', 'AbortError');
      if (error instanceof DriveError) throw error;
      // Never expose token, URL, provider response text or network exception to diagnostics.
      throw new DriveError('connection-interrupted', { retryable: true });
    } finally { clearTimeout(timer); signal?.removeEventListener('abort', cancel); }
  }
  return {
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
}
