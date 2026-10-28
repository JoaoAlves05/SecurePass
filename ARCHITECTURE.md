# SecurePass architecture

The extension uses native ES modules. There is no build process and no runtime third-party code. `background/serviceWorker.js` registers listeners, applies message authorization and dispatches to feature handlers. It does not implement encryption or UI flows.

Documentation baseline: version 0.2.0 at commit `e97f4c6558be23e50016a9b473441ce4c431490a`, reviewed on 2026-10-24 and documented on 2026-10-25. [SD01–SD23](docs/REVIEW_SETTINGS_SYNC_DATA.md) remain open; the [proposed design](docs/SYNC_DATA_PLAN.md) is not current runtime behavior.

## Implemented settings/data increment

See [current evidence](docs/SETTINGS_UX_IMPLEMENTATION.md) and [journey design](docs/SETTINGS_UX_DESIGN.md). `src/operationQueue.js` now serializes settings and vault mutations without a session/settings import cycle. `vault/backupService.js` owns digest/revision/session-bound previews and commits. IndexedDB stores the encrypted record, snapshot and outbox reference transactionally; `vault/retry.js` retries enabled legacy publication at startup/alarms with persisted backoff. `operationDialog.js` and `management.js` compose guided local workflows in the same trusted popup pathname with `?manage=1`. Drive remains explicitly unavailable.

The detailed SD descriptions below preserve the reviewed baseline where stated; consult the increment before interpreting them as current behavior. Full signed-device/Drive protocol and distributed transition recovery remain unimplemented.

The [2026-10-26 backup/Advanced review](docs/REVIEW_BACKUP_ADVANCED.md) adds idempotent conflict import, stable-ID replacement priority, unchanged-import preservation, remote-divergence checks, local-only vault status, explicit remote inspection errors and resumable local recovery cleanup. Startup/alarms finish a pending local restore with Sync off. Interrupted erasure remains suspended until explicitly repeated; force erasure does not open IndexedDB. These are local safety guarantees, not distributed transaction recovery.

## Boundaries

| Module | Responsibility |
|---|---|
| `src/security/` | Exact origin policy and context/capability checks |
| `src/vault/crypto.js` | Versioned envelope encryption, bounded KDF, key wrapping, legacy decryption |
| `src/vault/session.js` | Restricted volatile data key, deadline, restoration after worker suspension, immediate generation revocation |
| `src/vault/queue.js` | Serial operations and a Web Lock across extension contexts |
| `src/vault/repository.js` | Local-first normal commits, local-preferred reads and global pending Sync flag |
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
| `auth/` | Extension-owned confirmation window; no embedding in a visited page |
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

First remote adoption requires its master password. Selected-version restore writes locally and disables publication, preserving the prior encrypted local record. Local selected-version restore reads its independently complete generation even if another generation is incomplete. Selected-version merge validates the complete payload, retains the destination key/password and resolves only selected ancestry; unselected heads remain. Conflict copies retain exact user notes and receive distinct IDs. Automatic remote fast-forward, tombstones and signed-device authorization are not implemented.

Compaction traverses published ancestry and preserves active v2/unversioned copies and unreferenced uploads. Abandoned-upload cleanup, checkpoint-based history retirement and guaranteed capacity for two complete versions remain open. Local recovery uses a durable publication-suppression marker before its local write; a partial operation remains safe from accidental publication, but full cross-store recovery is still an acceptance gap. Google Drive and the new protocol remain unavailable pending configuration and implementation.

## Settings and data-management contracts

[Guided Chrome Sync setup](docs/CHROME_SYNC_SETUP.md) separates read-only preparation/capacity inspection from explicit activation. It checks room for today’s vault and another complete version before enabling, and publication refuses individually oversized versions before remote writes. Chrome storage acceptance is reported separately from an optional, expiring cross-installation diagnostic receipt. Receipt metadata never authorizes vault operations. Source/destination/owner/session-bound previews provide count comparisons before remote restore/combine. No new account or extension permissions are required; Google-authenticated transport remains a manual acceptance check.

`src/operationQueue.js` serializes vault operations and preference writes without a settings/session import cycle. `src/settings.js` validates local preferences and repairs invalid common fields with reported defaults. UI saves use revision-checked patches excluding Sync mode; only an internal transition changes `useSync`. `SAVE_SETTINGS` also recalculates the live session deadline from persisted last activity. Reset preserves the vault and mode.

`vault/backupService.js` decodes a bounded source, plans keep-both/skip/replace, and binds a preview token to source digest, destination revision, session generation and expiry. No plaintext entries/passwords are stored in the preview metadata. Commit revalidates source/destination and can explicitly create a new local vault from a backup. Compatibility import handlers still exist; the management UI uses the bound preview workflow.

