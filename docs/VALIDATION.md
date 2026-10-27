# Validation and release checklist

All automated scenarios use fictional data and disposable browser profiles. No real vault, master password or export is required.

## Checkpoint card summaries — 2026-10-27

Checkpoint cards now show aggregate counts without website, username or changed-field examples. Account identities and explicit **Different fields** labels remain inside **Review checkpoint**. The full-restore section and current-only rows explain removal of entries added since the checkpoint. **npm run check** passed for 93 JavaScript modules; **npm run test:checkpoints-browser** passed, including summary/detail separation, per-entry and whole-vault recovery, stale comparisons, lock cleanup, search/pagination and light/dark layouts down to 320 × 480. The nine checkpoint-review captures were refreshed and visually inspected. **git diff --check** passed. This copy/layout change does not add evidence of physical-authenticator or actual toolbar compatibility.

## Account suggestions and inline tools — 2026-10-27

[The account-prompt contract](ACCOUNT_PROMPTS.md) explains submission-triggered proposals and the redesigned popup suggestion, closed-shadow key menu and extension-owned confirmation. Proposals remain temporary and never establish login success. Save/update is explicit, same-origin and revision-checked, with notes/identity preserved. Cancellation retains the proposal; dismissal, successful save, expiry and vault lock remove it. Known identical logins are suppressed, including redundant proposals discovered after unlock. Master input and PRF remain outside the visited page. Public presentation settings are available to auth; private management and whole-vault disclosure remain forbidden.

Validation: **133 Node tests passed**, **93 JavaScript modules checked**, and dedicated account-prompt, general browser/virtual-PRF, settings and guided Chrome Sync suites passed. New regressions cover proposal bounds/deduplication/expiry, source document binding, concurrent review/confirmation, exact update targets and notes preservation, stale revisions, transaction rollback/retry, post-commit session failure, one-shot fill, native-close/expiry cleanup, existing-login suppression and public capability boundaries. Concurrent public status/list/Sync reads no longer revoke an in-flight save or block local erasure. Chromium exercises clear-on-submit and real form navigation, live popup updates, new/update/cancel/dismiss, username correction, stale-review recovery, generation from registration/change fields and confirmation synchronization, copy, current-password protection, Escape/outside/scroll/removal, actual virtual PRF enrollment plus cancellation in the dedicated window, fresh-vault setup with separate save, expired requests and already-saved state. Narrow light/dark captures and primary-action contrast checks are retained under `screenshots/account-prompts/`; unrelated generated fixtures are restored. The design detector ran with inherited popup/font/palette/focus-ring warnings; the new auth primary action also has a direct browser contrast regression. Whitespace checks passed.

All scenarios use fictional accounts and local disposable pages. No real login to the reported site was performed. Actual toolbar sizing, physical authenticators, real SSO sites, operating-system/screen-reader matrices and existing iframe/shadow-field limitations remain manual acceptance boundaries.

## Guided Chrome Sync setup and receipt evidence — 2026-10-27

[The implemented setup contract](CHROME_SYNC_SETUP.md) replaces “Legacy automatic publication” with Configure Chrome Sync and Send changes automatically. Browser preparation, read-only copy/capacity inspection and a separate activation confirmation precede publication. Remote restore/combine decrypt to a count comparison, then require a second confirmation with owner/session/source/destination-bound, expiring, single-use review grants. An independently complete selected version can be restored locally alongside an unrelated incomplete generation. Setup/publication refuse versions without conservative two-version capacity; failed initial local transactions leave publication off. Explicit history cleanup is available while sending is off and preserves active/unreferenced copies; old-format copies require exact-content adoption before retirement.

The optional cross-installation test uses expiring random metadata and explicit matching-code confirmation. A receipt can acknowledge the exact encrypted revision and digest present on the receiver. Same-profile, mismatched, expired or incomplete-version confirmations are rejected. Historical receipt wording survives later edits without claiming delivery of the new revision. Diagnostic metadata never authorizes vault access.

