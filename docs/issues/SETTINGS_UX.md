# Local issue — Settings, Sync and Data Management journeys

Opened 2026-10-25 before implementation on `feature/settings-data-management`. GitHub CLI is unavailable; this is a local work item, not a published GitHub issue. User authorized journey/screen design followed by background implementation and tests. Existing documentation/screenshot changes are preserved.

## Scope

Design screens against SC01–SC58, implement verifiable local/preferences/backup/recovery and legacy-Sync safety paths together, and record actual coverage. OAuth is not configured (confirmed by the user); do not advertise a working Google Drive connection. New signed multi-device protocol, recovery kit, authenticated device revocation and independent review remain explicit release gates.

## Acceptance

- Design and scenario matrix at `docs/SETTINGS_UX_DESIGN.md` cover every SC without claiming unexecuted tests passed.
- Local workflows have real background handlers, safe cancellation, stable selections, bounded input and regression tests.
- Management works in a tab and the popup; destructive actions explain scope and require appropriate confirmation.
- Existing credentials and snapshots remain recoverable; wrong passwords do not mutate data.
- Checks, screenshots and remaining limitations are recorded before handoff.

## Frontend refinement follow-up — 2026-10-25

The user requested an Impeccable design review and implementation of a cleaner, more intuitive settings interface. This follow-up is on `feature/settings-frontend-cleanup`; its review, changes, checks and screenshots are recorded in [SETTINGS_FRONTEND_REVIEW.md](../SETTINGS_FRONTEND_REVIEW.md). It reorganizes existing frontend controls and preserves the local/legacy safety boundaries and explicit Drive unavailability. The original issue and release gates are not closed by this visual increment.
