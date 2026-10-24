import { decodeBytes } from '../vault/crypto.js';
import { base64ToBuffer, bufferToBase64 } from '../encoding.js';

export const PRF_LABEL = 'securepass-master-key-v1';
export const base64url = bytes => bufferToBase64(bytes.buffer || bytes).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
export const challenge = () => base64url(crypto.getRandomValues(new Uint8Array(32)));
export function fromBase64url(text) {
  return new Uint8Array(base64ToBuffer(text.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - text.length % 4) % 4)));
}

export function verifyClientData(encoded, expectedChallenge, type, origin) {
  const bytes = decodeBytes(encoded, 1, 4096);
  const data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  if (data.type !== type || data.challenge !== expectedChallenge || data.origin !== origin || data.crossOrigin === true || data.topOrigin) throw new Error('WebAuthn challenge or origin mismatch.');
  return bytes;
}

function ecdsaSignature(bytes) {
  // WebAuthn ECDSA is ASN.1 DER; Web Crypto expects IEEE P1363 r || s.
  if (bytes[0] !== 0x30 || bytes[1] !== bytes.length - 2) throw new Error('Invalid ECDSA signature.');
  let offset = 2;
  const out = new Uint8Array(64);
  for (let part = 0; part < 2; part++) {
    if (bytes[offset++] !== 2) throw new Error('Invalid signature integer.');
    const length = bytes[offset++];
    let integer = bytes.slice(offset, offset + length);
    offset += length;
    if (integer.length === 33 && integer[0] === 0) integer = integer.slice(1);
    if (!integer.length || integer.length > 32) throw new Error('Invalid signature size.');
    out.set(integer, (part + 1) * 32 - integer.length);
  }
  if (offset !== bytes.length) throw new Error('Invalid signature trailing data.');
  return out;
}

export async function verifyAssertion(assertion, registration, expectedChallenge, origin, rpId) {
  if (assertion.credentialId !== registration.credentialId) throw new Error('Unexpected authenticator.');
  const client = verifyClientData(assertion.clientDataJSON, expectedChallenge, 'webauthn.get', origin);
  const auth = decodeBytes(assertion.authenticatorData, 37, 4096);
  // Chromium namespaces an extension's own RP ID as its full serialized origin.
  // See ChromeWebAuthenticationDelegate::MaybeGetRelyingPartyIdOverride.
  const effectiveRpId = origin.startsWith('chrome-extension://') && new URL(origin).hostname === rpId ? origin : rpId;
  const rpHash = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(effectiveRpId)));
  if (!rpHash.every((b, i) => auth[i] === b)) throw new Error('Authenticator RP ID hash mismatch.');
  if ((auth[32] & 5) !== 5) throw new Error('Authenticator did not verify user presence and identity.');
  const counter = new DataView(auth.buffer, auth.byteOffset).getUint32(33);
  if (counter && registration.counter && counter <= registration.counter) throw new Error('Authenticator counter replay detected.');
  const alg = registration.algorithm;
  if (![-7, -257].includes(alg)) throw new Error('Unsupported authenticator algorithm.');
  const key = await crypto.subtle.importKey('spki', decodeBytes(registration.publicKey, 32, 2048), alg === -7 ? { name: 'ECDSA', namedCurve: 'P-256' } : { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const hashedClient = new Uint8Array(await crypto.subtle.digest('SHA-256', client));
  const signed = new Uint8Array(auth.length + hashedClient.length);
  signed.set(auth); signed.set(hashedClient, auth.length);
  let signature = decodeBytes(assertion.signature, 8, 1024);
  if (alg === -7) signature = ecdsaSignature(signature);
  if (!await crypto.subtle.verify(alg === -7 ? { name: 'ECDSA', hash: 'SHA-256' } : 'RSASSA-PKCS1-v1_5', key, signature, signed)) throw new Error('Invalid authenticator signature.');
  return counter;
}
