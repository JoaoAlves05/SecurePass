# Recovery and historical key material

Implemented 2026-11-09 as internal candidates under the
[protocol-v2 contract](PROTOCOL_V2_REVIEW.md). This is not a public activation,
recovery or global-rotation journey. The production gate remains closed.

## Printed code and separate key roles

`sync/recoveryKit.js` generates an independent P-256 signing pair and an
RSA-OAEP-3072/SHA-256 pair (exponent 65537). A fresh random 256-bit secret encrypts
both PKCS8 private keys using HKDF-SHA256/AES-256-GCM, with a random 32-byte salt.
The HKDF info and GCM AAD are the UTF-8 JSON tuple
`["SecurePass:recovery-private:1",vaultId,recoveryId,signingKey,encryptionKey,keySalt]`.
The secret never derives from the master password or content root.

The printable `SPREC1:vaultId:recoveryId:base64urlSecret:checksum` code is bounded,
canonical and identity-bound. Its checksum is the first 16 hex characters of
SHA-256 over the JSON tuple `["SecurePass:recovery-code:1",prefix]`; it detects
transcription errors and is not an authentication mechanism. A checksum-valid
wrong secret still fails authenticated decryption. The caller receives the code
only as an in-memory candidate; these modules perform no storage, logging,
messaging, file download or clipboard write.

The RSA public key wraps the 32-byte current content root. The OAEP label is
UTF-8 JSON `["SecurePass:recovery-root:1",vaultId,keyEpoch,recoveryId]`. The live
administrative policy binds separate digests of both canonical envelopes and
both public keys. A later rotation can encrypt a new epoch root with that public
key while preserving the printed code and encrypted private keys. This produces
a candidate policy; it does not authorize or persist the rotation.

Opening requires an opaque verified live administrative state, matching material
digests/identities and a vault-v3 record with the policy's master-protection digest.
It proves both key pairs, unwraps exactly 32 bytes and decrypts/validates that record
before returning a root and a nonextractable recovery signer. This signer only
authorizes the recovery role; it cannot substitute for an administrator. Recovery
transitions consume the kit authority. Cleared kits and unresolved forks are
rejected against the supplied current graph.

Capabilities are immutable verified views, not a freshness oracle. A controller
must compare the current durable head/session again before commit and obtain
independent freshness where required. Clearing authority cannot erase old copies
or stop someone with an old code and old material decrypting those old copies.

## Historical content roots

`sync/keyHistory.js` encrypts up to 64 unique previous epoch roots under the new
root, with a fresh salt and a separate HKDF/GCM domain:
`["SecurePass:key-history:1",vaultId,keyEpoch,keySalt]`. Both info and AAD use
the UTF-8 JSON tuple. Plaintext is a strictly ordered array of epoch/root pairs;
the active epoch is excluded. The envelope's ciphertext is bounded to 16 KiB.
Opening requires its exact digest in the opaque live authority. An old root
cannot open the new history envelope or the new record. The decrypted roots can
open retained old encrypted records; they do not independently authenticate
historical records or parent relationships. Those still require protocol-v2
digest references/signature checks.

Mutable private/root buffers are cleared on completion/failure; returned roots
belong to the caller and must be cleared. JavaScript strings and CryptoKey garbage
collection cannot provide guaranteed memory erasure. Candidate draft lifetime,
document ownership, lock cancellation, actual temporary recovery test, explicit
save acknowledgement and transactional activation remain controller work.

## Evidence and remaining integration

Thirteen Node regressions cover round trips, wrong/checksum-valid secrets,
substitution, key-pair mismatch, old-root rejection, malformed decrypted history,
fork/clear/role rejection, input snapshots and an independent Node HKDF/GCM
reference. The Chromium protocol-v2 scenario also opens a real kit, rewraps a new
root without its code, opens that root using the unchanged printed code, then
decrypts the original record through authenticated historical keys.

No Google transport, full user journey, restart-safe activation, independent
protocol review or release acceptance is established by these tests.
