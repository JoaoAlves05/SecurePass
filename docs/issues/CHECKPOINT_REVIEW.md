# Checkpoint review flow

User-approved UI refinement, 2026-10-26, on `feature/checkpoint-review`.

Cards expose one primary Review checkpoint action, with Export/Remove secondary. An in-section review shows differing entries with individual recovery actions and short confirmations. Full restore is secondary at the bottom, with its own explicit review/confirmation. Preserve authentication, preview binding, stale-state protection, privacy on lock, keyboard focus and popup/tab layouts. Keep archived Sync copies separate.

## Verification

Implementation and captures are recorded in [CHECKPOINT_REVIEW.md](../CHECKPOINT_REVIEW.md). The 100-test Node suite, 83-module check and dedicated checkpoint/settings/backup-dialog browser scenarios passed. No commit or push was requested for this increment.
