# Local issue — Settings, Sync and Data Management journeys

## Inline master-password and tab proportions follow-up — 2026-10-26

The user approved a continuous inline identity/new-password/success flow, password or fresh biometric authorization, a pre-save biometric revocation notice and optional reconfiguration. The same request covers proportions in the management tab. Implementation is on `feature/master-password-settings`; scope and verification are recorded in [MASTER_PASSWORD_FLOW.md](../MASTER_PASSWORD_FLOW.md). This authorizes local implementation and checks, without a requested commit or push.

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

## Approved four-area revision — 2026-10-25

The user approved implementation directly on `main`, followed by a focused commit and push for practical review. Reuse the extension's existing visual language, remove the separate header surface and device/unlock/export overview, and replace the section combobox/sidebar with four always-visible tabs: General, Security, Backups, Advanced. Keep common controls directly accessible, move version actions onto their rows, and preserve working authentication, recovery, legacy Sync and deletion flows. Validate browser states and responsive light/dark layouts before publishing the commit.

## Approved hierarchical navigation — 2026-10-25

The user approved replacing Settings tabs with a category list and detail pages in the popup, and the same category list as a sidebar in a wide management tab. Work is on `feature/settings-list-navigation`. Preserve all existing controls and authentication/data flows; retain deep links, restore scroll and focus when returning, support browser history and narrow management windows, and correct the reproduced cache-row layout defect. Validate the full Node, settings, general browser/virtual-PRF and emulated Sync suites. This request authorizes implementation and verification; it does not request a commit or push. Record executed checks and remaining acceptance limits in `docs/VALIDATION.md`.
