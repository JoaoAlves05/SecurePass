export async function copyToClipboard(value) {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'COPY_PASSWORD', value });
    return Boolean(response?.ok);
  } catch { return false; }
}
