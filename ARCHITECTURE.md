# SecurePass architecture

The extension uses native ES modules. There is no build process and no runtime third-party code. `background/serviceWorker.js` registers listeners, applies message authorization and dispatches to feature handlers. It does not implement encryption or UI flows.

Documentation baseline: version 0.2.0 at commit `e97f4c6558be23e50016a9b473441ce4c431490a`, reviewed on 2026-10-24 and documented on 2026-10-25. [SD01–SD23](docs/REVIEW_SETTINGS_SYNC_DATA.md) remain open; the [proposed design](docs/SYNC_DATA_PLAN.md) is not current runtime behavior.

## Implemented settings/data increment

Update 2026-11-06: `sync/googleConnection.js` and management-only `driveHandlers.js` connect Chrome Identity to read-only account/appData inspection in an explicitly configured development build. Tokens stay in the Chrome Identity cache; a Drive permission ID, not email, pins account identity. Disconnect invalidates a durable generation and suspends the previous publication binding. No route enables Drive vault adoption or publication.

`sync/mutationPublication.js` prepares signed packets automatically on normal vault commits when an internal writer has been enrolled against pinned authorization. Vault/checkpoint/outbox commit checks current binding, administrative head and session generation/deadline. Local restore atomically disables Drive; unsupported administrative key-epoch changes fail before writing. `sync/driveRuntime.js` connects the coordinator to startup/alarms behind a source-level independent-review gate that defaults to false. Transport supports persisted resumable sessions for packets up to 16 MiB, with provider offset probes and verified immutable read-back. These integrations do not complete the new encryption format, device lifecycle, recovery kit, convergence or migration. Current evidence is in `docs/VALIDATION.md`.

See [current evidence](docs/SETTINGS_UX_IMPLEMENTATION.md) and [journey design](docs/SETTINGS_UX_DESIGN.md). `src/operationQueue.js` now serializes settings and vault mutations without a session/settings import cycle. `vault/backupService.js` owns digest/revision/session-bound previews and commits. IndexedDB stores the encrypted record, snapshot and outbox reference transactionally; `vault/retry.js` retries enabled legacy publication at startup/alarms with persisted backoff. `operationDialog.js` and `management.js` compose guided local workflows in the same trusted popup pathname with `?manage=1`. Drive vault synchronization remains unavailable; configured development copies expose account connection and read-only inspection.

The detailed SD descriptions below preserve the reviewed baseline where stated; consult the increment before interpreting them as current behavior. Full signed-device/Drive protocol and distributed transition recovery remain unimplemented.

The [2026-10-26 backup/Advanced review](docs/REVIEW_BACKUP_ADVANCED.md) adds idempotent conflict import, stable-ID replacement priority, unchanged-import preservation, remote-divergence checks, local-only vault status, explicit remote inspection errors and resumable local recovery cleanup. Startup/alarms finish a pending local restore with Sync off. Interrupted erasure remains suspended until explicitly repeated; force erasure does not open IndexedDB. These are local safety guarantees, not distributed transaction recovery.

## Boundaries

