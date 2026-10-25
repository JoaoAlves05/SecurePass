# Validation and release checklist

All automated scenarios use fictional data and disposable browser profiles. No real vault, master password or export is required.

## Settings frontend refinement — 2026-10-25

The [frontend review and evidence](SETTINGS_FRONTEND_REVIEW.md) records the category-based settings navigation, accessible theme/range controls, save feedback, popup/tab layouts and focus corrections. Validation: 57 Node tests, 73 checked modules, the settings browser journeys and the general browser/virtual-PRF suite passed. Screenshots cover the revised light/dark management page and popup. This frontend increment does not close the underlying transport/protocol acceptance gates.

## Current settings/data increment — 2026-10-25

The [implementation evidence](SETTINGS_UX_IMPLEMENTATION.md) records 57 passing Node tests, 72 checked modules, the new management/backup/recovery browser journeys and the existing browser/virtual-PRF and emulated Sync suites. The [design](SETTINGS_UX_DESIGN.md) maps all 58 scenarios; design coverage is not runtime acceptance. Drive OAuth/protocol, recovery kit, physical hardware and independent review remain gates.

Run `npm run test:settings-browser` for the new flows and screenshots. Existing `test:browser` overwrites phase-1 screenshots; preserve preexisting fixtures when checking a dirty tree.

## Historical review evidence — 2026-10-24, documented 2026-10-25

Baseline: version 0.2.0, commit `e97f4c6558be23e50016a9b473441ce4c431490a`. No production edits were made in the review or the documentation update. [SD01–SD23](REVIEW_SETTINGS_SYNC_DATA.md) are still open. Passing the baseline suite is not acceptance of these findings.

| Check | Recorded result | Boundary |
|---|---|---|
| `npm test` | 38 passed, 0 failed | Node tests with real Web Crypto, simulated Chrome and fake IndexedDB; missing SD regressions remain. |
| `npm run check` | 65 modules passed | Syntax/import/cycle/version checks, not runtime behavior. |
| `npm run test:sync-browser` | Passed | Two Chromium profiles, emulated key transport; no Google authentication. |
| Additional restore UI scenario | Reproduced SD12 | Real Chromium: stored mode off, toggle/status still on after restore. |
| Isolated exploratory scenarios | Reproduced defects | Merge notes, multiple heads, off-mode Retry, preference race, capacity deadlock, archive size, wipe dependency and deadline; see review. |
| `git diff --check` | Passed | Whitespace only. |
| General browser suite / packaging | Not rerun in this review | Earlier results below remain historical. |

Exploratory scripts were executed directly and were not added to the repository. Their repeatable scenario specifications and acceptance requirements are in the current review. Add them as persistent regressions before closing findings. In particular, measured manifest size above 8192 bytes was demonstrated with simulated storage; rejection/recovery by Chrome's actual per-item quota remains to be tested.

## Historical implementation result — version 0.2.0

- `npm test`: 36 passed, 0 failed.
- `npm run check`: 65 JavaScript modules checked; valid syntax/imports, no import cycles, consistent version.
- `npm run test:browser`: passed with Chromium 141 and a virtual PRF authenticator, including origin/document isolation, save suggestions after navigation, clipboard ownership checks and PRF revocation.
- `npm run test:sync-browser`: passed with two isolated Chromium profiles and emulated transport.
- `npm run package`: generated `dist/SecurePass-0.2.0.zip` from runtime files only.
- `git diff --check`: passed.

## Run the existing checks

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

`npm run package` requires Python 3 only for ZIP creation. It includes an allowlist of extension runtime directories and security/license documentation; it excludes development dependencies, tests, profiles and credentials. The extension itself still runs unpacked without a build or dependency installation. Links from packaged `SECURITY.md` to `docs/` refer to the source checkout; the runtime ZIP excludes those developer documents.

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

Screenshots from the fictional browser fixture are in [screenshots](screenshots/). They never reveal a real secret. `npm run test:browser` rewrites the tracked screenshot fixtures; do not overwrite preexisting screenshot work accidentally.

## Missing acceptance for settings, Sync and Data Management

The existing coverage list above describes exercised scenarios, not exhaustive correctness. The current [review](REVIEW_SETTINGS_SYNC_DATA.md) specifies the missing regression for each SD identifier; the [complete plan](SYNC_DATA_PLAN.md) maps all identifiers to work phases and defines SC01–SC58 as required acceptance scenarios. These are specifications, not executed tests. The plan includes wrong/different master passwords, fresh profiles, existing independent vaults, administrative key conflicts, recovery kits and device revocation.

Required additions include boundary merge validation; three-head resolution; off-mode publication denial; exact quotas and history-full recovery; preference/transition races; restart at each persistence boundary; partial/corrupt transport isolation; legacy inventory; complete recovery export/import round trips; import into an empty profile; conflict previews; stable snapshot selection; corrupt-device erasure; preference rollback; immediate deadline updates; and UI refresh/cancellation across contexts.

Use simulated fault injection for deterministic interleavings and real browser checks for quota/UI/service-worker behavior. Authenticate real disposable Google profiles only for the transport acceptance stage. Hardware acceptance remains separate. Do not mark an SD closed solely because `npm test` or the emulated transport suite passes.

## Hardware/platform checks before distribution

These checks cannot be substituted by the virtual authenticator or emulated transport:

1. On each supported OS/authenticator combination: register, cancel, fail user verification, unlock, restart Chrome, rotate the master password, revoke and re-register. Confirm unsupported PRF returns a useful error and stores no fallback secret. Keep disposable credentials and a known master password.
2. On two Google-signed-in Chrome profiles: enable Sync, receive a new vault, disconnect both devices, edit independently, reconnect and explicitly merge. Verify quotas, delayed chunk delivery and remote recovery exports.
3. Copy with 30/60/120-second cleanup and with cleanup disabled. Copy unrelated user text before the timeout and verify it remains. Check sleep/wake and browser shutdown. Cleanup is best effort; do not promise precise timing.
4. Load the ZIP contents as an unpacked release package, close DevTools and verify timeout, worker suspension and browser restart. No unlock state should survive extension reload/browser restart.
5. Use keyboard and a screen reader through dialogs/settings. Check 400px popup layout, light/dark/system theme, zoom, website SPA rerenders, registration and change-password forms. Iframes and website shadow-root fields are not currently supported.
6. Keep an encrypted backup before upgrading an old installation. Verify migration, export/import into a fresh profile, restoring a historical snapshot and explicit local device erasure.

Passing automated checks means the implementation's tested boundaries and regressions work; it does not constitute an independent security certification or physical-device compatibility claim.
