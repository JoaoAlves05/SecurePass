# Graph Report - SecurePass  (2026-10-27)

## Corpus Check
- 116 files · ~92,768 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: .css 5, (none) 3)

## Summary
- 1498 nodes · 3469 edges · 118 communities (81 shown, 37 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 31 edges (avg confidence: 0.86)
- Token cost: unavailable for host-agent semantic maintenance

## Graph Freshness
- Built from commit: `b44b4e6d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cryptoVault.js
- removeStorage
- client.js
- Documentação de Sync e dados
- Arquitetura documentada
- biometric/service.js
- Interface e revisão visual
- popup.js
- Revisão funcional histórica
- showToast
- checkpointReview.js
- popup.js
- session.js
- Criptografia e armazenamento
- Autofill na página
- backupCrypto.js
- biometric.test.js
- client.js
- Documentação de Sync e dados
- utilHandlers.js
- Modelo de segurança
- Settings UX — journeys, screens and acceptance map
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
- Checkpoint review interaction
- Captura do cofre
- checkpoints-browser.mjs
- Recovery checkpoints behavior, protection and verification
- Ferramentas de desenvolvimento
- Checkpoint review interaction
- Guided Chrome Sync setup and device verification
- Security settings area
- REVIEW_BACKUP_ADVANCED.md
- Evidência visual das definições
- Quatro áreas das definições
- Análise de formulários
- Timestamped local version backup cards
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
- Documentação de Sync e dados
- .put
- Operação de teste
- Local Settings Sync and Data Management work item
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
- vaultHandlers.js
- getStorage
- Guided Chrome Sync setup and receipt evidence contract
- modules/settings.js
- auth.js
- Compact in-section checkpoint comparison

## God Nodes (most connected - your core abstractions)
1. `getStorage()` - 66 edges
2. `Comprehensive recommended v2 settings Sync devices and data plan` - 66 edges
3. `Current architecture with implemented local and legacy increment` - 53 edges
4. `Validation and release checklist` - 52 edges
5. `removeStorage()` - 51 edges
6. `showToast()` - 46 edges
7. `setStorage()` - 44 edges
8. `withVaultOperation()` - 44 edges
9. `Historical review of commit 5aed51c` - 44 edges
10. `Proposed P6 migration and acceptance` - 42 edges

## Surprising Connections (you probably didn't know these)
- `Full restore confirms only restored total and removals` --references--> `restoreWhole()`  [EXTRACTED]
  docs/issues/RECOVERY_SURFACES.md → popup/modules/checkpointReview.js
- `Fresh identity confirmation replaces preliminary unlock and modal` --references--> `attachMasterPasswordListeners()`  [EXTRACTED]
  docs/MASTER_PASSWORD_FLOW.md → popup/modules/masterPassword.js
- `Ordinary biometric unlock cannot become a password-change grant` --references--> `startAuthentication()`  [EXTRACTED]
  docs/MASTER_PASSWORD_FLOW.md → src/biometric/service.js
- `Atomic live/history rekey without adding a content checkpoint` --references--> `rotateMasterPassword()`  [EXTRACTED]
  docs/CHECKPOINTS.md → src/cryptoVault.js
- `Diagnostic metadata never authorizes vault access or proves physical device identity` --references--> `startDeviceTest()`  [EXTRACTED]
  docs/CHROME_SYNC_SETUP.md → src/syncDiagnostics.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Trusted autofill disclosure boundary** — architecture_capability_policy, architecture_autofill_confirmation, architecture_storage_restriction [EXTRACTED 1.00]
- **Whole-checkpoint restore authorization sequence** — docs_checkpoint_review_recent_authentication, docs_checkpoint_review_confirm_identity, docs_checkpoint_review_fresh_scoped_token, docs_checkpoint_review_secondary_restore [EXTRACTED 1.00]

## Communities (118 total, 37 thin omitted)

### Community 0 - "cryptoVault.js"
Cohesion: 0.16
Nodes (34): acknowledgeSync(), CHECKPOINT_LIMIT, getDB(), readLegacySyncRecord(), readLocalVaultRecordRaw(), readSyncOutbox(), recordRevision(), writeLocalVaultRecordRaw() (+26 more)

### Community 1 - "removeStorage"
Cohesion: 0.11
Nodes (41): handlers, ready, clearCandidates(), dismissCandidate(), listCandidates(), proposeCandidate(), reviewCandidate(), assertDocument() (+33 more)

### Community 2 - "client.js"
Cohesion: 0.34
Nodes (12): attachMasterPasswordListeners(), assert(), authenticateBiometric(), authorizeMasterPassword(), cancelMasterPassword(), clientId, enrollBiometric(), request() (+4 more)

### Community 3 - "Documentação de Sync e dados"
Cohesion: 0.06
Nodes (48): Cancel, Unlock and icon-only fingerprint share one action row, Dark master-password identity with inline biometric method, Dark main vault unlock with inline biometric method, Readable cache row layout correction, Reproduced cache status layout defect, Historical navigation and dialog recommendations, Recovery discovery and terminology concerns, Visual critique and accessibility limits (+40 more)

### Community 4 - "Arquitetura documentada"
Cohesion: 0.04
Nodes (49): Checkpoint recovery with inline comparison and fresh scoped confirmation, Inline checkpoint review module and displayed-comparison identity, Archived Sync copies stay separate and exports are source-specific, Unlocked checkpoint counts, differences and affected-account examples, Remove one checkpoint or verify current password to clear local history, Recovery checkpoints behavior, protection and verification, Per-entry recovery through inline review and explicit confirmation, Existing-vault external and selected-remote restores preserve active authentication (+41 more)

### Community 5 - "biometric/service.js"
Cohesion: 0.08
Nodes (39): attachGeneratorListeners(), avoidSimilar, copyGeneratedBtn, generateButton, generatedResult, generatorStatus, handleGenerate(), includeLower (+31 more)

### Community 6 - "Interface e revisão visual"
Cohesion: 0.05
Nodes (8): Comprehensive recommended v2 settings Sync devices and data plan, Chrome Identity, Chrome Storage, Drive appDataFolder, Drive errors, OWASP Cryptographic Storage, Web Crypto AES-GCM parameters, MV3 service worker lifecycle

### Community 9 - "showToast"
Cohesion: 0.06
Nodes (34): Approved inline identity/password/success and management proportions, Pre-save biometric revocation notice and optional setup again, Clear secrets and revoke the exact grant on leaving the inline flow, Inline master-password flow and independent management proportions, Two-minute single-use revision-bound password-change grant, Physical authenticator and actual toolbar sizing remain manual acceptance, Fresh identity confirmation replaces preliminary unlock and modal, Tab stylesheet separates desktop layout from compact popup presentation (+26 more)

### Community 10 - "checkpointReview.js"
Cohesion: 0.12
Nodes (54): account(), attachCheckpointReviewListeners(), changedFields(), checkFreshness(), clientId, closeReview(), date(), entryCount() (+46 more)

### Community 11 - "popup.js"
Cohesion: 0.32
Nodes (10): attachBiometricListeners(), syncBiometricView(), refreshCandidates(), refreshManagement(), sendMessage(), attachSettingsNavigation(), LEGACY_SECTIONS, initToast() (+2 more)

### Community 12 - "session.js"
Cohesion: 0.09
Nodes (27): Older checkpoint protection migration, Journey scope and unconfigured OAuth, Accessibility and website compatibility acceptance, Automated regression coverage, Backup dialog refinement evidence, Development validation commands, Recovery checkpoints implementation evidence, Clipboard platform acceptance (+19 more)

### Community 13 - "Criptografia e armazenamento"
Cohesion: 0.08
Nodes (21): Local backup safety and repeatable recovery cleanup, Backups and Advanced functional review, Preenchimento confirmado por origem e documento, Backups cifrados com pré-visualização de importação, Desbloqueio WebAuthn com PRF, Limites de capacidade e importação, Desenvolvimento e verificações, Chrome122 e âmbito de compatibilidade (+13 more)

### Community 14 - "Autofill na página"
Cohesion: 0.08
Nodes (23): action, default_popup, default_title, background, service_worker, type, content_scripts, content_security_policy (+15 more)

### Community 15 - "backupCrypto.js"
Cohesion: 0.11
Nodes (37): attachManagementListeners(), showToast(), biometricUnlockContainer, clearRevealTimer(), confirmMasterInput, createMasterSection, createVaultIconButton(), deleteCredential() (+29 more)

### Community 16 - "biometric.test.js"
Cohesion: 0.11
Nodes (21): ALARM_NAME, BIOMETRIC_SESSION_PASSPHRASE_KEY, CHUNK_SIZE, CLIPBOARD_ALARM_NAME, DB_STORE_NAME, DB_VERSION, LOG_ENABLED, META_KEY (+13 more)

### Community 17 - "client.js"
Cohesion: 0.06
Nodes (61): fake-indexeddb, begin(), biometricStatus(), cancelAuthentication(), consume(), context(), finishAuthentication(), finishRegistration() (+53 more)

### Community 18 - "Documentação de Sync e dados"
Cohesion: 0.18
Nodes (16): attachButton(), entry, element(), initAutofill(), pending, showSaveSuggestion(), submitted, tracked (+8 more)

### Community 19 - "utilHandlers.js"
Cohesion: 0.16
Nodes (23): copyInBackground(), ensureOffscreen(), cacheWrites, checkPassword(), clearHibpCache(), hibpCacheStatus(), inFlight, utilHandlers (+15 more)

### Community 20 - "Modelo de segurança"
Cohesion: 0.27
Nodes (17): Inline unlock errors and retry without dismissing the form, resolveUnlockSetup(), setUnlockResolver(), attachUIListeners(), backFromSettings(), closeModal(), closeSettingsPanel(), manageFocus() (+9 more)

### Community 21 - "Settings UX — journeys, screens and acceptance map"
Cohesion: 0.09
Nodes (23): Single checkpoint review entry, Inline checkpoint comparison, Confirm identity flow, Individual entry recovery, Checkpoint review design document, Authentication expiry during confirmation, Successful recovery refreshes review or returns to checkpoint list, Recovery review cleanup and navigation (+15 more)

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

### Community 38 - "Checkpoint review interaction"
Cohesion: 0.20
Nodes (7): Historical accessible themes ranges and saving feedback, Historical six-category navigation, Historical six-category frontend review, Historical settings disclosures unlock and focus corrections, Historical independent Impeccable review evidence, Historical hTML category ownership and dedicated settings styles, Historical frontend regression evidence and manual limits

### Community 39 - "Captura do cofre"
Cohesion: 0.29
Nodes (9): Compatible Settings fragments, Executed verification, Hierarchical Settings navigation, Navigation history, focus and scroll preservation, Implemented behavior, Manual review and limits, Preserved Settings behavior and security contracts, Shared Settings footer across navigation layouts (+1 more)

### Community 40 - "checkpoints-browser.mjs"
Cohesion: 0.20
Nodes (5): errors, root, server, shadowClick(), find()

### Community 41 - "Recovery checkpoints behavior, protection and verification"
Cohesion: 0.20
Nodes (3): captures, errors, root

### Community 42 - "Ferramentas de desenvolvimento"
Cohesion: 0.22
Nodes (7): Explicit account selection section, Authenticator unlock button, Cancel confirmation button, Extension-owned secure confirmation page, Confirm save or update button, auth.js module bootstrap, Master password unlock form

### Community 43 - "Checkpoint review interaction"
Cohesion: 0.11
Nodes (14): Approved interaction, Captures, Checkpoint review interaction, State and privacy, Checkpoint review scenario coverage and remaining acceptance, Behavior and presentation, Encryption and rotation, Evidence (+6 more)

### Community 44 - "Guided Chrome Sync setup and device verification"
Cohesion: 0.29
Nodes (6): Device test, Evidence shown to the user, Guided Chrome Sync setup and device verification, Recovery and capacity corrections, User journey, Validation and manual acceptance

### Community 45 - "Security settings area"
Cohesion: 0.25
Nodes (8): devDependencies, fake-indexeddb@^6.2.4, playwright@1.56.1, name, private, type, version, playwright

### Community 46 - "REVIEW_BACKUP_ADVANCED.md"
Cohesion: 0.20
Nodes (10): scripts, check, package, test, test:backup-dialogs-browser, test:browser, test:checkpoints-browser, test:settings-browser (+2 more)

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
Nodes (7): Changed account offers Restore saved details, Back to checkpoints remains part of the in-section view, Show matching entries checkbox includes matching count, Account rows offer a specific Recover entry action, Management inline checkpoint review in dark theme, Website or username search within the review, Review title/date and saved/deleted/different/newer counts

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
Nodes (5): Back to checkpoints remains part of the in-section view, Account rows offer a specific Recover entry action, Popup inline checkpoint review in dark theme, Website or username search within the review, Review title/date and saved/deleted/different/newer counts

### Community 59 - "export dark 320 extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Back to checkpoints remains part of the in-section view, Account rows offer a specific Recover entry action, Popup inline checkpoint review in light theme, Website or username search within the review, Review title/date and saved/deleted/different/newer counts

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
Nodes (4): One primary Review checkpoint button with secondary Export and Remove, Dated cards show sequence, entry counts and changed-account example, Backups & recovery sidebar selection and Recovery checkpoints heading remain visible, Light management checkpoint cards with one Review action

### Community 71 - "Documentação de Sync e dados"
Cohesion: 0.20
Nodes (27): Independent management-tab layout with shared trusted pathname, Purpose-bound inline master-password authorization, changeMasterPassword(), changeMasterPasswordAuthorized(), clearVaultEntries(), deleteCredential(), importVaultData(), initializeVault() (+19 more)

### Community 72 - ".put"
Cohesion: 0.50
Nodes (4): Review checkpoint primary action with secondary Export and Remove, Dated checkpoint with sequence, recoverable-entry and later-entry counts, Backups header, Open in tab and fixed version/GitHub footer remain visible, Dark popup checkpoint card with one Review action

### Community 73 - "Operação de teste"
Cohesion: 0.50
Nodes (4): Review checkpoint primary action with secondary Export and Remove, Dated checkpoint with sequence, recoverable-entry and later-entry counts, Backups header, Open in tab and fixed version/GitHub footer remain visible, Light popup checkpoint card with one Review action

### Community 74 - "Local Settings Sync and Data Management work item"
Cohesion: 0.50
Nodes (4): Website, username and Add this deleted entry identify the action, Cancel and Recover entry without an account dropdown, Copy preserves other entries, current master password/biometrics and existing Sync mode, Short account-specific deleted-entry confirmation

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

### Community 113 - "vaultHandlers.js"
Cohesion: 0.16
Nodes (40): DECODER, decryptBackupPayload(), deriveBackupKey(), ENCODER, encryptBackupPayload(), isEncryptedBackupEnvelope(), recoveryStatus(), restoreRecovery() (+32 more)

### Community 114 - "getStorage"
Cohesion: 0.17
Nodes (27): range(), code(), confirmDeviceTest(), deviceId(), deviceTestStatus(), digest(), inspectDeviceTest(), requireTestedVersion() (+19 more)

### Community 115 - "Guided Chrome Sync setup and receipt evidence contract"
Cohesion: 0.12
Nodes (17): Guided Chrome Sync setup, bounded capacity and non-authorizing device diagnostic, Guided setup Node/security and Chromium evidence with emulated transport boundaries, Guided setup supersedes parts of historical capacity and selected-restore findings, Conservative two-complete-version capacity and local-only failure handling, Dark guided setup refusing insufficient two-version capacity, Enable is unavailable when the local vault cannot coexist with a subsequent complete copy, Narrow dark device-test receipt with preserved local cache controls, Receipt confirms the tested encrypted version while local maintenance remains available (+9 more)

### Community 116 - "modules/settings.js"
Cohesion: 0.29
Nodes (12): syncGeneratorControls(), attachSettingsListeners(), initialiseSettings(), saving, scheduleSettingsSave(), setSaveStatus(), syncSettingsView(), updateRangeLabel() (+4 more)

### Community 117 - "auth.js"
Cohesion: 0.60
Nodes (5): complete(), refresh(), requestId, send(), showError()

### Community 120 - "Compact in-section checkpoint comparison"
Cohesion: 0.50
Nodes (4): Compact in-section checkpoint comparison, Accessible compact comparison search and matching controls, Secondary whole-checkpoint review with preserved authentication copy, Stale review warning and refresh action

## Knowledge Gaps
- **318 isolated node(s):** `New-password confirmation with biometric revocation warning`, `Independent management-tab layout with shared trusted pathname`, `Cancel and Restore whole vault in the confirmation footer`, `Copy preserves current authentication and keeps current contents as a checkpoint while turning automatic Sync off`, `Checkpoint date, saved-entry/recovery/older-detail/removal counts` (+313 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 733 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Current architecture with implemented local and legacy increment` connect `Revisão funcional histórica` to `Ferramentas de desenvolvimento`, `Confirmação de autofill`, `Arquitetura documentada`, `restore light 400 extension dialog screenshot`, `Ferramentas de desenvolvimento`, `Documentação de Sync e dados`, `Interface e revisão visual`, `popup.js`, `Ferramentas de desenvolvimento`, `Criptografia e armazenamento`, `Quatro áreas das definições`, `Navegação e validação Settings`, `Implementação e migração`, `backupDialogs-browser.mjs`?**
  _High betweenness centrality (0.301) - this node is a cross-community bridge._
- **What connects `New-password confirmation with biometric revocation warning`, `Independent management-tab layout with shared trusted pathname`, `Cancel and Restore whole vault in the confirmation footer` to the rest of the system?**
  _318 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `removeStorage` be split into smaller, more focused modules?**
  _Cohesion score 0.10815602836879433 - nodes in this community are weakly interconnected._
- **Why does `Checkpoint recovery with inline comparison and fresh scoped confirmation` connect `Arquitetura documentada` to `Revisão funcional histórica`, `vaultHandlers.js`?**
  _High betweenness centrality (0.147) - this node is a cross-community bridge._
- **Should `Documentação de Sync e dados` be split into smaller, more focused modules?**
  _Cohesion score 0.058673469387755105 - nodes in this community are weakly interconnected._
- **Why does `Validation and release checklist` connect `session.js` to `Ferramentas de desenvolvimento`, `Confirmação de autofill`, `Ferramentas de desenvolvimento`, `Checkpoint review interaction`, `Captura do cofre`, `Interface e revisão visual`, `Checkpoint review interaction`, `Guided Chrome Sync setup and device verification`, `Criptografia e armazenamento`, `Settings UX — journeys, screens and acceptance map`, `modules/settings.js`, `Navegação e validação Settings`, `Implementação e migração`, `Quatro áreas das definições`, `backupDialogs-browser.mjs`, `vaultUnlock.js`, `Checkpoint review interaction and scoped action authorization`?**
  _High betweenness centrality (0.143) - this node is a cross-community bridge._
- **Should `Arquitetura documentada` be split into smaller, more focused modules?**
  _Cohesion score 0.04251700680272109 - nodes in this community are weakly interconnected._