| Module | Responsibility |
|---|---|
| `src/security/` | Exact origin policy and context/capability checks |
| `src/vault/crypto.js` | Versioned envelope encryption, bounded KDF, key wrapping, legacy decryption |
| `src/vault/session.js` | Restricted volatile data key, deadline, restoration after worker suspension, immediate generation revocation |
| `src/vault/queue.js` | Serial operations and a Web Lock across extension contexts |
| `src/vault/repository.js` | Local-first normal commits, local-preferred reads, internal mutation signing and transactional publication references |
| `src/vault/driveReview.js` | Management-only signed-copy inspection and document-owned cancellable review capabilities; no network I/O under the vault lock |
| `src/vault/mergeService.js` | Internal authenticated Drive merge application with fixed trust/binding, revision CAS and atomic signed vault/checkpoint/outbox commit |
| `src/vault/payload.js` | Versioned encrypted content, persistent tombstones, explicit restoration provenance and aggregate history capacity |
| `src/vault/driveMerge.js` | Internal bounded read-only Drive history retrieval and inventory recheck before authenticated merge planning |
| `src/vault/authenticatedMerge.js` | Internal signed-history verification, unique common-base selection and guarded decryption before planning; same authorization/epoch only |
| `src/vault/threeWayMerge.js` | Internal common-base merge planning, opaque revision-bound reviews and deterministic conflict copies; no production integration |
| `src/vault/sync.js` | Immutable chunks/manifests, integrity checking and divergent heads |
| `src/vault/syncService.js` | Enable/disable, archive, resolve, merge, retry and compact |
| `src/vault/recovery.js` | Explicit external recovery and device erasure |
| `src/cryptoVault.js` | Vault application service: create/unlock, copy-on-write CRUD, rotation and import |
| `src/biometric/` | WebAuthn client, proof verification, expiring owner-bound ceremonies, PRF key wrapping |
| `src/autofill/` | Origin/document-bound requests, restricted expiring candidate store and explicit revision-checked save/update |
| `src/clipboard/` and `offscreen.js` | One offscreen clipboard owner with serialized copy/conditional cleanup |
| `src/messageHandlers/` | Thin adapters from message DTOs to application services |
| `popup/state.js` | Popup state and shared constant icons; no bootstrap side effects |
| `popup/modules/` | Independent UI features, dialogs, session view, data management, Sync and biometrics |
| `popup/popup.js` | Bootstrap/listener composition only; feature modules never import it |
| `auth/` | Protected extension-owned authentication/save window; not web accessible |
| `selector/` | Minimal extension-origin account list embedded beside the source field; no authentication or management messages |
| `content/` | Field discovery, native value events and tools; no master password input or vault cache |
| `tests/` | Unit/integration regressions and disposable Chromium scenarios |

`npm run check` verifies module syntax, import paths, absence of import cycles and version consistency. New features should add a service and a small message adapter with an explicit capability policy, plus a UI module in the relevant context.

## Vault format and lifetime

Version 2 uses a random 256-bit data encryption key. PBKDF2-SHA256 (600,000 iterations, random 128-bit salt) derives a key that wraps the data key with AES-256-GCM. Credential data is separately encrypted with AES-256-GCM and a fresh 96-bit IV. Identity, key epoch, revision and ancestry are bound as authenticated data.

On unlock, the data key and deadline are held in restricted `storage.session`, which persists across worker suspension but is cleared on browser restart/reload. Credential snapshots are decrypted as needed. The master password is not retained after the operation. Vault operations use generation/deadline checks; this is not a transaction across every settings, backup and Sync step. Locking increments the session generation before asynchronous cleanup. Mutations use copies, serialize through a queue and a Web Lock, and publish cache state only after IndexedDB transaction completion. A revision comparison rejects stale writers.

Existing unversioned vaults are read without modifying the user's password. Successful unlock migrates to version 2 while retaining the original encrypted record in recovery. Missing, corrupt and unavailable storage are distinct outcomes; unlock never creates a vault implicitly.

## Sync model

The local IndexedDB record is authoritative. Normal writes commit record, previous snapshot and pending-publication reference in the same transaction. `syncOutbox` stores vault/revision identity, not plaintext credentials. Publication acknowledges only the matching revision. `vault/retry.js` resumes enabled legacy work at startup/alarms with durable backoff; off mode prevents automatic remote retry/inspection; explicitly confirmed manual history cleanup is available without enabling publication.

Legacy Chrome Sync uses immutable revision chunks and checksum-bearing manifests. `inspectSync()` separates valid heads from incomplete/corrupt generations and inventories legacy and v2 together. `syncHeads()` remains strict for mutation/compaction, so incomplete histories cannot silently resolve other heads. Preflight covers total/per-item/item-count quotas; rate errors are reported as pending. Missing matching chunks can be repaired; different content under the same revision is rejected.

