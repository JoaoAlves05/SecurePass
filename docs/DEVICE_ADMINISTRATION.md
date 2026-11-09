# Durable device administration

Implemented increment, 2026-11-09. Application services build on the existing
signed authorization chain and Web Crypto key protection; this increment does not
change the cipher format or enable production Drive sending.

`sync/administration.js` authenticates the current master password independently
of a live content or biometric session. Bootstrap generates a new administrative
key protected by that password and a local writer key protected by the content
key. The locally generated root is pinned together with its signed initial state.
It cannot overwrite an existing pin; adoption of a remote root still requires an
independent trust confirmation in its future onboarding caller.

Enrollment adds a sorted, unique device ID and valid P-256 public key. An existing
ID cannot silently receive another key. Revocation removes exactly the reviewed
device; removing the last authorized device fails. These operations require the
reviewed authorization head, verified full ancestry, the current administrative
private key and the current master password. Holding a content key alone does not
confer administrative signing authority.

`administrationStore.js` compares the current vault revision/epoch, complete known
authority, administrative state and binding/writer inside one IndexedDB
transaction. It commits the verified chain, encrypted key envelopes, local writer
and exact signed administrative intent together. A lock/deadline or transaction
abort prevents the entire update. Existing content outboxes are retained.
Self-revocation removes this writer and suspends publication; it does not erase
historical content or promise to revoke previously copied decryption keys.

A caller-generated stable operation ID makes retries idempotent. The same ID and
request return the prior operation; different inputs under that ID fail. Exact
signed bytes survive reload and are reused, rather than generating another
randomized ECDSA signature. Concurrent administrative branches fail the expected
head comparison. Requests return the current head and their specific operation
head separately.

The journal supports at most 32 pending operations, with a 4-MiB aggregate bound
on stored authority/administration. Protocol bounds of 128 active devices and 256
authorization states also apply. Capacity failures preserve prior state; no
unpublished history is silently pruned. Administrative delivery is not simulated
by marking a local operation published. The runtime refuses to request content
publication tokens while an administrative operation remains unpublished, even
when a test explicitly enables the separate production-review predicate.

Services: `bootstrapAdministration`, `enrollDevice`, `revokeDevice` and
`administrationStatus`. They expose metadata, never raw private keys. There are
no new management routes in this increment: public onboarding, proof/confirmation
of peer identity, administrative transport, key rotation/recovery, queue rebase
and production acceptance are subsequent integration work. Status may report
opaque registry metadata while locked; mutations require an unlocked supported
vault and fresh master proof.

Evidence: eight regressions in `tests/administration.test.js`; real Chromium
WebCrypto/IndexedDB in `npm run test:administration-browser`. The browser scenario
uses an extension page as the internal service harness, not public management
message routes. It verifies atomic abort/retry, protected bootstrap/enrollment,
exact signed replay after page reload, wrong-master isolation, self-revocation
and retained content outbox. Node tests also cover concurrent heads, invalid
identities/keys, last-device protection, lock during signing and no token fetch
before administrative delivery. No real Google or hardware acceptance is claimed.

Primitive reference: [W3C Web Cryptography](https://www.w3.org/TR/webcrypto/).
It defines the used API operations; it does not certify the application protocol.
