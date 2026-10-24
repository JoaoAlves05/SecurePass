export function analyzeFormContext(field) {
  const form = field.form || field.closest('form');
  const inputs = [...(form || document).querySelectorAll('input')].filter(el => el.type !== 'hidden');
  const passwords = inputs.filter(el => el.type === 'password' || el.autocomplete === 'new-password' || el.autocomplete === 'current-password');
  const current = passwords.find(el => el.autocomplete === 'current-password');
  const fresh = passwords.filter(el => el.autocomplete === 'new-password');
  const changing = Boolean(current && fresh.length) || passwords.length >= 3;
  const primary = changing ? (fresh[0] || passwords[1]) : passwords[0];
  const usernameField = inputs.find(el => el.autocomplete === 'username') ||
    inputs.slice(0, inputs.indexOf(field)).reverse().find(el => ['text', 'email'].includes(el.type)) || null;
  const confirmField = field === primary ? (fresh.find(el => el !== primary) || (passwords.length === 2 && !current ? passwords[1] : changing ? passwords[2] : null)) : null;
  return { context: changing ? 'change' : fresh.length || passwords.length > 1 ? 'register' : 'login', usernameField, confirmField, primaryField: primary, isCurrent: changing && field === (current || passwords[0]) };
}
export function extractConstraints(field) {
  const min = field.minLength > 0 ? field.minLength : 1;
  const max = Math.min(field.maxLength > 0 ? field.maxLength : 128, 128);
  return { minLength: min, maxLength: max, pattern: field.getAttribute('pattern') || undefined };
}
export function observePasswordFields(callback) {
  let scheduled;
  const scan = () => {
    scheduled = null;
    document.querySelectorAll('input[type="password"]').forEach(field => callback(field, extractConstraints(field)));
  };
  scan();
  const observer = new MutationObserver(mutations => {
    if (mutations.some(m => m.type === 'attributes' || m.addedNodes.length || m.removedNodes.length)) {
      clearTimeout(scheduled);
      scheduled = setTimeout(scan, 100);
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['type', 'autocomplete', 'minlength', 'maxlength', 'pattern'] });
  return () => { clearTimeout(scheduled); observer.disconnect(); };
}