Validation: **117 Node tests passed**, **89 JavaScript modules checked**, and the dedicated guided-setup, general browser/virtual-PRF, settings and two-profile emulated Sync suites passed. Regressions cover read-only/cancelled setup, changed remote heads, conservative capacity and vault growth, failed initial local commits, owner/mode/source/destination/session/expiry/replay/clock-rollback checks, valid mixed-generation restore, exact old-format adoption and diagnostic receipt checks. Chromium opens real browser settings, checks explicit activation/cancellation, remote comparison/cancellation, mixed-generation restore, matching-code reception, stale receipt wording, capacity refusal and a 320px dark layout. Three new captures are under `screenshots/sync-setup/`; unrelated generated fixtures were restored. The design detector ran with broader existing popup warnings, which are not evidence of functional defects in the new flow. `git diff --check` passed.

The host clock was observed moving backwards by approximately 13.5 seconds, which correctly triggered recent-authentication/preview rejection in intermediate Node runs. The simulated Chrome helper now derives ordinary test time from a monotonic clock; explicit expiry and rollback tests continue to override `Date.now`. Production authentication timing is unchanged.

The cross-profile transport is deliberately emulated. Google-authenticated delivery, actual toolbar popup sizing and physical authenticators remain manual acceptance checks. A successful storage API call does not prove cloud delivery; an observed diagnostic exchange is time-limited evidence, not device authorization or a guarantee of future delivery. No new extension/account permissions were introduced.

## Recent authentication for checkpoint restore — 2026-10-27

Whole-checkpoint restore now requires password or verified PRF authentication less than five minutes old, independently of inactivity. Backend preview and commit enforce the window; the legacy local-checkpoint endpoint also rejects stale authentication. Activity, edits, imports and recovery preserve the authentication timestamp. Individual recovery retains the active-session confirmation flow. Verification that fails or is cancelled makes no recovery changes; successful verification leads to a fresh comparison and explicit restore confirmation. Submission refreshes its scoped preview and source/destination checks, including after a long-open confirmation. The unlock/identity dialogs retain compact 320px layouts and expose biometrics only when configured. See [the authentication contract and captures](CHECKPOINT_REVIEW.md).

Validation: **106 Node tests passed**, **85 JavaScript modules checked**, and recovery-UI, checkpoint, general browser/virtual-PRF, settings, backup-dialog and two-profile emulated Sync suites passed. Added regressions cover the exact five-minute boundary, missing/invalid timestamps, failed password/PRF authentication, keep-alive/write/recovery preservation, the legacy endpoint, owner/replay protections and authentication expiry at confirmation. A preview requiring verification cannot become authorized after clock rollback. Browser journeys cover password retry/cancel, PRF cancel/success, expired confirmation previews, explicit confirmation after authentication, unchanged contents on cancellation and current biometric setup preservation. Three new identity captures are retained; unrelated generated screenshots were restored. The design detector and whitespace check passed. Physical authenticators, actual toolbar popup sizing and Google-authenticated Sync remain separate manual acceptance checks.

## Authentication method row — 2026-10-27

The vault unlock, scoped unlock dialog and master-password identity form now place an accessible icon-only fingerprint button beside the password field. The field and button share a 40px height and 8px gap; password reveal stays inside the field. Without configured biometrics the password field uses the whole row. Cancel/Unlock or Continue actions remain below. No authentication, authorization or key-handling code changed.

Validation: 85-module check plus general browser, settings and recovery-UI suites passed. Recovery checks verify actual rendered dimensions/alignment and full-width fallback, retain at least 100px for password text at 320px viewport width, exercise virtual-PRF unlock/cancel, and inspect all three authentication surfaces. Captures in `screenshots/recovery-ui/` include the moved modal shortcut and new main-vault/master-identity views. Unrelated generated fixtures were restored. The design detector ran with existing broader popup findings. Earlier Node/security evidence remains historical; physical authenticators and real toolbar sizing remain manual acceptance checks.

## Compact recovery presentation — 2026-10-27

User feedback requested smaller, cleaner extension cards. Unlock now has a single action row with Cancel, Unlock and a labelled fingerprint icon; the same fingerprint symbol appears in the other biometric controls. Pending state preserves the icon. Both unlock and recovery confirmations retain the extension context beneath a consistent dimmed backdrop; the old full-screen gradient is removed for unlock. Full restore confirms the saved-entry total and removal count, without repeating the comparison list or date. Password/biometric preservation and checkpoint/Sync effects remain explicit.

