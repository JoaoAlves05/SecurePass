# Verified administrative delivery

Implemented 2026-11-09 over the existing authorization signatures and protected
key envelopes. Production sending remains behind the unchanged independent-review
gate. The integration uses the real Drive transport with injected test policy and
an emulated provider in the recorded tests; Google-authenticated acceptance is open.

`administrationProtocol.js` produces canonical, bounded (4 MiB) packets containing
signed authorization ancestry and the master-protected administrative envelope.
It reconstructs known fields in one order and rejects duplicate/unknown JSON,
wrong identities, untrusted roots, incompatible contexts and forged chains.
A packet's self-declared head is not an independent freshness checkpoint: root-only
verification returns freshness unproven. Caller-supplied checkpoints remain binding.

Public verification checks the authority and encrypted-envelope context. It does
not authenticate the encrypted private key's contents or grant administrative
powers. `unlockAdministrationPublication` additionally requires the master
password, authenticated decryption and a private/public key-pair proof matching
the verified state. It returns a nonextractable internal key; no message route
returns that key. Envelope corruption fails without granting authority.

The Drive transport gives administrative files the explicit `authorization`
namespace. Content files retain their existing namespace/metadata compatibility.
Content history/review skips known administrative files, while unknown formats
remain subject to the existing validation path. Metadata never establishes trust.
Every matching copy is downloaded and compared byte-for-byte; a conflicting copy
blocks acknowledgement. A final complete inventory confirms a newly created file.

`administrationDeliveryStore.js` prepares the earliest unpublished signed intent.
Its immutable trusted chain prefix and per-operation protected envelope reproduce
the same canonical bytes after restart. No new ECDSA signature is made on retry.
Account/vault/generation, attempt and unknown outcome are persisted before I/O.
Each transaction rechecks binding, the exact pending operation, ancestry and key
envelope. Verified digest/file IDs are required for acknowledgment. Upload sessions
reuse the existing bounded, host-restricted resumable transport and are never
exposed in status. Pending operations are limited to 32; total retained operation
history is bounded by the 256-state chain and 4-MiB administrative store budget.

`administrationRuntime.js` reuses durable backoff/retry-limit policy. `driveRuntime`
delivers administrative work before content. If queued content belongs to an older
authorization, it reports rebase required and retains the original signed branch;
it does not blindly re-sign it or delete it.

Self-revocation disables content writing while retaining permission to deliver
its already-authorized administrative intent. A separate administrative transport
flag distinguishes this from explicit disable/disconnect/local restore, which
stop both. Status reports both flags and redacted pending errors/attempts/outcomes.
A paused owner cannot start a late account-verification GET when a cached-token
request completes: the transport's live guard is passed through token acquisition
and the account reader, in addition to checks before/after actual requests.

Generation changes never silently transfer work. An explicit
`retryAdministrativeDelivery` requires current master proof, the reviewed head,
trusted ancestry and an enabled current binding. It may resume the exact intent
for the same account/vault under its new generation; moving it to another account
is rejected. A published operation cannot be retried as new work.

Evidence: six administrative protocol/delivery regressions and one owner-pause
Google regression, plus the earlier eight administrative regressions. Chromium
covers an accepted upload with a lost reply, page reload, exact reuse without a
second upload, authority ordering and self-revocation delivery while content stays
suspended. The provider is emulated; actual cryptography, IndexedDB and transport
code run in Chromium. Public onboarding, incoming administrative discovery,
rotation/recovery, cross-authority/epoch rebase, retention, migration and external
review remain further work. [Checklist](IMPLEMENTATION_CHECKLIST.md),
[validation](VALIDATION.md), [administrative service](DEVICE_ADMINISTRATION.md).
