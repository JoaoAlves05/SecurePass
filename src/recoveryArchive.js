import { MAX_IMPORT_BYTES } from './validation.js';
import { validateRecord } from './vault/crypto.js';

export const MAX_RECOVERY_ARCHIVE_BYTES = 256 * 1024 * 1024;
export const MAX_RECOVERY_SNAPSHOTS = 100;
const WINDOW_BYTES = 64 * 1024;
const decoder = new TextDecoder('utf-8', { fatal: true });
const whitespace = byte => byte === 32 || byte === 9 || byte === 10 || byte === 13;
const invalid = () => new Error('This recovery archive is not valid JSON in the supported format.');
const abort = signal => signal?.throwIfAborted();
async function digest(bytes) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(value => value.toString(16).padStart(2, '0')).join('');
}
function parse(bytes) { try { return JSON.parse(decoder.decode(bytes)); } catch { throw invalid(); } }

class FileCursor {
  constructor(file, signal) { this.file = file; this.signal = signal; this.bytes = new Uint8Array(); this.pos = 0; this.start = 0; this.loaded = 0; }
  get offset() { return this.start + this.pos; }
  async fill() {
    abort(this.signal);
    if (this.pos < this.bytes.length) return true;
    if (this.loaded >= this.file.size) return false;
    this.start = this.loaded;
    const end = Math.min(this.file.size, this.start + WINDOW_BYTES);
    try { this.bytes = new Uint8Array(await this.file.slice(this.start, end).arrayBuffer()); }
    catch { abort(this.signal); throw new Error('This backup file could not be read. Choose the file again.'); }
    abort(this.signal);
    if (this.bytes.length !== end - this.start) throw new Error('The backup file changed while being read. Choose it again.');
    this.loaded = end; this.pos = 0; return true;
  }
  async skip() {
    while (await this.fill()) {
      while (this.pos < this.bytes.length && whitespace(this.bytes[this.pos])) this.pos++;
      if (this.pos < this.bytes.length) return;
    }
  }
  async peek() { await this.skip(); return await this.fill() ? this.bytes[this.pos] : undefined; }
  async expect(byte) { if (await this.peek() !== byte) throw invalid(); this.pos++; }
  async value(limit) {
    await this.skip(); if (!await this.fill()) throw invalid();
    const start = this.offset; const first = this.bytes[this.pos];
    const compound = first === 123 || first === 91; const string = first === 34;
    const stack = []; const parts = []; let size = 0; let quoted = false; let escaped = false; let done = false;
    while (await this.fill()) {
      const begin = this.pos;
      while (this.pos < this.bytes.length) {
        const byte = this.bytes[this.pos];
        if (!compound && !string && (whitespace(byte) || [44, 93, 125].includes(byte))) { done = true; break; }
        this.pos++; size++;
        if (size > limit) throw new Error(limit === MAX_IMPORT_BYTES ? 'A recovery record exceeds the supported 16 MiB limit. Export it separately.' : 'The recovery archive contains an oversized header.');
        if (quoted) {
          if (escaped) escaped = false;
          else if (byte === 92) escaped = true;
          else if (byte === 34) { quoted = false; if (string) done = true; }
        } else if (byte === 34) quoted = true;
        else if (byte === 123 || byte === 91) {
          stack.push(byte);
          if (stack.length > 64) throw new Error('The recovery archive is nested too deeply.');
        } else if (byte === 125 || byte === 93) {
          if (stack.pop() !== (byte === 125 ? 123 : 91)) throw invalid();
          if (!stack.length) done = true;
        }
        if (done) break;
      }
      if (this.pos > begin) parts.push(this.bytes.subarray(begin, this.pos));
      if (done) break;
    }
    if (!size || quoted || compound && !done) throw invalid();
    const bytes = new Uint8Array(size); let offset = 0;
    for (const part of parts) { bytes.set(part, offset); offset += part.length; }
    return { start, end: this.offset, bytes };
  }
}

