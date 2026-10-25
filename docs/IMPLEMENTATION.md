# Implementation tracking — current and historical status

Updated 2026-10-25. Current documentation baseline: version 0.2.0, commit `e97f4c6558be23e50016a9b473441ce4c431490a`. The historical phase used branch `feature/phase1-hardening`; this is not a statement of the current checkout branch. Scope of that phase: findings F01–F32 in REVIEW_PHASE1.md.

Historical note: the phase-1 local work item recorded that GitHub CLI was unavailable and no remote issue/PR was published. This documentation update did not create a remote issue, commit, PR, package or deployment.

## Settings/data UX increment — 2026-10-25

The [implemented increment](SETTINGS_UX_IMPLEMENTATION.md) adds real local/legacy flows and regression evidence for the [screen design](SETTINGS_UX_DESIGN.md). The original SD findings are not all closed. Google OAuth is unconfigured; Drive, signed devices and recovery kits are unavailable. Refer to the increment’s coverage boundary rather than interpreting phase-1 checkboxes as acceptance.

## Original open-work baseline

The [settings/Sync/data review](REVIEW_SETTINGS_SYNC_DATA.md) tracks **23 open SD findings** and seven UX/documentation items; UX07 (repository instructions) is addressed in this documentation update. SD01–SD23 and UX01–UX06 remain open. Implemented controls and passing baseline tests do not mean these flows have passed acceptance.

The [complete recommended plan](SYNC_DATA_PLAN.md), revision 2, specifies optional Drive transport over a local encrypted vault, second-device enrollment, wrong/different master passwords, key/device lifecycle, recovery, durable Sync, migration and 58 acceptance scenarios. This follows the user’s agreement with the direction discussed; the detailed protocol still requires technical validation before implementation. No production correction was made by writing the plan.

## Historical phase-1 implementation inventory

Checkboxes below mean code paths were introduced in phase 1. They do not close the later SD findings or establish release readiness.

- [x] Versioned envelope encryption and legacy migration with original encrypted recovery snapshot.
- [x] Serialized, revision-checked writes; complete IndexedDB transactions; immediate revocation and restricted volatile key session.
- [x] Exact-origin/document authorization and trusted confirmation windows; no master input or full-vault cache on websites.
- [x] Immutable Sync generations, integrity checks, explicit offline conflicts, local-first pending saves, merge, retry, recovery and ancestor compaction (later defects: SD01–SD17).
- [x] Verified WebAuthn assertions, challenge/owner/expiry/replay checks, real PRF enrollment assertion, key wrapping and revocation on rotation/recovery.
- [x] Removal of insecure verify-only/Trusted Device bypasses and legacy plaintext session seed.
- [x] Backup/export/import/clear actions, recovery export/import/restore and explicit local device erasure.
- [x] Generator DTO/requirements, exact preservation of secrets, honest strength heuristic and bounded HIBP requests/cache.
- [x] Save/update candidates deduplicated per form/account and retained only in expiring trusted session storage.
- [x] Single clipboard owner with conditional cleanup; visibility buttons, modal cleanup, focus/inert, theme and version consistency.
- [x] Modular services/UI without import cycles, development-only tests, architecture/security documentation and runtime-only packaging.

## Findings mapped to changes

| Findings | Implementation |
|---|---|
| F01–F03 | `security/`, `autofill/`, trusted `auth/`, `biometric/`, storage access restriction |
| F04–F05, F08, F14–F16 | `vault/queue.js`, `session.js`, `repository.js`, transactional `utils/storage.js`, popup session view |
| F06–F07 | `vault/sync.js`, `syncService.js`, Sync/recovery controls and two-profile transport tests |
| F09, F19, F26 | Exact validators, bounded formats/KDF, normalized identities, preview/deduplication, session attempt limiter |
| F10, F22–F23, F27–F28 | Minimal public resource graph, new content tools, trusted save candidates, native field events, no auto-submit/HTML interpolation |
| F11, F18 | Data management, encrypted recovery, full key rotation and explicit biometric invalidation |
| F12–F13 | Single generator contract, selected-group guarantees, rejection sampling, supported pattern subset and explicit failures |
| F17 | Shared WebAuthn client, browser-verified PRF flow, coherent response contracts and cancellation |
| F20–F21, F25 | No plaintext account index; validated local settings; capability matrix and central error responses |
| F24 | Serialized offscreen copy/paste compatibility, sender verification, ownership-aware best-effort cleanup |
| F29–F32 | Honest heuristic/HIBP wording, stale-result rejection, controls/focus/theme, version/license/docs consistency |

## Recorded checks and their scope

The historical implementation record reported 36 passing tests, a passing Chromium end-to-end suite, a two-profile Sync suite, and a generated ZIP. The later review on 2026-10-24 ran 38 passing Node regressions, checked 65 modules, passed the two-profile emulated Sync suite and whitespace checks, and independently reproduced several open SD defects. The general browser suite and packaging were not rerun in that review. See [VALIDATION.md](VALIDATION.md) for dated evidence, reproduction scenarios and acceptance gaps.

## Validation boundary

See [VALIDATION.md](VALIDATION.md) for reproducible checks and remaining platform acceptance. Automated tests include two real Chromium extension profiles with emulated Sync transport and a Chromium virtual PRF authenticator. Google-authenticated Sync transport, physical Windows Hello/Touch ID/security keys, OS sleep/clipboard behavior and screen-reader acceptance still need testing on the target devices before distribution.

There are no runtime dependencies and no build required to load the extension. Automated development checks and a runtime-only ZIP packaging command were added. No deployment, publication, commit or push was performed.
