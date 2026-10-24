import { positionFloating, positionPanel, resolveThemeClass } from './ui.js';
import { request } from './messaging.js';
import { setFieldValue, visibleField } from './fields.js';

let shadowRoot;
let shadowHost;
let analyzer;
const tracked = new Map();
const pending = new Map();
const submitted = new WeakMap();

export async function initAutofill(deps) {
  shadowRoot = deps.shadowRoot;
  shadowHost = deps.shadowHost;
  analyzer = deps.analyzer;
  chrome.runtime.onMessage.addListener((message, sender, respond) => {
    if (sender.id !== chrome.runtime.id) return;
    if (message.type === 'AUTOFILL_CHECK_DOCUMENT') { respond({ ok: true, origin: location.origin }); return; }
    if (message.type === 'VAULT_LOCKED') {
      pending.clear();
      for (const entry of tracked.values()) entry.close?.();
      return;
    }
    if (message.type !== 'AUTOFILL_RESULT') return;
    const target = pending.get(message.requestId);
    pending.delete(message.requestId);
    if (!target || target.expires < Date.now() || message.origin !== location.origin || !visibleField(target.field)) return;
    const context = analyzer.analyzeFormContext(target.field);
    if (context.isCurrent || context.context !== 'login') return;
    setFieldValue(target.field, message.entry.password);
    if (visibleField(context.usernameField)) setFieldValue(context.usernameField, message.entry.username);
    target.close();
  });
  document.addEventListener('submit', async event => {
    const fields = [...event.target.querySelectorAll('input[type="password"]')];
    const field = fields.find(f => f.autocomplete === 'new-password') || fields.find(f => !analyzer.analyzeFormContext(f).isCurrent);
    if (!field?.value || !visibleField(field)) return;
    const context = analyzer.analyzeFormContext(field);
    const username = context.usernameField?.value || '';
    // One suggestion per account/value per form; no credential is saved without trusted confirmation.
    const signature = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${username}\u0000${field.value}`)))).join(',');
    if (submitted.get(event.target) === signature) return;
    submitted.set(event.target, signature);
    const candidate = { site: location.origin, username, password: field.value, notes: '' };
    request('PROPOSE_CREDENTIAL', { entry: candidate }).catch(() => {});
    showSaveSuggestion(field, candidate);
  }, true);
}

function element(tag, text, className) {
  const el = document.createElement(tag);
  if (text) el.textContent = text;
  if (className) el.className = className;
  return el;
}
function showSaveSuggestion(field, entry) {
  const trackedField = tracked.get(field);
  if (!trackedField) return;
  trackedField.close?.();
  const panel = element('div', null, 'securepass-panel');
  panel.append(element('h3', 'Save or update this account?'));
  const note = element('p', 'Only confirm after the website accepts your login or password change.');
  panel.append(note);
  const save = element('button', 'Review in SecurePass', 'securepass-btn'); save.type = 'button';
  save.addEventListener('click', async () => {
    try { await request('PROMPT_SAVE_CREDENTIAL', { entry }); panel.remove(); } catch (error) { note.textContent = error.message; }
  });
  const dismiss = element('button', 'Dismiss', 'securepass-btn'); dismiss.type = 'button';
  dismiss.addEventListener('click', () => panel.remove());
  panel.append(save, dismiss); shadowRoot.append(panel);
  resolveThemeClass().then(cls => panel.classList.add(cls));
  positionPanel(panel, field);
  trackedField.close = () => { entry.password = ''; panel.remove(); };
  setTimeout(() => trackedField.close?.(), 30000);
}

export function attachButton(field) {
  // A single removal sweep replaces a MutationObserver per password field.
  for (const [input, entry] of tracked) if (!input.isConnected) { entry.destroy(); tracked.delete(input); }
  if (tracked.has(field)) return;
  const button = element('button', '🔑', 'securepass-floating'); button.type = 'button';
  button.setAttribute('aria-label', 'Open SecurePass tools');
  shadowRoot.append(button);
  const entry = { close: null };
  const reposition = () => positionFloating(button, field);
  const observer = new ResizeObserver(reposition); observer.observe(field);
  window.addEventListener('scroll', reposition, true); window.addEventListener('resize', reposition);
  entry.destroy = () => { entry.close?.(); button.remove(); observer.disconnect(); window.removeEventListener('scroll', reposition, true); window.removeEventListener('resize', reposition); };
  tracked.set(field, entry); reposition();
  button.addEventListener('click', async () => {
    if (entry.close) { entry.close(); entry.close = null; return; }
    const panel = element('div', null, 'securepass-panel');
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'SecurePass tools');
    const status = element('p', 'Unlock and confirm credentials in the SecurePass window.');
    const title = element('h3', 'SecurePass');
    panel.append(title, status);
    const close = () => { panel.remove(); document.removeEventListener('pointerdown', outside, true); entry.close = null; };
    const outside = e => { if (!e.composedPath().includes(shadowHost)) close(); };
    entry.close = close;
    document.addEventListener('pointerdown', outside, true);
    const context = analyzer.analyzeFormContext(field);
    const fill = element('button', 'Choose saved account', 'securepass-btn'); fill.type = 'button';
    fill.addEventListener('click', async () => {
      try {
        if (analyzer.analyzeFormContext(field).context !== 'login') throw new Error('Saved passwords are only filled into login fields.');
        const response = await request('REQUEST_AUTOFILL');
        pending.set(response.requestId, { field, close, expires: Date.now() + 120000 });
        status.textContent = 'Continue in the SecurePass window.';
      } catch (error) { status.textContent = error.message; }
    });
    if (context.context === 'login') panel.append(fill);
    if (!context.isCurrent) {
      const generate = element('button', 'Generate password', 'securepass-btn'); generate.type = 'button';
      generate.addEventListener('click', async () => {
        try {
          const current = analyzer.analyzeFormContext(field);
          if (current.isCurrent) throw new Error('Do not replace the current password.');
          const result = await request('GENERATE_PASSWORD', { constraints: analyzer.extractConstraints(field) });
          if (!visibleField(field)) return;
          setFieldValue(field, result.password);
          if (visibleField(current.confirmField)) setFieldValue(current.confirmField, result.password);
          status.textContent = 'Password generated. Save it after the website accepts it.';
        } catch (error) { status.textContent = error.message; }
      }); panel.append(generate);
    }
    const copy = element('button', 'Copy password', 'securepass-btn'); copy.type = 'button';
    copy.addEventListener('click', async () => {
      try { await request('COPY_INLINE_PASSWORD', { value: field.value }); status.textContent = 'Copied. Clipboard cleanup is best effort.'; } catch (error) { status.textContent = error.message; }
    });
    const save = element('button', 'Save or update account', 'securepass-btn'); save.type = 'button';
    save.addEventListener('click', async () => {
      try {
        const current = analyzer.analyzeFormContext(field);
        await request('PROMPT_SAVE_CREDENTIAL', { entry: { site: location.origin, username: current.usernameField?.value || '', password: field.value, notes: '' } });
        status.textContent = 'Confirm in the SecurePass window.';
      } catch (error) { status.textContent = error.message; }
    });
    const dismiss = element('button', 'Close', 'securepass-btn'); dismiss.type = 'button'; dismiss.addEventListener('click', close);
    panel.append(copy, save, dismiss); shadowRoot.append(panel);
    panel.addEventListener('keydown', e => { if (e.key === 'Escape') { close(); button.focus(); } });
    resolveThemeClass().then(cls => panel.classList.add(cls)); positionPanel(panel, field); fill.isConnected ? fill.focus() : dismiss.focus();
  });
}
