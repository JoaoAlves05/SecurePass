# Drive transport implementation status — 2026-11-06

`src/sync/driveTransport.js` implements bounded listing/download/account identification and immutable publication through an injected token provider and binding guard. Configured development builds now support management-only Google connection and read-only appData inspection. Normal mutation signing and worker scheduling are connected for internally enrolled writers, but production writes remain blocked by a source-level review condition. No public enrollment, adoption or write-activation route exists. The root manifest still requests no Google permissions; the builder adds them only to the explicitly configured copy.

The reader restricts listing to appDataFolder, follows all page tokens, rejects incomplete/looping/duplicate discovery and bounds pages, file count and response bytes. Downloaded text is untrusted staging data; the caller must verify format, authorization, signatures and ciphertext before using it. A successful listing does not verify vault identity or history freshness.

The caller must provide an immutable binding identity and an `assertBinding` callback that rejects off-mode automatic work, changed accounts/vaults/generations and revoked operations. The reader checks it before token acquisition, before fetching and after reading. It never prompts for OAuth or stores tokens. Redirects and ambient cookies are disabled. Cancellation aborts fetch/body reads; response and provider error text do not become diagnostics.

Authentication, permissions, capacity, missing files and transient failures have separate error codes. No automatic retry is performed here; the durable coordinator must schedule bounded backoff and reconcile uncertain writes once publication exists. Thus this module alone does not implement Sync, revocation or account switching.

Tests: `tests/driveTransport.test.js` covers complete/incomplete pagination, changed binding, error classification, rejected IDs and declared/streamed size limits. Real Google acceptance remains pending.

