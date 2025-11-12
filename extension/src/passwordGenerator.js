import { loadSettings } from './settings.js';

const SIMILAR_CHARS = /[Il1O0]/g;

function buildCharset(settings, constraints) {
  const requirements = {
    requiresUppercase: false,
    requiresLowercase: false,
    requiresNumber: false,
    requiresSymbol: false,
    ...(constraints.customRequirements || {})
  };
  let charset = '';
  if (settings.includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (settings.includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (settings.includeNumbers) charset += '0123456789';
  if (settings.includeSymbols) charset += '!@#$%^&*()-_=+[]{}|;:,.<>?';
  if (!charset) charset = 'abcdefghijklmnopqrstuvwxyz0123456789';

  if (constraints.pattern) {
    // Try to infer from regex character classes
    if (/\\d/.test(constraints.pattern) && !settings.includeNumbers) {
      charset += '0123456789';
    }
    if (/\[A-Z\]/.test(constraints.pattern) && !settings.includeUppercase) {
      charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    }
    if (/\[a-z\]/.test(constraints.pattern) && !settings.includeLowercase) {
      charset += 'abcdefghijklmnopqrstuvwxyz';
    }
  }

  if (requirements.requiresSymbol) {
    charset += '!@#$%^&*()-_=+[]{}|;:,.<>?';
  }

  if (settings.avoidSimilar) {
    charset = charset.replace(SIMILAR_CHARS, '');
  }

  return Array.from(new Set(charset.split(''))).join('');
}

function ensureRequirements(password, charset, constraints) {
  const requirements = {
    requiresUppercase: false,
    requiresLowercase: false,
    requiresNumber: false,
    requiresSymbol: false,
    ...(constraints.customRequirements || {})
  };
  const replacements = [];
  if (requirements.requiresUppercase && !/[A-Z]/.test(password)) {
    replacements.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  }
  if (requirements.requiresLowercase && !/[a-z]/.test(password)) {
    replacements.push('abcdefghijklmnopqrstuvwxyz');
  }
  if (requirements.requiresNumber && !/\d/.test(password)) {
    replacements.push('0123456789');
  }
  if (requirements.requiresSymbol && !/[^\w\s]/.test(password)) {
    replacements.push('!@#$%^&*()-_=+[]{}|;:,.<>?');
  }

  let result = password.split('');
  const random = crypto.getRandomValues(new Uint32Array(replacements.length));

  replacements.forEach((set, index) => {
    const pos = random[index] % result.length;
    const char = set[random[index] % set.length];
    result[pos] = char;
  });

  return result.join('');
}

export async function generatePassword(constraints = {}) {
  const settings = await loadSettings();
  const length = Math.min(
    Math.max(constraints.minLength || settings.minLength, settings.minLength),
    constraints.maxLength || 64
  );
  const charset = buildCharset(settings, {
    customRequirements: constraints.customRequirements || {},
    pattern: constraints.pattern || null
  });

  const cryptoArray = new Uint32Array(length);
  let password = '';

  for (let attempt = 0; attempt < 50; attempt += 1) {
    crypto.getRandomValues(cryptoArray);
    password = Array.from(cryptoArray, value => charset[value % charset.length]).join('');
    password = ensureRequirements(password, charset, {
      customRequirements: constraints.customRequirements || {}
    });

    if (constraints.pattern) {
      const regex = new RegExp(constraints.pattern);
      if (!regex.test(password)) {
        continue;
      }
    }

    if (constraints.confirmField) {
      constraints.confirmField.value = password;
      constraints.confirmField.dispatchEvent(new Event('input', { bubbles: true }));
    }
    return password;
  }

  return password;
}
