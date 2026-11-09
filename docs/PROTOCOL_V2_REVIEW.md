# Internal technical contract: rotation and recovery foundations

Engineering design review, 2026-11-09. This closes implementation choices for the
next internal format, not independent security review or production acceptance.
The production write predicate remains false until those external gates are met.

## Required security boundaries

The v1 prototype signs a whole encrypted vault-v2 record, including its master
wrapper. Its writer role must not gain administrative power to replace that
wrapper. New authorization states bind a SHA-256 digest of canonical vault/epoch,
KDF and wrapped-root-key fields. Content verification requires the exact digest.
A change to protection therefore requires a signed administrative transition.

An ancestry reference containing only a revision ID cannot bind the old parent's
contents against an equivocal former writer. New content references include the
SHA-256 digest of the entire canonical unsigned parent payload (including its own
ancestry and authorization). Signatures are excluded from identity because their
representation can vary without changing the signed message. Old-authority
history is accepted only through references rooted in verified live content or
explicit signed administrative content anchors. Merely supplying an old valid
signature never upgrades a retired writer's new packet to accepted live content.

New authority is a bounded DAG with at most two administrative parents. Normal
transitions require the previous administrative key. Recovery transitions require
a distinct recovery signing key authorized by the parent. Joining concurrent
legitimate branches requires proof under each parent's current administrative
key. There is no largest-clock/counter winner. If a branch cannot be authenticated,
keep it unresolved and offer independent local recovery; do not invent authority.
Recovery and administrative keys never become ordinary content/session authority.

## Canonical representation and limits

Use fixed ordered UTF-8 JSON tuples with versioned domain prefixes for signatures
and digests, strict known fields and canonical base64/JSON at wire boundaries.
Bound before cryptographic processing: 256 authority states, 128 active devices,
256 content anchors, 16 MiB individual content packets, 4 MiB administration,
5,000 entries/3 MiB plaintext and existing encrypted-history metadata limits.
Limits are combined byte budgets, not promises that every maximum fits together.
Unknown versions fail closed and never trigger an implicit vault reset.

## Content encryption and nonce domains

Vault-v3 retains a random 256-bit epoch root and bounded PBKDF2-SHA256 master
protection. Each content encryption generates a fresh random 256-bit `keySalt`.
HKDF-SHA256 derives an AES-256-GCM key from the root, that salt and a versioned
vault/epoch/revision context. A fresh 96-bit GCM IV is used once for that derived
key. Retries reuse exact persisted encrypted/signed bytes. Re-encryption always
generates a fresh salt, including checkpoint reprotection under the same content
ID. This removes the need to coordinate one shared GCM nonce stream across devices;
it relies on Web Crypto's secure random generation, not an absolute collision-free
claim. Administrative, writer, recovery and content derivation domains are distinct.

## Rotation and recovery application requirements

A linked global rotation requires complete recent remote discovery, master or
recovery proof, no unresolved administrative fork and durable intent before I/O.
Prepare new root, administrative protection and a full snapshot; commit data,
authority, checkpoints, protected key history and outbox together. Changed local
or remote context invalidates preparation. Revocation of old sessions/biometrics
must be restart-safe. Failure after a remote write is uncertain delivery, never
reported as a distributed rollback or proof that the old password is still current.

The optional kit uses a generated high-entropy secret, explicit save confirmation
and a successful temporary recovery test. Its private recovery material stays
secret-encrypted; public recovery encryption permits later root rewrapping without
requiring the user to re-enter the kit during every normal rotation. Signature
and encryption roles use separate keys. Normal portable backups exclude private
device/recovery keys and the kit secret. Master loss with content access alone
permits data export/new independent vault, not implicit administrative powers.
Compromised old copies remain readable with previously stolen keys; changing a
password cannot erase external backups. Kit theft requires recovery/authority and,
where content keys may have leaked, content rotation.

## Checkpoints, capacity and compatibility

Retirement requires authenticated ancestry, exact retained heads and final complete
concurrency enumeration. Preserve unresolved/offline branches and in-flight data;
when an old base is unavailable, request explicit rebase/import instead of guessing
an empty base. Full signed snapshots/checkpoints carry enough digest references to
detect missing history. Local retention and remote deletion require separate
reviewable policies and resumable exact-ID plans; lack of capacity preserves the
last valid local state. Existing 256-MiB legacy reader and bounded individual-file
exports remain the migration escape path.

The new format is initially opt-in through explicit migration. Existing local
vault-v2/legacy records remain readable and unchanged by merely loading code.
ID-only/unsigned old history is archived and imported with explicit provenance;
it is not presented as fully authenticated causal history. A downgrade refuses
unknown formats and offers compatible export/update guidance.

## Verification still required

Round-trip and negative tests cover master-wrapper substitution, signature/role
forgery, DAG forks, stale checkpoints, parent-content substitution, key-salt/AAD
changes, wrong keys, canonical bounds, lock/expiry and transaction rollback.
Disposable Chromium exercises Web Crypto and IndexedDB; emulated transport does
not establish Google OAuth/Drive delivery compatibility. Stable package identity
is configured, but real Google authorization, physical PRF/OS/site/accessibility
checks and independent protocol review remain external release requirements.

Primary references: [Web Cryptography](https://www.w3.org/TR/webcrypto/) for the
used primitive APIs; [RFC 5869](https://www.rfc-editor.org/rfc/rfc5869) for HKDF's
extract/expand construction. These references do not certify this application
protocol. Subsequent implementation and its evidence must be recorded separately.

### Concrete implementation choices

The administrative graph binds `protectionDigest`, `keyHistoryDigest`, separate
recovery public keys/envelope digests, content anchors and minimum format versions.
Content protection digests cover canonical vault/epoch/KDF/root-wrapper values.
Per-object data and device-private-key protection use distinct HKDF contexts with
fresh 256-bit salts. Recovery encryption uses RSA-OAEP-3072/SHA-256 for the 32-byte
root; recovery signing uses an independent P-256 key. Secret kit material will be
protected separately with a generated 256-bit secret and authenticated envelope.
Global rotation requires accessible data heads to be explicitly reconciled into
the supported reviewed parent set first; unresolved branches remain preserved.
[Implemented foundations](PROTOCOL_V2_FOUNDATIONS.md) distinguish these decisions
from still-pending application transactions and external security acceptance.