API references checked on 2026-11-04: [appDataFolder](https://developers.google.com/workspace/drive/api/guides/appdata), [files.list](https://developers.google.com/workspace/drive/api/reference/rest/v3/files/list), [error handling](https://developers.google.com/workspace/drive/api/guides/handle-errors).

## Immutable publication and durable scheduling primitives

`createDriveTransport` adds publication through a mandatory `validatePublication` protocol callback and `assertWritable` policy guard. It serializes concurrent publications per client, discovers existing logical revisions, verifies every matching file byte-for-byte, creates a multipart file only when none exists, downloads it and re-enumerates before acknowledgement. Lost responses leave an uncertain operation; retry discovers the accepted revision. Concurrent clients can still create duplicate file IDs; these are accepted only with identical contents and are not automatically deleted.

The multipart payload limit is 5 MiB minus metadata margin. Larger packets use resumable upload, with an overall 16 MiB serialized-packet bound matching the signed validator/download limit. Bytes, not JavaScript character counts, determine chunk offsets. The transport callback must reject unsigned/invalid packets; `signedProtocol.js` supplies the current prototype validator, but lifecycle and protocol review remain pending. Fake validation in transport-only tests does not constitute protocol verification.

Resumable sessions persist in the same trusted outbox before any media PUT. A restarted run enumerates completed revisions first, then probes the saved session offset; it never assumes a lost response means the server did not accept bytes. One-MiB chunks bound requests; invalid/oversized/regressive progress fails, and a missing expired session can restart without deleting remote data. The capability URI is accepted only on HTTPS `www.googleapis.com/upload/drive/v3/files` with resumable/upload identity parameters. It is never sent in UI responses or diagnostics. Changing binding/authorization/off mode prevents further writes or acknowledgements. Completion still requires byte-for-byte download and complete re-enumeration.

`publication.js` composes a store and transport, records uncertain sending before I/O, bounds retries and separates permanent failure from retryable errors. `publicationStore.js` stores binding and queued packets in the existing vault IndexedDB database; changing account/generation preserves old operations but prevents their acknowledgement or automatic reassociation. Wiping the vault database removes this state too. Binding configuration is an internal primitive, not an enrollment authorization API.

Normal vault commits now prepare their packet automatically when a writer is internally enrolled through `mutationPublication.js`. The writer envelope is content-key protected; enrollment verifies the pinned administrative registry, matching public key and recent authentication. There is no public enrollment route. `driveRuntime.js` connects verification/coordinator/token acquisition to worker startup and a retry alarm. Its production review predicate is false in source; tests explicitly inject a reviewed policy and fictional provider. No distributed atomicity, actual cloud delivery or full signed-device lifecycle guarantee is established.

New tests: `drivePublication.test.js`, `publication.test.js`, `publicationStore.test.js`. Upload API/properties references checked on 2026-11-05: [uploads](https://developers.google.com/workspace/drive/api/guides/manage-uploads), [private application properties](https://developers.google.com/workspace/drive/api/guides/properties).

## Atomic commit primitive

`publicationModel.js` holds pure validation and queue insertion shared by the store and vault transaction. `commitRecord(record, expected, { drivePublication: { binding, publication } })` passes the explicit packet into `writeLocalVaultRecordRaw`. Its revision/vault must match the record and legacy pending publication must be off. The enabled binding is checked inside the same IndexedDB transaction. Queue failure or changed binding aborts record, checkpoint and operation together. This validates packet identity, not its signature or semantic correspondence to the encrypted record: protocol preparation/verification remains a mandatory future application layer.

Four `driveCommit.test.js` regressions cover repository commit, wrong binding, abort after record put and incompatible packet/dual transport. The publication retry-limit regression ensures persisted exhausted operations make no further requests.

The internal signed-publication integration test now uses the actual prototype verifier rather than accepting any callback result. It checks the actual multipart media bytes and the complete signature/transaction/transport/acknowledgement path with a fictional provider. It does not activate Google transport or close the independent-review gate.

Prepared signed packets also carry the expected authorization hash. The atomic commit checks the persisted administrative head and session generation/deadline, and outbox state transitions reject queued authorization superseded in the meantime. Tests cover a change between signing and commit, revocation after queueing, normal CRUD signing, rollback with unchanged session contents, lock during preparation, binding enabled after unsigned preparation, and suspension on local restore. Administrative rotation/rebase and production activation remain pending.

## Account connection boundary

`googleConnection.js` acquires OAuth tokens only via Chrome Identity. Explicit connection can prompt; inspection/runtime acquisition is noninteractive. `about.get` identifies the token's Drive account by permission ID before bound file access, preventing a cached token from silently switching accounts. Durable connection generations invalidate old OAuth completions. Disconnect suspends the outbox and forgets extension-local cached tokens; it does not claim global OAuth revocation or remote deletion.

The management UI exposes connection, complete folder enumeration and disconnect, never tokens, upload URIs, signing keys or automatic vault adoption. Website/auth/selector contexts cannot call these routes. An empty list is shown only after successful complete enumeration, and counts refer to app files, not authenticated vaults. Google compatibility still requires user authorization with the real supplied client ID; automated tests emulate Identity/Drive responses. See [setup](GOOGLE_CLOUD_SETUP.md).


## Internal authenticated-history retrieval — 2026-11-08

`vault/driveMerge.js` now composes `list`/`download` with signed verification and
common-base planning. It retrieves selected revisions and their authenticated
ancestors, checks every listed copy for those identities, accepts unpublished
local packets, enforces 256 packets/32 MiB UTF-8 including duplicates and compares
the complete bound-vault inventory after downloads. Every asynchronous boundary
checks the caller's live context and cancellation. Incomplete discovery, missing
ancestors, contradictory packets, changed inventory or invalid trust aborts;
no vault/outbox/remote mutation occurs. The reader still owns pagination, streaming
limits, account checks and network errors. A final listing is a race check, not
proof of provider freshness or a distributed transaction. This path has no public
route and does not activate synchronization. [Scope and evidence](issues/AUTHENTICATED_DRIVE_HISTORY.md).


## Protected management review — 2026-11-08

`vault/driveReview.js` now exposes verified/decrypted copy inspection and owned
merge reviews through management-only routes. An already-enrolled writer and
current trusted context are required; ordinary connection does not enroll one.
Preparation is bounded/cancellable, omits password/note values, quarantines bad
copies and verifies the inventory again. Signed pending local packets supply
unpublished heads. Token/account/file reads honour cancellation without holding
the vault lock. Confirmation can commit a signed merged revision locally and
queue it; the worker production gate is unchanged and the UI states sending is
paused. [Scoped design and evidence](DRIVE_REVIEW_DESIGN.md).
