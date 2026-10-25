# Hierarchical Settings navigation

2026-10-25 · SecurePass 0.2.0 · `feature/settings-list-navigation`

This user-approved revision supersedes the tabs described in [SETTINGS_FOUR_AREAS.md](SETTINGS_FOUR_AREAS.md). The extension's Generator/Tester/Vault tabs remain its primary tool navigation. Settings uses a category list because users enter a configuration or data-management task rather than repeatedly switch tools.

## Implemented behavior

- The popup opens Settings on a list of Appearance, Security, Backups & recovery, and Advanced. Each row has a short description and leads to a detail page. The same controls, handlers and authentication workflows remain in those sections; the existing `generalSection` URL identifies Appearance for compatibility.
- Detail pages use the section title in the header. The back button and Escape return to the list, focus the originating category, and preserve each detail page's scroll position. A second back/Escape from the list closes Settings in the popup and returns focus to the gear button. Escape in an operation/authentication dialog retains the dialog's own cancellation behavior.
- In a management tab at 760px and above, the list becomes a persistent sidebar with an active-page indication and section content on the right. Appearance is the default wide-screen destination. Narrow management windows use list/detail navigation; returning to their list keeps the management page open. Resizing retains the current detail section.
- Navigation uses native links and normal Tab/Enter activation. Entering a detail page focuses its visible title; returning focuses its category. Browser Back/Forward, reload, and Open in tab retain the selected destination. `#settings` identifies the compact list. Historical preferences/appearance/data/recovery/sync/danger fragments resolve to the corresponding current sections.
- The main tool selection remains unchanged while navigating Settings. Ordinary preference saves still use the existing revision-checked background flow. No cryptographic, storage, message capability, permission or transport contracts were changed.
- The reproduced cache-row defect is fixed: its status and Clear cache button share space or wrap without shrinking the status to one character per line.
- Version, GitHub and the live preference-save/operation status share one Settings footer. It follows the category list on the home page and stays visible on detail pages and in the wide management layout. The version and project link are no longer part of Appearance.

## Executed verification

- `npm run check`: 73 modules passed syntax, import, cycle and manifest/version checks.
- `npm test`: 57 passed, 0 failed.
- `npm run test:settings-browser`: passed. Exercises list/detail/sidebar navigation, keyboard activation, both back paths, browser history, focus/scroll restoration, deep-link reload and legacy aliases, popup-to-tab transfer, responsive transitions, and light/dark layouts at 320/400/740/760/1200px. Includes a readable-cache-layout regression.
- The same settings scenario exercises theme/timeout persistence, reset cancellation and preservation, encrypted backup export/decryption, individual-version downloads, invalid-password rejection, fresh-vault import, conflict previews/stale commits, local and archived recovery, legacy remote merge, cache/archive/entry cleanup, forced-erasure confirmation/cancellation, local vault creation, and master-password rotation with old-password rejection.
- `npm run test:browser`: passed, including the primary interface, trusted origin-bound autofill, clipboard flows, Sync authentication/cancellation paths, and actual WebAuthn browser operations with a virtual PRF authenticator.
- `npm run test:sync-browser`: passed with two disposable Chromium profiles and emulated transport: initial adoption, offline branches, conflict prevention, lossless merge, re-download and compaction.
- Impeccable detector: nine whole-popup warnings, matching the previously reviewed contrast/small-text and incumbent font/palette/glow/copy signals. Several examples belong to Tester/other surfaces. These do not establish Settings accessibility conformance; the established visual identity was preserved.
- Screenshots were inspected after rendering. The unrelated vault screenshot was preserved.

Updated shared-footer captures: [popup category list](screenshots/settings-popup-home.png), [popup Security](screenshots/settings-popup.png), and [light sidebar](screenshots/settings-management-light.png). Earlier navigation captures: [popup Appearance](screenshots/settings-popup-appearance.png), [dark sidebar](screenshots/settings-management-dark.png), [dark Appearance](screenshots/settings-appearance-dark.png), [recovery](screenshots/phase1-recovery.png), and [erasure confirmation](screenshots/settings-erasure-review.png).

## Manual review and limits

Reload the unpacked extension and refresh affected pages. Open Settings, enter and leave each category, change a preference, open a section in a tab, and resize the tab across 760px. With disposable credentials, cancel an import/recovery operation and verify that the same section remains usable.

These checks establish the exercised automated paths, not exhaustive correctness or release acceptance. Physical biometric authenticators, Google-authenticated Sync transport and the remaining protocol/security findings retain their acceptance boundaries in [VALIDATION.md](VALIDATION.md). New Drive transport and signed-device authorization are outside this navigation change.
