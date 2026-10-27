import { positionFloating, positionPanel, resolveThemeClass } from './ui.js';
import { request } from './messaging.js';
import { setFieldValue, visibleField } from './fields.js';
import { icon } from './icons.js';
let shadowRoot; let shadowHost; let analyzer; let active = null;
const tracked = new Map(); const pending = new Map(); const submitted = new WeakMap();
const element = (tag, text, className) => {
  const node = document.createElement(tag); if (text) node.textContent = text; if (className) node.className = className; return node;
};
function action(label, name, primary = false) {
  const button = element('button', null, `securepass-btn ${primary ? 'primary' : 'securepass-tool'}`); button.type = 'button';
  button.dataset.action = name;
  button.append(icon(name), element('span', label)); return button;
}
function createPanel(field, title, { focus = false } = {}) {
  active?.close();
  const entry = tracked.get(field); if (!entry || !visibleField(field)) return null;
  const panel = element('section', null, 'securepass-panel sp-light'); panel.id = `securepass-panel-${crypto.randomUUID()}`;
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', title);
  const header = element('div', null, 'securepass-panel-header'); const brand = element('div', 'SecurePass', 'securepass-brand'); brand.prepend(icon('key', 16));
  const dismiss = element('button', null, 'securepass-icon-btn'); dismiss.type = 'button'; dismiss.setAttribute('aria-label', 'Close SecurePass tools'); dismiss.append(icon('close'));
  header.append(brand, dismiss); panel.append(header, element('h3', title), element('p', location.origin, 'securepass-origin'));
  const actions = element('div', null, 'securepass-actions'); const status = element('p', null, 'securepass-status'); status.hidden = true; status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
  panel.append(actions, status); shadowRoot.append(panel);
  let timer; let closed = false;
  const reposition = () => { if (!visibleField(field)) close(); else positionPanel(panel, field); };
  const outside = event => { if (!event.composedPath().includes(shadowHost)) close(); };
  const escape = event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(true); } };
  const observer = new ResizeObserver(reposition); observer.observe(field); observer.observe(panel);
  const close = (restoreFocus = false) => {
    if (closed) return; closed = true; clearTimeout(timer); panel.remove(); observer.disconnect();
    document.removeEventListener('pointerdown', outside, true); window.removeEventListener('scroll', reposition, true); window.removeEventListener('resize', reposition);
    window.visualViewport?.removeEventListener('resize', reposition); window.visualViewport?.removeEventListener('scroll', reposition);
    if (entry.close === close) { entry.close = null; entry.button.setAttribute('aria-expanded', 'false'); entry.button.removeAttribute('aria-controls'); }
    if (active?.panel === panel) active = null;
    for (const [id, target] of pending) if (target.close === close) pending.delete(id);
    if (restoreFocus && !entry.button.hidden && entry.button.isConnected) entry.button.focus();
  };
  const report = (text, error = false) => { if (closed) return; status.textContent = text; status.hidden = !text; status.dataset.state = error ? 'error' : ''; reposition(); };
  const run = async task => {
    if (panel.getAttribute('aria-busy') === 'true') return;
    const controls = [...panel.querySelectorAll('.securepass-btn')]; controls.forEach(button => { button.disabled = true; }); panel.setAttribute('aria-busy', 'true');
    try { await task(); } catch (error) { report(error.message, true); }
    finally { panel.removeAttribute('aria-busy'); if (!closed) controls.forEach(button => { button.disabled = false; }); field.dispatchEvent(new Event('securepass-refresh-actions')); }
  };
  entry.close = close; entry.button.setAttribute('aria-expanded', 'true'); entry.button.setAttribute('aria-controls', panel.id);
  active = { panel, close, field }; dismiss.addEventListener('click', () => close(true)); panel.addEventListener('keydown', escape);
  document.addEventListener('pointerdown', outside, true); window.addEventListener('scroll', reposition, true); window.addEventListener('resize', reposition);
  window.visualViewport?.addEventListener('resize', reposition); window.visualViewport?.addEventListener('scroll', reposition);
  resolveThemeClass().then(theme => { if (!closed) { panel.classList.remove('sp-light', 'sp-dark'); panel.classList.add(theme); } }).catch(() => {});
  reposition(); if (focus) dismiss.focus();
  return { panel, actions, report, close, run, expire: delay => { timer = setTimeout(close, delay); } };
}
function showSaveSuggestion(field, candidateId, username) {
  const view = createPanel(field, 'Save this login?'); if (!view) return;
  const account = element('p', username || 'No username detected', 'securepass-account'); view.actions.before(account);
  const note = element('p', 'Detected when this form was submitted. Review only after the website accepts your login. No changes have been saved.', 'securepass-note'); view.actions.before(note);
  const review = action('Review login', 'save', true);
  review.addEventListener('click', () => view.run(async () => { await request('REVIEW_INLINE_CANDIDATE', { candidateId }); view.close(); }));
  const dismiss = action('Not now', 'close');
  dismiss.addEventListener('click', () => view.run(async () => { await request('DISMISS_INLINE_CANDIDATE', { candidateId }); view.close(true); }));
  view.actions.append(review, dismiss); view.expire(30000); positionPanel(view.panel, field);
}
export async function initAutofill(deps) {
  shadowRoot = deps.shadowRoot; shadowHost = deps.shadowHost; analyzer = deps.analyzer;
  const cleanup = new MutationObserver(() => {
    for (const [field, entry] of tracked) if (!field.isConnected) { entry.destroy(); tracked.delete(field); }
  });
  const observeCleanup = () => cleanup.observe(document.documentElement, { childList: true, subtree: true });
  observeCleanup();
  chrome.runtime.onMessage.addListener((message, sender, respond) => {
    if (sender.id !== chrome.runtime.id) return;
    if (message.type === 'AUTOFILL_CHECK_DOCUMENT') { respond({ ok: true, origin: location.origin }); return; }
    if (message.type === 'VAULT_LOCKED') { pending.clear(); active?.close(); return; }
    if (!['AUTOFILL_RESULT', 'AUTOFILL_CANCELLED'].includes(message.type)) return;
    const target = pending.get(message.requestId); pending.delete(message.requestId);
    if (!target) return;
    if (message.type === 'AUTOFILL_CANCELLED') { target.report('Selection cancelled. You can choose a saved login again.'); return; }
    if (target.expires < Date.now() || message.origin !== location.origin || !visibleField(target.field)) return;
    const context = analyzer.analyzeFormContext(target.field);
    if (context.isCurrent || context.context !== 'login') return;
    setFieldValue(target.field, message.entry.password);
    if (visibleField(context.usernameField)) setFieldValue(context.usernameField, message.entry.username);
    target.close();
  });
  document.addEventListener('submit', event => {
    if (!(event.target instanceof HTMLFormElement)) return;
    const fields = [...event.target.querySelectorAll('input[type="password"]')];
    const field = fields.find(input => input.autocomplete === 'new-password') || fields.find(input => !analyzer.analyzeFormContext(input).isCurrent);
    if (!field?.value || !visibleField(field)) return;
    const context = analyzer.analyzeFormContext(field);
    const candidate = { site: location.origin, username: context.usernameField?.value || '', password: field.value };
    const attempt = Symbol(); submitted.set(event.target, attempt);
    // Capture before website listeners clear fields or navigate; no success is inferred.
    request('PROPOSE_CREDENTIAL', { entry: candidate }).then(result => {
      if (result.proposed && submitted.get(event.target) === attempt) showSaveSuggestion(field, result.candidateId, candidate.username);
    }).catch(() => {}).finally(() => { candidate.password = ''; });
  }, true);
  window.addEventListener('pagehide', () => { cleanup.disconnect(); pending.clear(); active?.close(); for (const entry of tracked.values()) entry.destroy(); tracked.clear(); });
  window.addEventListener('pageshow', event => { if (event.persisted) { observeCleanup(); document.querySelectorAll('input[type="password"]').forEach(attachButton); } });
}
export function attachButton(field) {
  for (const [input, entry] of tracked) if (!input.isConnected) { entry.destroy(); tracked.delete(input); }
  if (tracked.has(field)) return;
  const button = element('button', null, 'securepass-floating sp-light'); button.type = 'button'; button.append(icon('key', 16));
  button.setAttribute('aria-label', 'Open SecurePass tools'); button.setAttribute('aria-haspopup', 'dialog'); button.setAttribute('aria-expanded', 'false');
  shadowRoot.append(button); resolveThemeClass().then(theme => { button.classList.remove('sp-light', 'sp-dark'); button.classList.add(theme); }).catch(() => {});
  const entry = { button, close: null };
  const reposition = () => positionFloating(button, field);
  const observer = new ResizeObserver(reposition); observer.observe(field);
  window.addEventListener('scroll', reposition, true); window.addEventListener('resize', reposition);
  entry.destroy = () => { entry.close?.(); button.remove(); observer.disconnect(); window.removeEventListener('scroll', reposition, true); window.removeEventListener('resize', reposition); };
  tracked.set(field, entry); reposition();
  button.addEventListener('click', () => {
    if (entry.close) { entry.close(true); return; }
    const context = analyzer.analyzeFormContext(field);
    const view = createPanel(field, context.context === 'login' ? 'Sign in' : context.isCurrent ? 'Current password' : 'Create a password'); if (!view) return;
    const fill = action('Choose saved login', 'user', true); let selecting = false;
    fill.dataset.action = 'fill';
    if (context.context === 'login') {
      view.actions.append(fill);
      fill.addEventListener('click', () => view.run(async () => {
        if (analyzer.analyzeFormContext(field).context !== 'login') throw new Error('Saved logins are only filled into login forms.');
        view.report('Opening SecurePass…'); const response = await request('REQUEST_AUTOFILL');
        if (!view.panel.isConnected) return;
        selecting = true; pending.set(response.requestId, { field, close: view.close, report: text => { selecting = false; update(); view.report(text); }, expires: Date.now() + 120000 }); view.report('Choose a login in the SecurePass window. Your master password is entered there.');
      }));
    }
    const tools = element('div', null, 'securepass-tools');
    const generate = action('Generate password', 'generate', context.context !== 'login');
    if (!context.isCurrent) {
      (context.context === 'login' ? tools : view.actions).append(generate);
      generate.addEventListener('click', () => view.run(async () => {
        const current = analyzer.analyzeFormContext(field); if (current.isCurrent) throw new Error('Use the new password field to generate a replacement.');
        const destination = current.context === 'login' ? field : current.primaryField || field;
        const destinationContext = analyzer.analyzeFormContext(destination);
        const result = await request('GENERATE_PASSWORD', { constraints: analyzer.extractConstraints(destination) });
        if (!visibleField(field)) return;
        if (visibleField(destination)) setFieldValue(destination, result.password);
        if (visibleField(destinationContext.confirmField)) setFieldValue(destinationContext.confirmField, result.password);
        view.report('Password generated. Save it after the website accepts it.');
      }));
    }
    const copy = action('Copy password', 'copy');
    copy.addEventListener('click', () => view.run(async () => { await request('COPY_INLINE_PASSWORD', { value: field.value }); view.report('Password copied.'); }));
    const save = action('Save login', 'save');
    save.addEventListener('click', () => view.run(async () => {
      const current = analyzer.analyzeFormContext(field);
      if (current.isCurrent) throw new Error('Use the new password field to save a password change.');
      await request('PROMPT_SAVE_CREDENTIAL', { entry: { site: location.origin, username: current.usernameField?.value || '', password: field.value } }); view.report('Review the login in the SecurePass window before saving.');
    }));
    tools.append(copy); if (!context.isCurrent) tools.append(save); view.actions.after(tools);
    const update = () => { if (view.panel.getAttribute('aria-busy') !== 'true') { copy.disabled = save.disabled = !field.value; fill.disabled = selecting; } };
    field.addEventListener('input', update); field.addEventListener('securepass-refresh-actions', update); update();
    // Field listeners belong to this panel and never accumulate across opens.
    const cleanup = () => { field.removeEventListener('input', update); field.removeEventListener('securepass-refresh-actions', update); };
    const removal = new MutationObserver(() => { if (!view.panel.isConnected) { cleanup(); removal.disconnect(); } }); removal.observe(shadowRoot, { childList: true });
    const note = element('p', context.isCurrent ? 'Your current password will not be replaced by the generator.' : 'Passwords are only saved after you confirm in SecurePass.', 'securepass-note'); view.panel.append(note);
    positionPanel(view.panel, field); (fill.isConnected ? fill : generate.isConnected ? generate : button).focus();
  });
}