First remote adoption requires its master password. Selected-version restore writes locally and disables publication, preserving the prior encrypted local record. Local selected-version restore reads its independently complete generation even if another generation is incomplete. Selected-version merge validates the complete payload, retains the destination key/password and resolves only selected ancestry; unselected heads remain. Conflict copies retain exact user notes and receive distinct IDs. Automatic remote fast-forward is not implemented. Local mutations now persist encrypted tombstones; distributed merge/retention integration remains pending. Signed-device authorization exists as an internal prototype; production enrollment/revocation/rotation remain unavailable.

Compaction traverses published ancestry and preserves active v2/unversioned copies and unreferenced uploads. Abandoned-upload cleanup, checkpoint-based history retirement and guaranteed capacity for two complete versions remain open. Local recovery uses a durable publication-suppression marker before its local write; a partial operation remains safe from accidental publication, but full cross-store recovery is still an acceptance gap. Production Drive publication remains blocked pending protocol review, device lifecycle and acceptance; public client configuration has already been supplied.

`vault/threeWayMerge.js` is a separate internal planner over already-authenticated snapshots and an explicit common base. It combines independent changes and requires decisions for edit/edit or delete/edit conflicts, preserving notes through stable copy IDs and separate provenance. Opaque reviews expire, bind all revisions/vault/epoch and invoke a live synchronous guard before returning contents. Proposed deleted IDs are not persistent authenticated tombstones. The internal `authenticatedMerge.js` adapter now verifies common ancestry within one authorization/epoch; production integration, stale-device rebase and resolution UI remain required; the legacy additive merge now refuses to reintroduce locally tombstoned IDs. See [scope and evidence](docs/issues/THREE_WAY_MERGE.md).

## Settings and data-management contracts

[Guided Chrome Sync setup](docs/CHROME_SYNC_SETUP.md) separates read-only preparation/capacity inspection from explicit activation. It checks room for today’s vault and another complete version before enabling, and publication refuses individually oversized versions before remote writes. Chrome storage acceptance is reported separately from an optional, expiring cross-installation diagnostic receipt. Receipt metadata never authorizes vault operations. Source/destination/owner/session-bound previews provide count comparisons before remote restore/combine. No new account or extension permissions are required; Google-authenticated transport remains a manual acceptance check.

`src/operationQueue.js` serializes vault operations and preference writes without a settings/session import cycle. `src/settings.js` validates local preferences and repairs invalid common fields with reported defaults. UI saves use revision-checked patches excluding Sync mode; only an internal transition changes `useSync`. `SAVE_SETTINGS` also recalculates the live session deadline from persisted last activity. Reset preserves the vault and mode.

`vault/backupService.js` decodes a bounded source, plans keep-both/skip/replace, and binds a preview token to source digest, destination revision, session generation and expiry. No plaintext entries/passwords are stored in the preview metadata. Commit revalidates source/destination and can explicitly create a new local vault from a backup. Compatibility import handlers still exist; the management UI uses the bound preview workflow.

IndexedDB retains three previous local content states. `vault/checkpoints.js` provides authenticated comparison, explicit legacy-key migration, revision/digest/document/lock-bound recovery previews, entry/full recovery and scoped history deletion. Full and external/selected-remote restores preserve an existing vault's current key/master password/biometric setup; full restore suppresses automatic publication. Password rotation prepares fresh live/history encryption and commits both atomically without adding a checkpoint. Unreadable retained history blocks rotation until explicitly migrated or removed. UI cards show dates, sequence, counts and differences only while unlocked. Their Review action opens `checkpointReview.js`, an inline searchable comparison with per-entry confirmation and a separate full-restore confirmation. Read-only comparisons discard their preview token; actions acquire a fresh token and compare its revision/source digest with the displayed state before confirmation. Archived Sync copies remain separate, including when a local point shares their revision ID. See [checkpoint design and evidence](docs/CHECKPOINTS.md).

