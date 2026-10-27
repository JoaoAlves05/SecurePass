let active = null;
export function cancelOperation() {
  if (!active) return;
  const pending = active; active = null;
  pending.dialog.querySelectorAll('input').forEach(input => { input.value = ''; });
  document.getElementById('operationSummary').replaceChildren();
  document.getElementById('operationFields').replaceChildren();
  pending.dialog.close(); pending.resolve(null);
}
export function requestOperation({ title, description, fields = [], details = [], changes = [], layout, notice, confirmLabel = 'Continue', busyLabel = 'Working…', failureMessage, danger = false, submit }) {
  if (active) return Promise.reject(new Error('Finish or cancel the current operation first.'));
  const dialog = document.getElementById('operationDialog');
  dialog.classList.toggle('checkpoint-operation', layout === 'checkpoint');
  dialog.classList.toggle('recovery-operation', ['checkpoint', 'recovery'].includes(layout));
  const form = dialog.querySelector('form'); const body = document.getElementById('operationFields');
  document.getElementById('operationTitle').textContent = title;
  document.getElementById('operationDescription').textContent = description;
  const summary = document.getElementById('operationSummary'); summary.replaceChildren(); summary.hidden = !details.length;
  for (const detail of details) {
    const row = document.createElement('div'); const label = document.createElement('dt'); const value = document.createElement('dd');
    row.classList.toggle('operation-removal', Boolean(detail.danger));
    label.textContent = detail.label; value.textContent = detail.value; row.append(label, value); summary.append(row);
  }
  document.getElementById('operationNotice').hidden = !notice;
  document.getElementById('operationNoticeTitle').textContent = notice?.title || '';
  document.getElementById('operationNoticeText').textContent = notice?.text || '';
  const error = document.getElementById('operationError'); error.textContent = ''; error.hidden = true;
  body.replaceChildren();
  if (changes.length) {
    const list = document.createElement('ul'); list.className = 'checkpoint-review-changes'; list.setAttribute('aria-label', 'Checkpoint differences');
    for (const change of changes) {
      const item = document.createElement('li'); const title = document.createElement('strong'); const text = document.createElement('span');
      title.textContent = change.title; text.textContent = change.text; item.append(title, text); list.append(item);
    }
    body.append(list);
  }
  const passwords = [];
  for (const field of fields) {
    const group = document.createElement('div'); group.className = 'operation-field';
    const label = document.createElement('label'); label.textContent = field.label;
    const input = document.createElement(field.options ? 'select' : 'input'); input.name = field.name;
    input.id = `operation-${field.name}`; label.htmlFor = input.id;
    if (field.options) for (const item of field.options) {
      const option = document.createElement('option'); option.value = item.value; option.textContent = item.label; input.append(option);
    } else {
      input.type = field.type || 'text'; input.autocomplete = field.type === 'password' ? 'off' : 'off'; input.maxLength = field.maxLength || 1024;
    }
    input.required = field.required !== false; if (field.minLength) input.minLength = field.minLength;
    if (field.value !== undefined) input.value = field.value;
    const control = document.createElement('div'); control.className = 'operation-control'; control.append(input);
    group.append(label, control); body.append(group);
    if (field.type === 'password') {
      control.classList.add('operation-password');
      const reveal = document.createElement('button'); reveal.type = 'button'; reveal.className = 'password-reveal'; reveal.textContent = 'Show';
      reveal.setAttribute('aria-label', `Show ${field.label.toLowerCase()}`); reveal.setAttribute('aria-controls', input.id); reveal.setAttribute('aria-pressed', 'false');
      const conceal = () => { input.value = ''; input.type = 'password'; reveal.textContent = 'Show'; reveal.setAttribute('aria-label', `Show ${field.label.toLowerCase()}`); reveal.setAttribute('aria-pressed', 'false'); };
      passwords.push(conceal);
      reveal.addEventListener('click', () => {
        const show = input.type === 'password'; input.type = show ? 'text' : 'password'; reveal.textContent = show ? 'Hide' : 'Show';
        reveal.setAttribute('aria-label', `${show ? 'Hide' : 'Show'} ${field.label.toLowerCase()}`); reveal.setAttribute('aria-pressed', String(show));
      });
      control.append(reveal);
    }
    if (field.hint) {
      const hint = document.createElement('p'); hint.id = `${input.id}-hint`; hint.className = 'operation-hint'; hint.textContent = field.hint;
      input.setAttribute('aria-describedby', hint.id); group.append(hint);
    }
  }
  const confirm = document.getElementById('operationConfirm'); confirm.textContent = confirmLabel; confirm.classList.toggle('destructive', danger); confirm.disabled = false;
  const cancel = document.getElementById('operationCancel'); cancel.disabled = false;
  return new Promise(resolve => {
    active = { dialog, resolve };
    cancel.onclick = cancelOperation;
    dialog.oncancel = event => { event.preventDefault(); if (!confirm.disabled) cancelOperation(); };
    form.onsubmit = async event => {
      event.preventDefault(); if (confirm.disabled || !form.reportValidity()) return;
      const pending = active; const values = Object.fromEntries(new FormData(form));
      const controls = [...body.querySelectorAll('input, select, button')]; controls.forEach(control => { control.disabled = true; });
      confirm.disabled = true; confirm.textContent = busyLabel; cancel.disabled = true; dialog.setAttribute('aria-busy', 'true');
      error.hidden = true;
      try {
        const result = submit ? await submit(values) : values;
        if (active !== pending) return;
        active = null; dialog.close(); body.replaceChildren(); summary.replaceChildren(); resolve(result);
      } catch (failure) {
        if (active !== pending) return;
        if (pending.locked) { active = null; dialog.close(); resolve(null); return; }
        const generic = !failure.message || ['Operation failed.', 'The operation failed for an operation-specific reason'].includes(failure.message);
        error.textContent = generic && failureMessage ? failureMessage : failure.message || 'Could not complete this operation. Please try again.';
        error.hidden = false; error.focus(); error.scrollIntoView({ block: 'nearest' });
      } finally {
        passwords.forEach(conceal => conceal());
        controls.forEach(control => { control.disabled = false; });
        if (!active || active === pending) {
          confirm.disabled = false; confirm.textContent = confirmLabel; cancel.disabled = false; dialog.removeAttribute('aria-busy');
        }
      }
    };
    dialog.showModal();
    (body.querySelector('input, select') || cancel).focus();
  });
}
document.addEventListener('vault-ui-locked', () => {
  // A background commit may deliberately lock on completion. Do not report that as rollback.
  if (active && !document.getElementById('operationConfirm').disabled) cancelOperation();
  else if (active) {
    active.locked = true;
    active.dialog.querySelectorAll('input').forEach(input => { input.value = ''; });
    document.getElementById('operationSummary').replaceChildren();
    document.getElementById('operationFields').replaceChildren();
  }
});
window.addEventListener('pagehide', cancelOperation);
