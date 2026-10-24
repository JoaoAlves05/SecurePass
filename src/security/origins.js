export function normalizeSite(value) {
  if (typeof value !== 'string' || !value.trim() || value.length > 255) {
    throw new Error('Enter a valid website.');
  }
  const text = value.trim();
  const url = new URL(text.includes('://') ? text : `https://${text}`);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password ||
      !url.hostname || /\s/.test(text)) throw new Error('Only HTTP and HTTPS websites are supported.');
  return url.origin;
}

export function senderOrigin(sender) {
  if (sender.id !== chrome.runtime.id || !sender.tab || !sender.documentId || sender.frameId !== 0) {
    throw new Error('This request requires an active top-level web document.');
  }
  const origin = normalizeSite(sender.url);
  if (sender.origin && sender.origin !== origin) throw new Error('Opaque or mismatched document origin.');
  return origin;
}

export function matchesOrigin(site, origin) {
  try { return normalizeSite(site) === origin; } catch { return false; }
}

export function extensionPage(sender, paths) {
  if (sender?.id !== chrome.runtime.id || typeof sender.url !== 'string') return false;
  try {
    const url = new URL(sender.url);
    return url.protocol === 'chrome-extension:' && url.hostname === chrome.runtime.id && paths.includes(url.pathname);
  } catch { return false; }
}
