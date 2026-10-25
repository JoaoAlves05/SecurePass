let active = null;
export function cancelOperation() {
  if (!active) return;
  const pending = active; active = null;
  pending.dialog.querySelectorAll('input').forEach(input => { input.value = ''; });
  pending.dialog.close(); pending.resolve(null);
}
export function requestOperation({ title, description, fields = [], confirmLabel = 'Continue', danger = false, submit }) {
  if (active) return Promise.reject(new Error('Finish or cancel the current operation first.'));
  const dialog = document.getElementById('operationDialog');
  const form = dialog.querySelector('form'); const body = document.getElementById('operationFields');
  document.getElementById('operationTitle').textContent = title;
  document.getElementById('operationDescription').textContent = description;
  const error = document.getElementById('operationError'); error.textContent = ''; error.hidden = true;
  body.replaceChildren();
  for (const field of fields) {
    const label = document.createElement('label'); label.className = 'operation-field'; label.textContent = field.label;
    const input = document.createElement(field.options ? 'select' : 'input'); input.name = field.name;
    if (field.options) for (const item of field.options) {
      const option = document.createElement('option'); option.value = item.value; option.textContent = item.label; input.append(option);
    } else {
      input.type = field.type || 'text'; input.autocomplete = field.type === 'password' ? 'off' : 'off'; input.maxLength = field.maxLength || 1024;
    }
    input.required = field.required !== false; if (field.minLength) input.minLength = field.minLength;
    if (field.value !== undefined) input.value = field.value;
    label.append(input); body.append(label);
    if (field.type === 'password') {
      const reveal = document.createElement('button'); reveal.type = 'button'; reveal.className = 'password-reveal'; reveal.textContent = 'Show password';
      reveal.addEventListener('click', () => { input.type = input.type === 'password' ? 'text' : 'password'; reveal.textContent = input.type === 'password' ? 'Show password' : 'Hide password'; });
      label.append(reveal);
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
      confirm.disabled = true; cancel.disabled = true; dialog.setAttribute('aria-busy', 'true');
      try {
        const result = submit ? await submit(values) : values;
        if (active !== pending) return;
        active = null; dialog.close(); resolve(result);
      } catch (failure) {
        if (active !== pending) return;
        error.textContent = failure.message; error.hidden = false; error.focus();
      } finally {
        for (const field of fields.filter(field => field.type === 'password')) form.elements.namedItem(field.name).value = '';
        confirm.disabled = false; cancel.disabled = false; dialog.removeAttribute('aria-busy');
      }
    };
    dialog.showModal();
    (body.querySelector('input, select') || cancel).focus();
  });
}
document.addEventListener('vault-ui-locked', () => {
  // A background commit may deliberately lock on completion. Do not report that as rollback.
  if (active && !document.getElementById('operationConfirm').disabled) cancelOperation();
  else active?.dialog.querySelectorAll('input').forEach(input => { input.value = ''; });
});
window.addEventListener('pagehide', cancelOperation);