UI recovery selects stable snapshot IDs and exports one encrypted snapshot per file, within the 16 MiB individual file contract. Explicit source selection keeps local and archived exports distinct. The aggregate legacy export handler remains for compatibility. `src/recoveryArchive.js` inventories legacy aggregate archives up to 256 MiB in 64-KiB windows (100 records, 16 MiB per record). It validates the complete structure, isolates malformed envelopes and rereads only a digest-bound selected record. Regular backups retain their 16-MiB limit; batch exports remain pending. Wipe reads only local data; explicit force confirmation allows deleting indecipherable records without granting access to contents.

`vaultUnlock.js` authenticates within a bounded unlock form, keeps failures inline, aborts pending WebAuthn on cancellation and returns an unlock result rather than a password. `recovery.css` owns compact unlock, comparison and recovery-confirmation geometry for popup/tab sizes. `operationDialog.js` supplies native exclusive operation dialogs; `management.js` refreshes settings, vault and history state after actions. The same trusted popup pathname supports `?manage=1` without granting content or authentication pages general management access. Google controls permit connection/read-only inspection only in a configured copy and provide no vault-publication switch. HIBP cache writes carry a generation barrier across clear/wipe, and offscreen clipboard erasure only targets still-owned content.

Master-password changes use the inline `masterPassword.js` flow: fresh password authentication or a purpose-bound verified PRF assertion, then new password/confirmation, then an in-place result. `vault/masterAuthorization.js` stores a random, two-minute, single-use grant in restricted session storage, bound to the management client, available browser document/tab identity, vault revision/key epoch and lock revocation nonce. The background consumes the grant under the same operation lock as rotation; an already-unlocked vault or ordinary biometric unlock is insufficient. Rotation preserves entries and removes the local biometric wrapper. `management.css` owns the tab layout independently of popup sizing. See [flow and verification](docs/MASTER_PASSWORD_FLOW.md).

## Message flows

1. A login-field key directly requests autofill with its browser-supplied origin/document identity and a random per-field target. Repeated clicks refocus that same pending selector.
2. If locked, the background reserves an `about:blank` window, records its tab identity and loads the protected auth page. If unlocked, it authorizes the source to create the extension-origin selector frame.
3. The window unlocks through the master password or verified PRF, then transfers ownership back to the anchored frame. Its unlock response contains no full vault. Explicit native fallback retains selection in that window.
4. The user explicitly chooses a credential filtered by exact origin, even when only one matches. Account metadata is delivered to the bound selector frame or the explicit native fallback, never as a list to the content script.
5. The background consumes the request, checks revocation and sends that single credential to the original document ID, requiring source acknowledgement.
6. The content script checks its pending target, visibility and login context, applies native input/change events, restores field focus and shows pointer-transparent status feedback. It never submits the form.

Management messages are restricted to the exact bundled popup page. The confirmation window has a smaller capability set. Content scripts cannot call general vault mutations, list all entries, unlock the vault or complete biometric ceremonies. Local/session/Sync storage is restricted before the background accepts requests. Public resource exposure includes content modules, the form analyzer and only the selector HTML; auth and management HTML remain unlisted.

[Account suggestions and inline login tools](docs/ACCOUNT_PROMPTS.md) use the popup visual tokens in extension-owned confirmation and a closed-shadow tools menu. Submission captures values before page listeners clear/navigate, without claiming login success. Metadata-only suggestions remain available after review cancellation and are removed on save/dismiss/expiry/lock. Inline review/dismiss checks the originating tab/document. Explicit same-origin save targets preserve notes/identity, bind the reviewed destination revision and serialize consumption with commit. Public status/account/Sync reads serialize against mutations; fill remains one-shot, document-bound and never submits. No permissions changed; auth may read only existing public presentation settings.

