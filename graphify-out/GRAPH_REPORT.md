# Graph Report - SecurePass  (2026-11-05)

## Corpus Check
- 156 files · ~125,652 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: .css 6, (none) 3)

## Summary
- 1822 nodes · 4246 edges · 146 communities (102 shown, 44 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 54 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5fe4ba17`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- SETTINGS_UX_IMPLEMENTATION.md
- Security model and open risks
- getStorage
- Popup HTML semantic surfaces
- Recovery checkpoints behavior, protection and verification
- biometric/service.js
- Interface e revisão visual
- popup.js
- Revisão funcional histórica
- Inline master-password flow and independent management proportions
- checkpointReview.js
- popup.js
- session.js
- Criptografia e armazenamento
- Autofill na página
- backupCrypto.js
- storage.js
- IMPLEMENTATION_CHECKLIST.md
- Documentação de Sync e dados
- Separate whole-vault restore confirmation from inline review
- Modelo de segurança
- Checkpoint review design document
- driveTransport.js
- googleConfiguration.test.js
- cryptoVault.js
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
- ref_node_assert
- checkpoints-browser.mjs
- Recovery checkpoints behavior, protection and verification
- Ferramentas de desenvolvimento
- Checkpoint review interaction
- Guided Chrome Sync setup and device verification
- logger.js
- REVIEW_BACKUP_ADVANCED.md
- Evidência visual das definições
- Quatro áreas das definições
- Análise de formulários
- Timestamped local version backup cards
- crypto.js
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
- masterPassword.test.js
- biometric.test.js
- accountPrompts.test.js
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
- Dark management checkpoint list
- Historical six-category frontend review
- ref_node_url
- SETTINGS_NAVIGATION.md
- Shared password and biometric method row
- 2026-10-25T22-07-51Z__popup-popup-html.md
- Original SD review with later local increment notice
- Guided Chrome Sync setup, manual discovery and device test
- Compact in-section checkpoint comparison
- selector.js
- checkpointReview.js
- Light management checkpoint cards with one Review action
- Light management checkpoint list
- Dark popup checkpoint cards
- Narrow dark registration generator inside the viewport
- Light contextual registration generator with primary Generate and fill
- Light review of a new captured login
- Compact popup save suggestion with origin, username and two actions
- Dark biometric alternative beside the master-password input
- Dark review of a password update
- authorizationStore.js
- Guided Chrome Sync setup and receipt evidence contract
- Light popup checkpoint cards
- playwright
- Individual entry recovery review dialog
- Whole-vault restore review dialog
- publication.test.js
- Dark management checkpoint cards with one Review action
- Short account-specific deleted-entry confirmation
- Compact dark master-password confirmation
- Implementation checklist: partial implementation, release not accepted

## God Nodes (most connected - your core abstractions)
1. `Version 3 settings Sync data and compact login plan` - 98 edges
2. `getStorage()` - 72 edges
3. `removeStorage()` - 54 edges
4. `Current architecture with implemented local and legacy increment` - 53 edges
5. `Validation and release checklist` - 52 edges
6. `withVaultOperation()` - 51 edges
7. `setStorage()` - 48 edges
8. `showToast()` - 46 edges
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
- **Whole-checkpoint restore authorization sequence** — docs_checkpoint_review_recent_authentication, docs_checkpoint_review_confirm_identity, docs_checkpoint_review_fresh_scoped_token, docs_checkpoint_review_secondary_restore [EXTRACTED 1.00]

## Communities (146 total, 44 thin omitted)

### Community 0 - "SETTINGS_UX_IMPLEMENTATION.md"
Cohesion: 0.15
Nodes (6): Delivered behavior, Executed checks, Remaining release gates, Review artifacts, Scenario coverage boundary, Settings UX implementation and evidence

### Community 2 - "getStorage"
Cohesion: 0.05
Nodes (116): Independent management-tab layout with shared trusted pathname, Purpose-bound inline master-password authorization, handlers, ready, clearCandidates(), dismissCandidate(), inlineCandidate(), listCandidates (+108 more)

### Community 3 - "Popup HTML semantic surfaces"
Cohesion: 0.13
Nodes (23): Version and repository footer, System light and dark theme controls, Auto-lock inactivity preference, Backups, checkpoint cards and inline review settings area, Consistent fingerprint symbol for biometric entry points, Ownership-aware clipboard timeout explanation, Encrypted backup import and export controls, Popup HTML semantic surfaces (+15 more)

### Community 4 - "Recovery checkpoints behavior, protection and verification"
Cohesion: 0.12
Nodes (19): Checkpoint recovery with inline comparison and fresh scoped confirmation, Inline checkpoint review module and displayed-comparison identity, Archived Sync copies stay separate and exports are source-specific, Unlocked checkpoint counts, differences and affected-account examples, Remove one checkpoint or verify current password to clear local history, Recovery checkpoints behavior, protection and verification, Per-entry recovery through inline review and explicit confirmation, Existing-vault external and selected-remote restores preserve active authentication (+11 more)

### Community 5 - "biometric/service.js"
Cohesion: 0.08
Nodes (39): attachGeneratorListeners(), avoidSimilar, copyGeneratedBtn, generateButton, generatedResult, generatorStatus, handleGenerate(), includeLower (+31 more)

### Community 6 - "Interface e revisão visual"
Cohesion: 0.03
Nodes (39): REQUIRED FUTURE UI: Google-like account suggestions anchored to login field after protected unlock; current separate compact window is interim, not final acceptance, REQUIRED FUTURE UI: Google-like account suggestions anchored to login field after protected unlock; current separate compact window is interim, not final acceptance, ARCHITECTURE.md: explicit repository Drive packet commits record/checkpoint/outbox atomically; 166 Node tests, 104-module check and real Chromium IndexedDB rollback passed; automatic signed packet preparation and production activation pending, docs/DRIVE_TRANSPORT.md: explicit repository Drive packet commits record/checkpoint/outbox atomically; 166 Node tests, 104-module check and real Chromium IndexedDB rollback passed; automatic signed packet preparation and production activation pending, docs/IMPLEMENTATION_CHECKLIST.md: explicit repository Drive packet commits record/checkpoint/outbox atomically; 166 Node tests, 104-module check and real Chromium IndexedDB rollback passed; automatic signed packet preparation and production activation pending, docs/VALIDATION.md: explicit repository Drive packet commits record/checkpoint/outbox atomically; 166 Node tests, 104-module check and real Chromium IndexedDB rollback passed; automatic signed packet preparation and production activation pending, docs/SIGNED_PROTOCOL.md: Internal prototype: domain-separated P-256 administrative chain and signed encrypted-v2 revisions; independent root and known checkpoint required; protected admin/device keys and durable checkpoint CAS; not activated and independent protocol review pending, Version 3 settings Sync data and compact login plan (+31 more)

### Community 8 - "Revisão funcional histórica"
Cohesion: 0.05
Nodes (3): Current architecture with implemented local and legacy increment, Invisible offscreen clipboard document, offscreen.js clipboard handler

### Community 9 - "Inline master-password flow and independent management proportions"
Cohesion: 0.06
Nodes (34): Approved inline identity/password/success and management proportions, Pre-save biometric revocation notice and optional setup again, Clear secrets and revoke the exact grant on leaving the inline flow, Inline master-password flow and independent management proportions, Two-minute single-use revision-bound password-change grant, Physical authenticator and actual toolbar sizing remain manual acceptance, Fresh identity confirmation replaces preliminary unlock and modal, Tab stylesheet separates desktop layout from compact popup presentation (+26 more)

### Community 10 - "checkpointReview.js"
Cohesion: 0.17
Nodes (32): attachCheckpointListeners(), date(), deleteHistory(), handleCheckpointAction(), plural(), renderCheckpoints(), accessibleDestination(), attachDataListeners() (+24 more)

### Community 11 - "popup.js"
Cohesion: 0.21
Nodes (21): attachBiometricListeners(), syncBiometricView(), attachCandidateListeners(), refreshCandidates(), syncGeneratorControls(), refreshManagement(), attachMasterPasswordListeners(), sendMessage() (+13 more)

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
Nodes (37): attachManagementListeners(), showToast(), biometricUnlockContainer, clearRevealTimer(), confirmMasterInput, createMasterSection, createVaultIconButton(), deleteCredential() (+29 more)

### Community 16 - "storage.js"
Cohesion: 0.15
Nodes (18): ALARM_NAME, BIOMETRIC_SESSION_PASSPHRASE_KEY, CHUNK_SIZE, CLIPBOARD_ALARM_NAME, DB_STORE_NAME, DB_VERSION, META_KEY, PRF_EVAL_LABEL (+10 more)

### Community 17 - "IMPLEMENTATION_CHECKLIST.md"
Cohesion: 0.06
Nodes (26): Account suggestions and inline login tools, Integrity and capability boundaries, Surfaces and interaction, Validation, Why a save suggestion appears, Capacidades e vinculação, Evidência, Manifesto e limites (+18 more)

### Community 18 - "Documentação de Sync e dados"
Cohesion: 0.10
Nodes (42): clearSecrets(), complete(), expired(), refresh(), requestId, run(), saveTargetChanged(), send() (+34 more)

### Community 19 - "Separate whole-vault restore confirmation from inline review"
Cohesion: 0.50
Nodes (4): Cancel and Restore vault in the confirmation footer, Copy preserves current authentication and keeps current contents as a checkpoint while turning automatic Sync off, Separate whole-vault restore confirmation from inline review, Compact confirmation shows saved-entry count and highlighted removal count

### Community 20 - "Modelo de segurança"
Cohesion: 0.27
Nodes (17): Inline unlock errors and retry without dismissing the form, resolveUnlockSetup(), setUnlockResolver(), attachUIListeners(), backFromSettings(), closeModal(), closeSettingsPanel(), manageFocus() (+9 more)

### Community 21 - "Checkpoint review design document"
Cohesion: 0.12
Nodes (16): Single checkpoint review entry, Inline checkpoint comparison, Confirm identity flow, Individual entry recovery, Checkpoint review design document, Authentication expiry during confirmation, Successful recovery refreshes review or returns to checkpoint list, Recovery review cleanup and navigation (+8 more)

### Community 23 - "driveTransport.js"
Cohesion: 0.21
Nodes (13): bounded(), classify(), createDriveClient(), guard(), publish(), request(), createDriveReader(), createDriveTransport() (+5 more)

### Community 24 - "googleConfiguration.test.js"
Cohesion: 0.15
Nodes (6): base, config, der, extensionId, { publicKey }, expected

### Community 25 - "cryptoVault.js"
Cohesion: 0.07
Nodes (116): DECODER, decryptBackupPayload(), deriveBackupKey(), ENCODER, encryptBackupPayload(), isEncryptedBackupEnvelope(), changeMasterPassword(), changeMasterPasswordAuthorized() (+108 more)

### Community 26 - "backupDialogs-browser.mjs"
Cohesion: 0.17
Nodes (7): Delivery evidence, Information architecture, Interaction rules, Journey state machine, SC01–SC58 traceability, Screen sketches, Settings UX — journeys, screens and acceptance map

### Community 27 - "vaultUnlock.js"
Cohesion: 0.13
Nodes (14): Advanced control inventory, Scoped authentication and local erasure, Backups control inventory, Cache usage without duration control, Unified local and archived earlier versions, Executed validation, Four-area Settings revision, Historical General inventory (+6 more)

### Community 28 - "Navegação e composição popup"
Cohesion: 0.12
Nodes (14): done, files(), graph, js, manifest, pkg, root, visit() (+6 more)

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
Cohesion: 0.14
Nodes (14): Review cancellation retains a proposal; dismissal/save/expiry/lock remove it, Restricted five-minute proposals, eight-item bound, metadata-only listing and deduplication, Same-origin explicit save/update binds destination revision and preserves notes and identity, Fill and save consume authorization once under the operation lock, Inline review and dismissal validate origin, tab and document, Closed-shadow tools follow theme and reposition with field and viewport; removal releases listeners, Real SSO, toolbar, physical authenticators and screen readers remain manual checks, Public status, account and Sync reads wait for writes and erasure (+6 more)

### Community 39 - "ref_node_assert"
Cohesion: 0.16
Nodes (11): fake-indexeddb, alarms, areas, event(), failWhen(), fault, installChrome(), resetStorage() (+3 more)

### Community 40 - "checkpoints-browser.mjs"
Cohesion: 0.13
Nodes (8): frameFor(), projectRoot, server, errors, root, server, shadowClick(), find()

### Community 41 - "Recovery checkpoints behavior, protection and verification"
Cohesion: 0.20
Nodes (3): captures, errors, root

### Community 42 - "Ferramentas de desenvolvimento"
Cohesion: 0.20
Nodes (8): Explicit account selection section, PRF alternative beside the master password field, Cancel confirmation button, Compact extension-owned login confirmation with shared popup tokens, Editable username and explicit selection before an update, with expired/already-saved states, Explicit new-login save or selected password update, auth.js module bootstrap, Master password unlock form

### Community 43 - "Checkpoint review interaction"
Cohesion: 0.11
Nodes (14): Approved interaction, Captures, Checkpoint review interaction, State and privacy, Checkpoint review scenario coverage and remaining acceptance, Behavior and presentation, Encryption and rotation, Evidence (+6 more)

### Community 44 - "Guided Chrome Sync setup and device verification"
Cohesion: 0.29
Nodes (6): Device test, Evidence shown to the user, Guided Chrome Sync setup and device verification, Recovery and capacity corrections, User journey, Validation and manual acceptance

### Community 45 - "logger.js"
Cohesion: 0.22
Nodes (11): LOG_ENABLED, buffer, format(), isArrayBufferLike(), isPrimitive(), isSensitiveString(), logger, redactValue() (+3 more)

### Community 46 - "REVIEW_BACKUP_ADVANCED.md"
Cohesion: 0.12
Nodes (17): scripts, check, configure:google, package, test, test:account-prompts-browser, test:anchored-browser, test:backup-dialogs-browser (+9 more)

### Community 47 - "Evidência visual das definições"
Cohesion: 0.25
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

### Community 52 - "crypto.js"
Cohesion: 0.08
Nodes (58): 1. Escolher a identidade da extensão, 2. Criar/configurar o projeto Google, 3. Gerar uma cópia de desenvolvimento, Configurar Google Cloud para o SecurePass, Dados necessários para continuar a integração real, abortable(), assert(), authorizeMasterPassword() (+50 more)

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

### Community 69 - "masterPassword.test.js"
Cohesion: 0.22
Nodes (7): AUTH, CONTENT, SELECTOR, authorize(), call(), clientId, sender

### Community 70 - "biometric.test.js"
Cohesion: 0.42
Nodes (7): assertion(), b64(), client(), der(), registration(), request(), sender

### Community 71 - "accountPrompts.test.js"
Cohesion: 0.40
Nodes (4): auth(), entry(), saveRequest(), sender

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
Cohesion: 0.20
Nodes (16): Dedicated disposable account-prompt Chromium command, capture(), errors, nextPage(), openFill(), openSaveEntered(), openTools(), output (+8 more)

### Community 113 - "Dark management checkpoint list"
Cohesion: 0.40
Nodes (5): Recover an entry, Restore whole vault, Export and Remove actions, Dated checkpoint cards with saved entry counts, sequence and account differences, Recovery checkpoints heading, Clear history and three-state policy, Dark management checkpoint list, Four-section sidebar with Backups & recovery selected

### Community 115 - "Historical six-category frontend review"
Cohesion: 0.20
Nodes (7): Historical accessible themes ranges and saving feedback, Historical six-category navigation, Historical six-category frontend review, Historical settings disclosures unlock and focus corrections, Historical independent Impeccable review evidence, Historical hTML category ownership and dedicated settings styles, Historical frontend regression evidence and manual limits

### Community 116 - "ref_node_url"
Cohesion: 0.21
Nodes (6): root, root, root, run, root, vector

### Community 117 - "SETTINGS_NAVIGATION.md"
Cohesion: 0.29
Nodes (9): Compatible Settings fragments, Executed verification, Hierarchical Settings navigation, Navigation history, focus and scroll preservation, Implemented behavior, Manual review and limits, Preserved Settings behavior and security contracts, Shared Settings footer across navigation layouts (+1 more)

### Community 118 - "Shared password and biometric method row"
Cohesion: 0.22
Nodes (10): Cancel, Unlock and icon-only fingerprint share one action row, Dark master-password identity with inline biometric method, Dark main vault unlock with inline biometric method, Shared password and biometric method row, Accessible fingerprint-only shortcut beside password, Inline identity form with biometric shortcut beside current password, New-password confirmation with biometric revocation warning, Inline master-password identity, new-password and success forms (+2 more)

### Community 119 - "2026-10-25T22-07-51Z__popup-popup-html.md"
Cohesion: 0.29
Nodes (6): Readable cache row layout correction, Reproduced cache status layout defect, Historical navigation and dialog recommendations, Recovery discovery and terminology concerns, Visual critique and accessibility limits, Breach-check cache management

### Community 121 - "Guided Chrome Sync setup, manual discovery and device test"
Cohesion: 0.29
Nodes (7): Advanced Chrome Sync setup and local maintenance, Scoped entry clearing and local device erasure, Explicit legacy remote version review, Guided Chrome Sync setup, manual discovery and device test, Remote source unlock then entry-count comparison and confirmation, Configure Chrome Sync then separately enable automatic sending, Explicit matching-code device test and historical receipt status

### Community 122 - "Compact in-section checkpoint comparison"
Cohesion: 0.33
Nodes (6): Recovery checkpoints heading, Clear history and local/archive inventory, Compact in-section checkpoint comparison, Checkpoint cards and inline review with separate archived copies, Accessible compact comparison search and matching controls, Secondary whole-checkpoint review with preserved authentication copy, Stale review warning and refresh action

### Community 123 - "selector.js"
Cohesion: 0.56
Nodes (8): clear(), finish(), refresh(), render(), requestId, run(), send(), settleLayout()

### Community 124 - "checkpointReview.js"
Cohesion: 0.30
Nodes (21): account(), attachCheckpointReviewListeners(), changedFields(), checkFreshness(), clientId, closeReview(), date(), entryCount() (+13 more)

### Community 125 - "Light management checkpoint cards with one Review action"
Cohesion: 0.50
Nodes (4): One primary Review checkpoint button with secondary Export and Remove, Dated cards show sequence and aggregate entry differences without account examples, Backups & recovery sidebar selection and Recovery checkpoints heading remain visible, Light management checkpoint cards with one Review action

### Community 126 - "Light management checkpoint list"
Cohesion: 0.40
Nodes (5): Recover an entry, Restore whole vault, Export and Remove actions, Dated checkpoint cards with saved entry counts, sequence and account differences, Recovery checkpoints heading, Clear history and three-state policy, Light management checkpoint list, Four-section sidebar with Backups & recovery selected

### Community 127 - "Dark popup checkpoint cards"
Cohesion: 0.40
Nodes (5): Entry recovery, whole-vault restore, Export and Remove fit wrapped action rows, Dated checkpoint cards with sequence, entry counts and recoverable-account examples, Version and GitHub footer with automatic-save status, Backups & recovery header, Back and Open in tab remain visible, Dark popup checkpoint cards

### Community 134 - "authorizationStore.js"
Cohesion: 0.54
Nodes (7): advanceAuthorization(), key(), loadAuthorization(), pinAuthorization(), read(), write(), getDB()

### Community 135 - "Guided Chrome Sync setup and receipt evidence contract"
Cohesion: 0.12
Nodes (17): Guided Chrome Sync setup, bounded capacity and non-authorizing device diagnostic, Guided setup Node/security and Chromium evidence with emulated transport boundaries, Guided setup supersedes parts of historical capacity and selected-restore findings, Conservative two-complete-version capacity and local-only failure handling, Dark guided setup refusing insufficient two-version capacity, Enable is unavailable when the local vault cannot coexist with a subsequent complete copy, Narrow dark device-test receipt with preserved local cache controls, Receipt confirms the tested encrypted version while local maintenance remains available (+9 more)

### Community 136 - "Light popup checkpoint cards"
Cohesion: 0.40
Nodes (5): Entry recovery, whole-vault restore, Export and Remove fit wrapped action rows, Dated checkpoint cards with sequence, entry counts and recoverable-account examples, Version and GitHub footer with automatic-save status, Backups & recovery header, Back and Open in tab remain visible, Light popup checkpoint cards

### Community 138 - "playwright"
Cohesion: 0.25
Nodes (8): devDependencies, fake-indexeddb@^6.2.4, playwright@1.56.1, name, private, type, version, playwright

### Community 139 - "Individual entry recovery review dialog"
Cohesion: 0.40
Nodes (5): Cancel and Recover selected entry stay in the dialog footer, Explanation says only the selected entry changes and existing Sync applies, Individual entry recovery review dialog, Stable account selector and examples distinguish deleted entry from older password, Checkpoint date, saved entries, recoverable and older-detail counts

### Community 140 - "Whole-vault restore review dialog"
Cohesion: 0.40
Nodes (5): Cancel and Restore whole vault stay in the dialog footer, Review says current master password and biometric setup stay the same, Whole-vault restore review dialog, Checkpoint date, saved-entry, recovery, older-detail and removal counts, Current contents become a checkpoint and automatic Sync turns off

### Community 142 - "Dark management checkpoint cards with one Review action"
Cohesion: 0.50
Nodes (4): One primary Review checkpoint button with secondary Export and Remove, Dated cards show sequence and aggregate entry differences without account examples, Backups & recovery sidebar selection and Recovery checkpoints heading remain visible, Dark management checkpoint cards with one Review action

### Community 143 - "Short account-specific deleted-entry confirmation"
Cohesion: 0.50
Nodes (4): Website and username identify the deleted entry to recover, Cancel and Recover entry without an account dropdown, Copy preserves other entries, current master password/biometrics and existing Sync mode, Short account-specific deleted-entry confirmation

### Community 145 - "Implementation checklist: partial implementation, release not accepted"
Cohesion: 0.50
Nodes (4): Pending SC01–SC58 and AF01–AF12 acceptance scenarios, Implementation checklist: partial implementation, release not accepted, Pending OAuth stable extension identity, real Google, hardware and independent review, Implemented autofill revision guard: missing or changed revision rejects delivery; targeted 22 tests pass

## Knowledge Gaps
- **386 isolated node(s):** `Historical frontend regression evidence and manual limits`, `Historical independent Impeccable review evidence`, `Historical hTML category ownership and dedicated settings styles`, `Historical accessible themes ranges and saving feedback`, `Historical settings disclosures unlock and focus corrections` (+381 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 873 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **44 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Current architecture with implemented local and legacy increment` connect `Revisão funcional histórica` to `SETTINGS_UX_IMPLEMENTATION.md`, `Ferramentas de desenvolvimento`, `getStorage`, `Confirmação de autofill`, `Recovery checkpoints behavior, protection and verification`, `Ferramentas de desenvolvimento`, `Interface e revisão visual`, `popup.js`, `Ferramentas de desenvolvimento`, `Criptografia e armazenamento`, `Quatro áreas das definições`, `Original SD review with later local increment notice`, `backupDialogs-browser.mjs`?**
  _High betweenness centrality (0.303) - this node is a cross-community bridge._
- **What connects `Historical frontend regression evidence and manual limits`, `Historical independent Impeccable review evidence`, `Historical hTML category ownership and dedicated settings styles` to the rest of the system?**
  _386 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Security model and open risks` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Why does `Checkpoint recovery with inline comparison and fresh scoped confirmation` connect `Recovery checkpoints behavior, protection and verification` to `Revisão funcional histórica`, `cryptoVault.js`?**
  _High betweenness centrality (0.165) - this node is a cross-community bridge._
- **Should `getStorage` be split into smaller, more focused modules?**
  _Cohesion score 0.053671103477887505 - nodes in this community are weakly interconnected._
- **Why does `Vault unlock controller with bounded inline retry and WebAuthn cancellation` connect `Quatro áreas das definições` to `Revisão funcional histórica`, `Modelo de segurança`?**
  _High betweenness centrality (0.123) - this node is a cross-community bridge._
- **Should `Popup HTML semantic surfaces` be split into smaller, more focused modules?**
  _Cohesion score 0.13438735177865613 - nodes in this community are weakly interconnected._
## Scoped delivery refresh — 2026-11-05

Two anchored account suggestions and protected complete-list fallback are implemented; 27-account Chromium and extracted ZIP checks passed. Full inline pagination failed pointer testing and remains pending. Google Cloud setup is documented but OAuth is not configured. Drive production integration and independent protocol review remain incomplete. Scoped documentation/image facts and obsolete future-selector status were refreshed after AST update. Existing community labels may need a separate refresh.
