import { normalizeSite } from './security/origins.js';

export const MAX_LENGTHS = { site: 255, username: 255, password: 1024, notes: 4096, id: 64 };
export const BACKUP_VERSION = 1;
export const MAX_IMPORT_BYTES = 16 * 1024 * 1024;
export const MAX_ENTRIES = 5000;
export const MAX_VAULT_BYTES = 3 * 1024 * 1024;

// Secrets and user data are never trimmed or HTML-sanitized. Escape when rendering.
export function validateString(value, maxLength, fieldName, required = false) {
  if (value === undefined || value === null) {
    if (required) throw new Error(`${fieldName} is required`);
    return '';
  }
  if (typeof value !== 'string' || value.length > maxLength || (required && !value.length)) {
    throw new Error(`Invalid ${fieldName} (maximum ${maxLength} characters).`);
  }
  return value;
}

export function validateMaster(value, creating = false) {
  const pass = validateString(value, 1024, 'master password', true);
  if (creating && [...pass].length < 16) throw new Error('Use at least 16 characters for a new master password.');
  return pass;
}

export function validateBackupPassword(value, creating = false) {
  const password = validateString(value, 1024, 'backup password', true);
  if (creating && [...password].length < 12) throw new Error('Use at least 12 characters for the backup password.');
  return password;
}

function date(value, fallback) {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || value.length > 64 || !Number.isFinite(Date.parse(value))) throw new Error('Invalid entry date.');
  return new Date(value).toISOString();
}

export function validateEntry(entry, partial = false) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw new Error('Invalid entry.');
  const result = {};
  for (const [key, limit] of Object.entries(MAX_LENGTHS)) {
    if (entry[key] !== undefined) result[key] = validateString(entry[key], limit, key, ['site', 'password', 'id'].includes(key));
    else if (!partial && ['site', 'password'].includes(key)) throw new Error(`${key} is required`);
  }
  if (result.site !== undefined) result.site = normalizeSite(result.site);
  for (const key of ['createdAt', 'updatedAt']) if (entry[key] !== undefined) result[key] = date(entry[key]);
  return result;
}

export function createVaultBackup(entries) {
  return { kind: 'securepass-vault-backup', version: BACKUP_VERSION, exportedAt: new Date().toISOString(), entries };
}

export function validateImportData(data) {
  if (!data || typeof data !== 'object' || new TextEncoder().encode(JSON.stringify(data)).length > MAX_IMPORT_BYTES) throw new Error('Invalid or oversized backup.');
  if (data.version !== undefined && data.version !== BACKUP_VERSION) throw new Error('Unsupported backup version.');
  if (data.kind !== undefined && data.kind !== 'securepass-vault-backup') throw new Error('Unsupported backup kind.');
  const entries = Array.isArray(data) ? data : data.entries || data.vault?.entries;
  if (!Array.isArray(entries) || entries.length > MAX_ENTRIES) throw new Error('Invalid backup entries.');
  const ids = new Set();
  const now = new Date().toISOString();
  const clean = entries.map(entry => {
    const item = validateEntry(entry);
    item.id ||= crypto.randomUUID();
    if (ids.has(item.id)) throw new Error('Duplicate credential ID in backup.');
    ids.add(item.id);
    item.createdAt = date(item.createdAt, now);
    item.updatedAt = date(item.updatedAt, item.createdAt);
    return { username: '', notes: '', ...item };
  });
  return { entries: clean, version: BACKUP_VERSION };
}

export function validateVaultEntries(entries) {
  const clean = validateImportData({ entries }).entries;
  if (new TextEncoder().encode(JSON.stringify({ entries: clean })).length > MAX_VAULT_BYTES) throw new Error('Vault capacity reached (5,000 entries or 3 MiB).');
  return clean;
}

export function validateConstraints(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid generator options.');
  const result = {};
  for (const key of ['length', 'minLength', 'maxLength']) {
    if (input[key] !== undefined) {
      if (!Number.isInteger(input[key]) || input[key] < 1 || input[key] > 128) throw new Error(`Invalid ${key}: use 1–128.`);
      result[key] = input[key];
    }
  }
  if (input.pattern) {
    if (typeof input.pattern !== 'string' || input.pattern.length > 256) throw new Error('Unsupported password pattern.');
    // Only a small, bounded HTML-pattern subset is accepted; arbitrary regex can block the worker.
    if (!/^\^?(?:\[[A-Za-z0-9!@#$%^&*()_+=.,:;? /\\\-]+\]|\\[dw]|[A-Za-z0-9])(?:\{\d{1,3}(?:,\d{0,3})?\}|[+*?])?\$?$/.test(input.pattern)) {
      throw new Error('This site uses an unsupported pattern. Choose a password manually.');
    }
    result.pattern = input.pattern;
  }
  result.overrides = {};
  for (const key of ['includeLowercase', 'includeUppercase', 'includeNumbers', 'includeSymbols', 'avoidSimilar']) {
    if (input.overrides?.[key] !== undefined) {
      if (typeof input.overrides[key] !== 'boolean') throw new Error(`Invalid ${key}.`);
      result.overrides[key] = input.overrides[key];
    }
  }
  result.customRequirements = {};
  for (const key of ['requiresUppercase', 'requiresLowercase', 'requiresNumber', 'requiresSymbol']) {
    if (input.customRequirements?.[key] !== undefined) {
      if (typeof input.customRequirements[key] !== 'boolean') throw new Error(`Invalid ${key}.`);
      result.customRequirements[key] = input.customRequirements[key];
    }
  }
  return result;
}
