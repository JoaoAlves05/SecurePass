export async function request(type, payload = {}) {
  const result = await chrome.runtime.sendMessage({ type, ...payload });
  if (!result?.ok) throw new Error(result?.error || 'SecurePass is unavailable. Reload the page.');
  return result;
}
