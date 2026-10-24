# SecurePass architecture

The extension uses native ES modules. There is no build process and no runtime third-party code. `background/serviceWorker.js` registers listeners, applies message authorization and dispatches to feature handlers. It does not implement encryption or UI flows.

## Boundaries

| Module | Responsibility |
|---|---|
| `src/security/` | Exact origin policy and context/capability checks |
| `src/vault/crypto.js` | Versioned envelope encryption, bounded KDF, key wrapping, legacy decryption |
| `src/vault/session.js` | Restricted volatile data key, deadline, restoration after worker suspension, immediate generation revocation |
| `src/vault/queue.js` | Serial operations and a Web Lock across extension contexts |
| `src/vault/repository.js` | Local-first commits and explicit pending Sync publication |
| `src/vault/sync.js` | Immutable chunks/manifests, integrity checking and divergent heads |
| `src/vault/syncService.js` | Enable/disable, archive, resolve, merge, retry and compact |
| `src/vault/recovery.js` | Explicit external recovery and device erasure |
| `src/cryptoVault.js` | Vault application service: create/unlock, copy-on-write CRUD, rotation and import |
| `src/biometric/` | WebAuthn client, proof verification, expiring owner-bound ceremonies, PRF key wrapping |
| `src/autofill/` | Origin/document-bound confirmation requests and expiring save candidates |
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

On unlock, the data key and deadline are held in restricted `storage.session`, which persists across worker suspension but is cleared on browser restart/reload. Credential snapshots are decrypted as needed. The master password is not retained after the operation. Every operation verifies its generation and the session deadline; locking invalidates pending operations synchronously before asynchronous cleanup. Mutations use copies, serialize through a queue and a Web Lock, and publish cache state only after IndexedDB transaction completion. A revision comparison rejects stale writers.

Existing unversioned vaults are read without modifying the user's password. Successful unlock migrates to version 2 while retaining the original encrypted record in recovery. Missing, corrupt and unavailable storage are distinct outcomes; unlock never creates a vault implicitly.

## Sync model

The local IndexedDB vault remains the durable working copy. Each version 2 record has a unique revision and bounded ancestry. Sync stores immutable chunks under revision-specific keys and publishes a checksum-bearing manifest only after chunk verification. The transport may deliver a manifest before all chunks to another device; this is an explicit incomplete state, never an empty vault.

Offline sibling revisions form multiple heads. The background refuses to edit over an unseen remote head until the user explicitly resolves it. Resolution preserves encrypted remote heads in a device-local archive and the previous local record in transactional recovery history. The UI supports download or preserving conflicting credentials in a merge. Publication failure after a local commit is reported as pending Sync; it does not pretend the local save failed.

Compaction considers a single storage snapshot and deletes only manifests/chunks for published ancestors of retained heads. It follows transitive ancestry before deletion, so truncating a newer record’s ancestry list does not resurrect an older head. It does not delete unreferenced in-flight uploads or other heads. Quota preflight leaves room for metadata, and no failed publication removes the prior valid generation. Old offline histories outside the retained ancestry window require explicit conflict resolution.

## Message flows

1. A content script asks for autofill with its browser-supplied origin/document identity.
2. The background opens an extension-owned window and binds the request to that window's tab.
3. The window unlocks through the master password or verified PRF. Its unlock response contains no full vault.
4. The user chooses a credential filtered by exact origin in the background.
5. The background consumes the request, checks revocation and sends that single credential to the original document ID.
6. The content script checks its pending request and field, applies native input/change events, and never submits the form.

Management messages are restricted to the exact bundled popup page. The confirmation window has a smaller capability set. Content scripts cannot call general vault mutations, list all entries, unlock the vault or complete biometric ceremonies. Local/session/Sync storage is restricted before the background accepts requests. Public resource exposure includes only content modules and the form analyzer.

## Biometric model

Registration requires the master password. A create ceremony is followed by a real assertion that must return PRF output. The background verifies the public key signature, challenge, credential ID, origin, RP ID hash, UP/UV flags and authenticator counter. Ceremonies expire, are bound to the exact bundled extension page and its per-document random client ID, and are consumed once; this supports Chrome popup messages that do not include `sender.documentId`. The PRF key wraps the data key with vault/credential/epoch authenticated context. Master rotation, recovery or explicit revocation invalidates the wrapper. No verify-only session seed or persistent Trusted Device bypass is supported.
