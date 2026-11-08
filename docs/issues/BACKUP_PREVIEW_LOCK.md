# Cancel delayed backup previews on lock — SC44

Source investigation after the recovery export block: `requestOperation` treats a
lock while submit is pending as possibly deliberate post-commit locking. It clears
fields but can still return a successful result. Backup preview returns a retained
backup password to `importFile`, which then opens the confirmation dialog. A
preview response delivered after the lock must not reopen that sensitive flow.

Reproduce with an encrypted backup and hold the actual PREVIEW_BACKUP response
callback in a disposable Chromium popup; lock the real background vault, release
the callback, and assert the dialog stays closed, no confirmation or write occurs,
password fields are empty and a fresh unlock/import is possible. Fix only preview
cancellation; preserve existing committed-mutation semantics during deliberate
post-commit locks. Record this as a partial SC44 correction, not full hardware or
whole-plan acceptance.

## Reproduced and corrected — 2026-11-08

The disposable Chromium regression failed on the original implementation with
`A locked import must never open a late confirmation` (actual true). The correction
adds explicit cancel-on-lock for backup preview dialogs. Cancellation drops stored
form values and busy state; old asynchronous cleanup cannot modify a newer dialog.
The default committed-mutation behavior remains unchanged.

The final regression holds a real completed PREVIEW_BACKUP callback, locks the
background, checks immediate closure/empty fields/no session token/no vault write,
then starts a fresh import before releasing the old callback. The new password
field/action survive; the old confirmation never opens; the fresh import succeeds.
Run `npm run test:backup-lock-browser`. Full SC44 remains open for other operations,
auto-lock, biometrics and external acceptance.
