# Administrative protocol-v2 delivery

Implemented 2026-11-09 on top of local v2 transactions. The source production
review gate remains false. [Issue](issues/ADMINISTRATIVE_V2_DELIVERY.md).

## Canonical wire and independent trust

`administrationProtocol2.js` verifies bounded graph-v2 packets with explicit
version 2, vault/head, complete administrative ancestors, protected admin key
and encrypted epoch material. The wire sorts states by revision identity; parent
hashes and both proofs of a joint resolution remain intact. Serialization is
canonical, unknown/duplicate fields fail, and the entire packet is limited to
4 MiB. Content ciphertext travels separately in the revision namespace.

The caller supplies the trusted root fingerprint and optional known checkpoint.
The packet's head never becomes that independent checkpoint. A root-only view
remains freshness-unproven. Verified current authority binds the exact master-
protection digest, optional historical-root envelope and separate recovery
envelopes/public keys. `vaultProtection.js` carries just the bounded PBKDF2/root
wrapper context; its digest is byte-for-byte compatible with the original v2
contract. It cannot substitute an unsigned wrapper for administrative authority.

Public verification proves signatures/context, not private-key possession.
Explicit master opening decrypts the root and proves the admin key pair; if the
second proof fails, the opened root is cleared. The caller must clear successfully
returned root bytes and still validate any selected content before adoption.
No master opening here activates a session, replaces a cofre or enrolls a device.

## Immutable delivery and restart

New v2 journal operations snapshot their protected epoch material. Historical
intents retain their own admin envelope/material rather than using whatever
keys are current when a retry happens. The delivery store verifies the complete
current graph and walks parent hashes to construct the exact ancestor subset of
the selected operation. It never takes an array prefix or includes later states
merely because they occur earlier in storage order.

Before network work/acknowledgement, the IndexedDB guard compares binding,
operation ID/head/signed state, material/envelope and the entire authority snapshot.
A concurrent authority change suspends acknowledgement and preserves uncertainty.
A new run verifies the new graph and resumes the exact old intent; accepted
remote bytes are discovered/read back rather than posted again. All existing
resumable-session, namespace, complete-copy read-back and final-inventory rules
remain applicable. The runtime delivers pending authority before content and
verifies protocol-v2 content packets when allowed by the test-only review hook.
Old-authority content remains queued for explicit authenticated rebase.

Earlier unreleased v2 prototype journal rows without protected material are
refused before I/O and preserved for explicit migration. They are not silently
filled from current keys or discarded. This is a documented compatibility gap,
not completed migration. Received administration is verified by this API but no
discovery/adoption controller persists it yet.

## Evidence and remaining work

Eleven Node regressions cover root/checkpoint rejection, canonical/schema and
master-wrapper substitution, clearing the opened root on admin-proof failure,
input snapshots, accepted-upload/lost-reply reuse, authority races, exact DAG
ancestry despite reversed storage, joint two-parent resolution, authenticated
kit/history serialization, missing prototype material and authority-before-content
delivery. The protection digest also matches an independent Node SHA-256 tuple.

The v2 Chromium scenario uses real WebCrypto/IndexedDB and an emulated provider:
accepted upload/lost reply, reload/reuse, three ordered administrative deliveries,
self-revocation with retained content and actual master/root/private-key opening
from the received packet. No real Google authentication/transport, public
onboarding, incoming-administration controller, kit activation, global rotation/
recovery, rebase, retention/migration or independent protocol review is accepted
by these tests. Those remain release work.
