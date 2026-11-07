# Settings UX implementation and evidence

Original increment: 2026-10-25 on `feature/settings-data-management`. Documentation reconciled on 2026-11-07; the baseline evidence below remains historical. Work item: [local issue](issues/SETTINGS_UX.md). Design: [eight screens and SC01–SC58 map](SETTINGS_UX_DESIGN.md). Full target design: [Sync/data plan](SYNC_DATA_PLAN.md). This is an implemented local/legacy safety increment, not completion of the new Drive/security protocol or all 58 acceptance scenarios.

## Current delivery boundary — 2026-11-06

Code integrated in `main`: `f7fb780` and `82933d8`. The latest recorded code run passed **227 Node tests, the 132-module check and the dedicated Chromium three-way scenario**. Broader browser results remain dated by increment in [VALIDATION.md](VALIDATION.md); they were not all rerun after the planner addition. This documentation reconciliation does not execute runtime tests.

| Area | Delivered since the baseline | Still required |
|---|---|---|
| Google account access | Supplied public client configuration, management-only OAuth connection/disconnect and complete read-only app-folder inspection in a configured copy | Real Google authorization/inspection and account acceptance |
| Drive publication | Internal automatic mutation signatures, atomic vault/checkpoint/outbox, resumable upload and worker coordinator behind a false production review predicate | Reviewed format/nonces/bootstrap, full device/key lifecycle and production activation |
| Data convergence | Internal common-base planner, explicit edit/delete conflicts, stable keep-both IDs, capacity/session/revision guards and same-base permutation tests | Verified ancestry, persistent signed tombstones/provenance, rebase, resolution UI and full distributed convergence |
| Login | Anchored origin-isolated selector with username search, two accounts per page and protected fallback | Full real-site/SSO, hostile-visual, accessibility, hardware and OS acceptance |

The original local/legacy behavior and evidence follow. Their historical “still required” cells describe the 25/10 baseline; use the table above and [current checklist](IMPLEMENTATION_CHECKLIST.md) for subsequent deliveries. Full SC/AF acceptance remains separate from prototype and regression coverage.

## Delivered behavior — 2026-10-25 baseline

- One trusted bundled page supports the popup and a wider management tab (`popup/popup.html?manage=1`), preserving themes. Overview, Sync, backups, recovery, security, preferences and danger-zone actions are separated.
- Native accessible operation dialogs replace numeric prompts and browser confirmation boxes in settings/Sync/data paths. They provide explicit scope, selected identities, password reveal, inline errors, confirmation, cancellation and exclusivity. Legacy unlock supports existing biometric flow.
- New local creation requires at least 16 Unicode characters; existing short master passwords remain valid for unlock/migration. Backup passwords remain separate and require at least 12 characters. No new Google permission is requested while Drive is unavailable.
- Backup import works into an empty profile. Decryption and preview do not create/replace a vault. Preview counts new/identical/conflicting accounts and supports keep both, skip or replace. The server binds confirmation to source digest, destination revision, session generation and expiry; preview state stores no plaintext entries or passwords.
- Local imports/merges validate the whole resulting vault before commit. Conflicting copies receive unique IDs without overflowing notes. A local merge retains the destination key/password and resolves only the selected remote head. First legacy remote adoption requires the remote master password.
- Restoring a remote version is a local operation that disables Sync and does not publish. Local snapshots are selected by stable identity; old index-based callers remain compatibility-only. The previous encrypted local record is retained.
- Recovery exports select one snapshot per file, keeping outputs compatible with the 16 MiB file importer. Large aggregate legacy archives still need the streaming migration reader specified in the plan; they are not silently accepted or truncated.
- An encrypted local revision and pending-publication reference commit together in IndexedDB. Pending status derives from that outbox, not an unrelated boolean. Worker startup/alarms retry enabled legacy outbox work with persisted backoff; explicit off mode blocks retry/compaction/publication. Full distributed transition atomicity remains open.
- Ordinary settings use serialized, revision-checked patches excluding Sync mode. Load repairs invalid common preferences and reports repairs. Active timeout is recalculated from last activity; an already expired reduced timeout locks immediately.
- Automatic status while Sync is off avoids remote reads. Explicit inspection separates valid remote versions from incomplete/corrupt ones. Local history renders independently. Strict mutation/compaction still refuses an ambiguous remote state.
- Legacy publication checks total size, per-item size and item count, verifies existing chunks, repairs missing matching chunks and rejects same-revision different contents. A coexisting legacy-format record remains in the inventory. Chrome's fundamental two-full-version capacity limit remains a limitation.
- Local erasure can be explicitly confirmed without decrypting damaged/forgotten data and never reads/deletes remote data. Wipe revokes the session, prevents old HIBP requests repopulating cache, and best-effort clears only clipboard contents still owned by the extension. Physical secure erasure is not promised.
- HIBP shows cache occupation and provides clear. Reset affects preferences, not the vault or Sync mode.