Validation: 85-module check and general browser, checkpoint, backup-dialog and recovery-UI suites passed. The recovery scenario also asserts compact card heights, fingerprint retention while verifying, cancellation, cleared secrets and popup/tab light/dark layouts at 320 × 480 and above. Captures in `screenshots/recovery-ui/` were refreshed; unrelated generated baseline captures were restored. The design detector ran with existing broader popup findings. Backend code is unchanged; the earlier 100-test Node evidence is historical and was not rerun for this presentation-only pass. Hardware authenticator and actual toolbar sizing remain manual acceptance checks.

## Recovery surfaces — 2026-10-26

The unlock form now stays open on authentication errors, clears submitted passwords, prevents duplicate submissions and cancels pending biometric ceremonies on dismissal. Checkpoint comparison uses a compact header, domain/account rows, nonzero summary counts and a lower-priority full restore. Recovery, legacy-checkpoint unlock, history removal and saved-version dialogs share bounded geometry; full restore highlights nonzero removals and keeps its actions outside the scrolling body.

Validation: **100 Node tests passed**, **85 JavaScript modules checked**, and general browser (virtual PRF), checkpoint, settings, backup-dialog and new `npm run test:recovery-ui-browser` suites passed. The new scenario exercises wrong-password retry, cancel, cleared secrets, actual virtual-PRF cancellation/success and light/dark popup/tab layouts, including 320 × 480. Captures are under `screenshots/recovery-ui/`; unrelated generated fixtures were restored. The Impeccable detector ran: broader existing palette/font/contrast findings remain; its dialog-padding finding is checked visually against the padded header/body/footer. No backend cryptography, recovery authorization or Sync transport contract changed. Physical authenticator/toolbar checks and signed-in Sync acceptance remain outstanding as below.

## Checkpoint review interaction — 2026-10-26

The [review refinement](CHECKPOINT_REVIEW.md) gives each local card one Review checkpoint entry point. An inline comparison offers per-entry recovery with short confirmation, search, optional matching entries and pagination. Full restore is a secondary action at the bottom with its own confirmation. Actions acquire fresh scope-specific tokens and compare source/destination identity with the displayed state; stale views require refresh. Lock/close clears the comparison.

Validation: **100 Node tests passed**, **83 JavaScript modules checked**, and the dedicated checkpoint, settings and backup-dialog Chromium suites passed. The checkpoint journey additionally covers per-row confirmation/cancellation, stale state and refresh, search/Escape/back, matching and empty comparisons, 65-entry pagination, untrusted username rendering and lock cleanup. New captures are under `screenshots/checkpoint-review/`; unrelated generated baseline fixtures were restored. The design detector ran with broader pre-existing findings recorded in the review notes. `git diff --check` passed. General autofill/PRF and two-profile Sync suites were not rerun for this interaction-only refinement; previous evidence below remains historical.

## Recovery checkpoints — 2026-10-26

The [checkpoint implementation and evidence](CHECKPOINTS.md) delivers three local content states, individual-entry recovery, reviewed full restore, current-password/biometric preservation, atomic live/history re-encryption on master-password change, explicit migration of older protection and local-history deletion. Cards show sequence/date, entry counts and differences only while unlocked. Archived Sync copies are separately identified and exported by source, even when they share a local revision ID.

Validation: **100 Node tests passed**, **82 JavaScript modules checked**, `npm run test:checkpoints-browser`, `npm run test:settings-browser`, `npm run test:backup-dialogs-browser`, `npm run test:browser` (virtual PRF) and `npm run test:sync-browser` passed. Coverage includes retention/no-op saves, preservation across local/external/remote recovery, PRF-authorized history rotation, transaction abort, legacy-key migration, preview integrity/expiry/owner/concurrency, scoped deletion, privacy on lock and popup/tab light/dark layouts. New captures are under `screenshots/checkpoints/`; unrelated generated baseline fixtures were restored. The design detector ran with existing broader base-popup findings documented in the implementation notes. `git diff --check` passed.

The three-state policy prunes older local history on read/write. Historical remote/archive/exported copies remain outside local re-encryption. Physical PRF, actual toolbar sizing and Google-authenticated transport remain manual acceptance gates; these automated results do not establish release acceptance.

## Inline master-password and management layout — 2026-10-26

