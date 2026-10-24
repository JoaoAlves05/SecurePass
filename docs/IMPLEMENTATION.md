# Phase 1 implementation tracking

Branch: `feature/phase1-hardening`. Scope: findings F01–F32 in REVIEW_PHASE1.md, including recoverable Sync and revocable PRF biometric unlock.

This local work item was created before implementation. GitHub CLI was unavailable; no remote issue or PR has been published.

## Implementation

- [x] Versioned envelope encryption and legacy migration with original encrypted recovery snapshot.
- [x] Serialized, revision-checked writes; complete IndexedDB transactions; immediate revocation and restricted volatile key session.
- [x] Exact-origin/document authorization and trusted confirmation windows; no master input or full-vault cache on websites.
- [x] Immutable Sync generations, integrity checks, explicit offline conflicts, local-first pending saves, merge, retry, recovery and safe compaction.
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

## Final automated checks

36 regression tests passed. All 65 JavaScript modules passed syntax/import/cycle checks. The Chromium end-to-end and two-profile Sync suites passed. The runtime-only ZIP was generated and whitespace checks passed. See [VALIDATION.md](VALIDATION.md) for commands and test boundaries.

## Validation boundary

See [VALIDATION.md](VALIDATION.md) for reproducible checks and remaining platform acceptance. Automated tests include two real Chromium extension profiles with emulated Sync transport and a Chromium virtual PRF authenticator. Google-authenticated Sync transport, physical Windows Hello/Touch ID/security keys, OS sleep/clipboard behavior and screen-reader acceptance still need testing on the target devices before distribution.

There are no runtime dependencies and no build required to load the extension. Automated development checks and a runtime-only ZIP packaging command were added. No deployment, publication, commit or push was performed.
