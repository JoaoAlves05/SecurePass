# Account suggestions and inline login tools

Implemented on 2026-10-27 for SecurePass 0.2.0. Work item: [#3](https://github.com/JoaoAlves05/SecurePass/issues/3).

## Why a save suggestion appears

The top-level content script observes form submission and captures the username and password before website submit listeners can clear them or navigate. The server uses the browser-supplied origin rather than a website-provided URL. This is evidence of submission only; SecurePass cannot generically establish whether a login, registration or password change succeeded. The interface asks the user to confirm only after the website accepted it.

An accepted proposal is held in restricted, in-memory `chrome.storage.session` for five minutes. At most eight proposals are retained; repeated submissions for the same origin/account are deduplicated and a changed value replaces its previous proposal. The stored source metadata contains the origin and browser tab/document identity, without the page path/query. If the vault is unlocked and an identical login already exists, no proposal or on-page suggestion is created. A proposal detected while locked is dismissed as redundant if review later establishes an exact match.

The toolbar badge and popup display pending proposals. No vault entry is saved merely because a form was submitted. A proposal can survive a successful page navigation. A review opens an extension-owned confirmation window, whose authorization expires after two minutes. Cancelling review leaves the original proposal available until expiry, dismissal or vault lock. Repeated review focuses an existing confirmation instead of opening duplicates. Dismissal also revokes and closes its linked confirmation. Successful save removes the linked proposal and badge count.

## Surfaces and interaction

The popup now shows a compact suggestion with website, username, “No changes saved yet”, **Review login** and **Not now**. It updates when proposals arrive, expire, are dismissed or are saved, including when the popup page is already open. Review errors are reported and repeated clicks are disabled while the request is opening.

The on-page key is a vector icon matching the extension's existing key shape. Its closed shadow-root menu follows the extension's light/dark/system preference and uses the same typography, neutral surfaces, rounded primary action and spacing. Login forms offer **Choose saved login**, with generation/copy/save as secondary tools. Empty fields disable copy/save. Current-password fields on recognized change forms offer no generation or save action. Generating from a new-password or confirmation field updates the primary and confirmation fields together, while preserving the current password.

Only one menu is open at a time. Escape and the close button restore key-button focus; an outside click preserves the clicked page target. Scrolling/resizing repositions the menu, including the visual viewport. Removing a field closes its panel and releases its observers/listeners; page exit clears pending fills. BFCache return attaches the keys again. A late request response cannot restore a fill target after its panel was closed. Automatic save prompts do not steal focus. Their 30-second timer closes only that prompt, never a later tools panel.

The extension-owned confirmation uses the popup stylesheet tokens with a compact responsive layout. It always displays the exact origin. Password unlock, reveal/hide, inline error/retry, vault creation and the existing PRF client remain in this extension window, never inside the visited website. The biometric control sits beside the password field. Settings/system theme changes apply to the window. Dark primary-action contrast is checked in the browser. The final save action becomes **Save login** or **Update password**, and ambiguous same-username targets require an explicit choice. The username can be corrected before saving. There is an explicit already-saved state, a no-matching-accounts fill state and a terminal expired-request state.

A new vault requires at least 16 characters and matching master passwords. Creating/unlocking a vault does not itself confirm the captured login; a separate save is still required. Final save/fill prevents duplicate submission. Cancellation remains available during authentication; once final confirmation has been submitted it does not advertise cancellation of an in-flight mutation.

## Integrity and capability boundaries

Inline review/dismiss endpoints validate the proposal's exact origin, tab and document. Content cannot use the general popup candidate-management endpoints, unlock the vault, list the whole vault or finish biometric authentication. The authentication page gains only the existing public theme/clipboard settings response; private settings and general management remain forbidden. No manifest/host permission changed.

A save requires the exact confirmation tab, an active session, an explicit create/update action and the destination revision shown in review. Updates require an explicitly selected same-origin entry and preserve its ID, notes and creation time. The ordinary encrypted checkpoint/outbox path is used. Concurrent changes require review again. Grant consumption and the save run in one operation lock, so concurrent confirmation/replay cannot create duplicate entries. Failed local transactions preserve the previous vault and permit retry. A failure after the new revision was committed never revives a consumed save grant or reports that nothing was saved.

Fill remains bound to the original origin/document, is consumed once under the operation lock and sends only the chosen username/password to that document. It never submits the website form. Cancellation, expiry and confirmation-tab closure revoke the request and notify the original page. Status/account/Sync reads wait for in-flight operations, avoiding a spurious lock between a local commit and its session activation, and preventing UI reads from opening IndexedDB during local erasure.

These changes do not establish login success, site trust, distributed Sync delivery or physical authenticator compatibility.

## Validation

Commands: `npm run check`, `npm test`, `npm run test:account-prompts-browser`, `npm run test:browser`, `npm run test:settings-browser` and `npm run test:sync-setup-browser`. Actual results are recorded in [VALIDATION.md](VALIDATION.md).

The dedicated Chromium scenario uses a disposable local website/profile and fictional credentials. It covers exact-origin/no-submit fill; locked retry and isolation from website keyboard listeners; live suggestions; fields cleared on submit and full navigation; cancel/dismiss; new save/update with notes preserved; stale-review rejection; registration/change generation, confirmation and copy; narrow light/dark layouts; Escape/outside/scroll/field removal; virtual PRF enrollment and cancellation; fresh-vault confirmation; expired requests and already-saved handling.

Captures: [light tools](screenshots/account-prompts/inline-light.png), [dark tools](screenshots/account-prompts/inline-dark.png), [popup suggestion](screenshots/account-prompts/suggestion-light.png), [unlock](screenshots/account-prompts/unlock-dark.png), [biometric alternative](screenshots/account-prompts/unlock-biometric-dark.png), [save](screenshots/account-prompts/save-light.png), [update](screenshots/account-prompts/update-dark.png).

Manual acceptance remains for a real toolbar popup, supported physical authenticators, OS/screen-reader combinations and representative real login/SSO sites, including the reported site. No real user login was performed. Iframes and website shadow-root fields remain outside the current form analyzer's supported scope.