The [inline flow and authorization contract](MASTER_PASSWORD_FLOW.md) replace the preliminary unlock plus modal with fresh identity verification, new password/confirmation and an in-place result. Either the current password or a fresh purpose-bound PRF ceremony can authorize rotation. Grants expire after two minutes, are single-use and bound to the client/document, vault revision/key epoch and lock revocation. The UI warns before biometric revocation and offers optional setup again. The management tab now has its own layout stylesheet and bounded form/control proportions.

Validation: **84 Node tests passed**, **78 JavaScript modules checked**, `npm run test:settings-browser` and `npm run test:browser` passed. Settings checks include actual Chromium virtual PRF rotation without the old password, biometric revocation, inline error/cancel/lock cleanup, focus and light/dark popup/tab layouts from 320 to 1600 px. The resize matrix waits for the media-query navigation listener before interacting. New master-password captures and updated relevant settings fixtures are linked from the flow document; unrelated generated fixtures were restored. The Impeccable detector ran, with remaining broader base-popup findings documented there.

Physical PRF authentication and actual toolbar popup sizing remain manual checks; disposable extension pages and virtual authenticators do not establish those results. This increment does not close Sync/Drive or other release gates. No commit or push was requested.

## Current backup dialog refinement — 2026-10-26

The [export/restore UI refinement](BACKUP_DIALOGS_UI.md) improves the extension popup and management dialogs with selected-version metadata, password help and reveal controls, explicit recovery effects, fixed visible actions, pending states and clearer errors. Earlier-version export now includes a version review before downloading. The dedicated `npm run test:backup-dialogs-browser`, existing settings/browser suites and 75-module check passed. New captures live under `screenshots/backup-dialogs/`; unrelated generated baseline screenshots were restored. Backend test evidence and acceptance limits remain those recorded below.

## Current Backups/recovery and Advanced review — 2026-10-26

The [functional review](REVIEW_BACKUP_ADVANCED.md) records reproduced defects and fixes for import identity/deduplication, unchanged imports, remote divergence, local access during remote outages, resumable local recovery, confirmed erasure with an unreadable database, interrupted deletion, selected remote adoption and concurrent retry suppression. Added 18 Node regressions and Chromium journeys for malformed files, failed remote inspection and encrypted reimport without consuming history.

Validation: **75 Node tests passed**, **74 JavaScript modules checked**, `npm run test:settings-browser`, `npm run test:browser` (including virtual PRF) and `npm run test:sync-browser` passed. The two-profile Sync scenario emulates transport. The graph was refreshed after source/document changes; generated baseline screenshots were restored after the runs. `git diff --check` passed.

This does not establish authenticated Google transport, physical PRF hardware, every failure/interleaving or full distributed transition recovery. Legacy capacity deadlock, large aggregate archive migration and the proposed Drive/device protocol remain outside acceptance. See the review's limits and manual steps.

## Previous hierarchical Settings navigation — 2026-10-25

The [hierarchical navigation revision](SETTINGS_NAVIGATION.md) replaces Settings tabs with a popup category list/detail pages and a persistent sidebar in wide management tabs. Existing controls and authentication/data flows are retained. Checks passed: 57 Node tests, 73 checked modules, the expanded settings browser scenario, the general browser/virtual-PRF suite, and the two-profile emulated Sync suite. Navigation regressions cover keyboard activation, back/Escape, browser history, scroll/focus, legacy fragments, reload, tab transfer, responsive modes and light/dark layouts at 320–1200px. The cache status no longer collapses into one character per line. Current screenshots and reproducible manual checks are linked in the revision report. These are executed disposable scenarios; physical authenticator, authenticated transport and protocol acceptance remain separate.

## Previous four-area Settings revision — 2026-10-25

The [four-area revision](SETTINGS_FOUR_AREAS.md) reuses the extension's existing styling, removes the device overview/section combobox and supplies direct General/Security/Backups/Advanced tabs. Validation passed: 57 Node tests, 73 checked modules, the general browser/virtual-PRF suite and expanded settings journeys including light/dark popup/full-tab layouts, real backup/version downloads, local/archive recovery, reset/cache/entry/archive cleanup, master-password rotation and local erasure. These are disposable automated scenarios; underlying protocol and hardware acceptance limits remain.

## Previous Settings frontend refinement — 2026-10-25

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
