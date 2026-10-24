import { extensionPage, senderOrigin } from './origins.js';

const CONTENT = new Set(['PUBLIC_SETTINGS', 'GENERATE_PASSWORD', 'HIBP_CHECK', 'LIST_SITE_CREDENTIALS', 'REQUEST_AUTOFILL', 'PROMPT_SAVE_CREDENTIAL', 'COPY_INLINE_PASSWORD', 'PROPOSE_CREDENTIAL']);
const AUTH = new Set(['VAULT_STATUS', 'INITIALIZE_VAULT', 'UNLOCK_VAULT', 'LOCK_VAULT', 'BIOMETRIC_STATUS', 'BIOMETRIC_AUTH_START', 'BIOMETRIC_AUTH_COMPLETE', 'BIOMETRIC_CANCELLED', 'AUTH_REQUEST_DETAILS', 'AUTH_REQUEST_COMPLETE', 'AUTH_REQUEST_CANCEL']);

export function authorizeMessage(message, sender) {
  if (!message || typeof message !== 'object' || Array.isArray(message) || typeof message.type !== 'string') throw new Error('Invalid message envelope.');
  if (sender?.id !== chrome.runtime.id) throw new Error('Forbidden');
  if (extensionPage(sender, ['/popup/popup.html'])) return 'management';
  if (extensionPage(sender, ['/auth/auth.html'])) {
    if (!AUTH.has(message.type)) throw new Error('Forbidden');
    return 'authentication';
  }
  if (!CONTENT.has(message.type)) throw new Error('Forbidden');
  senderOrigin(sender);
  return 'content';
}
