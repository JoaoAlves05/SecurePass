# Validation and release checklist

All automated scenarios use fictional data and disposable browser profiles. No real vault, master password or export is required.

## Recorded automated result — version 0.2.0

- `npm test`: 36 passed, 0 failed.
- `npm run check`: 65 JavaScript modules checked; valid syntax/imports, no import cycles, consistent version.
- `npm run test:browser`: passed with Chromium 141 and a virtual PRF authenticator, including origin/document isolation, save suggestions after navigation, clipboard ownership checks and PRF revocation.
- `npm run test:sync-browser`: passed with two isolated Chromium profiles and emulated transport.
- `npm run package`: generated `dist/SecurePass-0.2.0.zip` from runtime files only.
- `git diff --check`: passed.

## Reproduce

```sh
npm ci
npm run check
npm test
npx playwright install chromium
npm run test:browser
npm run test:sync-browser
npm run package
git diff --check
```

`npm run package` requires Python 3 only for ZIP creation. It includes an allowlist of extension runtime directories and security/license documentation; it excludes development dependencies, tests, profiles and credentials. The extension itself still runs unpacked without a build or dependency installation.

## Automated coverage

- Exact secret/notes round trips, wrong master passwords and explicit initialization.
- Concurrent mutations, operation revocation during encryption, failed IndexedDB access and abort after request success.
- Restricted session restoration after worker-module restart and deadline enforcement independent of alarms.
- Master-key rotation, biometric revocation and legacy-format migration with original encrypted recovery snapshot.
- Backup decryption, wrong passwords, corruption/unsupported formats, KDF cost limits and duplicate import policy.
- Generator selected groups, exclusions, exact length, bounds, unsupported patterns and invalid numeric input.
- Message capabilities, management pages opened in tabs, exact origin matching and unbound documents.
- Verified ECDSA WebAuthn enrollment/authentication with synthetic signed assertions: missing PRF, owner mismatch, invalid challenge, replay, expiry and revocation.
- Immutable Sync publication failures, incomplete generations, offline sibling heads, mode transitions, pending local changes, retry, compaction and preservation of conflicting entries.
- HIBP padded hash-prefix requests, exact password hashing, padding count zero and optional-cache storage failure.

The Chromium scenario exercises startup, popup rendering, origin-bound autofill, no automatic submit, master input isolated from website keyboard listeners, stale-document rejection, trusted save suggestions, repeated offscreen clipboard copying, conditional cleanup, encrypted backup operations and native WebAuthn with a virtual PRF authenticator.

The two-profile Chromium scenario copies immutable Sync keys between separate browser profiles as an emulated transport. It tests first-device download, independent offline writes, explicit conflict blocking, merge, re-download and compaction through the real extension APIs. It does not authenticate to Google's Sync servers.

Screenshots from the fictional browser fixture are in [screenshots](screenshots/). They never reveal a real secret.

## Hardware/platform checks before distribution

These checks cannot be substituted by the virtual authenticator or emulated transport:

1. On each supported OS/authenticator combination: register, cancel, fail user verification, unlock, restart Chrome, rotate the master password, revoke and re-register. Confirm unsupported PRF returns a useful error and stores no fallback secret. Keep disposable credentials and a known master password.
2. On two Google-signed-in Chrome profiles: enable Sync, receive a new vault, disconnect both devices, edit independently, reconnect and explicitly merge. Verify quotas, delayed chunk delivery and remote recovery exports.
3. Copy with 30/60/120-second cleanup and with cleanup disabled. Copy unrelated user text before the timeout and verify it remains. Check sleep/wake and browser shutdown. Cleanup is best effort; do not promise precise timing.
4. Load the ZIP contents as an unpacked release package, close DevTools and verify timeout, worker suspension and browser restart. No unlock state should survive extension reload/browser restart.
5. Use keyboard and a screen reader through dialogs/settings. Check 400px popup layout, light/dark/system theme, zoom, website SPA rerenders, registration and change-password forms. Iframes and website shadow-root fields are not currently supported.
6. Keep an encrypted backup before upgrading an old installation. Verify migration, export/import into a fresh profile, restoring a historical snapshot and explicit local device erasure.

Passing automated checks means the implementation's tested boundaries and regressions work; it does not constitute an independent security certification or physical-device compatibility claim.