IndexedDB retains three previous local content states. `vault/checkpoints.js` provides authenticated comparison, explicit legacy-key migration, revision/digest/document/lock-bound recovery previews, entry/full recovery and scoped history deletion. Full and external/selected-remote restores preserve an existing vault's current key/master password/biometric setup; full restore suppresses automatic publication. Password rotation prepares fresh live/history encryption and commits both atomically without adding a checkpoint. Unreadable retained history blocks rotation until explicitly migrated or removed. UI cards show dates, sequence, counts and differences only while unlocked. Their Review action opens `checkpointReview.js`, an inline searchable comparison with per-entry confirmation and a separate full-restore confirmation. Read-only comparisons discard their preview token; actions acquire a fresh token and compare its revision/source digest with the displayed state before confirmation. Archived Sync copies remain separate, including when a local point shares their revision ID. See [checkpoint design and evidence](docs/CHECKPOINTS.md).

UI recovery selects stable snapshot IDs and exports one encrypted snapshot per file, within the 16 MiB individual file contract. Explicit source selection keeps local and archived exports distinct. The aggregate legacy export handler remains for compatibility; large legacy archives still need the planned bounded streaming reader. Wipe reads only local data; explicit force confirmation allows deleting indecipherable records without granting access to contents.

`vaultUnlock.js` authenticates within a bounded unlock form, keeps failures inline, aborts pending WebAuthn on cancellation and returns an unlock result rather than a password. `recovery.css` owns compact unlock, comparison and recovery-confirmation geometry for popup/tab sizes. `operationDialog.js` supplies native exclusive operation dialogs; `management.js` refreshes settings, vault and history state after actions. The same trusted popup pathname supports `?manage=1` without granting content or authentication pages general management access. The Drive button is disabled with an explicit availability reason. HIBP cache writes carry a generation barrier across clear/wipe, and offscreen clipboard erasure only targets still-owned content.

Master-password changes use the inline `masterPassword.js` flow: fresh password authentication or a purpose-bound verified PRF assertion, then new password/confirmation, then an in-place result. `vault/masterAuthorization.js` stores a random, two-minute, single-use grant in restricted session storage, bound to the management client, available browser document/tab identity, vault revision/key epoch and lock revocation nonce. The background consumes the grant under the same operation lock as rotation; an already-unlocked vault or ordinary biometric unlock is insufficient. Rotation preserves entries and removes the local biometric wrapper. `management.css` owns the tab layout independently of popup sizing. See [flow and verification](docs/MASTER_PASSWORD_FLOW.md).

## Message flows

1. A login-field key directly requests autofill with its browser-supplied origin/document identity and a random per-field target. Repeated clicks refocus that same pending selector.
2. The background reserves an `about:blank` window, records its tab identity, then loads the extension-owned auth page bound to that tab.
3. The window unlocks through the master password or verified PRF. Its unlock response contains no full vault.
4. The user explicitly chooses a credential filtered by exact origin, even when only one matches. Account metadata stays in the native selector for this flow.
5. The background consumes the request, checks revocation and sends that single credential to the original document ID, requiring source acknowledgement.
6. The content script checks its pending target, visibility and login context, applies native input/change events, restores field focus and shows pointer-transparent status feedback. It never submits the form.

Management messages are restricted to the exact bundled popup page. The confirmation window has a smaller capability set. Content scripts cannot call general vault mutations, list all entries, unlock the vault or complete biometric ceremonies. Local/session/Sync storage is restricted before the background accepts requests. Public resource exposure includes only content modules and the form analyzer.

[Account suggestions and inline login tools](docs/ACCOUNT_PROMPTS.md) use the popup visual tokens in extension-owned confirmation and a closed-shadow tools menu. Submission captures values before page listeners clear/navigate, without claiming login success. Metadata-only suggestions remain available after review cancellation and are removed on save/dismiss/expiry/lock. Inline review/dismiss checks the originating tab/document. Explicit same-origin save targets preserve notes/identity, bind the reviewed destination revision and serialize consumption with commit. Public status/account/Sync reads serialize against mutations; fill remains one-shot, document-bound and never submits. No permissions changed; auth may read only existing public presentation settings.

The [contextual-key refinement](docs/CONTEXTUAL_KEY.md) keeps generation/copy/save-entered in the source content module, reached through consumed, source-acknowledged native requests; public generation/current-field copy can run while locked. Manual Add login stays in `auth/`, is create-only, source-origin/document/revision-bound, and uses the encrypted checkpoint/outbox commit path without filling. Its draft password never enters the pending fill record. Registration/change tools offer bounded generation overrides and recheck context after generation to protect current-password fields. Automatic suggestions preserve manually opened tools and pending selections. Keyboard shortcuts remain deferred; the existing capability set is unchanged.

## Biometric model

Registration requires the master password. A create ceremony is followed by a real assertion that must return PRF output. The background verifies the public key signature, challenge, credential ID, origin, RP ID hash, UP/UV flags and authenticator counter. Ceremonies expire, are bound to the exact bundled extension page and its per-document random client ID, and are consumed once; this supports Chrome popup messages that do not include `sender.documentId`. The PRF key wraps the data key with vault/credential/epoch authenticated context. Master rotation, adopting a different vault/key or explicit revocation invalidates the wrapper. Content recovery into an existing vault preserves its active key and biometric wrapper. No verify-only session seed or persistent Trusted Device bypass is supported.
