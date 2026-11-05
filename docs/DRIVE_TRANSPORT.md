# Drive transport implementation status — 2026-11-05

`src/sync/driveTransport.js` implements bounded listing/download and an internal immutable-publication factory through an injected token provider and binding guard. It is not registered in the worker router and has no UI activation, OAuth configuration or manifest permissions. Production activation and application of remote data remain unavailable.

The reader restricts listing to appDataFolder, follows all page tokens, rejects incomplete/looping/duplicate discovery and bounds pages, file count and response bytes. Downloaded text is untrusted staging data; the caller must verify format, authorization, signatures and ciphertext before using it. A successful listing does not verify vault identity or history freshness.

The caller must provide an immutable binding identity and an `assertBinding` callback that rejects off-mode automatic work, changed accounts/vaults/generations and revoked operations. The reader checks it before token acquisition, before fetching and after reading. It never prompts for OAuth or stores tokens. Redirects and ambient cookies are disabled. Cancellation aborts fetch/body reads; response and provider error text do not become diagnostics.

Authentication, permissions, capacity, missing files and transient failures have separate error codes. No automatic retry is performed here; the durable coordinator must schedule bounded backoff and reconcile uncertain writes once publication exists. Thus this module alone does not implement Sync, revocation or account switching.

Tests: `tests/driveTransport.test.js` covers complete/incomplete pagination, changed binding, error classification, rejected IDs and declared/streamed size limits. Real Google acceptance remains pending.

API references checked on 2026-11-04: [appDataFolder](https://developers.google.com/workspace/drive/api/guides/appdata), [files.list](https://developers.google.com/workspace/drive/api/reference/rest/v3/files/list), [error handling](https://developers.google.com/workspace/drive/api/guides/handle-errors).

## Immutable publication and durable scheduling primitives

`createDriveTransport` adds publication through a mandatory `validatePublication` protocol callback and `assertWritable` policy guard. It serializes concurrent publications per client, discovers existing logical revisions, verifies every matching file byte-for-byte, creates a multipart file only when none exists, downloads it and re-enumerates before acknowledgement. Lost responses leave an uncertain operation; retry discovers the accepted revision. Concurrent clients can still create duplicate file IDs; these are accepted only with identical contents and are not automatically deleted.

The multipart payload limit is 5 MiB minus metadata margin. Larger packets are rejected before network and need a resumable-upload implementation; this is not a claim of full planned capacity. The transport callback must reject unsigned/invalid packets; the isolated `signedProtocol.js` prototype supplies a possible validator, but its lifecycle and protocol review remain pending. Fake validation in tests does not constitute protocol verification.

`publication.js` composes a store and transport, records uncertain sending before I/O, bounds retries and separates permanent failure from retryable errors. `publicationStore.js` stores binding and queued packets in the existing vault IndexedDB database; changing account/generation preserves old operations but prevents their acknowledgement or automatic reassociation. Wiping the vault database removes this state too. Binding configuration is an internal primitive, not an enrollment authorization API.

Normal vault commits, worker alarms, OAuth and UI are not connected to these modules yet. The vault repository now accepts an explicit `drivePublication` option: identity/binding validation and enqueue share the vault/checkpoint transaction, with rollback regressions. Normal mutation callers do not yet prepare signed packets or provide that option automatically. No distributed atomicity, cloud delivery or signed-device guarantee is established by this increment.

New tests: `drivePublication.test.js`, `publication.test.js`, `publicationStore.test.js`. Upload API/properties references checked on 2026-11-05: [uploads](https://developers.google.com/workspace/drive/api/guides/manage-uploads), [private application properties](https://developers.google.com/workspace/drive/api/guides/properties).

## Atomic commit primitive

`publicationModel.js` holds pure validation and queue insertion shared by the store and vault transaction. `commitRecord(record, expected, { drivePublication: { binding, publication } })` passes the explicit packet into `writeLocalVaultRecordRaw`. Its revision/vault must match the record and legacy pending publication must be off. The enabled binding is checked inside the same IndexedDB transaction. Queue failure or changed binding aborts record, checkpoint and operation together. This validates packet identity, not its signature or semantic correspondence to the encrypted record: protocol preparation/verification remains a mandatory future application layer.

Four `driveCommit.test.js` regressions cover repository commit, wrong binding, abort after record put and incompatible packet/dual transport. The publication retry-limit regression ensures persisted exhausted operations make no further requests.

The internal signed-publication integration test now uses the actual prototype verifier rather than accepting any callback result. It checks the actual multipart media bytes and the complete signature/transaction/transport/acknowledgement path with a fictional provider. It does not activate Google transport or close the independent-review gate.

Prepared signed packets also carry the expected authorization hash. The atomic commit checks the persisted administrative head, and outbox state transitions reject a queued authorization superseded in the meantime. The integrated test covers a change between signing and commit, and revocation after queueing. Normal mutation callers and worker activation remain pending.
