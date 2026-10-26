# Backups & recovery — export and restore dialogs

Updated 2026-10-26. This refinement uses the existing extension palette and native dialog. It applies inside the popup itself as well as the management tab.

## Delivered interaction

- Export backup separates its short introduction, password fields, minimum-length help and recovery-password reminder. Show/Hide sits inside each password field with an explicit accessible name and pressed state.
- Restore saved version identifies the selected date, source and short version ID before asking for that version's historical master password. A separate explanation states that the previous local vault is retained and automatic Sync turns off. An empty destination receives the appropriate creation explanation instead.
- Export on an earlier version now opens a version review before Download version. It explains that this encrypted recovery file keeps its original master password; it does not request a new backup password. Cancel leaves the vault and history unchanged.
- The native dialog keeps its actions visible while its body scrolls on shorter popups. Labels remain above their controls, long metadata wraps and the header no longer repeats the product name.
- While an action is pending, its button names the work and editable controls are disabled. Error feedback stays inside the dialog. Passwords are cleared and masked again after submission; a failed restore explains the password/damaged-data possibilities instead of displaying only a generic operation failure. Specific stale-version and session errors remain intact.

The shared dialog also renders existing import, preference and Advanced confirmations. Those existing journeys were checked after the component change. No extension permissions or cryptographic formats changed in this UI increment.

## Visual evidence

| Surface | Light | Dark |
|---|---|---|
| Export in the extension popup | [400 px](screenshots/backup-dialogs/export-light-400.png) | [400 px](screenshots/backup-dialogs/export-dark-400.png) |
| Restore in the extension popup | [400 px](screenshots/backup-dialogs/restore-light-400.png) | [400 px](screenshots/backup-dialogs/restore-dark-400.png) |
| Short popup, 320 × 480 | [Export](screenshots/backup-dialogs/export-light-320.png) | [Restore](screenshots/backup-dialogs/restore-dark-320.png) |

Additional evidence: [saved-version export](screenshots/backup-dialogs/saved-version-export-dark.png), [password mismatch](screenshots/backup-dialogs/export-error-dark.png), [restore failure](screenshots/backup-dialogs/restore-error-dark.png) and [management tab](screenshots/backup-dialogs/export-management-dark.png). All profiles, dates, account details and passwords are disposable fixtures. Password fields are empty or masked in the captures.

## Executed checks

- `npm run test:backup-dialogs-browser`: passed. Exercises the popup route in light/dark at 400 × 650 and 320 × 480; metadata, field names/help, viewport fit, keyboard cancellation, wrong-password recovery, remasking, actual encrypted backup and selected-version downloads, successful restore, pending-state exclusivity and the wide management tab. The backup is decrypted again and its entries checked; the downloaded snapshot's identity is verified.
- `npm run test:settings-browser`: passed with the new version-export review, import/conflict/recovery flows and existing Settings/Advanced actions.
- `npm run test:browser`: passed, including general popup interactions, clipboard, autofill and virtual PRF.
- `npm run check`: 75 JavaScript modules passed. `git diff --check` passed. The 75 Node regressions from the preceding functional review remain the recorded backend baseline; this UI increment adds a separate browser scenario.
- Rendered text contrast was measured in both themes: description/help ≥ 6.86:1, Show/Hide ≥ 5.31:1 and error feedback ≥ 4.51:1.
- Impeccable's mechanical scan was run once. It also inspected the generator behind the popup route and reported existing generator contrast/type and inherited theme warnings outside this refinement. Its zero-inset dialog warning refers to the outer shell: the header, scrolling body and fixed footer own their padding, verified in the rendered captures. No global detector exceptions were added.

The functional limits in [the backup/Advanced review](REVIEW_BACKUP_ADVANCED.md) still apply. Chromium checks do not establish physical authenticator compatibility or Google-authenticated transport acceptance.
