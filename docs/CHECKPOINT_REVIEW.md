# Checkpoint review interaction

2026-10-26 · SecurePass 0.2.0 · `feature/checkpoint-review`

## Approved interaction

Each local checkpoint card has one primary **Review checkpoint** action (or **Unlock to review** while locked), with Export/Remove secondary. The same entry point handles explicit migration of older protection before opening the comparison. Archived Sync copies retain their separate existing workflow.

Review is an in-section view rather than an operation dialog. It shows the checkpoint date, saved/deleted/different/newer counts, a website/username search and the differing entries. Every missing or changed entry has its own **Recover entry** or **Restore saved details** action. A short confirmation identifies only that entry and its changed fields; there is no entry-selection dropdown. Unchanged and current-only entries have no recovery action. Matching saved entries can be shown explicitly. Lists render 50 rows at a time and support loading more without hiding entries from search.

A separated **Restore the whole checkpoint** area at the bottom leads to **Review full restore**, then the existing explicit full-restore confirmation with removal counts and effects. Master-password/biometric preservation, automatic checkpoint creation and Sync behavior remain those of the checkpoint implementation. Empty/matching checkpoints disable full restore.

## State and privacy

Review and recovery require an unlocked current vault. The standard unlock flow accepts the master password or, when configured, biometric unlock. Individual recovery uses that active session and an explicit confirmation of the affected entry, without repeating authentication. The inactivity timeout locks the vault and clears the review.

Whole-checkpoint restore additionally requires authentication less than five minutes old. The backend stores the authentication time separately from activity in restricted session storage, preserving it across worker suspension. Keep-alive, edits, imports and recovery do not renew it. The preview reports whether authentication is required, and submission checks again. The older local-checkpoint restore endpoint also enforces this window. Missing, invalid or future authentication timestamps require verification again.

If verification is needed, a compact **Confirm identity** dialog offers the current master password and configured biometrics. Failed or cancelled verification never restores data. Successful verification obtains a fresh comparison and still requires the explicit whole-vault confirmation; it cannot silently commit recovery. If authentication expires while that confirmation is open, the consumed preview makes no changes and the same verification/review sequence runs again. Concurrent destination/source changes require refreshing the comparison. Lock and preview expiry/revocation checks remain independent of the five-minute window.

A checkpoint protected with an older master password is a separate case: that previous password is needed once to decrypt and migrate the checkpoint to the current protection. Archived Sync copies and external backups retain their separate recovery workflows.

Opening a read-only comparison immediately discards its recovery token. A recovery action obtains a fresh token for its exact scope and verifies that the destination revision and encrypted-source digest still match the displayed comparison. Submission obtains another fresh token and repeats those identity checks, so a long-open confirmation never submits an expired preview or silently accepts changed contents. The backend's existing single-use/expiry/document/lock checks still protect commit. If the comparison is stale, actions are disabled and Refresh comparison is offered. The read view itself does not expire after two minutes. Older running background code lacking comparison identity or the whole-restore authentication contract is rejected with a reload instruction.

Successful entry recovery refreshes the comparison, preserves search/filter state and keeps the user in the review when the source remains retained. If retention removes the source, the user returns to saved checkpoints. Cancelling confirmation keeps the comparison open. Full restore returns to the card list. Back restores the list's scroll/focus; Escape clears a nonempty search first, then closes the review without leaving Backups. Section changes, closing Settings, vault lock and page teardown clear comparison rows, counts and search values. Busy and stale controls cannot submit duplicate actions. Account names and arbitrary usernames are rendered with textContent.

## Captures

- [Cards, light](screenshots/checkpoint-review/management-light.png)
- [Cards, dark](screenshots/checkpoint-review/management-dark.png)
- [Inline review in a tab](screenshots/checkpoint-review/review-management-dark.png)
- [Inline review in the popup, light](screenshots/checkpoint-review/review-popup-light.png)
- [Inline review in the popup, dark](screenshots/checkpoint-review/review-popup-dark.png)
- [Individual confirmation](screenshots/checkpoint-review/recover-entry.png)
- [Full-restore confirmation](screenshots/checkpoint-review/restore-whole-vault.png)
- [Full-restore identity confirmation](screenshots/recovery-ui/restore-identity-password.png)
- [Identity error and retry](screenshots/recovery-ui/restore-identity-error.png)
- [Biometric identity confirmation](screenshots/recovery-ui/restore-identity-biometric.png)

## Verification

Executed results are recorded in [VALIDATION.md](VALIDATION.md). The dedicated Chromium scenario covers the single card action, per-row confirmation/cancellation, individual/full recovery, unchanged passwords, migration, stale destination detection, refresh, search/matching/empty/paginated comparisons, untrusted usernames, lock cleanup, keyboard navigation and light/dark popup/tab layouts down to 320 × 480. The design detector was run; existing broader base-popup contrast, font/palette/glow and unrelated size/dialog findings are not claimed resolved. Physical authenticator and actual toolbar sizing acceptance remain those documented for the previous checkpoint increment.
