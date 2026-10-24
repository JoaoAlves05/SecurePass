import { base64ToBuffer, bufferToBase64 } from '../encoding.js';
import { PRF_LABEL, fromBase64url } from './webauthn.js';

const request = async (type, payload = {}) => {
  const response = await chrome.runtime.sendMessage({ type, ...payload });
  if (!response?.ok) throw new Error(response?.error || 'Authentication failed.');
  return response;
};
function serialize(assertion) {
  return { credentialId: bufferToBase64(assertion.rawId), clientDataJSON: bufferToBase64(assertion.response.clientDataJSON), authenticatorData: bufferToBase64(assertion.response.authenticatorData), signature: bufferToBase64(assertion.response.signature) };
}
async function assert(session, signal) {
  const credential = await navigator.credentials.get({ signal, publicKey: {
    challenge: fromBase64url(session.challenge), rpId: session.rpId, timeout: 60000,
    allowCredentials: [{ type: 'public-key', id: base64ToBuffer(session.credentialId) }], userVerification: 'required',
    extensions: { prf: { eval: { first: new TextEncoder().encode(PRF_LABEL) } } }
  } });
  const first = credential.getClientExtensionResults()?.prf?.results?.first;
  return { assertion: serialize(credential), prfOutput: first ? bufferToBase64(first) : null };
}
export async function enrollBiometric(passphrase, signal) {
  let session = await request('BIOMETRIC_REGISTER_START', { passphrase });
  try {
    const credential = await navigator.credentials.create({ signal, publicKey: {
      challenge: fromBase64url(session.challenge), rp: { id: session.rpId, name: 'SecurePass' },
      user: { id: crypto.getRandomValues(new Uint8Array(32)), name: 'SecurePass vault', displayName: 'SecurePass vault' },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
      authenticatorSelection: { userVerification: 'required', residentKey: 'preferred' }, timeout: 60000, attestation: 'none', extensions: { prf: {} }
    } });
    const key = credential.response.getPublicKey();
    if (!key) throw new Error('Authenticator public key unavailable.');
    session = await request('BIOMETRIC_REGISTER_PREPARE', { sessionId: session.sessionId, credentialId: bufferToBase64(credential.rawId), publicKey: bufferToBase64(key), algorithm: credential.response.getPublicKeyAlgorithm(), clientDataJSON: bufferToBase64(credential.response.clientDataJSON) });
    return await request('BIOMETRIC_REGISTER_COMPLETE', { sessionId: session.sessionId, ...await assert(session, signal) });
  } finally { await request('BIOMETRIC_CANCELLED', { sessionId: session.sessionId }).catch(() => {}); }
}
export async function authenticateBiometric(signal) {
  const session = await request('BIOMETRIC_AUTH_START');
  try { return await request('BIOMETRIC_AUTH_COMPLETE', { sessionId: session.sessionId, ...await assert(session, signal) }); }
  finally { await request('BIOMETRIC_CANCELLED', { sessionId: session.sessionId }).catch(() => {}); }
}
