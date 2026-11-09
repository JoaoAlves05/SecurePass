# Protocol-v2 local transactions

Implemented 2026-11-09 for an explicitly created vault-v3. The normal local
creation default remains v2. No public route migrates or enrolls a vault simply
by loading these modules. [Issue](issues/PROTOCOL_V2_TRANSACTIONS.md).

## Durable authority and original signed content

`administration.js` dispatches v3 work to `administration2.js`. Bootstrap proves
the master independently of the live content session, creates distinct protected
admin/writer keys, verifies graph-v2 and signs the original v3 record. Unsigned
parent IDs are refused: bootstrap cannot manufacture historical signatures.
Known authority cannot be silently repinned. Legacy Chrome Sync must be paused.

The shared transaction compares the complete original v3 record, registry,
writer/account binding and current session deadline/generation. It commits the
authority, protected keys, exact signed intent, original signed packet and any
enabled content outbox atomically. The format-2 transaction requires an opaque
verified live state; writer membership comes from that state, not array order.
Aborts and lock leave all parts unchanged. Stable operation IDs replay the exact
signed operation after reload.

`signedHistoryModel.js`/`signedHistoryStore.js` retain original signed packets
independently of the outbox. Capacity is 128 packets and 64 MiB aggregate, with
16 MiB per packet. Duplicate or substituted revision IDs fail; exhaustion refuses
the whole transaction without deleting branches. This is preservation with a
hard limit, not implemented retention/GC. Stored packet metadata is bookkeeping,
never proof: each selected body must pass graph/signature/digest validation.

## Mutation and administrative boundaries

Ordinary enabled v3 mutations load exact authenticated parents from the retained
cache, create digest-bound protocol-v2 signatures and commit ciphertext,
checkpoints, original signed history and outbox together. Queue acknowledgement
does not remove historical packets. Missing/damaged parent bodies fail before
commit. A v2 body cannot substitute for a v3/v2 signed parent.

Enrollment/revocation authenticate the current signed content, anchor that exact
payload in the administrative successor, and, when the local writer remains
authorized, create a new same-content direct descendant under the new authority.
Both authority and descendant commit together; the session advances to it.
Historical anchors can prove the old local snapshot during later master-powered
administration after self-revocation. They do not restore writer permission.
Self-revocation preserves the local record, original signed history and every
old queued operation, removes the local writer and suspends content publication
while leaving administrative delivery enabled. Pending old-authority operations
still require explicit rebase; they are not discarded or silently delivered.

Paused administration retains its signatures without queuing network work.
Unsigned local mutations while paused still require explicit reconciliation
before synchronization; these helpers do not invent ancestry for them.

## Integration boundaries

`loadAuthorization` and content signature preparation support the verified
v2 graph. This local-transaction increment did not accept v2 transport; the
following [administrative-v2 delivery increment](ADMINISTRATIVE_V2_DELIVERY.md)
adds that wire/runtime with emulated-provider evidence. Production remains
blocked by the source review gate. Public
onboarding, discovery of received administration, kit activation, global
rotation/recovery, rebase, retention, migration and external acceptance remain.

## Evidence

Twelve Node regressions cover master proof, bootstrap/replay, normal signing
after a modeled queue acknowledgement, cross-authority anchored ancestry,
self-revocation, simultaneous reviewed heads, cache capacity/substitution,
damaged parents and atomic rollback of administrative and normal mutations.
Chromium uses real WebCrypto and IndexedDB for abort/retry, original cache,
normal mutations, cross-authority ancestry, page reload/exact replay and
self-revocation. Its acknowledgement is a local modeled store event, not a
provider upload/read-back or real Google delivery. Prior v1 administration,
emulated delivery and cryptographic protocol-v2 browser suites also passed.
