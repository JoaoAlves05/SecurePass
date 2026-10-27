# Guided Chrome Sync setup and device verification

Implemented on 2026-10-27 for SecurePass 0.2.0. Work item: [#2](https://github.com/JoaoAlves05/SecurePass/issues/2). This is the existing Chrome storage transport with clearer setup and recovery safeguards; it does not implement the proposed Drive protocol or automatic incoming vault updates.

## User journey

Advanced now has a Chrome Sync area with **Configure Chrome Sync**. Preparation explains that Chrome controls the account/transport and opens `chrome://settings/syncSetup`. No OAuth flow, account/email permission, host permission or new extension permission is introduced. The same extension must be available in each participating Chrome profile. Restoring and combining incoming copies remain manual.

The user explicitly requests **Check copies and space**. An existing local vault must be unlocked first. This inspects complete copies, local entry count, divergence and capacity without changing the vault, its publication preference or remote data. An empty installation is directed to create a vault or restore an available copy. A failed inspection or incomplete generation cannot enable sending. Complete selected copies remain available for local recovery.

**Enable automatic sending** requires a separate confirmation. Divergent copies offer review first by default; keeping local contents explicitly archives the other active copies on this device and makes them ancestors of the new publication. Destination revision and inspected remote heads are checked again. Local revision/outbox commit precedes enabling remote work, so a failed initial IndexedDB transaction leaves sending off. Setup does not claim a distributed transaction across all stores and devices.

After setup the control is **Send changes automatically**. Turning it off preserves existing copies. Turning it back on repeats the guided check. A receiving installation must explicitly inspect and restore/combine incoming data; this is not bidirectional automatic synchronization.

## Evidence shown to the user

- Automatic sending off: the extension does not publish new vault versions.
- Saving in Chrome storage: a publication attempt is in progress; the local revision is already committed.
- Saved in Chrome storage: the Chrome storage API accepted and verified the encrypted items. This does not acknowledge cloud upload or another device.
- Sending pending: local data remains saved, with the storage/capacity error and appropriate actions. Automatic retries skip known capacity failures. Manual cleanup can make a retry available when a complete publication will fit.
- Device test confirmation: a separate installation explicitly confirmed a matching, unexpired test. If the test included the current encrypted revision, its revision and SHA-256 digest must match. Later edits retain the confirmation as historical evidence and do not inherit it.

Chrome storage acceptance and local readback cannot establish remote delivery. Account identity is not delivery evidence either. See the [Chrome storage documentation](https://developer.chrome.com/docs/extensions/reference/api/storage) and [Chrome Extensions discussion of transport detection](https://groups.google.com/a/chromium.org/g/chromium-extensions/c/sCgqrxibbfo).

## Device test

The user opens **Test between devices**, starts a test on one installation and chooses **Receive test** on the other. The second user compares the displayed eight-character code and confirms. The sender checks for the corresponding receipt; after starting a test, while its panel is open, it also checks every five seconds. Polling pauses while the document or Advanced is hidden, stops on confirmation/error/expiry and is disposed on page exit. Merely opening Advanced performs no diagnostic writes. Tests may be requested while automatic vault sending is off.

Two bounded keys (`sp:device-test`, `sp:device-receipt`) contain random identifiers, times and, when available, a revision plus content digest. They contain no master passwords, entries, email addresses or vault keys. A random installation identifier stays in local storage. Starting a new test replaces the diagnostic slot; tests expire after five minutes. Same-installation confirmations, mismatched receipts, missing/changed encrypted revisions, future timestamps and expired tests are rejected. A test without a published current revision only confirms a diagnostic exchange.

This is a transport diagnostic with explicit participation, not device authorization or cryptographic proof of physical hardware identity. Anyone able to modify the transport metadata could fabricate a diagnostic receipt. It never grants access to the vault, changes encryption or resolves conflicts. Failure/expiry does not establish that browser Sync is disabled. A manual test can confirm an exchange at one moment; it cannot guarantee future delivery.

## Recovery and capacity corrections

Local restore selects from independently complete copies even when an unrelated generation is incomplete. It does not resolve or publish other generations. Combining and publication retain strict whole-inventory checks. Remote restore/combine now decrypt to a count comparison first, then require a second confirmation. Preview grants contain no plaintext/passwords, expire after five minutes, bind owner/document, session generation, source digest, operation and destination revision, reject clock rollback and are consumed once. Existing destination password/biometrics are preserved on local restore.

Activation checks total/per-item/item-count capacity for a candidate and a subsequent complete version of today's contents, with metadata headroom. Individual publication also rejects versions too large for two copies before writing chunks. This prevents accepting a first oversized publication that can never be replaced under the same size assumptions. It does not reserve cloud quota or guarantee capacity after vault growth, new branches, diagnostics or concurrent writes. There is no unsafe delete-current-before-upload fallback. Oversized vaults remain local and can be exported as encrypted backups.

**Clean old remote history** requires explicit confirmation, including when sending is off. It removes published ancestor items only, keeps active v2 and unversioned copies, and keeps unreferenced/in-flight chunks. Explicitly keeping local contents archives an older-format copy and binds its exact content fingerprint into the new ancestry; only that adopted fingerprint can later be retired by cleanup. An unrelated or changed older copy remains active. It cannot guarantee enough free space for another version. Off-mode automatic inspection/retry/cleanup remain disabled.

## Validation and manual acceptance

Automated checks are recorded in [VALIDATION.md](VALIDATION.md). The dedicated `npm run test:sync-setup-browser` uses two disposable Chromium profiles with deliberately emulated transport. New screenshots: [setup](screenshots/sync-setup/setup-light.png), [narrow device receipt](screenshots/sync-setup/receipt-narrow-dark.png), [capacity refusal](screenshots/sync-setup/capacity-dark.png).

For real transport acceptance, install the same extension identity in two disposable Google-authenticated Chrome profiles/devices, configure browser extension-data transport, enable sending after the guided check, and run the device test in both directions. Verify a real encrypted version reaches the receiver before confirming. Turn transport off/offline, repeat, and verify the UI shows waiting/expiry without declaring successful delivery. Restore/combine still requires user action. Do not use real credentials. This manual Google-authenticated check and physical-authenticator compatibility have not been completed by the automated suites.
