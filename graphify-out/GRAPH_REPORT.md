# Graph Report - SecurePass  (2026-10-28)

## Corpus Check
- 122 files · ~103,953 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: .css 5, (none) 3)

## Summary
- 1617 nodes · 3763 edges · 135 communities (90 shown, 45 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 46 edges (avg confidence: 0.86)
- Token cost: deterministic code extraction; host semantic-update token counts unavailable.

## Graph Freshness
- Built from commit: `1909aa3a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- syncService.js
- getStorage
- biometric/service.js
- Popup HTML semantic surfaces
- Recovery checkpoints behavior, protection and verification
- biometric/service.js
- Interface e revisão visual
- popup.js
- Revisão funcional histórica
- Inline master-password flow and independent management proportions
- checkpointReview.js
- sendMessage
- session.js
- Criptografia e armazenamento
- Autofill na página
- backupCrypto.js
- biometric.test.js
- biometric.test.js
- Documentação de Sync e dados
- crypto.js
- Modelo de segurança
- Checkpoint review design document
- Navegação e validação Settings
- Implementação e migração
- Quatro áreas das definições
- backupDialogs-browser.mjs
- vaultUnlock.js
- Navegação e composição popup
- popup.js
- Checkpoint review interaction and scoped action authorization
- Navegação e validação Settings
- syncSetup-browser.mjs
- Ferramentas de desenvolvimento
- Confirmação de autofill
- Ferramentas de desenvolvimento
- Ferramentas de desenvolvimento
- Ferramentas de desenvolvimento
- Account suggestions, inline tools and trusted-window confirmation contract
- popup.js
- checkpoints-browser.mjs
- Recovery checkpoints behavior, protection and verification
- Ferramentas de desenvolvimento
- Checkpoint review interaction
- Guided Chrome Sync setup and device verification
- Shared password and biometric method row
- REVIEW_BACKUP_ADVANCED.md
- Evidência visual das definições
- Quatro áreas das definições
- Análise de formulários
- Timestamped local version backup cards
- session.js
- cryptoVault.js
- Ícone 16 pixels
- Ícone 32 pixels
- Ícone 48 pixels
- Entrada do content script
- Documentação de Sync e dados
- Documentação de Sync e dados
- export dark 320 extension dialog screenshot
- export dark 400 extension dialog screenshot
- export error dark extension dialog screenshot
- export light 320 extension dialog screenshot
- export light 400 extension dialog screenshot
- export management dark extension dialog screenshot
- restore dark 320 extension dialog screenshot
- restore dark 400 extension dialog screenshot
- restore error dark extension dialog screenshot
- restore light 320 extension dialog screenshot
- restore light 400 extension dialog screenshot
- Light management checkpoint cards with one Review action
- Security settings light screenshot
- .put
- Operação de teste
- Contextual on-page key contract
- Security settings area
- sync-browser.mjs
- .put
- auth.js
- Local Settings Sync and Data Management work item
- recoveryDesign-browser.mjs
- Management inline checkpoint review in dark theme
- Device erasure confirmation modal
- Appearance popup with back navigation and Open in tab link
- Popup inline checkpoint review in dark theme
- Popup inline checkpoint review in light theme
- Dark management checkpoint cards with one Review action
- Light management checkpoint cards with one Review action
- Dark popup checkpoint card with one Review action
- Dark popup bounded vault unlock
- Separate whole-vault restore confirmation from inline review
- Recovery-surface presentation and unlock-controller refinement
- export dark 400 extension dialog screenshot
- Dark popup bounded whole-vault restore confirmation
- Light tab bounded whole-vault restore confirmation
- Dark popup compact checkpoint comparison
- Light tab compact checkpoint comparison
- Light popup checkpoint card with one Review action
- Dark popup bounded deleted-entry recovery confirmation
- Light popup bounded deleted-entry recovery confirmation
- Light tab bounded deleted-entry recovery confirmation
- Light popup bounded whole-vault restore confirmation
- saved version export dark extension dialog screenshot
- accountPrompts-browser.mjs
- Contextual on-page key
- Historical six-category frontend review
- Original SD review with later local increment notice
- SETTINGS_NAVIGATION.md
- 2026-10-25T22-07-51Z__popup-popup-html.md
- Guided Chrome Sync setup, manual discovery and device test
- Separate whole-vault restore confirmation from inline review
- Popup inline identity confirmation
- Popup inline new-master-password step
- Compact in-section checkpoint comparison
- Dark management checkpoint cards with one Review action
- Short account-specific deleted-entry confirmation
- Narrow dark registration generator inside the viewport
- Light contextual registration generator with primary Generate and fill
- Light review of a new captured login
- Compact popup save suggestion with origin, username and two actions
- Dark biometric alternative beside the master-password input
- Dark review of a password update
- Checkpoint recovery with inline comparison and fresh scoped confirmation

## God Nodes (most connected - your core abstractions)
1. `getStorage()` - 72 edges
2. `Comprehensive recommended v2 settings Sync devices and data plan` - 66 edges
3. `removeStorage()` - 54 edges
4. `Current architecture with implemented local and legacy increment` - 53 edges
5. `Validation and release checklist` - 52 edges
6. `withVaultOperation()` - 48 edges
7. `showToast()` - 46 edges
8. `setStorage()` - 45 edges
9. `Historical review of commit 5aed51c` - 44 edges
10. `Original SD review with later local increment notice` - 42 edges

## Surprising Connections (you probably didn't know these)
- `Closed-shadow tools follow theme and reposition with field and viewport; removal releases listeners` --references--> `positionPanel()`  [EXTRACTED]
  docs/ACCOUNT_PROMPTS.md → content/modules/ui.js
- `Full restore confirms only restored total and removals` --references--> `restoreWhole()`  [EXTRACTED]
  docs/issues/RECOVERY_SURFACES.md → popup/modules/checkpointReview.js
- `Checkpoint summary and detail separation verified` --documents verification of--> `renderCheckpoints()`  [EXTRACTED]
  docs/VALIDATION.md → popup/modules/checkpoints.js
- `Fresh identity confirmation replaces preliminary unlock and modal` --references--> `attachMasterPasswordListeners()`  [EXTRACTED]
  docs/MASTER_PASSWORD_FLOW.md → popup/modules/masterPassword.js
- `Restricted five-minute proposals, eight-item bound, metadata-only listing and deduplication` --references--> `listCandidateMetadata()`  [EXTRACTED]
  docs/ACCOUNT_PROMPTS.md → src/autofill/candidateStore.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Trusted autofill disclosure boundary** — architecture_capability_policy, architecture_autofill_confirmation, architecture_storage_restriction [EXTRACTED 1.00]
- **Whole-checkpoint restore authorization sequence** — docs_checkpoint_review_recent_authentication, docs_checkpoint_review_confirm_identity, docs_checkpoint_review_fresh_scoped_token, docs_checkpoint_review_secondary_restore [EXTRACTED 1.00]

## Communities (135 total, 45 thin omitted)

### Community 0 - "syncService.js"
Cohesion: 0.05
Nodes (103): Guided Chrome Sync setup, bounded capacity and non-authorizing device diagnostic, Guided setup Node/security and Chromium evidence with emulated transport boundaries, Guided setup supersedes parts of historical capacity and selected-restore findings, copyInBackground(), ensureOffscreen(), ALARM_NAME, BIOMETRIC_SESSION_PASSPHRASE_KEY, CHUNK_SIZE (+95 more)

### Community 1 - "getStorage"
Cohesion: 0.13
Nodes (44): handlers, ready, clearCandidates(), dismissCandidate(), inlineCandidate(), listCandidates, proposeCandidate(), reviewCandidate() (+36 more)

### Community 2 - "biometric/service.js"
Cohesion: 0.20
Nodes (25): begin(), cancelAuthentication(), consume(), context(), expireCeremonies(), finishAuthentication(), finishRegistration(), origin() (+17 more)

### Community 3 - "Popup HTML semantic surfaces"
Cohesion: 0.13
Nodes (23): Version and repository footer, System light and dark theme controls, Auto-lock inactivity preference, Backups, checkpoint cards and inline review settings area, Consistent fingerprint symbol for biometric entry points, Ownership-aware clipboard timeout explanation, Encrypted backup import and export controls, Popup HTML semantic surfaces (+15 more)

### Community 4 - "Recovery checkpoints behavior, protection and verification"
Cohesion: 0.04
Nodes (48): Archived Sync copies stay separate and exports are source-specific, Unlocked checkpoint counts, differences and affected-account examples, Remove one checkpoint or verify current password to clear local history, Recovery checkpoints behavior, protection and verification, Per-entry recovery through inline review and explicit confirmation, Existing-vault external and selected-remote restores preserve active authentication, Secondary full-restore review preserves current authentication, Unreadable legacy protection requires explicit unlock or removal (+40 more)

### Community 5 - "biometric/service.js"
Cohesion: 0.07
Nodes (40): attachGeneratorListeners(), avoidSimilar, copyGeneratedBtn, generateButton, generatedResult, generatorStatus, handleGenerate(), includeLower (+32 more)

### Community 6 - "Interface e revisão visual"
Cohesion: 0.05
Nodes (8): Comprehensive recommended v2 settings Sync devices and data plan, Chrome Identity, Chrome Storage, Drive appDataFolder, Drive errors, OWASP Cryptographic Storage, Web Crypto AES-GCM parameters, MV3 service worker lifecycle

### Community 9 - "Inline master-password flow and independent management proportions"
Cohesion: 0.14
Nodes (14): Approved inline identity/password/success and management proportions, Pre-save biometric revocation notice and optional setup again, Clear secrets and revoke the exact grant on leaving the inline flow, Inline master-password flow and independent management proportions, Two-minute single-use revision-bound password-change grant, Physical authenticator and actual toolbar sizing remain manual acceptance, Fresh identity confirmation replaces preliminary unlock and modal, Tab stylesheet separates desktop layout from compact popup presentation (+6 more)

### Community 10 - "checkpointReview.js"
Cohesion: 0.12
Nodes (53): account(), attachCheckpointReviewListeners(), changedFields(), checkFreshness(), clientId, closeReview(), date(), entryCount() (+45 more)

### Community 11 - "sendMessage"
Cohesion: 0.30
Nodes (16): attachBiometricListeners(), syncBiometricView(), attachMasterPasswordListeners(), sendMessage(), refreshState(), assert(), authenticateBiometric(), authorizeMasterPassword() (+8 more)

### Community 12 - "session.js"
Cohesion: 0.09
Nodes (28): Older checkpoint protection migration, Journey scope and unconfigured OAuth, Accessibility and website compatibility acceptance, Automated regression coverage, Backups and Advanced functional review, Backup dialog refinement evidence, Development validation commands, Recovery checkpoints implementation evidence (+20 more)

### Community 13 - "Criptografia e armazenamento"
Cohesion: 0.08
Nodes (20): Local backup safety and repeatable recovery cleanup, Preenchimento confirmado por origem e documento, Backups cifrados com pré-visualização de importação, Desbloqueio WebAuthn com PRF, Limites de capacidade e importação, Desenvolvimento e verificações, Chrome122 e âmbito de compatibilidade, Contribuições e licença MIT (+12 more)

### Community 14 - "Autofill na página"
Cohesion: 0.08
Nodes (23): action, default_popup, default_title, background, service_worker, type, content_scripts, content_security_policy (+15 more)

### Community 15 - "backupCrypto.js"
Cohesion: 0.11
Nodes (36): showToast(), biometricUnlockContainer, clearRevealTimer(), confirmMasterInput, createMasterSection, createVaultIconButton(), deleteCredential(), entryForm (+28 more)

### Community 16 - "biometric.test.js"
Cohesion: 0.22
Nodes (11): LOG_ENABLED, buffer, format(), isArrayBufferLike(), isPrimitive(), isSensitiveString(), logger, redactValue() (+3 more)

### Community 17 - "biometric.test.js"
Cohesion: 0.10
Nodes (23): fake-indexeddb, auth(), saveRequest(), sender, assertion(), b64(), client(), der() (+15 more)

### Community 18 - "Documentação de Sync e dados"
Cohesion: 0.11
Nodes (36): clearSecrets(), complete(), expired(), refresh(), requestId, run(), saveTargetChanged(), send() (+28 more)

### Community 19 - "crypto.js"
Cohesion: 0.13
Nodes (32): DECODER, decryptBackupPayload(), deriveBackupKey(), ENCODER, encryptBackupPayload(), isEncryptedBackupEnvelope(), rotateMasterPassword(), base64ToBuffer() (+24 more)

### Community 20 - "Modelo de segurança"
Cohesion: 0.27
Nodes (17): Inline unlock errors and retry without dismissing the form, resolveUnlockSetup(), setUnlockResolver(), attachUIListeners(), backFromSettings(), closeModal(), closeSettingsPanel(), manageFocus() (+9 more)

### Community 21 - "Checkpoint review design document"
Cohesion: 0.12
Nodes (16): Single checkpoint review entry, Inline checkpoint comparison, Confirm identity flow, Individual entry recovery, Checkpoint review design document, Authentication expiry during confirmation, Successful recovery refreshes review or returns to checkpoint list, Recovery review cleanup and navigation (+8 more)

### Community 23 - "Navegação e validação Settings"
Cohesion: 0.18
Nodes (31): recoveryStatus(), restoreRecovery(), vaultHandlers, normalizeSite(), readRecoveryRecords(), snapshotId(), BACKUP_VERSION, createVaultBackup() (+23 more)

### Community 24 - "Implementação e migração"
Cohesion: 0.15
Nodes (6): Delivered behavior, Executed checks, Remaining release gates, Review artifacts, Scenario coverage boundary, Settings UX implementation and evidence

### Community 26 - "backupDialogs-browser.mjs"
Cohesion: 0.17
Nodes (7): Delivery evidence, Information architecture, Interaction rules, Journey state machine, SC01–SC58 traceability, Screen sketches, Settings UX — journeys, screens and acceptance map

### Community 27 - "vaultUnlock.js"
Cohesion: 0.13
Nodes (14): Advanced control inventory, Scoped authentication and local erasure, Backups control inventory, Cache usage without duration control, Unified local and archived earlier versions, Executed validation, Four-area Settings revision, Historical General inventory (+6 more)

### Community 28 - "Navegação e composição popup"
Cohesion: 0.14
Nodes (10): done, files(), graph, js, manifest, pkg, root, visit() (+2 more)

### Community 29 - "popup.js"
Cohesion: 0.15
Nodes (14): Auto-lock vault slider, Set up biometric unlock action, Change master password action, Clear copied passwords slider, GitHub footer link, Settings category navigation: Appearance, Security, Backups & recovery, Advanced, Settings footer with version, GitHub link, and preference save status, Settings popup home screenshot (+6 more)

### Community 31 - "Navegação e validação Settings"
Cohesion: 0.17
Nodes (6): Recovery-surface checks recorded in validation evidence, Dedicated recovery UI browser command, test:recovery-ui-browser, captures, errors, root

### Community 32 - "syncSetup-browser.mjs"
Cohesion: 0.12
Nodes (6): test:sync-setup-browser runs the disposable guided Chrome Sync scenario, contexts, directories, errors, output, root

### Community 33 - "Ferramentas de desenvolvimento"
Cohesion: 0.18
Nodes (9): Backups & recovery — export and restore dialogs, Delivered interaction, Executed checks, Visual evidence, Limites e aceitação restante, Problemas reproduzidos e corrigidos, Revisão funcional — Backups & recovery e Advanced, Validação (+1 more)

### Community 34 - "Confirmação de autofill"
Cohesion: 0.18
Nodes (10): Local Settings Sync and Data Management work item, Local workflow acceptance requirements, Historical approved four-area revision on main, Historical frontend cleanup follow-up, Historical approved hierarchical implementation scope, Authorization contract, Delivered behavior, Inline master-password change and management layout (+2 more)

### Community 35 - "Ferramentas de desenvolvimento"
Cohesion: 0.20
Nodes (6): cancel(), captures, errors, idle(), root, ./modules/operationDialog.js

### Community 36 - "Ferramentas de desenvolvimento"
Cohesion: 0.20
Nodes (4): errors, layouts(), root, section()

### Community 38 - "Account suggestions, inline tools and trusted-window confirmation contract"
Cohesion: 0.13
Nodes (15): Review cancellation retains a proposal; dismissal/save/expiry/lock remove it, Restricted five-minute proposals, eight-item bound, metadata-only listing and deduplication, Compact dark master-password confirmation, Master password stays on the extension-owned page with retry and cancellation, Same-origin explicit save/update binds destination revision and preserves notes and identity, Fill and save consume authorization once under the operation lock, Inline review and dismissal validate origin, tab and document, Closed-shadow tools follow theme and reposition with field and viewport; removal releases listeners (+7 more)

### Community 39 - "popup.js"
Cohesion: 0.18
Nodes (19): attachCandidateListeners(), refreshCandidates(), attachManagementListeners(), refreshManagement(), attachSettingsListeners(), initialiseSettings(), saving, scheduleSettingsSave() (+11 more)

### Community 40 - "checkpoints-browser.mjs"
Cohesion: 0.20
Nodes (5): errors, root, server, shadowClick(), find()

### Community 41 - "Recovery checkpoints behavior, protection and verification"
Cohesion: 0.18
Nodes (4): captures, errors, root, seedReviewFixture()

### Community 42 - "Ferramentas de desenvolvimento"
Cohesion: 0.20
Nodes (8): Explicit account selection section, PRF alternative beside the master password field, Cancel confirmation button, Compact extension-owned login confirmation with shared popup tokens, Editable username and explicit selection before an update, with expired/already-saved states, Explicit new-login save or selected password update, auth.js module bootstrap, Master password unlock form

### Community 43 - "Checkpoint review interaction"
Cohesion: 0.11
Nodes (14): Approved interaction, Captures, Checkpoint review interaction, State and privacy, Checkpoint review scenario coverage and remaining acceptance, Behavior and presentation, Encryption and rotation, Evidence (+6 more)

### Community 44 - "Guided Chrome Sync setup and device verification"
Cohesion: 0.29
Nodes (6): Device test, Evidence shown to the user, Guided Chrome Sync setup and device verification, Recovery and capacity corrections, User journey, Validation and manual acceptance

### Community 45 - "Shared password and biometric method row"
Cohesion: 0.22
Nodes (10): Cancel, Unlock and icon-only fingerprint share one action row, Dark master-password identity with inline biometric method, Dark main vault unlock with inline biometric method, Shared password and biometric method row, Accessible fingerprint-only shortcut beside password, Inline identity form with biometric shortcut beside current password, New-password confirmation with biometric revocation warning, Inline master-password identity, new-password and success forms (+2 more)

### Community 46 - "REVIEW_BACKUP_ADVANCED.md"
Cohesion: 0.11
Nodes (19): devDependencies, fake-indexeddb@^6.2.4, playwright@1.56.1, name, private, scripts, check, package (+11 more)

### Community 47 - "Evidência visual das definições"
Cohesion: 0.22
Nodes (3): contexts, profiles, root

### Community 48 - "Quatro áreas das definições"
Cohesion: 0.25
Nodes (8): Vault unlock controller with bounded inline retry and WebAuthn cancellation, Compact comparison header and account rows, Recovery-surface presentation and unlock-controller refinement, Smaller cards and a shared contextual dimmed backdrop, Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Compact Unlock vault heading, current-password field and reveal control, Light tab bounded vault unlock

### Community 49 - "Análise de formulários"
Cohesion: 0.25
Nodes (8): 85 modules and four browser suites; Node evidence remains historical, Compact recovery presentation and consistent fingerprint entry points, Same dimmed and 2px-blurred extension context under unlock and recovery, Full restore confirms only restored total and removals, Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Compact Unlock vault heading, current-password field and reveal control, Dark popup bounded vault unlock

### Community 50 - "Timestamped local version backup cards"
Cohesion: 0.29
Nodes (7): Changed account labels Different fields: password and offers Restore details, Back to checkpoints remains part of the in-section view, Show matching entries checkbox includes matching count, Account rows offer a specific Recover entry action, Management inline checkpoint review in dark theme, Website or username search within the review, Review title/date and saved/deleted/different/newer counts

### Community 51 - "session.js"
Cohesion: 0.25
Nodes (11): tail, activate(), assertGeneration(), current(), generation(), onLock(), reconfigureTimeout(), revokeSession() (+3 more)

### Community 52 - "cryptoVault.js"
Cohesion: 0.21
Nodes (23): Independent management-tab layout with shared trusted pathname, Purpose-bound inline master-password authorization, changeMasterPassword(), changeMasterPasswordAuthorized(), clearVaultEntries(), deleteCredential(), importVaultData(), initializeVault() (+15 more)

### Community 53 - "Ícone 16 pixels"
Cohesion: 0.33
Nodes (6): Copy edit and delete controls, Credential cards, Generator Tester Vault tabs, Unlocked vault screenshot, Settings navigation, Search add and lock controls

### Community 54 - "Ícone 32 pixels"
Cohesion: 0.33
Nodes (6): Cancel and Restore vault remain visible in a compact footer, Actual extension visible under a shared dimmed blurred backdrop, Short current-password and biometric preservation statement, Short checkpoint and Sync effects notice, Dark popup bounded whole-vault restore confirmation, Restore total and To remove counts only

### Community 55 - "Ícone 48 pixels"
Cohesion: 0.33
Nodes (6): Cancel and Restore vault remain visible in a compact footer, Actual extension visible under a shared dimmed blurred backdrop, Short current-password and biometric preservation statement, Short checkpoint and Sync effects notice, Light popup bounded whole-vault restore confirmation, Restore total and To remove counts only

### Community 56 - "Entrada do content script"
Cohesion: 0.33
Nodes (6): Cancel and Restore vault remain visible in a compact footer, Actual extension visible under a shared dimmed blurred backdrop, Short current-password and biometric preservation statement, Short checkpoint and Sync effects notice, Light tab bounded whole-vault restore confirmation, Restore total and To remove counts only

### Community 57 - "Documentação de Sync e dados"
Cohesion: 0.47
Nodes (4): legacyClipboard(), read(), serial, write()

### Community 58 - "Documentação de Sync e dados"
Cohesion: 0.40
Nodes (5): Back to checkpoints remains part of the in-section view, Deleted account offers Recover entry; later accounts explicitly indicate removal by full restore, Popup inline checkpoint review in dark theme, Website or username search within the review, Review title/date and saved/deleted/different/newer counts

### Community 59 - "export dark 320 extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Back to checkpoints remains part of the in-section view, Deleted account offers Recover entry; later accounts explicitly indicate removal by full restore, Popup inline checkpoint review in light theme, Website or username search within the review, Review title/date and saved/deleted/different/newer counts

### Community 60 - "export dark 400 extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Website and Account identify the one entry to recover, Cancel and Recover entry remain in the footer, Actual extension visible under a shared dimmed blurred backdrop, Short one-entry and checkpoint/Sync effects, Dark popup bounded deleted-entry recovery confirmation

### Community 61 - "export error dark extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Website and Account identify the one entry to recover, Cancel and Recover entry remain in the footer, Actual extension visible under a shared dimmed blurred backdrop, Short one-entry and checkpoint/Sync effects, Light popup bounded deleted-entry recovery confirmation

### Community 62 - "export light 320 extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Website and Account identify the one entry to recover, Cancel and Recover entry remain in the footer, Actual extension visible under a shared dimmed blurred backdrop, Short one-entry and checkpoint/Sync effects, Light tab bounded deleted-entry recovery confirmation

### Community 63 - "export light 400 extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Lower-priority full-checkpoint area and Review full restore action, Checkpoint date and nonzero saved/deleted summary, Domain, account and Deleted entry row with Recover entry, Dark popup compact checkpoint comparison, Search website or username field

### Community 64 - "export management dark extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Lower-priority full-checkpoint area and Review full restore action, Checkpoint date and nonzero saved/deleted summary, Domain, account and Deleted entry row with Recover entry, Light tab compact checkpoint comparison, Search website or username field

### Community 65 - "restore dark 320 extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Single Cancel and Unlock row with compact spacing, Fingerprint-only shortcut beside password, Actual extension visible under a shared dimmed blurred backdrop, Compact Unlock vault heading, current-password field and reveal control, Dark popup bounded vault unlock with biometric alternative

### Community 66 - "restore dark 400 extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Inline Invalid master password or corrupted vault error with empty password field, Compact Unlock vault heading, current-password field and reveal control, Dark popup bounded vault unlock with inline error

### Community 67 - "restore error dark extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Inline Invalid master password or corrupted vault error with empty password field, Compact Unlock vault heading, current-password field and reveal control, Light popup bounded vault unlock with inline error

### Community 68 - "restore light 320 extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Inline Invalid master password or corrupted vault error with empty password field, Compact Unlock vault heading, current-password field and reveal control, Light tab bounded vault unlock with inline error

### Community 70 - "Light management checkpoint cards with one Review action"
Cohesion: 0.50
Nodes (4): One primary Review checkpoint button with secondary Export and Remove, Dated cards show sequence and aggregate entry differences without account examples, Backups & recovery sidebar selection and Recovery checkpoints heading remain visible, Light management checkpoint cards with one Review action

### Community 71 - "Security settings light screenshot"
Cohesion: 0.20
Nodes (10): Visible auto-lock vault slider shows 15 minutes, Visible biometric unlock setup card with collapsed explanation, Visible copied-password clearing slider shows After 30 seconds; best effort matching the last SecurePass copy, Visible GitHub footer link, Visible Change master password row asks to authenticate and choose a new vault password, Visible footer product version SecurePass v0.2.0, Visible Preferences saved status below product version, Security settings light screenshot (+2 more)

### Community 72 - ".put"
Cohesion: 0.50
Nodes (4): Review checkpoint primary action with secondary Export and Remove, Dated checkpoint with sequence, recoverable-entry and later-entry counts, Backups header and Open in tab remain visible above checkpoint cards, Dark popup checkpoint card with one Review action

### Community 73 - "Operação de teste"
Cohesion: 0.50
Nodes (4): Review checkpoint primary action with secondary Export and Remove, Dated checkpoint with sequence, recoverable-entry and later-entry counts, Backups header and Open in tab remain visible above checkpoint cards, Light popup checkpoint card with one Review action

### Community 74 - "Contextual on-page key contract"
Cohesion: 0.09
Nodes (23): Direct selector and original-field tool handoff, Native manual login creation form, Native secondary website tools disclosure, Source field and reserved native-tab request binding, Direct key opens explicit native account choice, Contextual on-page key contract, Executed contextual-key evidence and remaining manual acceptance, Pointer-transparent feedback preserves the next website action (+15 more)

### Community 76 - "Security settings area"
Cohesion: 0.50
Nodes (4): Set up biometric unlock card describing fingerprint, face, PIN or security key, Clear copied passwords after 30 seconds slider with best-effort copy-matching explanation, Security settings screenshot with password, clipboard, biometric controls and a toast, Visible toast states Legacy Sync mode updated and asks to unlock active vault again

### Community 77 - "sync-browser.mjs"
Cohesion: 0.50
Nodes (4): Password and fingerprint identity row, Fingerprint authentication affordance, Biometric identity confirmation capture, Dark compact identity dialog

### Community 78 - ".put"
Cohesion: 0.50
Nodes (4): Identity error and retry capture, Compact responsive error layout, Inline invalid password or corrupt vault error, Identity retry or cancellation controls

### Community 79 - "auth.js"
Cohesion: 0.50
Nodes (4): Password identity confirmation capture, Explicit identity confirmation actions, Current master-password identity form, Dimmed checkpoint review context

### Community 80 - "Local Settings Sync and Data Management work item"
Cohesion: 0.50
Nodes (4): Checkpoint date and nonzero saved/deleted summary, Domain, account and Deleted entry row with Recover entry, Light popup compact checkpoint comparison, Search website or username field

### Community 81 - "recoveryDesign-browser.mjs"
Cohesion: 0.50
Nodes (4): Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Compact Unlock vault heading, current-password field and reveal control, Light popup bounded vault unlock

### Community 82 - "Management inline checkpoint review in dark theme"
Cohesion: 0.50
Nodes (4): Settings navigation: Appearance selected, Security, Backups & recovery, Advanced, Reset preferences row says theme, generator and timeout defaults are restored and vault is kept, Dark appearance settings screenshot, Theme choices: System selected, Light, Dark

### Community 83 - "Device erasure confirmation modal"
Cohesion: 0.50
Nodes (4): Typed confirmation shows wrong with ERASE THIS DEVICE error, Device erasure confirmation modal, Visible local erasure scope text says remote copies remain, Verification dropdown shows erase without unlocking

### Community 84 - "Appearance popup with back navigation and Open in tab link"
Cohesion: 0.50
Nodes (4): Preferences save automatically notice, Appearance popup with back navigation and Open in tab link, Reset preferences copy lists theme, generator and timeout defaults and says vault is kept, System, Light, and Dark theme choices; System visibly selected

### Community 86 - "Popup inline checkpoint review in light theme"
Cohesion: 0.67
Nodes (3): Timestamped encrypted local-version backup cards with Restore and Export buttons, Legacy Sync mode update notice requesting active vault unlock, Backups and recovery settings screenshot

### Community 112 - "accountPrompts-browser.mjs"
Cohesion: 0.17
Nodes (17): 133 Node tests, 93 modules and disposable account-prompt Chromium evidence, Dedicated disposable account-prompt Chromium command, capture(), errors, nextPage(), openFill(), openSaveEntered(), openTools() (+9 more)

### Community 113 - "Contextual on-page key"
Cohesion: 0.15
Nodes (11): Account suggestions and inline login tools, Integrity and capability boundaries, Surfaces and interaction, Validation, Why a save suggestion appears, Contextual on-page key, Executed evidence and manual acceptance, Feedback and concurrent prompts (+3 more)

### Community 115 - "Historical six-category frontend review"
Cohesion: 0.20
Nodes (7): Historical accessible themes ranges and saving feedback, Historical six-category navigation, Historical six-category frontend review, Historical settings disclosures unlock and focus corrections, Historical independent Impeccable review evidence, Historical hTML category ownership and dedicated settings styles, Historical frontend regression evidence and manual limits

### Community 117 - "SETTINGS_NAVIGATION.md"
Cohesion: 0.29
Nodes (9): Compatible Settings fragments, Executed verification, Hierarchical Settings navigation, Navigation history, focus and scroll preservation, Implemented behavior, Manual review and limits, Preserved Settings behavior and security contracts, Shared Settings footer across navigation layouts (+1 more)

### Community 118 - "2026-10-25T22-07-51Z__popup-popup-html.md"
Cohesion: 0.29
Nodes (6): Readable cache row layout correction, Reproduced cache status layout defect, Historical navigation and dialog recommendations, Recovery discovery and terminology concerns, Visual critique and accessibility limits, Breach-check cache management

### Community 119 - "Guided Chrome Sync setup, manual discovery and device test"
Cohesion: 0.29
Nodes (7): Advanced Chrome Sync setup and local maintenance, Scoped entry clearing and local device erasure, Explicit legacy remote version review, Guided Chrome Sync setup, manual discovery and device test, Remote source unlock then entry-count comparison and confirmation, Configure Chrome Sync then separately enable automatic sending, Explicit matching-code device test and historical receipt status

### Community 121 - "Separate whole-vault restore confirmation from inline review"
Cohesion: 0.50
Nodes (4): Cancel and Restore vault in the confirmation footer, Copy preserves current authentication and keeps current contents as a checkpoint while turning automatic Sync off, Separate whole-vault restore confirmation from inline review, Compact confirmation shows saved-entry count and highlighted removal count

### Community 123 - "Popup inline identity confirmation"
Cohesion: 0.40
Nodes (5): Continue and Cancel actions on the same row, Use biometric unlock instead action, Security header, Open in tab action and fixed footer remain visible, Empty current-master-password field with reveal control, Popup inline identity confirmation

### Community 124 - "Popup inline new-master-password step"
Cohesion: 0.40
Nodes (5): Save new password and Cancel actions on one row, Empty new-password and confirmation fields with reveal controls, Visible guidance to use at least 16 characters, Popup inline new-master-password step, Pre-save warning that biometric unlock on this device will be turned off

### Community 125 - "Compact in-section checkpoint comparison"
Cohesion: 0.40
Nodes (5): Compact in-section checkpoint comparison, Checkpoint cards and inline review with separate archived copies, Accessible compact comparison search and matching controls, Secondary whole-checkpoint review with preserved authentication copy, Stale review warning and refresh action

### Community 126 - "Dark management checkpoint cards with one Review action"
Cohesion: 0.50
Nodes (4): One primary Review checkpoint button with secondary Export and Remove, Dated cards show sequence and aggregate entry differences without account examples, Backups & recovery sidebar selection and Recovery checkpoints heading remain visible, Dark management checkpoint cards with one Review action

### Community 127 - "Short account-specific deleted-entry confirmation"
Cohesion: 0.50
Nodes (4): Website and username identify the deleted entry to recover, Cancel and Recover entry without an account dropdown, Copy preserves other entries, current master password/biometrics and existing Sync mode, Short account-specific deleted-entry confirmation

## Knowledge Gaps
- **352 isolated node(s):** `Independent management-tab layout with shared trusted pathname`, `Recover an entry, Restore whole vault, Export and Remove actions`, `Dated checkpoint cards with saved entry counts, sequence and account differences`, `Recovery checkpoints heading, Clear history and three-state policy`, `Four-section sidebar with Backups & recovery selected` (+347 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 787 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **45 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Current architecture with implemented local and legacy increment` connect `Revisão funcional histórica` to `Ferramentas de desenvolvimento`, `Confirmação de autofill`, `restore light 400 extension dialog screenshot`, `Ferramentas de desenvolvimento`, `Checkpoint recovery with inline comparison and fresh scoped confirmation`, `Interface e revisão visual`, `popup.js`, `Ferramentas de desenvolvimento`, `Criptografia e armazenamento`, `Quatro áreas das definições`, `cryptoVault.js`, `Original SD review with later local increment notice`, `Implementação e migração`, `backupDialogs-browser.mjs`?**
  _High betweenness centrality (0.295) - this node is a cross-community bridge._
- **What connects `Independent management-tab layout with shared trusted pathname`, `Recover an entry, Restore whole vault, Export and Remove actions`, `Dated checkpoint cards with saved entry counts, sequence and account differences` to the rest of the system?**
  _352 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `syncService.js` be split into smaller, more focused modules?**
  _Cohesion score 0.053268765133171914 - nodes in this community are weakly interconnected._
- **Why does `Checkpoint recovery with inline comparison and fresh scoped confirmation` connect `Checkpoint recovery with inline comparison and fresh scoped confirmation` to `Revisão funcional histórica`, `Recovery checkpoints behavior, protection and verification`, `Navegação e validação Settings`?**
  _High betweenness centrality (0.164) - this node is a cross-community bridge._
- **Should `getStorage` be split into smaller, more focused modules?**
  _Cohesion score 0.13019607843137254 - nodes in this community are weakly interconnected._
- **Why does `Recovery-surface presentation and unlock-controller refinement` connect `Quatro áreas das definições` to `export management dark extension dialog screenshot`, `restore dark 320 extension dialog screenshot`, `restore dark 400 extension dialog screenshot`, `restore error dark extension dialog screenshot`, `restore light 320 extension dialog screenshot`, `Local Settings Sync and Data Management work item`, `Análise de formulários`, `export light 400 extension dialog screenshot`, `recoveryDesign-browser.mjs`, `Modelo de segurança`, `Ícone 32 pixels`, `Ícone 48 pixels`, `Entrada do content script`, `export dark 400 extension dialog screenshot`, `export error dark extension dialog screenshot`, `export light 320 extension dialog screenshot`, `Navegação e validação Settings`?**
  _High betweenness centrality (0.119) - this node is a cross-community bridge._
- **Should `Popup HTML semantic surfaces` be split into smaller, more focused modules?**
  _Cohesion score 0.13438735177865613 - nodes in this community are weakly interconnected._