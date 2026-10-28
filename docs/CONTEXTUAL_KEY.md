# Contextual on-page key

Implemented for SecurePass 0.2.0 on 2026-10-28. Work item: [#4](https://github.com/JoaoAlves05/SecurePass/issues/4). This is a refinement of the existing extension theme, typography and tokens. Keyboard shortcuts are deferred. [Account proposals and save/update](ACCOUNT_PROMPTS.md) retain their separate confirmation contract.

## Login and authentication

Clicking a login-field key opens the extension-owned selector directly. Clicking again focuses its existing window while the request remains valid. The selector displays the exact browser-supplied origin. Saved accounts appear only after unlock in that window, and even one account requires an explicit **Fill** click. Filling changes the original password and detected username fields without submitting the form.

Master-password unlock, reveal and retry remain inside the extension window. Configured biometric unlock is a separate fingerprint button beside the password field, using the existing verified PRF flow. Vault creation also stays here and requires matching master passwords of at least 16 characters. Authentication does not itself choose an account, save a login or submit the website.

**Other options** offers **Generate and fill a password**, **Copy entered password** and **Save entered login**. These return to the original website field. Copy/save are disabled when it was empty; the source checks its current value again. Generation and current-field copy use existing public tools and can run while the vault is locked. Save-entered opens a separate trusted save review.

The empty state offers **Add login**. Its form has an optional username, masked login password with reveal control, **Back to logins**, and explicit **Save login**. The displayed website is immutable. Saving creates a new encrypted entry for that origin; it neither updates another entry nor fills the page. The user can reopen the selector and choose the saved login afterward. **Add a new login** is also available under Other options while unlocked.

Back, cancel, failure, expiry, page closure and vault lock clear the draft password and reset reveal state. A stale vault revision requires review again. The draft password is submitted only with explicit save and is never added to the pending fill-request record.

## Registration and password change

Registration keys lead with **Generate and fill**; new-password fields on recognized change forms lead with **Generate new password**. The tools display the exact origin and keep copy/save under **Other options**. **Password options** contains optional length and symbol controls. Length is checked against current detected limits; an unset symbol override uses the SecurePass preference. Generating fills the primary new-password field and its detected confirmation field together. Generating alone does not save a vault entry.

Recognized current-password fields offer copy only, with no generation or save action. The generator checks form context again after its asynchronous response; a changed context or target cannot cause the current password to be replaced. Iframe and website shadow-root fields remain outside the current analyzer's supported scope.

The tools follow light/dark/system preference and the incumbent typography, palette and rounded controls. They follow their field on scroll/resize, including the visual viewport, and close when the field disappears. Escape/close restores key focus; an outside click retains the clicked target. Reduced-motion preference removes panel entry animation.

## Feedback and concurrent prompts

After fill or cancellation, focus returns to the original password field. A compact bottom status region announces the result without opening a dialog or intercepting pointer input. Ordinary messages expire after 3.5 seconds, errors after eight seconds; a pointer interaction dismisses the message. The website submit button remains usable. Feedback does not replace manually opened tools.

Automatic submission-triggered save suggestions neither steal focus nor replace manually opened tools or pending account selections. Their proposal remains available in the popup. Submission is evidence of an attempt, not proof of website acceptance; saving/updating still requires explicit review after the user confirms that it worked.

## Request and storage boundaries

`content/modules/autofill.js` owns a random per-field target and a two-minute pending selection. `src/autofill/requests.js` binds the request to the source origin, tab, browser document and native confirmation tab. It first reserves an `about:blank` window and records its tab identity, then loads `auth/auth.html`. Repeated key clicks must match the original source and target before refocusing that window.

Fill and secondary-tool requests validate the original live document/field, consume their request under the operation lock and require acknowledgement from the source. Only the selected username/password is delivered for fill. Navigation, removal, cancellation, expiry, confirmation closure and vault lock release or revoke the pending selection. The source checks visibility and login context before applying a result; no form submission is issued.

Manual addition validates the source document, active session, immutable origin and displayed vault revision. It accepts create only and uses the ordinary encrypted commit/checkpoint/outbox path. Failed local transactions preserve the previous vault; a failure after commit cannot revive a consumed save grant. No manifest permissions, host permissions or message-capability set changed. Website scripts can read filled fields; these checks do not make an untrusted website safe.

## Executed evidence and manual acceptance

The full Node run passed **138 tests**; the final targeted account-prompt run passed **21 tests**. The final dedicated Chromium scenario and **93-module check** passed after the feedback refinement. The general Chromium suite passed with successful virtual PRF enrollment, unlock and revocation. The dedicated scenario covers direct open/refocus, explicit one-account fill, no auto-submit, secondary tools, empty/manual-add/back, stale/removed targets, generator options/confirmation/current-password protection, suggestion priority, feedback pointer transparency and website submission, plus the earlier save/update/authentication journeys. See [VALIDATION.md](VALIDATION.md) for scope and historical evidence.

Sixteen captures are retained under `screenshots/account-prompts/`. Useful views: [selector](screenshots/account-prompts/fill-light.png), [secondary tools](screenshots/account-prompts/fill-options-light.png), [empty state](screenshots/account-prompts/empty-light.png), [manual add](screenshots/account-prompts/add-login-dark.png), [generator options](screenshots/account-prompts/generator-options-light.png), [password change](screenshots/account-prompts/change-light.png), [filled feedback](screenshots/account-prompts/filled-feedback-light.png) and [cancel feedback](screenshots/account-prompts/cancel-feedback-dark.png).

Manual acceptance remains for actual toolbar popup behavior, physical authenticators, operating-system/screen-reader combinations and representative real login/SSO sites, including the reported site. No real user login was performed. Virtual PRF and local disposable pages do not establish those results, Google-authenticated Sync compatibility or release acceptance.
