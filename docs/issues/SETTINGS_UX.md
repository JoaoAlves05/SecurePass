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
