# Vault-v3 and protocol-v2 foundations

Implemented 2026-11-09 following the [internal technical contract](PROTOCOL_V2_REVIEW.md).
Independent protocol review, public integration and production activation remain
open. No stored vault is migrated merely by loading these modules.

The following increment implements bounded encrypted recovery-key and historical-
root candidates, public root rewrapping and verified opening. See
[RECOVERY_KEY_MATERIAL.md](RECOVERY_KEY_MATERIAL.md). Activation and global
rotation/recovery controllers remain unintegrated.

## Encrypted records and writer keys

`vault/crypto.js` keeps vault-v2 as its default and reads legacy/v2 records with
their existing contexts. Explicit `createRecord(..., { version: 3 })` creates a
strict vault-v3 envelope. A fresh random 32-byte `keySalt` and scoped HKDF-SHA256
produce a per-object AES-256-GCM key from the 256-bit epoch root. The data AAD binds
version, vault, epoch, revision, direct parents and salt. Create/mutate/merge and
checkpoint reprotection all use fresh salts, including when retaining a historical
content ID. The default v3 ancestry is one direct parent; reviewed merges accept
two. Root/master wrapping remains separate from the derived data key.

Canonical v3 fields, fixed root-wrapper size, canonical base64, ISO timestamp,
parent uniqueness/order and known version are validated. Creation rejects missing,
empty or oversized master strings rather than coercing them; existing valid short
passwords remain supported at the cryptographic compatibility boundary. Public
new-password policy is still enforced by its application caller. Local rotation
preserves the current format rather than silently downgrading a v3 record.

`deviceKeyProtection2.js` gives new v3 writers separate per-envelope HKDF wrapping
domains and fresh 32-byte salts. The protected ECDSA private key is returned only
as nonextractable after a key-pair proof. Vault/epoch/key/public-key/salt context
is authenticated; wrong roots/roles cannot unwrap it. Existing writer-envelope-v1
keys remain readable. Administrative private keys retain their distinct master
protection and cannot be unlocked by the writer/content capability.

## Administrative graph

`authorizationGraph.js` verifies up to 256 signed states under an independently
supplied root fingerprint and optional known checkpoint. States bind a master-
protection digest, content/writer versions, optional encrypted key-history digest,
separate recovery signing/encryption public keys and digest-bound content anchors.
Limits include 128 unique active writers, two administrative parents, 256 anchors
and 4 MiB aggregate serialized authority. Duplicate/unknown fields, missing parents,
replay, invalid roles and untrusted roots fail before authority is issued.

Enrollment adds one writer; revocation removes one without replacing other keys.
Writer/kit/checkpoint changes cannot replace master or content protection. Rotation
requires a new epoch, administrator and protection; retained history/recovery roots
need new protection. Recovery requires the parent's enrolled recovery signing key
and consumes that kit authority. Concurrent branches remain separate heads and
cannot issue live-writer capabilities. Joining them requires both current admin
proofs and new protection. Root-only verification remains freshness-unproven;
self-declared packet heads are never treated as independent checkpoints.

Recovery signing uses P-256; its separate public encryption key is constrained to
RSA-OAEP-3072/SHA-256 with exponent 65537. This block verifies the role/key policy,
not an operational recovery-kit flow. Actual kit generation, secret protection,
activation test, root wrapping and administrative transaction are subsequent work.

## Content signatures and historical identity

`revisionProtocol2.js` requires opaque verified authority. The entire canonical
unsigned payload, including encrypted record, authorization and recursive parent
references, determines its SHA-256 identity; signature bytes do not. A content
writer cannot replace the master KDF/wrapper because their canonical digest must
match signed administrative policy, even if it signs the altered record itself.

Live acceptance requires the exact live authorization and an active writer.
Historical acceptance requires an opaque digest reference issued by already
verified content or a signed administrative anchor in the same trusted graph.
A valid old signature alone cannot grant a revoked writer live acceptance. Changing
the body or ancestry under an old ID fails its anchored digest. Look-alike plain
objects cannot supply graph/state/revision/reference capabilities.

Signature verification does not replace authenticated data decryption and complete
plaintext validation before application. These foundational modules do not yet
wire public onboarding, live v2 application services, migration, global rotation,
recovery UI, cross-epoch merge or retention into production.

## Evidence

Twenty-three new Node regressions cover format round trips, per-object domains,
independent Node-HKDF/GCM reference decryption, tampering/canonical bounds,
checkpoint/merge reprotection, role separation, forks/joint resolution, recovery
signer policy, master-wrapper substitution by a valid writer and digest-anchored
history after revocation. The browser harness checks native Chromium cryptography,
protected writer keys, master/parent substitution, forks/resolution, recovery role
and identical Node/Chromium unsigned-payload digest. It calls internal modules in
a disposable extension page and does not activate or migrate a real vault.
