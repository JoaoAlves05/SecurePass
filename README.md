# SecurePass

SecurePass is a Manifest V3 Chrome extension for generating passwords, checking known breaches and managing an encrypted local vault. It runs as JavaScript ES modules with no build step or runtime dependencies.

Requires Chrome 122 or later. PRF unlock additionally requires a PRF-capable authenticator. Incognito, file URLs, cross-origin frames and fields inside website shadow roots are outside the current support scope.

## Current status

The current working tree includes a [settings/data UX increment](docs/SETTINGS_UX_IMPLEMENTATION.md): management tab, guided backup import into a new profile, stable snapshot recovery, settings patches and legacy Sync safety fixes. See the [screen/journey design](docs/SETTINGS_UX_DESIGN.md) for all 58 scenario mappings. Drive remains unavailable until OAuth and the new security protocol are implemented; this is not full release acceptance.

Version 0.2.0 has open integrity, quota, concurrency and recovery defects in settings, Sync and Data Management. Passing the existing tests does not close these findings. See the [current review](docs/REVIEW_SETTINGS_SYNC_DATA.md), [validation record](docs/VALIDATION.md), and [proposed remediation](docs/SYNC_DATA_PLAN.md). The local increment implements part of the target; the full Drive/security protocol remains unimplemented and requires technical validation.

## Run the extension

1. Open `chrome://extensions`, enable Developer mode and select **Load unpacked**.
2. Choose this repository directory and pin SecurePass.
3. After editing, reload the extension and refresh the affected websites.

The local vault supports up to 5,000 entries and 3 MB of credential JSON. Normal writes enforce these limits. Individual import files are limited to 16 MiB. Imports and merges validate the complete resulting vault. The UI exports individual recovery snapshots; oversized aggregate legacy archives still require a separate migration reader.

Create a vault with a master password of at least 16 characters (existing valid passwords remain accepted for unlock/migration). The password is preserved exactly, including spaces, Unicode and symbols. Losing the master password and access to a configured PRF authenticator means losing access; there is no server-side recovery.

## Features

- Local vault: create, unlock, search, add, edit, remove, change the master password and lock.
- Automatic locking after the configured period without vault interaction, on OS lock and when the last browser window closes. The session survives normal service-worker suspension, but not browser restart or extension reload.
- Generator with selected character sets, exclusions, length bounds and a bounded subset of website patterns. Unsupported or impossible rules produce an explicit error.
- Local strength heuristic. Its random-character entropy bound is not an estimate of human-password strength or cracking time.
- Optional, explicitly requested HIBP lookup. Only a five-character SHA-1 prefix is transmitted, with response padding. A negative result is not a guarantee of safety.
- Encrypted JSON backups, previewed imports, duplicate skipping and encrypted recovery snapshots.
- Autofill with explicit account selection in an extension-owned confirmation window. Matching is exact by scheme, hostname and port. It never submits the website form automatically.
- Save/update suggestions captured at form submission, held only in trusted session storage for at most five minutes and shown as a badge/popup suggestion. The user confirms only after checking that the website accepted the credentials.
- Chrome Sync controls for immutable encrypted generations, explicit conflicts, merge/download, retry and history compaction, with known limitations described below. Normal credential saves commit locally before remote publication; mode changes and resolution use different ordering.
- Revocable biometric/passkey unlock using a verified WebAuthn assertion and PRF-wrapped vault key. Unsupported authenticators use the master password; there is no local-secret or verify-only bypass.

The popup contains all settings; there is no separate Options page. The same management page can be opened in a browser tab for longer operations. Native authenticator prompts can close a toolbar popup on some systems; use a management tab if this occurs.

## Sync and recovery

Preferences remain device-local. Normal credential writes commit to IndexedDB before publication; a publication error records a pending status. Mode transitions and local recovery cross distinct storage areas, so full multi-store reconciliation remains an acceptance gap. Pending status is now derived from a durable IndexedDB outbox tied to the local revision.

