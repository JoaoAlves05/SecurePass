# Drive copy review: design record

## Scope and incumbent design

This is an ordinary extension of SecurePass Operate settings, inside the Google group in Advanced. It preserves the existing light/dark palette, Inter/system fallback font stack, rounded forms, primary/secondary buttons and settings navigation. It introduces no new visual world or durable design tokens. The source of truth remains [popup.css](../popup/popup.css), [popup.html](../popup/popup.html) and [driveReview.js](../popup/modules/driveReview.js).

Existing visual authority: [dark management settings](screenshots/settings-management-dark.png) and [popup settings](screenshots/settings-popup.png). The review uses the same theme variables for text, muted descriptions, raised surfaces, borders and primary emphasis. Its title is 15px; descriptions and conflict metadata are 13px. Controls inherit the established font, use the existing small radius, have a 44px minimum height and visible keyboard outlines. Conflict groups wrap long metadata; page controls wrap at narrow widths. The settings surface scrolls vertically in the popup.

## Interaction and privacy

The sequence is explicit: inspect signed copies, select a verified copy, compare, choose whole versions, then save the combined vault locally. Copy selection shows counts and timestamps. Conflict previews show site and username metadata, deletion state and whether passwords or notes differ; passwords and note contents are absent. Every conflict requires a decision. “Both” is offered only when two versions exist; deletion conflicts name which side's deletion is being kept.

Reviews with more than eight conflicts expose search, pagination and an explicit bulk policy. Each page contains at most eight rows. Choices survive search and page changes. Bulk actions affect only matching unresolved conflicts; the two side policies explicitly include deletions, while “both” skips deletion conflicts. The range and completed-choice count remain visible, and attempting an incomplete save directs the user to unresolved choices.

The final action says “Save combined vault.” Supporting copy and success feedback explain that the result is queued for Drive while sending is paused. Saving performs the local atomic commit with its queue record; this surface does not activate provider sending. Cancel clears the preview and choices. Lock clears and hides review content. Review tokens are transient and bound to the requesting owner/document; they are not persistent UI preferences.

Availability requires a configured, connected Google integration, an internally enrolled writer with valid authorization, and an unlocked vault. This feature does not provide public enrollment or production activation.

## Evidence and limits

`npm run test:drive-review-browser` passed for the implementation reviewed here. Its [browser scenario](../tests/driveReview-browser.mjs) exercises actual message routes and clicks, cancellation during fetch, document ownership, mandatory choices, Tab navigation, light/dark layouts and horizontal overflow, an 18-conflict pagination/search/bulk journey, signed local saving, lock cleanup, and absence of provider writes or persisted tokens. It uses disposable Chromium, emulated Google and an internal enrollment fixture. These results do not establish production Google transport compatibility or full release/security acceptance.

The fresh visual review returned `ship` with no material fixes across nine captures in [screenshots/drive-review](screenshots/drive-review/): `tab-light`, `tab-dark`, `tab-actions-light`, `tab-actions-dark`, `popup-light`, `popup-dark`, `popup-actions-light`, `popup-actions-dark` and `popup-many-dark` (all PNG). Tab captures use 1200×900 and popup captures use 320×560; the popup legitimately requires vertical scrolling. The design documentation pass checked source styles and interactions against the incumbent screenshots and sampled the new dark tab and many-conflict popup captures.

The existing mechanical detector report contained eight unrelated global findings. They were left outside this feature's scope and are not adopted as design rules. No root design-system document or token sidecar is introduced by this record.
