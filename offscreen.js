// Clipboard ownership stays in this document; no password is persisted to storage.
let timer;
let serial = Promise.resolve();
let generation = 0;
let ownedValue = null;
const enqueue = task => {
  const next = serial.then(task, task);
  serial = next.catch(() => {});
  return next;
};
function legacyClipboard(command, value = '') {
  const textarea = document.createElement('textarea');
  textarea.value = command === 'copy' && !value ? ' ' : value;
  textarea.style.cssText = 'position:fixed;opacity:0;';
  document.body.append(textarea); textarea.focus(); textarea.select();
  const forceCopy = event => { event.clipboardData.setData('text/plain', value); event.preventDefault(); };
  if (command === 'copy') document.addEventListener('copy', forceCopy);
  try {
    if (!document.execCommand(command)) throw new Error('The browser could not access the clipboard.');
    return textarea.value;
  } finally { document.removeEventListener('copy', forceCopy); textarea.remove(); }
}
async function write(value) {
  try { await navigator.clipboard.writeText(value); }
  catch { legacyClipboard('copy', value); }
}
async function read() {
  try { return await navigator.clipboard.readText(); }
  catch { return legacyClipboard('paste'); }
}
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (message?.target !== 'offscreen' || sender.id !== chrome.runtime.id || sender.tab || sender.url !== chrome.runtime.getURL('background/serviceWorker.js')) return;
  enqueue(async () => {
    if (message.type === 'CLEAR_OWNED') {
      clearTimeout(timer); generation++;
      if (ownedValue !== null && await read() === ownedValue) await write('');
      ownedValue = null;
      return { ok: true };
    }
    if (message.type !== 'COPY' || typeof message.value !== 'string' || message.value.length > 1024) throw new Error('Invalid clipboard request.');
    clearTimeout(timer); generation++;
    await write(message.value); ownedValue = message.value;
    if (message.timeout > 0) {
      const expected = message.value;
      const ownGeneration = generation;
      timer = setTimeout(() => enqueue(async () => {
        if (ownGeneration !== generation) return;
        // Only clear a matching copy; never erase content subsequently copied by the user.
        try { if (await read() === expected) await write(''); }
        finally { if (ownGeneration === generation) ownedValue = null; }
      }).catch(() => {}), message.timeout * 1000);
    }
    return { ok: true };
  }).then(respond, error => respond({ ok: false, error: error.message }));
  return true;
});