## Executed checks — 2026-10-25 baseline

- Node regressions: **57 passed, 0 failed**, including 17 focused settings/data tests, one management-capability regression and one additional HIBP cache-barrier test beyond the prior 38-test baseline.
- Syntax/import/cycle/version check: **72 JavaScript modules passed**.
- `npm run test:settings-browser`: fresh-profile encrypted import, wrong password/no creation, confirmation mismatch, real conflict preview, stale destination rejection, full-length notes, stable local restore, effective Sync-off state, scoped erasure guard/cancel and management/popup rendering. Successful force-erasure/reload and local creation with mismatched/matching confirmation were also executed. Do not infer physical OS coverage from Chromium.
- `npm run test:sync-browser`: passed with real Chromium extension profiles and emulated transport under authenticated first-download/destination-key contracts.
- `npm run test:browser`: passed, including native virtual-PRF enrollment/unlock/revocation, origin-bound autofill and clipboard ownership. Existing phase-1 screenshot work is restored after running this script.
- Whitespace and local-document link checks run before handoff. New screenshots use separate filenames below.

Test names with SC references exercise the stated local/legacy aspects, not every condition of the full future scenario. For example, SC40 tests single-snapshot export, not a 256 MiB streaming legacy reader; SC29 tests durable outbox/retry, not the unimplemented Drive transaction protocol.

## Scenario coverage boundary — 2026-10-25 baseline

| SC group | Evidence in this increment | Still required for full target acceptance |
|---|---|---|
| SC01–SC02 | Local create and backup-based create; wrong confirmation does not create | Complete initial onboarding polish and user testing |
| SC03–SC13, SC58 | Legacy source-password validation, multiple-version selector, explicit local destination, no automatic discovery when off | Google OAuth/Drive discovery/enrollment/account switching and independent identity verification |
| SC14–SC21, SC26–SC27, SC46–SC47 | Existing master rotation/legacy unlock/virtual PRF regressions retained | Signed authorization protocol, key conflicts, recovery kit, device enrollment/revocation and bootstrap freshness controls |
| SC22–SC25, SC34–SC35, SC43 | Validated conservative selected-version merge, unselected-head preservation, capacity checks and existing ancestor compaction | Three-way merge/tombstones, authenticated checkpoints, stale-device rebase and generated convergence tests |
| SC28–SC33, SC57 | Matching chunk repair, durable outbox, startup/alarm retry/backoff, off-mode guards and local-first publication | Drive API error matrix, account-bound queue, resumable cloud operations and every interruption boundary |
| SC36–SC40 | Server-bound preview, source-password guard, fresh-profile restore, stable snapshot IDs, single-file recovery export | Large streaming legacy archives, exhaustive size/memory cases and batch export |
| SC41–SC42, SC52 | Local force-erasure confirmation without remote dependency, HIBP write barrier and owned clipboard cleanup | Remote deletion workflow, physical platform behavior and all asynchronous erasure interleavings |
| SC44–SC45, SC48–SC51, SC56 | Session generation regressions, immediate timeout, settings CAS, native dialogs, status reconciliation and management capability boundary | Cross-context/UI fuzzing, screen reader/hardware acceptance and expanded privilege regressions for future Drive handlers |
| SC53–SC55 | Legacy/v2 inventory and existing migration fixtures | New-format/Drive migration, late old-client writes and downgrade gates |

## Remaining release gates

Public Google client configuration has been supplied and a configured development copy exposes connection/read-only inspection. Real Google authorization is still unverified. There is no public production-publication activation or complete device enrollment/revocation/rotation, recovery kit, cloud deletion, migration or automatic distributed convergence. Internal transport/signing/merge modules do not close those gates.

No independent security audit, Google-authenticated transport acceptance or physical authenticator/OS matrix has been completed. The 23 original findings are a baseline: several are mitigated here, but the full plan is not accepted or closed. Remaining major items include legacy quota deadlock, abandoned-upload GC, complete multi-store transition recovery, automatic remote fast-forward/tombstones, and large archive migration. Do not treat the advanced legacy transport as equivalent to the planned Drive transport.

## Review artifacts

- [Management — light](screenshots/settings-management-light.png)
- [Management — dark](screenshots/settings-management-dark.png)
- [Scoped erasure review](screenshots/settings-erasure-review.png)
- [Popup settings](screenshots/settings-popup.png)

All artifacts use disposable profiles and fictional data. No real passwords, accounts or exports are required for reproduction.
