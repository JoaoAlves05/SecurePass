import { loadSettings } from '../settings.js';
let creating;
export async function ensureOffscreen() {
  const url = chrome.runtime.getURL('offscreen.html');
  const existing = await chrome.runtime.getContexts({ contextTypes: ['OFFSCREEN_DOCUMENT'], documentUrls: [url] });
  if (existing.length) return;
  if (!creating) creating = chrome.offscreen.createDocument({ url: 'offscreen.html', reasons: ['CLIPBOARD'], justification: 'Copy passwords and clear extension-owned clipboard contents after timeout.' }).finally(() => { creating = null; });
  await creating;
}
export async function copyInBackground(value) {
  const timeout = (await loadSettings()).clipboardTimeout;
  await ensureOffscreen();
  const reply = await chrome.runtime.sendMessage({ target: 'offscreen', type: 'COPY', value, timeout });
  if (!reply?.ok) throw new Error(reply?.error || 'Clipboard copy failed.');
}
