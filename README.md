# SecurePass

SecurePass is a Manifest V3 Chrome extension for generating passwords, checking known breaches and managing an encrypted local vault. It runs as JavaScript ES modules with no build step or runtime dependencies.

Requires Chrome 122 or later. PRF unlock additionally requires a PRF-capable authenticator. Incognito, file URLs, cross-origin frames and fields inside website shadow roots are outside the current support scope.

## Run the extension

1. Open `chrome://extensions`, enable Developer mode and select **Load unpacked**.
2. Choose this repository directory and pin SecurePass.
3. After editing, reload the extension and refresh the affected websites.

The local vault supports up to 5,000 entries and 3 MB of credential JSON, keeping encrypted backups within the 5 MB import limit.

Create a vault with a master password of at least 12 characters. The password is preserved exactly, including spaces, Unicode and symbols. Losing the master password and access to a configured PRF authenticator means losing access; there is no server-side recovery.

## Features

- Local vault: create, unlock, search, add, edit, remove, change the master password and lock.
- Automatic locking after the configured period without vault interaction, on OS lock and when the last browser window closes. The session survives normal service-worker suspension, but not browser restart or extension reload.
- Generator with selected character sets, exclusions, length bounds and a bounded subset of website patterns. Unsupported or impossible rules produce an explicit error.
- Local strength heuristic. Its random-character entropy bound is not an estimate of human-password strength or cracking time.
- Optional, explicitly requested HIBP lookup. Only a five-character SHA-1 prefix is transmitted, with response padding. A negative result is not a guarantee of safety.
- Encrypted JSON backups, previewed imports, duplicate skipping and encrypted recovery snapshots.
- Autofill with explicit account selection in an extension-owned confirmation window. Matching is exact by scheme, hostname and port. It never submits the website form automatically.
- Save/update suggestions captured at form submission, held only in trusted session storage for at most five minutes and shown as a badge/popup suggestion. The user confirms only after checking that the website accepted the credentials.
- Chrome Sync with immutable encrypted generations, local-first saves, explicit conflicts, merge/download, retry and history compaction.
- Revocable biometric/passkey unlock using a verified WebAuthn assertion and PRF-wrapped vault key. Unsupported authenticators use the master password; there is no local-secret or verify-only bypass.

The popup contains all settings; there is no separate Options page. The same management page can be opened in a browser tab for longer operations. Native authenticator prompts can close a toolbar popup on some systems; use a management tab if this occurs.

## Sync and recovery

Enable Chrome Sync in settings only after making an encrypted backup. Preferences remain device-local. Vault writes commit locally first; a failed remote publication is displayed as **Sync pending**, with a Retry action. Chrome Sync is small (approximately 100 KB total); a large vault can remain local even when it does not fit remotely.

Different devices publish independent encrypted generations. Offline edits are kept as conflicting versions rather than silently overwriting one another. Refresh remote versions and explicitly download one or merge it with the unlocked local vault. The remote version's master password protects the resolved vault. Conflicting IDs are retained as separate entries; review them afterwards.

Compaction removes only published ancestor generations and retains current heads. Current remote heads are preserved locally before resolution/compaction, either as the live local record or in an encrypted archive. The archive can be exported and explicitly cleared after master-password confirmation. Export encrypted recovery snapshots before changing storage or compacting. An incomplete/corrupt remote generation blocks editing through Sync; disable Sync to continue with the local copy and retain the remote evidence.

Five previous local encrypted records are retained automatically. Settings provides export and restore actions. Restoring a snapshot creates a new local vault revision and disables Sync. Recovery exports contain encrypted vault snapshots, not plaintext credentials, and can be imported through Import Vault. A snapshot needs the master password it had at the time it was created.

Changing the master password rotates the live vault key and revokes this device's biometric wrapper. Historical backups/snapshots remain encrypted under their historical passwords. **Erase this device** deletes local vault, recovery, settings and biometric data after master-password confirmation; it deliberately leaves remote Sync copies on other devices.

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
git diff --check
```

Browser checks use fresh disposable profiles and fictional credentials. The Sync browser test uses two real browser profiles with an emulated transport; it does not sign in to Google. The biometric browser test uses a virtual PRF authenticator; real Windows Hello/Touch ID/security-key checks remain separate. See [docs/VALIDATION.md](docs/VALIDATION.md).

The original review is preserved at [docs/REVIEW_PHASE1.md](docs/REVIEW_PHASE1.md); remediation tracking is at [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md).

Licensed under the [MIT License](LICENSE).
