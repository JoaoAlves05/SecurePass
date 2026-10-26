# Inline master-password change and management layout

2026-10-26 · SecurePass 0.2.0 · `feature/master-password-settings`

The user approved replacing the disconnected unlock/modal sequence with an inline identity → new password → success flow, accepting the current master password or fresh biometric authentication. The management tab also needs proportions suited to a browser window.

## Delivered behavior

- Security's change-password button expands into a current-password form, with an alternative biometric action only when configured. A locked vault is authenticated here directly; no preliminary unlock modal appears.
- Successful authentication replaces that form with new password and confirmation. The existing 16-character minimum is preserved. Mismatch errors remain inside the flow; secrets are not sanitized or trimmed.
- When biometric unlock is configured, the new-password step explains that this device's setup will be removed. Success offers optional setup again and a Done action.
- Cancel/Escape, leaving Security, closing Settings, page teardown and vault lock clear fields and discard the local authorization. Biometric prompts are aborted when cancelled. Saving disables repeated submission and cancellation; leaving the view cannot undo an already-submitted write.
- Each step scrolls into view. Focus moves to its first field or success message; reveal controls, inline errors and reduced motion are supported.
- The tab retains the existing trusted pathname and shared behavior. A separate `popup/management.css` defines its sidebar, spacing, bounded forms, desktop preference rows and static background; the popup keeps its compact presentation.

## Authorization contract

`AUTHORIZE_MASTER_PASSWORD` verifies the password even when already unlocked. A biometric ceremony must request `change-master-password` at its start; adding that purpose to an ordinary unlock completion cannot produce a grant. Auth confirmation pages and content pages cannot request password-change grants.

The random grant contains no password or key and lasts two minutes in restricted `storage.session`. It binds the operation purpose, client UUID, document/tab identity when supplied by Chrome, vault ID, revision, key epoch and lock revocation nonce. Each client has at most one current grant. New-password submission validates and consumes it under the vault operation lock before rotation, so concurrent reuse cannot commit twice. Cancellation targets the exact token, protecting a newer attempt from delayed cleanup.

Changing the master password rotates the encrypted record, preserves entries and removes the local biometric wrapper. It does not promise to delete credentials held by the external authenticator or change historical backups' passwords.

## Verification and captures

Executed checks and their results are recorded in [VALIDATION.md](VALIDATION.md). Node regressions cover password-based authorization, preservation/revocation, missing grants, wrong passwords, client/document binding, reuse/concurrency, expiry, revision changes, cancellation, lock revocation, replacement grants and biometric purpose isolation.

The settings Chromium scenario exercises incorrect-password and mismatch errors, inline cancellation, password-based rotation, a virtual PRF rotation without the old password, biometric revocation/setup handoff, Escape and lock cleanup. It also checks popup/tab light and dark layouts, keyboard navigation, existing data workflows and proportional widths.

- [Identity step in the popup](screenshots/settings-master-identity-popup.png)
- [New-password step and biometric warning](screenshots/settings-master-new-popup.png)
- [Management, light](screenshots/settings-management-light.png)
- [Management, dark](screenshots/settings-management-dark.png)

The Impeccable detector completed and reported existing palette/font/glow and unrelated base-popup contrast/size/dialog findings. This scoped change does not claim those broader issues are resolved.

## Manual hardware acceptance

Reload the unpacked extension and use a disposable vault. In the actual toolbar popup, verify password authentication once, Cancel/Escape, mismatch errors and a successful change. Repeat with a physical PRF authenticator: cancel one prompt, complete a fresh verification, confirm the pre-save warning, then check that the old password fails and biometric unlock needs setup again. Resize the management tab and inspect both themes. Leave a new-password form open for two minutes and confirm it returns to identity verification; lock the vault from another context and confirm the fields clear.

Virtual PRF and emulated popup viewports do not establish physical authenticator or real toolbar sizing compatibility. Existing Sync/Drive and release acceptance limits remain open.
