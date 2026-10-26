# Recovery checkpoints

2026-10-26 · SecurePass 0.2.0 · `feature/recovery-checkpoints`

The approved scope replaces ambiguous earlier-version recovery with three automatic content checkpoints, individual entry recovery, full-content restore that preserves current authentication, local-history deletion and useful checkpoint cards.

## Behavior and presentation

The section is named **Recovery checkpoints**. Each local card shows its saved date/time including seconds, sequence (latest / two or three states back), entry count, deleted entries available to recover, entries with older details, entries added since that checkpoint, and up to two affected account examples with changed field names. Password and note values never appear in cards or comparison responses. Counts/examples/differences are removed on lock and computed again only after unlock. Unknown historical dates stay unknown rather than being replaced with migration time.

**Recover an entry** previews differences and lets the user select a missing/changed entry by stable ID. It changes only that entry, preserves other newer entries and uses the existing Sync setting. **Restore whole vault** shows recovery/replacement/removal counts and account differences before replacing all contents. Its current key, master password and biometric wrapper remain; current contents become a checkpoint and automatic Sync is turned off. Restoring already identical contents is a no-op.

Previews render at most 20 example differences; totals and the individual-entry selector include every applicable entry. Dialogs keep actions visible in short viewports, including 320 × 480. Counts and dates use the product's existing typography; technical IDs are not the primary visible means of distinguishing points.

Archived Sync copies appear in a separate labelled group. They are outside the three-checkpoint policy and may require older passwords. A local checkpoint and an archived copy sharing a revision ID remain separately selectable/exportable because their protection may differ.

**Remove** deletes one local point; **Clear history** removes all local points after current-password verification. These operations keep live contents, the publication outbox, archived Sync copies and external files. Subsequent content changes create new checkpoints. Unchanged entry saves and local-only Sync ancestry changes do not consume a checkpoint.

## Encryption and rotation

Complete encrypted records are stored in IndexedDB. The three-state policy is enforced on read/write, so an installation with five local states keeps only its three newest points when accessed after this update. Export older points before upgrading if they are needed. Metadata comparisons are not stored as plaintext summaries.

During master-password rotation the background opens every retained local checkpoint using the active key, creates fresh live protection, re-encrypts all retained historical contents under that protection, and writes the live record/history/outbox in one transaction. Historical content IDs and known saved dates are preserved. A password-only rotation does not add a history slot. A transaction abort preserves both the old live record and old history. Verified PRF authorization can perform the same operation without knowing the old master password.

An older local checkpoint encrypted under an unavailable key cannot be recovered automatically. The UI offers **Unlock older checkpoint**, which verifies its historical password and re-encrypts it under the current vault's protection without changing live contents. Rotation fails before changing the password if any retained point is still unreadable. The user can explicitly remove an unwanted/damaged point instead. There is no silent historical-data discard on rotation.

Remote versions, archived Sync copies and downloaded files are not re-encrypted by a local password change. Old copies already obtained by another party cannot be revoked. Logical history deletion is not a guarantee of physical erasure from storage media or OS/browser backups.

## Recovery integrity

Preview tokens contain no decrypted entries or passwords. They are random, single-use and expire after two minutes; bindings include the trusted client/document, source digest, destination revision and vault-lock nonce. Commit reopens and verifies the source under the operation lock. Destination changes, source edits, expiry, cancellation, locking, owner mismatch and reuse reject recovery. The live/history write uses a revision comparison; rotation/history-only writes also compare the captured history to prevent stale replacement.

Existing recovery-file and selected-remote restore paths also preserve the active master password when a local vault exists. A first-device restore has no existing local password to preserve and uses the source password. Full restore uses the existing durable publication-suppression/reconciliation path; the cross-store/real-transport acceptance limits remain.

## Evidence

Run `npm test`, `npm run check`, `npm run test:checkpoints-browser`, `npm run test:settings-browser`, `npm run test:backup-dialogs-browser`, `npm run test:browser`, and `npm run test:sync-browser`. Executed results are recorded in [VALIDATION.md](VALIDATION.md).

- [Management, light](screenshots/checkpoints/management-light.png)
- [Management, dark](screenshots/checkpoints/management-dark.png)
- [Popup, light](screenshots/checkpoints/popup-light.png)
- [Popup, dark](screenshots/checkpoints/popup-dark.png)
- [Individual recovery](screenshots/checkpoints/recover-entry.png)
- [Full restore review](screenshots/checkpoints/restore-whole-vault.png)

Node regressions cover retention/no-op writes, password/PRF rotation, atomic abort, migration, current-password preservation across local/external/remote restore, entry isolation, token binding/concurrency/expiry/source changes, locked metadata, deletion and source-specific exports. Disposable Chromium exercises the real UI paths, incorrect historical/current passwords, migration-before-rotation, recovery, cleanup and light/dark layouts. The Impeccable detector reported existing broader base-popup contrast/font/palette/glow/size/dialog findings; this change does not claim those are resolved.

Manual acceptance: use a disposable vault in the actual toolbar popup; edit/delete an entry and recover it without affecting another newer entry. Restore a whole checkpoint and verify the current master password and physical PRF authenticator still unlock it. Change the master password using fresh physical verification, check all local points remain usable, and verify archived/exported copies still need their original passwords. Also test cancellation, two-minute preview expiry, simultaneous contexts and interrupted storage operations on supported platforms. Virtual PRF and emulated Sync do not establish physical-hardware or Google-authenticated transport compatibility.