The [contextual-key refinement](docs/CONTEXTUAL_KEY.md) keeps generation/copy/save-entered in the source content module, reached through consumed, source-acknowledged native requests; public generation/current-field copy can run while locked. Manual Add login stays in `auth/`, is create-only, source-origin/document/revision-bound, and uses the encrypted checkpoint/outbox commit path without filling. Its draft password never enters the pending fill record. Registration/change tools offer bounded generation overrides and recheck context after generation to protect current-password fields. Automatic suggestions preserve manually opened tools and pending selections. Keyboard shortcuts remain deferred; the existing capability set is unchanged.

## Biometric model

Registration requires the master password. A create ceremony is followed by a real assertion that must return PRF output. The background verifies the public key signature, challenge, credential ID, origin, RP ID hash, UP/UV flags and authenticator counter. Ceremonies expire, are bound to the exact bundled extension page and its per-document random client ID, and are consumed once; this supports Chrome popup messages that do not include `sender.documentId`. The PRF key wraps the data key with vault/credential/epoch authenticated context. Master rotation, adopting a different vault/key or explicit revocation invalidates the wrapper. Content recovery into an existing vault preserves its active key and biometric wrapper. No verify-only session seed or persistent Trusted Device bypass is supported.

## In-progress plan completion — 2026-11-04

The fill selector uses a compact extension-owned window, starts configured biometric authentication once while locked, and offers cancellation/password fallback. Account selection carries the displayed vault revision and fills without a second authentication while the session remains valid. Names stay hidden while locked. No embedded credential-list surface or new page capability was introduced.

`src/sync/driveTransport.js` provides read and immutable-publication primitives with token/binding injection, complete bounded pagination, bounded streaming download and typed errors. The 2026-11-05 increment added publication verification plus scheduling and account/generation-bound IndexedDB state. The 2026-11-06 integration above adds normal mutation signing, resumable upload and gated worker scheduling, plus read-only OAuth management UI. Production publication, full signed-device lifecycle, recovery kit and Drive migration remain unavailable. See [transport status](docs/DRIVE_TRANSPORT.md) and [execution checklist](docs/IMPLEMENTATION_CHECKLIST.md).

## Internal signed authorization prototype — 2026-11-05

`sync/signedProtocol.js` verifies domain-separated administrative chains against an independent root and known checkpoint, and signs/verifies strictly structured encrypted-v2 revision wrappers. `signingKeyProtection.js` separates master-protected administrative keys from content-key-protected writer keys. `authorizationStore.js` persists/reverifies the known chain with transactional compare-and-write. `signedPublication.js` prepares packets for the explicit atomic commit path. These prototypes have no message routes or UI activation and do not establish complete enrollment/revocation, a new encryption format, recovery, migration or release acceptance. [Protocol specification and gates](docs/SIGNED_PROTOCOL.md).

## Anchored account selector — 2026-11-05

The normal field-key flow renders `selector/selector.html` as an extension-origin frame after unlock. This frame has only selection-details/fill/cancel/layout/public-settings capabilities; metadata is not sent to the content script. Request ownership binds the source tab/document/field and the selector document. Master input and WebAuthn remain in the non-web-accessible auth window, which can hand ownership to the selector. Explicit native fallback supports CSP-blocked embedding and manual login creation. Only the selector HTML is newly web accessible; the global frame-ancestors directive now permits self/http/https ancestors for it, while auth/management remain outside web-accessible resources. See [security boundaries and acceptance limits](docs/ANCHORED_SELECTOR.md).


## Authenticated merge adapter — 2026-11-08

`vault/authenticatedMerge.js` verifies a bounded complete history of signed
revisions under one verified authorization/epoch, rejects equivocation/cycles and
selects a unique nearest common ancestor. It decrypts the three snapshots with
complete entry identities/dates required before import defaults, then delegates
to the revision-bound opaque planner. Its synchronous caller guard must pin the
live session, account binding, authorization and heads. It has no storage,
transport, handler or UI effects. Cross-authorization history, checkpoint retention, public management routes/UI and production integration
remain pending. Internal merge-result metadata persistence is implemented below.
See [scope and conservative failure behavior](docs/issues/THREE_WAY_MERGE.md).


