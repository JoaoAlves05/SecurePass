# Recovery checkpoints

User-approved implementation, 2026-10-26, on `feature/recovery-checkpoints`.

Retain three local content checkpoints; preserve the active master password on restore; re-encrypt retained checkpoints atomically during master-password rotation without adding a content checkpoint. Recover individual entries with a revision-bound preview, offer full restore and explicit local-history deletion, and make checkpoint cards distinguishable through dates, counts and differences. Legacy checkpoints requiring unavailable keys must be unlocked explicitly or removed; do not silently discard them during rotation. Keep archived Sync copies separate from the three-checkpoint retention policy.

Record executed verification and remaining hardware/transport limits before handoff.

## Verification

Implemented on the feature branch. The full 100-test Node suite, 82-module syntax/import/cycle check, dedicated checkpoint/backup-dialog/settings/general browser journeys and two-profile emulated Sync suite passed. Screenshots and limits are recorded in [CHECKPOINTS.md](../CHECKPOINTS.md) and [VALIDATION.md](../VALIDATION.md). No commit or push was requested for this increment.
