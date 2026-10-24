const COMMON = /password|passw[0o]rd|12345|qwerty|letmein|welcome|admin|summer|winter|spring|autumn|football|iloveyou/i;
export function evaluatePassword(password) {
  let charset = 0;
  if (/[a-z]/.test(password)) charset += 26;
  if (/[A-Z]/.test(password)) charset += 26;
  if (/\d/.test(password)) charset += 10;
  if (/[^a-zA-Z0-9]/u.test(password)) charset += 32;
  const entropy = password.length ? Math.round([...password].length * Math.log2(Math.max(charset, 1))) : 0;
  const repeated = /(.{1,4})\1{2,}/u.test(password);
  const sequential = /abcd|1234|4321|qwer|asdf/i.test(password);
  const common = COMMON.test(password) || repeated || sequential;
  const unique = new Set([...password]).size;
  let score = Math.min(0.95, password.length / 28) * Math.min(1, unique / 10);
  if (common) score = Math.min(score, 0.2);
  if (password.length < 12) score = Math.min(score, 0.35);
  const suggestions = [];
  if (password.length < 14) suggestions.push('Use a longer password or several randomly chosen words.');
  if (common) suggestions.push('Avoid common words, sequences and repeated patterns.');
  if (unique < 6 && password.length) suggestions.push('Use more variation or generate a random password.');
  suggestions.push('Use a unique password for every account. This rating is only a heuristic.');
  return { score, verdict: score >= 0.8 ? 'Excellent' : score >= 0.6 ? 'Strong' : score >= 0.4 ? 'Fair' : 'Weak', entropy, suggestions, crackTime: 'Not estimated for human passwords' };
}