Chrome Sync has 102,400 bytes total storage, 8192 bytes per item, 512 items, and write-rate limits ([Chrome documentation](https://developer.chrome.com/docs/extensions/reference/api/storage#property-sync)). The current preflight checks a conservative total of 95,000 bytes, per-item size and item count; write-rate errors remain pending and use retry backoff. Full encrypted versions coexist during publication: a vault that initially fits can fail on its next update, even after compaction. The local 3 MB capacity is not a promise of equivalent Sync capacity.

Remote updates are not automatically adopted when a local vault exists. An unseen remote head blocks editing until explicit resolution; reads/autofill can still use the older local data. Manual inspection lists valid versions alongside incomplete/corrupt-version warnings; automatic mutation and compaction still refuse an ambiguous history. Turning Sync off permits continued local work when the local copy is usable, and off-mode Retry/compaction are rejected; selected-version local restore does not publish.

Restoring a selected version now acts locally and disables Sync without publishing. Combining validates the final payload, preserves the destination password and leaves unselected heads unresolved. These improvements are covered by local/legacy tests; the new Drive protocol is still a release gate.

Compaction traverses published ancestry and retains current remote heads. It does not reclaim abandoned chunks, reduce the current ancestry metadata, or guarantee enough room for another full version. The local Sync recovery archive holds at most 20 records; export and clearing are explicit actions. Legacy-format records are inventoried even when version 2 generations coexist.

Five previous local encrypted records are retained automatically. A successful snapshot restore creates a new local revision, disables Sync and activates the restored vault. The settings toggle/status refreshes afterwards. Recovery exports contain historical local records and archived Sync versions, not necessarily the current vault. They use each record's historical master password. The UI exports individually restorable snapshots. Large aggregate legacy files still require the planned streaming migration reader.

Normal encrypted exports use a separate backup password of at least 12 characters. The guided import supports an empty profile or an unlocked existing vault, previews new/identical/conflicting entries and confirms keep-both/skip/replace decisions against a stable destination revision. Clear Vault removes current entries and publishes that change when Sync is enabled, while retaining recovery history.

Changing the master password rotates the live key and revokes local biometric setup. Historical snapshots, exports and remote copies retain their historical protection. Erase this device attempts to delete the local vault, history, preferences and biometric data; remote copies remain. Local erasure can be explicitly confirmed without decrypting damaged data; it does not consult remote storage. No all-device remote-erasure workflow is implemented.

These limitations are tracked individually as SD01–SD23 and UX01–UX07 in the [current review](docs/REVIEW_SETTINGS_SYNC_DATA.md). Keep independent encrypted backups and verify restoration with disposable data before relying on a recovery workflow.

## Security and permissions

See [SECURITY.md](SECURITY.md) for the threat model and migration behavior and [ARCHITECTURE.md](ARCHITECTURE.md) for module boundaries.

| Permission | Purpose |
|---|---|
| `storage` | Encrypted Sync records, local preferences and volatile session state; access restricted to extension contexts |
| `activeTab` | Suggest the current website when the user opens the popup |
| `alarms`, `idle` | Session deadline and OS-lock detection; expiring save suggestions |
| `offscreen` | Central clipboard operations independent of popup lifetime |
| `clipboardWrite`, `clipboardRead` | Copy and best-effort clear only if the clipboard still matches the last SecurePass copy |
| HIBP host permission | Send padded hash-prefix lookups after user request |
| HTTP/HTTPS content scripts | Discover password fields and receive only an explicitly approved credential for the original document |

Clipboard cleanup is best effort: browser shutdown, permissions, sleep or OS behavior may delay/prevent it. No clipboard value is persisted. Local storage holds encrypted vault/recovery records and device-specific biometric metadata. While unlocked, a data encryption key exists in restricted, in-memory `chrome.storage.session`; the master password is never saved there.

## Development and checks

The extension itself needs no installation or build. Development checks use Node 18+ and development-only dependencies:

```sh
npm ci
npm run check
npm test
npx playwright install chromium
npm run test:browser
npm run test:sync-browser
npm run test:settings-browser
git diff --check
```

Browser checks use fresh disposable profiles and fictional credentials. The Sync browser test uses two real browser profiles with an emulated transport; it does not sign in to Google. The biometric browser test uses a virtual PRF authenticator; real Windows Hello/Touch ID/security-key checks remain separate. See [docs/VALIDATION.md](docs/VALIDATION.md).

The [original review](docs/REVIEW_PHASE1.md) is a historical baseline. [Implementation tracking](docs/IMPLEMENTATION.md) distinguishes the first implementation from the open [settings/Sync/data review](docs/REVIEW_SETTINGS_SYNC_DATA.md). The [complete recommended plan](docs/SYNC_DATA_PLAN.md) specifies local encrypted storage with optional Drive synchronization, second-device setup, master-password scenarios, recovery, migration and 58 acceptance scenarios. It is a future design, not functionality available in version 0.2.0.

Licensed under the [MIT License](LICENSE).
