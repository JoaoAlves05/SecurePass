# Four-area Settings revision

2026-10-25 · SecurePass 0.2.0 · implemented directly on `main` at the user's request.

Historical navigation: the subsequent user-approved [hierarchical revision](SETTINGS_NAVIGATION.md) replaces the four tabs with list/detail navigation and a wide-screen sidebar. Linked screenshot fixtures now show that later revision; the feature inventory below remains useful but does not describe current navigation.

This supersedes the six-category design in [SETTINGS_FRONTEND_REVIEW.md](SETTINGS_FRONTEND_REVIEW.md). The user approved a plan to match the existing extension, remove the separate header/device overview/section combobox, and give direct access to four areas before a commit and push for practical review.

## Implemented interface

| Area | Controls |
|---|---|
| General | System/Light/Dark theme, reset all ordinary preferences, version and project link. |
| Security | Auto-lock and clipboard timeouts, master-password change, biometric setup/replacement/removal, optional authenticator explanation. |
| Backups | Encrypted export, file import, initial local-vault creation only when missing, earlier local/archived versions with Restore and Export on each row. |
| Advanced | Existing Chrome Sync discovery/version selection/publication/merge/maintenance, local archive cleanup, breach-check cache usage/clear, entry clearing and local SecurePass erasure. |

Four tabs remain visible in both popup and full-tab modes. They use the existing `.main-nav`, `.nav-item` and `.nav-indicator` styles. Settings shares the popup's background, palette, cards, typography and button styles; the header has no separate background or dividing border. General opens by default. Only technical help uses disclosure; common controls are directly visible in their area. No device overview, generic Unlock/Lock action, duplicate export shortcut, section combobox or unavailable Google Drive button remains.

The main Generator/Tester/Vault tab handlers are scoped to their own `data-view` controls, so Settings tabs cannot change the underlying application view. Settings supports Left/Right/Home/End keyboard navigation and selected-tab focus. URL fragments survive reload and full-tab opening; old Appearance/Data/Recovery/Sync/Device-data fragments resolve to their corresponding new area. Closing Settings returns focus to its trigger.

## Working behavior and state

- Ordinary preferences remain editable while locked. Export, master-password changes and recovery request authentication within their own existing workflows. Biometric enrollment retains its own master-password verification.
- A missing vault enables the create/import path in Backups and disables actions that require an existing vault. Other preferences remain usable. Reset preserves vault data and the current Sync mode.
- Earlier versions combine local snapshots and the local Sync archive. Identical snapshot IDs appear once, preferring their local representation. Each action revalidates its selected ID against the current inventory; local restoration uses the existing revision-bound restore API, and archived restoration uses the existing encrypted-record import API. Export downloads that encrypted version directly. Historical passwords still apply.
- Legacy remote inspection is explicit, including while publication is off. Retry appears when an enabled upload is pending; remote cleanup appears when applicable; local archive cleanup appears when archives exist. No new Drive transport, permissions or security capabilities were added.
- Cache duration is no longer a UI control. Existing validated expiration preferences are retained; new profiles still use the existing 24-hour default. Cache usage refreshes when Advanced opens and after management operations.
- Clearing entries retains recovery history and may publish the deletion when legacy Sync is active. Deleting local SecurePass data remains a separate confirmed operation, including the existing explicit force-erasure path for inaccessible data. Remote copies remain outside that local erasure.

## Executed validation

- `npm test`: **57 passed**, 0 failed.
- `npm run check`: **73 modules passed** syntax/import/cycle/version checks.
- `npm run test:browser`: passed, including main-view UI, trusted autofill, clipboard and virtual WebAuthn PRF enrollment/unlock/revocation; Settings accesses use the four tabs.
- `npm run test:settings-browser`: passed with disposable data. Exercises four-tab keyboard/deep-link behavior, shared palette/header, all four areas in light/dark at 320/400/740/760/1200px in popup and full-tab modes, theme persistence/system changes, timeout saves, reset confirmation/cancellation and data preservation, encrypted backup download/decryption, direct snapshot download, conflict/stale-destination handling, local/archived restoration and snapshot deduplication, remote discovery/merge and restore cancellation, archive/cache/entry cleanup, force-erasure guard/cancellation/success, local creation, master-password rotation/old-password rejection, and return focus.
- Impeccable's whole-popup detector ran. Two theme-padding findings were corrected. Its final nine warnings concern whole-popup contrast/small text, existing font/palette/glow conventions and text grouped from the Tester surface. The user explicitly requested the incumbent extension design; this pass does not claim complete accessibility conformance or redesign unrelated views.
- `git diff --check`: passed. Unrelated browser screenshots were preserved.

Current disposable screenshots: [General popup](screenshots/settings-popup-appearance.png), [Security popup](screenshots/settings-popup.png), [light full-tab Security](screenshots/settings-management-light.png), [dark full-tab Security](screenshots/settings-management-dark.png), [dark General](screenshots/settings-appearance-dark.png), [Backups/history](screenshots/phase1-recovery.png), and [erasure confirmation](screenshots/settings-erasure-review.png). Screenshot paths are current fixtures and replace the previous six-area captures.

Manual review: reload the unpacked extension, open Settings, switch all four tabs, compare their styling with Generator/Tester/Vault, try light/dark/system theme, open the full tab, and exercise operation cancellation with disposable credentials. Physical authenticator and Google-authenticated transport acceptance retain the boundaries in [VALIDATION.md](VALIDATION.md).