`vault/driveMerge.js` composes the bounded Drive reader with this adapter. It
captures the binding/key/local packets, downloads selected revisions and their
signed ancestors, verifies all remote copies for those identities, includes
unpublished local packets, and checks the vault inventory again before planning.
Foreign vaults and unselected branches are not incorporated. Missing/contradicting
history, cancellation, changed context or changed inventory aborts preparation.
It shares the adapter's 256-packet/32-MiB aggregate bounds, including duplicates.
No handler/UI or local/remote write is added; listing cannot establish provider
freshness or complete convergence. [Retrieval contract](docs/issues/AUTHENTICATED_DRIVE_HISTORY.md).


## Persistent encrypted deletion history — 2026-11-08

`vault/payload.js` validates encrypted state version 1 with entries, tombstones
and restoration provenance. Existing entry-only payloads remain readable and
migrate only on writes. `encryptEntries` authenticates previous content, preserves
history, records deletions and refuses implicit reuse of deleted IDs. Explicit
recovery/reviewed import opts into restoration and records provenance. Master
rotation and checkpoint re-protection preserve metadata. Capacity includes history
and never silently truncates it. Older clients reject the new plaintext kind.
The signed wrapper covers this ciphertext; production Drive remains gated.
See [format, migration and remaining merge scope](docs/VAULT_PAYLOAD.md).


## Authenticated merge commit — 2026-11-08

`mergeService.js` accepts only authenticated in-memory reviews, requires the
reviewed Drive binding, enrolled writer and persisted authorization, and resolves
under the vault operation lock. The planner carries private snapshot histories,
requires explicit tombstone-versus-entry choices even with an empty base, reserves
historically deleted IDs against generated-copy collisions and enforces full
metadata capacity. `resolveThreeWayPayload` combines encrypted tombstones,
restoration provenance and deterministic copy provenance. `encryptMergedPayload`
uses only the two selected heads as parents. Repository context requirements
prevent preparation under a newer binding/authorization from silently rebinding
an older review. Commit atomically stores live state/checkpoint/signed outbox;
success consumes the review, rollback preserves it for a guarded retry. No
management handler/UI or production Drive activation is added in this block.


## Protected Drive review — 2026-11-08

`vault/driveReview.js` verifies/decrypts bounded remote copy metadata, quarantines
invalid or equivocal identities/cycles and rechecks inventory/context. It includes
current-authorized signed local outbox packets when preparing a merge, supporting
unpublished local heads. Only an unlocked vault with configured connected Google,
current pinned authorization and an already-enrolled writer can enter this flow.
The five `DRIVE_REVIEW_*` routes are management-only; mutating/inspection requests
also bind the management client nonce and browser document/tab identity. Tokens
live only in memory, expire after two minutes and are discarded on replacement,
cancel, disconnect or lock; a worker restart loses them safely. Preparations are
bounded to eight requests and two minutes, 256 packets/32 MiB; no network I/O
holds the vault operation lock. Abort propagates through token/account/file reads.
The atomic commit composes session and review guards, preventing cancellation or
expiry during signing from turning into a late write.

`popup/modules/driveReview.js` extends the existing Advanced Google group. It
shows signed/decrypted counts and metadata, requires whole-version conflict
choices, pages eight rows, retains choices across search/pages and provides an
explicit bulk policy limited to matching unresolved conflicts. Passwords/notes
are absent from preview responses and DOM; lock clears the view. Sending remains
paused. No public enrollment, new permissions or production activation is added.
[Interaction, visuals and verification](docs/DRIVE_REVIEW_DESIGN.md).
