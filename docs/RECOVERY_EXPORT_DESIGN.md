# Saved-version batch export: design record

## Overview

This is a scoped extension of the incumbent Backups settings surface. It adds “Export saved versions” beneath the recovery status using the existing text action, then reuses the shared operation dialog and recovery layout. Visual authority remains [SETTINGS_UX_DESIGN.md](SETTINGS_UX_DESIGN.md), [DRIVE_REVIEW_DESIGN.md](DRIVE_REVIEW_DESIGN.md), [popup.css](../popup/popup.css) and [recovery.css](../popup/recovery.css). No new visual world, stylesheet, design tokens, root design-system document or token sidecar is introduced.

## Colors

Light and dark themes retain the existing background, text, muted text, border, raised surface and primary action variables. Cancel inherits the readable foreground in both themes. Errors use the existing danger treatment. This record does not redefine palette values.

## Typography

The existing Inter/system fallback stack and dialog hierarchy carry the flow. The initial overview uses the standard operation dialog heading and description; each version uses the denser recovery dialog typography and metadata rows. Counts and action labels remain ordinary interface text, with no added decorative labels.

## Layout

The overview states the number of exportable versions and their total file size, lists versions that cannot be exported, and explains that current entries use the separate “Export backup” action. Each subsequent dialog displays one version, its source, abbreviated identity, saved date or legacy status, file size, batch position and count of download requests already sent. The established viewport-bounded dialog and scrolling body support both management tab and narrow popup, preserving reachable actions.

## Elevation & Depth

The overview keeps the existing operation dialog surface and backdrop. Per-version confirmation uses the incumbent recovery surface and subdued blurred backdrop. Existing dialog shadows and tonal grouping remain unchanged.

## Shapes

Dialogs, metadata containers and buttons inherit incumbent rounded corners, borders and spacing. The feature adds no new shape vocabulary or CSS.

## Components

### Interaction and completion

[recoveryExport.js](../popup/modules/recoveryExport.js) opens a preview before starting. When some versions are invalid, the initial action says “Export available versions”; otherwise it says “Start export”. Invalid records are explicitly listed by source and position with a reason. Their list has the export-specific accessible name “Saved versions that cannot be exported”, rather than checkpoint comparison language. If no version is exportable, the flow reports that state instead of starting an empty batch.

Every file requires its own “Download version” confirmation. Preparing disables controls and marks the dialog busy, preventing duplicate submission. A successful preparation sends exactly one download request and advances to the next version. Filenames include `local` or `archive`, batch position and abbreviated identity, matching the selected source. No single combined file is presented as the result.

Progress and the final toast describe **download requests sent**, and explicitly direct users to browser downloads. SecurePass cannot confirm that files reached disk. A request count is not a durable-save claim; even a complete request sequence still requires checking browser downloads.

### Cancellation, errors and accessibility

Cancel or Escape stops between versions and retains the request count already sent. Preparation failures stay inline in the same dialog, focus and scroll the error into view, and re-enable the action for retry or cancellation. A changed or removed version instructs the user to stop and review the updated history; retry does not silently select another version. Cancel and Escape are temporarily disabled during preparation. Vault lock or `pagehide` stops the batch, closes its pending dialog and suppresses a late preparation result before it can trigger a download. Closing does not retract earlier download requests.

The shared native dialog supplies modal focus containment, a labelled title and description, visible keyboard outlines and status/error semantics. Initial focus goes to Cancel; ordinary completion or cancellation returns focus to “Export saved versions” when the page remains active. The workflow uses the existing management-operation exclusion mechanism.

### Privacy and selection integrity

[recoveryExport.js in the vault layer](../src/vault/recoveryExport.js) inventories local recovery records and the locally stored archived Chrome Sync copies; it does not fetch live remote versions. The current vault is exported separately. Batch metadata contains no credential fields, passwords or decrypted notes. Files retain each record’s existing encryption, so the overview reminds users to keep the historical passwords; this flow does not request a new backup password or re-encrypt records.

The inventory checks record validity and identity, excludes duplicate identities within a source, and reports invalid versions. It bounds the batch to 100 records across both sources, including invalid records, and each serialized recovery file to 16 MiB. Before each download, the background resolves the exact source and identity again, validates the record, and compares the SHA-256 digest captured during preview. This prevents source ambiguity or content changes from silently exporting a different version. Export does not restore a version or modify the current vault.

### Evidence and limits

The final disposable Chromium run of `npm run test:recovery-export-browser` passed: three actual files were downloaded, read back, independently imported and decrypted. The scenario checks source inventory, invalid-version accessible naming, unchanged current revision, keyboard focus, light/dark foregrounds, horizontal overflow, cancellation before and during the batch, changed-version rejection and suppression of a late result after lock. This is fixture-based browser evidence, not verification of every browser download policy or destination.

Final captures: [tab light](screenshots/recovery-export/tab-light.png) and [tab dark](screenshots/recovery-export/tab-dark.png) at 1100×850; [popup light](screenshots/recovery-export/popup-light.png) and [popup dark](screenshots/recovery-export/popup-dark.png) at 320×560; and [changed-version error](screenshots/recovery-export/changed-version-error.png). The final scoped visual reviewer found both requested fixes resolved, observed no regressions and returned `ship` for the captures and scored changes. This disposition does not establish whole-release, security, physical-authenticator or production transport acceptance.

## Do's and Don'ts

- **Do** retain explicit per-file consent, source identity, historical-password guidance and truthful request counts.
- **Do** keep invalid versions visible and errors within the existing accessible operation surface.
- **Don't** interpret a download request as proof that a file was saved to disk.
- **Don't** promote unrelated incumbent visual drift into new design rules or broaden this feature into a system redesign.

No unrelated incumbent defects were repaired or canonized by this documentation pass; their review remains outside this feature’s scope.
