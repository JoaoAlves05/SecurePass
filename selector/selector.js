const requestId = new URLSearchParams(location.search).get('requestId');
const $ = id => document.getElementById(id);
let details; let layoutRevision = 0;
let busy = false; let finished = false; let expiry; let focusAfterTask;
async function send(type, data = {}) {
  const response = await chrome.runtime.sendMessage({ type, requestId, ...data });
  if (!response?.ok) throw new Error(response?.error || 'Open SecurePass again.');
  return response;
}
function clear(message) { $('accounts').replaceChildren(); $('status').textContent = message; }
function finish(message) { finished = true; details = null; $('refresh').hidden = true; clear(message); }
async function run(task) {
  if (busy || finished) return; busy = true; document.body.setAttribute('aria-busy', 'true');
  const controls = [...document.querySelectorAll('button, input')]; controls.forEach(control => { control.disabled = true; });
  try { await task(); } catch (error) { clear(error.message); $('refresh').hidden = false; }
  finally { busy = false; document.body.removeAttribute('aria-busy'); document.querySelectorAll('button, input').forEach(control => { control.disabled = finished; }); if (!finished) focusAfterTask?.focus(); focusAfterTask = null; }
}
async function refresh() {
  $('refresh').hidden = true;
  details = await send('SELECTOR_DETAILS');
  $('origin').textContent = details.origin;
  clearTimeout(expiry); expiry = setTimeout(() => { finish('Selection expired. Open SecurePass again.'); }, Math.max(0, details.expires - Date.now()));
  clear('');
  if (!details.revision) { clear('Vault locked. Open SecurePass again to unlock.'); return; }
  if (!details.entries.length) { clear('No saved logins. Use the SecurePass window below to add one.'); return; }
  render();
  await settleLayout();
  focusAfterTask = $('accounts').querySelector('button');
}
async function settleLayout() {
  const revision = ++layoutRevision;
  document.querySelectorAll('#accounts button').forEach(button => { button.disabled = true; });
  const height = Math.max(80, Math.min(240, Math.ceil(document.body.getBoundingClientRect().height) + 2));
  reportedHeight = height;
  await send('SELECTOR_LAYOUT', { height }).catch(() => {});
  await new Promise(resolve => requestAnimationFrame(resolve));
  if (revision === layoutRevision && !busy && !finished) document.querySelectorAll('#accounts button').forEach(button => { button.disabled = false; });
}
function render() {
  if (!details?.revision || finished) return;
  clear('');
  const counts = new Map(); for (const entry of details.entries) counts.set(entry.username, (counts.get(entry.username) || 0) + 1);
  if (details.entries.length > 2) $('status').textContent = 'Open the SecurePass window below to choose from all saved logins.';
  for (const entry of details.entries.slice(0, 2)) {
    const button = document.createElement('button'); button.type = 'button';
    const label = (entry.username || 'No username') + (counts.get(entry.username) > 1 ? ` · ${entry.id.slice(0, 8)}` : '');
    button.textContent = label; button.title = label; button.setAttribute('aria-label', `Fill login for ${label}`);
    button.addEventListener('click', event => {
      if (!event.isTrusted) return;
      const rect = button.getBoundingClientRect();
      const interaction = event.detail ? { mode: 'pointer', x: event.clientX, y: event.clientY } : { mode: 'keyboard', x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      run(async () => {
        await send('SELECTOR_COMPLETE', { credentialId: entry.id, expectedRevision: details.revision, interaction });
        finish('Login filled.');
      });
    });
    $('accounts').append(button);
  }
}
$('refresh').addEventListener('click', () => run(refresh));
$('cancel').addEventListener('click', () => run(async () => { await send('SELECTOR_CANCEL'); finish('Selection closed.'); }));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') { event.preventDefault(); $('cancel').click(); }
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    const buttons = [...$('accounts').querySelectorAll('button')]; if (!buttons.length) return;
    event.preventDefault(); const found = buttons.indexOf(document.activeElement); const index = found < 0 ? event.key === 'ArrowDown' ? -1 : 0 : found; buttons[(index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length].focus();
  }
});
window.addEventListener('pagehide', () => { clearTimeout(expiry); if (!finished) chrome.runtime.sendMessage({ type: 'SELECTOR_CANCEL', requestId }).catch(() => {}); });
chrome.runtime.onMessage.addListener(message => { if (message.type === 'VAULT_LOCKED') { finish('Vault locked.'); } });
chrome.runtime.sendMessage({ type: 'PUBLIC_SETTINGS' }).then(response => {
  const theme = response?.settings?.theme;
  const query = matchMedia('(prefers-color-scheme: dark)');
  const update = () => { document.body.dataset.theme = theme === 'dark' || theme === 'system' && query.matches ? 'dark' : 'light'; };
  update(); query.addEventListener('change', update);
}).catch(() => {});
run(refresh);

let reportedHeight = 0;
new ResizeObserver(() => {
  const height = Math.max(80, Math.min(240, Math.ceil(document.body.getBoundingClientRect().height) + 2));
  if (height !== reportedHeight && !finished) { reportedHeight = height; send('SELECTOR_LAYOUT', { height }).catch(() => {}); }
}).observe(document.body);
