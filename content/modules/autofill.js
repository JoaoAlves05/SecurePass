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
function createPanel(field, title, { focus = false, kind = 'tools' } = {}) {
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
  active = { panel, close, field, kind }; dismiss.addEventListener('click', () => close(true)); panel.addEventListener('keydown', escape);
  document.addEventListener('pointerdown', outside, true); window.addEventListener('scroll', reposition, true); window.addEventListener('resize', reposition);
  window.visualViewport?.addEventListener('resize', reposition); window.visualViewport?.addEventListener('scroll', reposition);
  resolveThemeClass().then(theme => { if (!closed) { panel.classList.remove('sp-light', 'sp-dark'); panel.classList.add(theme); } }).catch(() => {});
  reposition(); if (focus) dismiss.focus();
  return { panel, actions, report, close, run, expire: delay => { timer = setTimeout(close, delay); } };
}
function showSaveSuggestion(field, candidateId, username) {
  if (active?.kind === 'tools' || pending.size) return;
  const view = createPanel(field, 'Save this login?', { kind: 'suggestion' }); if (!view) return;
  const account = element('p', username || 'No username detected', 'securepass-account'); view.actions.before(account);
  const note = element('p', 'Detected when this form was submitted. Review only after the website accepts your login. No changes have been saved.', 'securepass-note'); view.actions.before(note);
  const review = action('Review login', 'save', true);
  review.addEventListener('click', () => view.run(async () => { await request('REVIEW_INLINE_CANDIDATE', { candidateId }); view.close(); }));
  const dismiss = action('Not now', 'close');
  dismiss.addEventListener('click', () => view.run(async () => { await request('DISMISS_INLINE_CANDIDATE', { candidateId }); view.close(true); }));
  view.actions.append(review, dismiss); view.expire(30000); positionPanel(view.panel, field);
}
function releaseTarget(target) {
  clearTimeout(target.timer); pending.delete(target.id);
  if (target.entry.target === target) target.entry.target = null;
  target.entry.button.removeAttribute('aria-busy');
  target.entry.button.setAttribute('aria-expanded', 'false');
  target.entry.button.setAttribute('aria-label', 'Choose a saved login in SecurePass');
}
function feedback(field, message, error = false) {
  if (active?.kind === 'tools') return;
  active?.close();
  const entry = tracked.get(field); if (!entry || !visibleField(field)) return;
  const status = element('p', message, 'securepass-feedback sp-light');
  status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); status.dataset.state = error ? 'error' : '';
  shadowRoot.append(status);
  let closed = false;
  const close = () => {
    if (closed) return; closed = true; clearTimeout(timer); status.remove();
    document.removeEventListener('pointerdown', close, true);
    if (entry.close === close) entry.close = null;
    if (active?.panel === status) active = null;
  };
  const timer = setTimeout(close, error ? 8000 : 3500);
  entry.close = close; active = { panel: status, close, field, kind: 'feedback' };
  document.addEventListener('pointerdown', close, true);
  resolveThemeClass().then(theme => { if (!closed) { status.classList.remove('sp-light', 'sp-dark'); status.classList.add(theme); } }).catch(() => {});
}
async function beginFill(field) {
  const entry = tracked.get(field); if (!entry || !visibleField(field)) return;
  if (entry.target) {
    if (!entry.target.requestId) return;
    try { await request('REQUEST_AUTOFILL', { existingRequestId: entry.target.requestId, targetId: entry.target.id }); }
    catch (error) { if (entry.target) releaseTarget(entry.target); feedback(field, error.message, true); }
    return;
  }
  active?.close();
  const target = { id: crypto.randomUUID(), field, entry, expires: Date.now() + 120000 };
  entry.target = target; pending.set(target.id, target);
  entry.button.setAttribute('aria-busy', 'true'); entry.button.setAttribute('aria-expanded', 'true');
  entry.button.setAttribute('aria-label', 'Opening SecurePass…');
  target.timer = setTimeout(() => { releaseTarget(target); feedback(field, 'Selection expired. Open SecurePass again.'); }, 120000);
  try {
    const response = await request('REQUEST_AUTOFILL', { targetId: target.id, hasPassword: Boolean(field.value) });
    if (!pending.has(target.id)) return;
    target.requestId = response.requestId; entry.button.removeAttribute('aria-busy');
    entry.button.setAttribute('aria-label', 'Return to the SecurePass selection');
  } catch (error) { if (pending.has(target.id)) { releaseTarget(target); feedback(field, error.message, true); } }
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
    const target = pending.get(message.targetId);
    const usable = target && target.expires > Date.now() && visibleField(target.field) && analyzer.analyzeFormContext(target.field).context === 'login';
    if (message.type === 'AUTOFILL_CHECK_DOCUMENT') { respond({ ok: Boolean(usable), origin: location.origin }); return; }
    if (message.type === 'VAULT_LOCKED') { for (const value of pending.values()) releaseTarget(value); active?.close(); return; }
    if (!['AUTOFILL_RESULT', 'AUTOFILL_CANCELLED', 'AUTOFILL_TOOL'].includes(message.type)) return;
    if (!target || target.requestId && target.requestId !== message.requestId) { respond({ ok: false }); return; }
    releaseTarget(target);
    if (message.type === 'AUTOFILL_CANCELLED') { feedback(target.field, message.reason === 'saved' ? 'Login saved. Open SecurePass to fill it.' : message.reason === 'expired' ? 'Selection expired. Open SecurePass again.' : 'Selection cancelled. Choose a login when you are ready.'); target.field.focus({ preventScroll: true }); respond({ ok: true }); return; }
    if (!usable || message.origin !== location.origin) { respond({ ok: false }); return; }
    const context = analyzer.analyzeFormContext(target.field);
    if (context.isCurrent) { respond({ ok: false }); return; }
    if (message.type === 'AUTOFILL_TOOL') { openTools(target.field, message.tool); respond({ ok: true }); return; }
    setFieldValue(target.field, message.entry.password);
    if (visibleField(context.usernameField)) setFieldValue(context.usernameField, message.entry.username);
    target.field.focus({ preventScroll: true }); feedback(target.field, 'Login filled. Submit the form when ready.'); respond({ ok: true });
  });
  document.addEventListener('submit', event => {
    if (!(event.target instanceof HTMLFormElement)) return;
    if (active?.kind === 'feedback') active.close();
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
  window.addEventListener('pagehide', () => { cleanup.disconnect(); for (const target of pending.values()) releaseTarget(target); active?.close(); for (const entry of tracked.values()) entry.destroy(); tracked.clear(); });
  window.addEventListener('pageshow', event => { if (event.persisted) { observeCleanup(); document.querySelectorAll('input[type="password"]').forEach(attachButton); } });
}
function openTools(field, selectedTool) {
  const context = analyzer.analyzeFormContext(field);
  const title = context.context === 'login' ? 'Password tools' : context.isCurrent ? 'Current password' : context.context === 'change' ? 'Create a new password' : 'Create a password';
  const view = createPanel(field, title); if (!view) return;
  const generate = action(context.context === 'change' ? 'Generate new password' : 'Generate and fill', 'generate', true);
  const options = element('details', null, 'securepass-options');
  const summary = element('summary', 'Password options'); options.append(summary);
  const destination = context.context === 'login' ? field : context.primaryField || field;
  const constraints = analyzer.extractConstraints(destination);
  const optionId = crypto.randomUUID();
  const lengthLabel = element('label', 'Length'); const length = element('input');
  length.id = `securepass-length-${optionId}`; lengthLabel.htmlFor = length.id;
  length.type = 'number'; length.min = constraints.minLength; length.max = constraints.maxLength;
  length.placeholder = 'Default'; lengthLabel.textContent = 'Length (optional)';
  const lengthRow = element('div', null, 'securepass-option-row'); lengthRow.append(lengthLabel, length);
  const symbolsLabel = element('label', null, 'securepass-option-row'); const symbols = element('select');
  symbols.id = `securepass-symbols-${optionId}`; symbolsLabel.htmlFor = symbols.id;
  for (const [value, text] of [['', 'Use SecurePass preference'], ['yes', 'Include symbols'], ['no', 'No symbols']]) {
    const option = element('option', text); option.value = value; symbols.append(option);
  }
  symbolsLabel.append(element('span', 'Symbols'), symbols);
  options.append(lengthRow, symbolsLabel, element('p', `Website length: ${constraints.minLength}–${constraints.maxLength} characters.`, 'securepass-note'));
  const copy = action('Copy entered password', 'copy');
  const save = action('Save entered login', 'save');
  const more = element('details', null, 'securepass-options'); more.append(element('summary', 'Other options'));
  const tools = element('div', null, 'securepass-tools'); tools.append(copy); if (!context.isCurrent) tools.append(save); more.append(tools);
  async function generatePassword() {
    const current = analyzer.analyzeFormContext(field);
    if (current.isCurrent) throw new Error('Use the new password field to generate a replacement.');
    const target = current.context === 'login' ? field : current.primaryField || field;
    const expected = analyzer.analyzeFormContext(target);
    const currentConstraints = analyzer.extractConstraints(target);
    const lengthOverride = options.open && length.value ? Number(length.value) : undefined;
    if (lengthOverride !== undefined && (!Number.isInteger(lengthOverride) || lengthOverride < currentConstraints.minLength || lengthOverride > currentConstraints.maxLength)) throw new Error(`Choose a length between ${currentConstraints.minLength} and ${currentConstraints.maxLength}.`);
    const overrides = symbols.value ? { includeSymbols: symbols.value === 'yes' } : {};
    const result = await request('GENERATE_PASSWORD', { constraints: { ...currentConstraints, ...(lengthOverride !== undefined ? { length: lengthOverride } : {}), overrides } });
    if (!view.panel.isConnected || !visibleField(field) || !visibleField(target)) return;
    const after = analyzer.analyzeFormContext(field); const targetAfter = analyzer.analyzeFormContext(target);
    if (after.isCurrent || after.context !== current.context || targetAfter.isCurrent || current.context !== 'login' && after.primaryField !== target || targetAfter.confirmField !== expected.confirmField) throw new Error('The form changed. Open SecurePass again before generating a password.');
    setFieldValue(target, result.password);
    if (visibleField(expected.confirmField)) setFieldValue(expected.confirmField, result.password);
    generate.querySelector('span').textContent = 'Generate another password';
    view.report('Password filled. Save it after the website accepts it.');
  }
  generate.addEventListener('click', () => view.run(generatePassword));
  copy.addEventListener('click', () => view.run(async () => {
    if (!field.value) throw new Error('Enter a password first.');
    await request('COPY_INLINE_PASSWORD', { value: field.value }); view.report('Password copied.');
  }));
  save.addEventListener('click', () => view.run(async () => {
    const current = analyzer.analyzeFormContext(field);
    if (current.isCurrent) throw new Error('Use the new password field to save a password change.');
    if (!field.value) throw new Error('Enter a password first.');
    await request('PROMPT_SAVE_CREDENTIAL', { entry: { site: location.origin, username: current.usernameField?.value || '', password: field.value } });
    view.report('Review the login in the SecurePass window before saving.');
  }));
  if (!context.isCurrent) view.actions.append(generate, options);
  view.actions.append(more);
  const update = () => { if (view.panel.getAttribute('aria-busy') !== 'true') copy.disabled = save.disabled = !field.value; };
  field.addEventListener('input', update); field.addEventListener('securepass-refresh-actions', update); update();
  const removal = new MutationObserver(() => {
    if (!view.panel.isConnected) { field.removeEventListener('input', update); field.removeEventListener('securepass-refresh-actions', update); removal.disconnect(); }
  }); removal.observe(shadowRoot, { childList: true });
  view.panel.append(element('p', context.isCurrent ? 'Your current password will not be replaced.' : 'Saving always asks for confirmation in SecurePass.', 'securepass-note'));
  for (const details of [options, more]) details.addEventListener('toggle', () => { if (view.panel.isConnected) positionPanel(view.panel, field); });
  positionPanel(view.panel, field);
  if (selectedTool) {
    if (selectedTool === 'generate') { generate.focus(); view.run(generatePassword); }
    else {
      more.open = true;
      if (!field.value) { more.querySelector('summary').focus(); view.report('Enter a password first.', true); }
      else { const control = selectedTool === 'copy' ? copy : save; control.focus(); control.click(); }
    }
  } else (context.isCurrent ? more.querySelector('summary') : generate).focus();
}
export function attachButton(field) {
  for (const [input, entry] of tracked) if (!input.isConnected) { entry.destroy(); tracked.delete(input); }
  if (tracked.has(field)) return;
  const button = element('button', null, 'securepass-floating sp-light'); button.type = 'button'; button.append(icon('key', 16));
  const label = () => analyzer.analyzeFormContext(field).context === 'login' ? 'Choose a saved login in SecurePass' : 'Open SecurePass password tools';
  button.setAttribute('aria-label', label()); button.setAttribute('aria-haspopup', 'dialog'); button.setAttribute('aria-expanded', 'false');
  shadowRoot.append(button); resolveThemeClass().then(theme => { button.classList.remove('sp-light', 'sp-dark'); button.classList.add(theme); }).catch(() => {});
  const entry = { button, close: null, target: null };
  const reposition = () => { positionFloating(button, field); if (!entry.target) button.setAttribute('aria-label', label()); };
  const observer = new ResizeObserver(reposition); observer.observe(field);
  window.addEventListener('scroll', reposition, true); window.addEventListener('resize', reposition);
  entry.destroy = () => { if (entry.target) releaseTarget(entry.target); entry.close?.(); button.remove(); observer.disconnect(); window.removeEventListener('scroll', reposition, true); window.removeEventListener('resize', reposition); };
  tracked.set(field, entry); reposition();
  button.addEventListener('click', () => {
    const context = analyzer.analyzeFormContext(field);
    if (context.context === 'login') { beginFill(field); return; }
    if (entry.close) { entry.close(true); return; }
    openTools(field);
  });
}
