import { loadSettings } from './settings.js';
import { validateConstraints } from './validation.js';

const GROUPS = { includeLowercase: 'abcdefghijklmnopqrstuvwxyz', includeUppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', includeNumbers: '0123456789', includeSymbols: '!@#$%^&*()-_=+[]{}|;:,.<>?' };
const REQUIREMENTS = { requiresLowercase: 'includeLowercase', requiresUppercase: 'includeUppercase', requiresNumber: 'includeNumbers', requiresSymbol: 'includeSymbols' };
function randomIndex(length) {
  const limit = Math.floor(0x100000000 / length) * length;
  const value = new Uint32Array(1);
  do { crypto.getRandomValues(value); } while (value[0] >= limit);
  return value[0] % length;
}
export async function generatePassword(input = {}) {
  const c = validateConstraints(input);
  const options = { ...await loadSettings(), ...c.overrides };
  const min = c.minLength || 1;
  const max = c.maxLength || 128;
  const length = Math.max(min, Math.min(c.length || options.minLength, max));
  if (min > max || length > 128) throw new Error('Incompatible password length constraints.');
  const groups = Object.fromEntries(Object.entries(GROUPS).map(([key, chars]) => [key, options.avoidSimilar ? chars.replace(/[Il1O0]/g, '') : chars]));
  for (const [req, key] of Object.entries(REQUIREMENTS)) if (c.customRequirements[req]) options[key] = true;
  const selected = Object.keys(groups).filter(key => options[key]);
  if (!selected.length) throw new Error('Select at least one character set.');
  // Enabled groups are guaranteed, not just probabilistically present.
  if (length < selected.length) throw new Error('Length is too short for all selected character sets.');
  const charset = selected.map(key => groups[key]).join('');
  const regex = c.pattern ? new RegExp(`^(?:${c.pattern.replace(/^\^|\$$/g, '')})$`, 'u') : null;
  for (let attempt = 0; attempt < 500; attempt++) {
    const chars = selected.map(key => groups[key][randomIndex(groups[key].length)]);
    while (chars.length < length) chars.push(charset[randomIndex(charset.length)]);
    for (let i = chars.length - 1; i > 0; i--) {
      const j = randomIndex(i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    const password = chars.join('');
    if (!regex || regex.test(password)) return password;
  }
  throw new Error('Unable to satisfy the site pattern with the selected options. Adjust the character sets.');
}