export async function scanRecoveryArchive(file, { signal } = {}) {
  if (!file || !Number.isSafeInteger(file.size) || file.size < 1 || file.size > MAX_RECOVERY_ARCHIVE_BYTES || typeof file.slice !== 'function') throw new Error('Recovery archives support files up to 256 MiB. Export individual snapshots for larger archives.');
  const cursor = new FileCursor(file, signal); const keys = new Set(); const records = []; let count = 0; let issues = 0; let kind; let version;
  // Accept a UTF-8 BOM only at the start; offsets always refer to original bytes.
  if (await cursor.fill() && cursor.bytes[0] === 239) {
    if (cursor.bytes[1] !== 187 || cursor.bytes[2] !== 191) throw invalid();
    cursor.pos = 3;
  }
  await cursor.expect(123);
  while (await cursor.peek() !== 125) {
    const key = parse((await cursor.value(256)).bytes);
    if (typeof key !== 'string' || keys.has(key) || !['kind', 'version', 'snapshots', 'sync'].includes(key)) throw invalid();
    keys.add(key); await cursor.expect(58);
    if (key === 'kind' || key === 'version') {
      const value = parse((await cursor.value(256)).bytes);
      if (key === 'kind') {
        kind = value;
        if (kind !== 'securepass-encrypted-recovery') throw new Error('Regular backups support files up to 16 MiB. Larger files must be SecurePass recovery archives.');
      } else version = value;
    } else {
      await cursor.expect(91);
      while (await cursor.peek() !== 93) {
        if (++count > MAX_RECOVERY_SNAPSHOTS) throw new Error('Choose an archive with at most 100 snapshots.');
        const value = await cursor.value(MAX_IMPORT_BYTES); const record = parse(value.bytes);
        let valid = true;
        try { validateRecord(record); } catch { issues++; valid = false; }
        if (valid) {
          const hash = await digest(value.bytes); abort(signal);
          records.push({ id: `${key}:${count}:${hash}`, hash, start: value.start, end: value.end, revision: typeof record.revision === 'string' && /^[\w-]{1,64}$/.test(record.revision) ? record.revision : undefined, updatedAt: typeof record.updatedAt === 'string' && record.updatedAt.length <= 64 && Number.isFinite(Date.parse(record.updatedAt)) ? record.updatedAt : undefined, collection: key });
        }
        if (await cursor.peek() === 93) break;
        await cursor.expect(44);
        if (await cursor.peek() === 93) throw invalid();
      }
      await cursor.expect(93);
    }
    if (await cursor.peek() === 125) break;
    await cursor.expect(44);
    if (await cursor.peek() === 125) throw invalid();
  }
  await cursor.expect(125); await cursor.skip();
  if (await cursor.peek() !== undefined || keys.size !== 4 || kind !== 'securepass-encrypted-recovery' || version !== 1) throw invalid();
  abort(signal);
  if (!records.length) throw new Error('This archive has no readable encrypted snapshots. Your vault was not changed.');
  records.sort((a, b) => (a.collection === 'snapshots' ? 0 : 1) - (b.collection === 'snapshots' ? 0 : 1) || a.start - b.start);
  return {
    kind: 'recovery', issues,
    snapshots: records.map(({ id, revision, updatedAt, collection }) => ({ id, revision, updatedAt, collection })),
    async readSnapshot(id) {
      abort(signal);
      const selected = records.find(record => record.id === id);
      if (!selected) throw new Error('Choose a snapshot from this archive again.');
      let bytes;
      try { bytes = new Uint8Array(await file.slice(selected.start, selected.end).arrayBuffer()); }
      catch { abort(signal); throw new Error('This backup file could not be reread. Choose the file again.'); }
      abort(signal);
      if (bytes.length !== selected.end - selected.start || await digest(bytes) !== selected.hash) throw new Error('The backup file changed after review. Choose it again.');
      abort(signal);
      const record = parse(bytes); validateRecord(record); return record;
    }
  };
}

export async function readImportFile(file, { signal } = {}) {
  abort(signal);
  if (!file || !Number.isSafeInteger(file.size) || file.size < 1 || typeof file.arrayBuffer !== 'function' || typeof file.slice !== 'function') throw new Error('Invalid backup file.');
  if (file.size > MAX_IMPORT_BYTES) return scanRecoveryArchive(file, { signal });
  let data;
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (bytes.length !== file.size) throw invalid();
    data = parse(bytes);
  }
  catch { throw new Error('This file is not a valid JSON backup. Choose a SecurePass backup file.'); }
  abort(signal);
  if (!data || typeof data !== 'object') throw new Error('Invalid backup file.');
  if (data.kind === 'securepass-encrypted-recovery') { data = null; return scanRecoveryArchive(file, { signal }); }
  return { kind: 'backup', data };
}
