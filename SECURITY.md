# Security model

SecurePass protects stored credential contents with native Web Crypto. It does not protect an already unlocked browser against a fully compromised extension process, operating system, malicious extension update or a user deliberately granting an attacker access to the extension UI.

- Never enter the master password into a website. SecurePass asks for it only on `chrome-extension://…` pages. The inline tools contain no master password field.
- Autofill is an explicit disclosure to the selected exact website origin. The website can read its own filled fields; SecurePass cannot make a malicious destination safe.
- The data key is present in restricted browser session memory while unlocked. JavaScript cannot guarantee physical erasure of strings or all runtime copies. Locking revokes access and drops application-held references; it is not a secure-memory-erasure guarantee.
- Device biometric registration metadata is local. PRF output is never sent to visited pages or persisted. WebAuthn may use a PIN/security key rather than a biometric sensor; SecurePass requires user verification, not a particular modality.
- Disabling biometrics deletes the local wrapper. Changing the master password rotates the live data key and deletes local biometric setup. Old snapshots and external backups remain decryptable with their historical passwords.
- Original Trusted Device keys and plaintext biometric session seeds are removed. Legacy biometric setup must be registered again on PRF-capable hardware. Unsupported hardware uses the master password.
- HIBP is optional and contacted only after a check request. Five hash characters leave the extension, not the password or full hash. Response padding is retained. An absent breach result does not imply a strong or safe password.
- Clipboard access is broader than writing alone because cleanup checks ownership before erasing. Contents are transient, never written to storage, and cleanup is best effort. The clipboard listener only accepts the bundled background worker as sender.
- Save candidates are transient, restricted to extension contexts and expire after five minutes. They are suggestions, not evidence that a site accepted the login. Confirm acceptance before saving/updating.

## Migration and recovery

Make an encrypted backup before upgrading an existing installation. Unversioned encrypted vaults migrate on successful unlock; the prior record is retained as an encrypted snapshot. Original password normalization cannot be reversed: use the actual password the old version stored, without assuming the new version will silently remove symbols/spaces.

The last five local records and a device-local archive of up to 20 remote records are retained for recovery. Keep exported backups separately. Device erasure deletes local history but leaves remote copies; an all-device deletion workflow is not implemented. Recovery requires the password of the chosen snapshot. Never send real exports or passwords in bug reports.

Sync generations are immutable and individually encrypted. It is possible to receive an incomplete or divergent generation. Preserve the local copy and resolve explicitly. Chrome Sync is a transport with small quotas, not an unlimited vault backup service.

## Settings/data increment and remaining risks

The [implementation evidence](docs/SETTINGS_UX_IMPLEMENTATION.md) records local/legacy mitigations and their limits. New master passwords require 16 characters; existing passwords remain accepted for unlock. Preview commits are bound to input/destination/session; local restores do not publish; selected-head merges preserve the destination key; off-mode writes are guarded. Google Drive and signed-device/recovery-kit features are not available. The following risk inventory describes the original review baseline and must be read with that increment; no full release or independent audit is claimed.

## Remaining settings, Sync and recovery risks

The [original review](docs/REVIEW_SETTINGS_SYNC_DATA.md) records the baseline defects. The local increment mitigates invalid merges, selected-head retirement, off-mode publication, preference races, unstable snapshot selection and local-erasure dependencies, with tests scoped in [implementation evidence](docs/SETTINGS_UX_IMPLEMENTATION.md). This does not close the full plan.

Transport checksums do not provide atomic multi-device delivery or prove arrival at another device. Legacy quota limits can still prevent updates; abandoned chunks are not automatically reclaimed. Strict mutation still blocks on ambiguous remote history, although manual inspection preserves access to valid candidates. Cross-store mode/recovery operations remain an acceptance gap.

Single-snapshot exports are now individually restorable; a large aggregate legacy archive still needs the streaming reader. Historical passwords continue to open historical copies. Clear Vault can publish deletion of current entries while snapshots remain. Explicit local force erasure does not grant decryption access and leaves remote data alone. There is no implemented all-device erasure, recovery kit or signed-device revocation protocol.

Reducing auto-lock now updates the active deadline and restore refreshes the effective Sync mode. These corrections are covered locally; physical authenticator/SO behavior and the full 58-scenario target still require acceptance. The linked review/plan/validation files are source-repository documentation and are not bundled in the runtime-only ZIP.

## Validation limits

Automated tests exercise cryptographic round trips, forged assertions, revocation, offline conflict histories and browser boundaries with fictional data. A virtual PRF authenticator does not validate a particular Windows Hello, Touch ID or physical security-key implementation. Google-authenticated multi-device transport, OS clipboard behavior after sleep and hardware-specific cancellation must also be checked before distributing a release. See `docs/VALIDATION.md`.
