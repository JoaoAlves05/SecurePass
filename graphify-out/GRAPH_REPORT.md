# Graph Report - SecurePass  (2026-11-06)

## Corpus Check
- 257 files · ~133,079 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: .css 6, (none) 3)

## Summary
- 1937 nodes · 4545 edges · 162 communities (111 shown, 51 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 79 edges (avg confidence: 0.84)
- Token cost: host extraction usage unavailable; no separate semantic API used.

## Community Hubs (Navigation)
- requests.js
- Interface e revisão visual
- signedProtocol.js
- ref_node_assert
- Documentação de Sync e dados
- vaultHandlers.js
- biometric/service.js
- cryptoVault.js
- Original SD review with later local increment notice
- utilHandlers.js
- driveRuntime.js
- popup.js
- cryptoVault.js
- Current architecture with implemented local and legacy increment
- Inline master-password flow and independent management proportions
- signedProtocol.js
- vault.js
- IMPLEMENTATION_CHECKLIST.md
- checkpointReview.js
- popup.js
- session.js
- Criptografia e armazenamento
- googleConfiguration.test.js
- Checkpoint review design document
- Autofill na página
- Contextual on-page key contract
- logger.js
- checkpointReview.js
- Modelo de segurança
- Popup HTML semantic surfaces
- Recovery checkpoints behavior, protection and verification
- accountPrompts-browser.mjs
- Guided Chrome Sync setup and receipt evidence contract
- selector.js
- SETTINGS_UX_IMPLEMENTATION.md
- playwright
- REVIEW_BACKUP_ADVANCED.md
- Security model and open risks
- Implemented extension-origin anchored account selector with two-account pagination and username search
- backupDialogs-browser.mjs
- syncSetup-browser.mjs
- Account suggestions, inline tools and trusted-window confirmation contract
- vaultUnlock.js
- browser.mjs
- popup.js
- popup.js
- Implementation checklist: partial implementation, release not accepted
- Checkpoint review interaction
- Checkpoint review interaction and scoped action authorization
- Navegação e validação Settings
- setStorage
- Internal normal-mutation signing and atomic vault-checkpoint-outbox authorization/session checks
- ref_node_fs
- Ferramentas de desenvolvimento
- Confirmação de autofill
- Settings category links and labelled navigation
- Ferramentas de desenvolvimento
- Ferramentas de desenvolvimento
- Ferramentas de desenvolvimento
- Popup HTML semantic surfaces
- Historical six-category frontend review
- SETTINGS_NAVIGATION.md
- Recovery checkpoints behavior, protection and verification
- Ferramentas de desenvolvimento
- check.mjs
- biometric.test.js
- Quatro áreas das definições
- Análise de formulários
- Guided Chrome Sync setup and device verification
- Timestamped local version backup cards
- Popup HTML semantic surfaces
- Guided Chrome Sync setup, manual discovery and device test
- Google configuration builder validates public key/ID and adds appData-only permissions to a separate copy
- Ícone 16 pixels
- Ícone 32 pixels
- Ícone 48 pixels
- Entrada do content script
- Documentação de Sync e dados
- Checkpoint review interaction
- Dark credential selector with many logins
- Documentação de Sync e dados
- export dark 320 extension dialog screenshot
- Dark management checkpoint list
- Light management checkpoint list
- Dark popup checkpoint cards
- Light popup checkpoint cards
- Individual entry recovery review dialog
- Whole-vault restore review dialog
- export dark 400 extension dialog screenshot
- export error dark extension dialog screenshot
- export light 320 extension dialog screenshot
- export light 400 extension dialog screenshot
- export management dark extension dialog screenshot
- restore dark 320 extension dialog screenshot
- restore dark 400 extension dialog screenshot
- restore error dark extension dialog screenshot
- restore light 320 extension dialog screenshot
- drive.js
- Serialized offscreen clipboard owner
- Dark anchored credential selector on narrow page
- Checkpoint review design document
- Light management checkpoint cards with one Review action
- .put
- Operação de teste
- Separate whole-vault restore confirmation from inline review
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
- SecurePass light credential selector
- Vault management Advanced settings
- Narrow Advanced settings layout
- Popup inline checkpoint review in light theme
- Proposed explicit discovery, stable vault/account/device identities and authenticated second-device enrollment
- Account suggestions, inline tools and trusted-window confirmation contract
- Account suggestions, inline tools and trusted-window confirmation contract
- Account suggestions, inline tools and trusted-window confirmation contract
- Account suggestions, inline tools and trusted-window confirmation contract
- Account suggestions, inline tools and trusted-window confirmation contract
- Account suggestions, inline tools and trusted-window confirmation contract
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
- Dark anchored credential selector on narrow page
- Dark credential selector with many logins
- SecurePass light credential selector
- Popup Generator, Tester, breach check and vault credential editor surfaces

## God Nodes (most connected - your core abstractions)
1. `Version 3 settings Sync data and compact login plan` - 97 edges
2. `getStorage()` - 78 edges
3. `Validation and release checklist` - 55 edges
4. `Current architecture with implemented local and legacy increment` - 55 edges
5. `removeStorage()` - 54 edges
6. `withVaultOperation()` - 51 edges
7. `setStorage()` - 51 edges
8. `showToast()` - 46 edges
9. `Historical review of commit 5aed51c` - 44 edges
10. `Original SD review with later local increment notice` - 42 edges

## Surprising Connections (you probably didn't know these)
- `Checkpoint summary and detail separation verified` --conceptually_related_to--> `renderCheckpoints()`  [INFERRED]
  docs/VALIDATION.md → popup/modules/checkpoints.js
- `Key protection and trusted checkpoint implementation` --references--> `prepareSignedPublication()`  [INFERRED]
  docs/SIGNED_PROTOCOL.md → src/sync/signedPublication.js
- `Master-protected administrative keys and content-key-protected writer keys with nonextractable CryptoKeys` --semantically_similar_to--> `Purpose-bound inline master-password authorization`  [INFERRED] [semantically similar]
  docs/SIGNED_PROTOCOL.md → ARCHITECTURE.md
- `Purpose-bound inline master-password authorization` --conceptually_related_to--> `attachMasterPasswordListeners()`  [INFERRED]
  ARCHITECTURE.md → popup/modules/masterPassword.js
- `Fresh identity confirmation replaces preliminary unlock and modal` --references--> `attachMasterPasswordListeners()`  [EXTRACTED]
  docs/MASTER_PASSWORD_FLOW.md → popup/modules/masterPassword.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Protected authentication and minimal document-bound anchored account selection** — docs_anchored_selector_account_selection, docs_anchored_selector_request_binding, docs_anchored_selector_visual_attestation, docs_anchored_selector_native_fallback, selector_selector_account_surface [EXTRACTED 1.00]
- **Whole-checkpoint restore authorization sequence** — docs_checkpoint_review_recent_authentication, docs_checkpoint_review_confirm_identity, docs_checkpoint_review_fresh_scoped_token, docs_checkpoint_review_secondary_restore [EXTRACTED 1.00]
- **Internal signed local mutation through atomic outbox to verified immutable publication** — docs_drive_transport_atomic_signed_commit, docs_signed_protocol_revision_wrapper, docs_drive_transport_durable_coordinator, docs_drive_transport_immutable_publication, docs_drive_transport_resumable_upload [EXTRACTED 1.00]
- **Delivered increments remain distinct from full protocol and release acceptance** — docs_implementation_checklist_delivered_increment, docs_implementation_checklist_acceptance, docs_implementation_checklist_external, docs_validation_acceptance_boundary, docs_signed_protocol_review_gates [EXTRACTED 1.00]

## Communities (162 total, 51 thin omitted)

### Community 0 - "requests.js"
Cohesion: 0.09
Nodes (69): handlers, ready, clearCandidates(), dismissCandidate(), inlineCandidate(), listCandidates, proposeCandidate(), reviewCandidate() (+61 more)

### Community 1 - "Interface e revisão visual"
Cohesion: 0.03
Nodes (37): Implemented anchored selector with two-account pagination/search and protected unlock/native fallback, Atomic vault-checkpoint-Drive outbox commit with internal automatic signing; production remains gated, Atomic vault-checkpoint-Drive outbox commit with internal automatic signing; production remains gated, Atomic vault-checkpoint-Drive outbox commit with internal automatic signing; production remains gated, Atomic vault-checkpoint-Drive outbox commit with internal automatic signing; production remains gated, Internal P-256 administrative and encrypted-v2 revision prototype with pinned root/checkpoint; production review remains pending, Version 3 settings Sync data and compact login plan, AF01-AF12 acceptance matrix with AF03/AF09 closed; broad physical and accessibility acceptance remains open (+29 more)

### Community 2 - "signedProtocol.js"
Cohesion: 0.08
Nodes (56): 1. Escolher a identidade da extensão, 2. Criar/configurar o projeto Google, 3. Gerar uma cópia de desenvolvimento, Configurar Google Cloud para o SecurePass, Dados necessários para continuar a integração real, abortable(), assert(), clientId (+48 more)

### Community 3 - "ref_node_assert"
Cohesion: 0.11
Nodes (18): fake-indexeddb, auth(), saveRequest(), sender, alarms, areas, event(), failWhen() (+10 more)

### Community 4 - "Documentação de Sync e dados"
Cohesion: 0.11
Nodes (38): clearSecrets(), complete(), expired(), refresh(), requestId, run(), saveTargetChanged(), send() (+30 more)

### Community 5 - "vaultHandlers.js"
Cohesion: 0.13
Nodes (41): DECODER, decryptBackupPayload(), deriveBackupKey(), ENCODER, encryptBackupPayload(), isEncryptedBackupEnvelope(), recoveryStatus(), vaultHandlers (+33 more)

### Community 6 - "biometric/service.js"
Cohesion: 0.07
Nodes (40): attachGeneratorListeners(), avoidSimilar, copyGeneratedBtn, generateButton, generatedResult, generatorStatus, handleGenerate(), includeLower (+32 more)

### Community 7 - "cryptoVault.js"
Cohesion: 0.18
Nodes (38): vaultStatus(), loadSettings(), getStorage(), readLegacySyncRecord(), readLocalVaultRecordRaw(), readSyncOutbox(), recordRevision(), finishLocalRecovery() (+30 more)

### Community 9 - "utilHandlers.js"
Cohesion: 0.13
Nodes (34): copyInBackground(), ensureOffscreen(), cacheWrites, checkPassword(), clearHibpCache(), hibpCacheStatus(), inFlight, range() (+26 more)

### Community 10 - "driveRuntime.js"
Cohesion: 0.12
Nodes (32): driveHandlers, bounded(), classify(), createDriveClient(), guard(), publish(), request(), uploadResumable() (+24 more)

### Community 12 - "cryptoVault.js"
Cohesion: 0.15
Nodes (37): changeMasterPassword(), changeMasterPasswordAuthorized(), clearVaultEntries(), deleteCredential(), importVaultData(), initializeVault(), keepAlive(), mutate() (+29 more)

### Community 14 - "Inline master-password flow and independent management proportions"
Cohesion: 0.05
Nodes (37): Independent management-tab layout with shared trusted pathname, Purpose-bound inline master-password authorization, Approved inline identity/password/success and management proportions, Pre-save biometric revocation notice and optional setup again, Clear secrets and revoke the exact grant on leaving the inline flow, Inline master-password flow and independent management proportions, Two-minute single-use revision-bound password-change grant, Physical authenticator and actual toolbar sizing remain manual acceptance (+29 more)

### Community 15 - "signedProtocol.js"
Cohesion: 0.12
Nodes (26): DB_STORE_NAME, advanceAuthorization(), key(), loadAuthorization(), pinAuthorization(), read(), write(), createDriveRuntime() (+18 more)

### Community 16 - "vault.js"
Cohesion: 0.11
Nodes (35): attachManagementListeners(), showToast(), biometricUnlockContainer, clearRevealTimer(), confirmMasterInput, createMasterSection, createVaultIconButton(), deleteCredential() (+27 more)

### Community 17 - "IMPLEMENTATION_CHECKLIST.md"
Cohesion: 0.06
Nodes (27): Account suggestions and inline login tools, Integrity and capability boundaries, Surfaces and interaction, Validation, Why a save suggestion appears, Capacidades e vinculação, Evidência, Manifesto e limites (+19 more)

### Community 18 - "checkpointReview.js"
Cohesion: 0.17
Nodes (32): attachCheckpointListeners(), date(), deleteHistory(), handleCheckpointAction(), plural(), renderCheckpoints(), accessibleDestination(), attachDataListeners() (+24 more)

### Community 19 - "popup.js"
Cohesion: 0.22
Nodes (19): attachBiometricListeners(), syncBiometricView(), attachCandidateListeners(), refreshCandidates(), refreshManagement(), attachMasterPasswordListeners(), sendMessage(), attachSettingsNavigation() (+11 more)

### Community 20 - "session.js"
Cohesion: 0.10
Nodes (26): Older checkpoint protection migration, Journey scope and unconfigured OAuth, Accessibility and website compatibility acceptance, Backup dialog refinement evidence, Development validation commands, Recovery checkpoints implementation evidence, Clipboard platform acceptance, Compact recovery presentation (+18 more)

### Community 21 - "Criptografia e armazenamento"
Cohesion: 0.08
Nodes (21): Local backup safety and repeatable recovery cleanup, Backups and Advanced functional review, Preenchimento confirmado por origem e documento, Backups cifrados com pré-visualização de importação, Desbloqueio WebAuthn com PRF, Limites de capacidade e importação, Desenvolvimento e verificações, Chrome122 e âmbito de compatibilidade (+13 more)

### Community 22 - "googleConfiguration.test.js"
Cohesion: 0.11
Nodes (14): Public Google client received and stable configured development copy generated; real authorization remains pending, Disposable Chromium anchored, configured-Google emulation and ZIP evidence; real Google remains unaccepted, googleManifest(), main(), root, result, { version }, runtimeFiles (+6 more)

### Community 23 - "Checkpoint review design document"
Cohesion: 0.10
Nodes (20): Single checkpoint review entry, Inline checkpoint comparison, Confirm identity flow, Individual entry recovery, Checkpoint review design document, Authentication expiry during confirmation, Successful recovery refreshes review or returns to checkpoint list, Recovery review cleanup and navigation (+12 more)

### Community 24 - "Autofill na página"
Cohesion: 0.08
Nodes (23): action, default_popup, default_title, background, service_worker, type, content_scripts, content_security_policy (+15 more)

### Community 25 - "Contextual on-page key contract"
Cohesion: 0.09
Nodes (23): Direct selector and original-field tool handoff, Native manual login creation form, Native secondary website tools disclosure, Source field and reserved native-tab request binding, Direct key opens up to two anchored account suggestions, Contextual on-page key contract, Executed contextual-key evidence and remaining manual acceptance, Pointer-transparent feedback preserves the next website action (+15 more)

### Community 26 - "logger.js"
Cohesion: 0.11
Nodes (20): ALARM_NAME, BIOMETRIC_SESSION_PASSPHRASE_KEY, CHUNK_SIZE, CLIPBOARD_ALARM_NAME, DB_VERSION, LOG_ENABLED, META_KEY, PRF_EVAL_LABEL (+12 more)

### Community 27 - "checkpointReview.js"
Cohesion: 0.30
Nodes (21): account(), attachCheckpointReviewListeners(), changedFields(), checkFreshness(), clientId, closeReview(), date(), entryCount() (+13 more)

### Community 28 - "Modelo de segurança"
Cohesion: 0.27
Nodes (17): Inline unlock errors and retry without dismissing the form, resolveUnlockSetup(), setUnlockResolver(), attachUIListeners(), backFromSettings(), closeModal(), closeSettingsPanel(), manageFocus() (+9 more)

### Community 29 - "Popup HTML semantic surfaces"
Cohesion: 0.14
Nodes (20): Version and repository footer, System light and dark theme controls, Auto-lock inactivity preference, Consistent fingerprint symbol for biometric entry points, Ownership-aware clipboard timeout explanation, Popup HTML semantic surfaces, Labelled credential editor dialog, Appearance settings area (+12 more)

### Community 30 - "Recovery checkpoints behavior, protection and verification"
Cohesion: 0.12
Nodes (19): Checkpoint recovery with inline comparison and fresh scoped confirmation, Inline checkpoint review module and displayed-comparison identity, Archived Sync copies stay separate and exports are source-specific, Unlocked checkpoint counts, differences and affected-account examples, Remove one checkpoint or verify current password to clear local history, Recovery checkpoints behavior, protection and verification, Per-entry recovery through inline review and explicit confirmation, Existing-vault external and selected-remote restores preserve active authentication (+11 more)

### Community 31 - "accountPrompts-browser.mjs"
Cohesion: 0.18
Nodes (17): Historical disposable account-prompt Node, module and Chromium evidence, Dedicated disposable account-prompt Chromium command, capture(), errors, nextPage(), openFill(), openSaveEntered(), openTools() (+9 more)

### Community 32 - "Guided Chrome Sync setup and receipt evidence contract"
Cohesion: 0.12
Nodes (17): Guided Chrome Sync setup, bounded capacity and non-authorizing device diagnostic, Guided setup Node/security and Chromium evidence with emulated transport boundaries, Guided setup supersedes parts of historical capacity and selected-restore findings, Conservative two-complete-version capacity and local-only failure handling, Dark guided setup refusing insufficient two-version capacity, Enable is unavailable when the local vault cannot coexist with a subsequent complete copy, Narrow dark device-test receipt with preserved local cache controls, Receipt confirms the tested encrypted version while local maintenance remains available (+9 more)

### Community 33 - "selector.js"
Cohesion: 0.22
Nodes (16): Implemented anchored selector with two-account pagination/search and protected unlock/native fallback, Disposable anchored and ZIP journeys plus internal Drive integration evidence; full release remains open, Current login key UI has two anchored suggestions and native complete-list fallback; registration/change-password generator remains available., Assisted login offers two suggestions beside the field and complete native account selection after protected unlock if needed., Selector is extension-origin with restricted message capabilities and source/document binding; iframe isolation is not independent Chrome permissions or native clickjacking assurance., Implemented anchored selector with two-account pagination/search and protected unlock/native fallback, Implemented anchored selector with two-account pagination/search and protected unlock/native fallback, clear() (+8 more)

### Community 34 - "SETTINGS_UX_IMPLEMENTATION.md"
Cohesion: 0.15
Nodes (6): Delivered behavior, Executed checks, Remaining release gates, Review artifacts, Scenario coverage boundary, Settings UX implementation and evidence

### Community 35 - "playwright"
Cohesion: 0.12
Nodes (11): devDependencies, fake-indexeddb@^6.2.4, playwright@1.56.1, name, private, type, version, playwright (+3 more)

### Community 36 - "REVIEW_BACKUP_ADVANCED.md"
Cohesion: 0.12
Nodes (17): scripts, check, configure:google, package, test, test:account-prompts-browser, test:anchored-browser, test:backup-dialogs-browser (+9 more)

### Community 38 - "Implemented extension-origin anchored account selector with two-account pagination and username search"
Cohesion: 0.13
Nodes (15): Chromium selector evidence does not close visual-adversarial, physical accessibility or real-site acceptance, Implemented extension-origin anchored account selector with two-account pagination and username search, Protected auth-window handoff and native fallback for CSP blocking and manual creation, Trusted selection plus source focus, ancestor visibility and hit-testing checks, False source-level production-review predicate; no public enrollment, adoption or Drive write activation, 2026-11-06 delivered OAuth inspection, signing, gated runtime, resumable uploads and anchored search, Global completion issue remains open for administrative lifecycle, recovery, convergence, migration and independent gates, Drive integration issue: resumable uploads, automatic signing, gated worker and read-only OAuth management (+7 more)

### Community 39 - "backupDialogs-browser.mjs"
Cohesion: 0.17
Nodes (7): Delivery evidence, Information architecture, Interaction rules, Journey state machine, SC01–SC58 traceability, Screen sketches, Settings UX — journeys, screens and acceptance map

### Community 40 - "syncSetup-browser.mjs"
Cohesion: 0.12
Nodes (6): test:sync-setup-browser runs the disposable guided Chrome Sync scenario, contexts, directories, errors, output, root

### Community 41 - "Account suggestions, inline tools and trusted-window confirmation contract"
Cohesion: 0.13
Nodes (15): Review cancellation retains a proposal; dismissal/save/expiry/lock remove it, Restricted five-minute proposals, eight-item bound, metadata-only listing and deduplication, Compact dark master-password confirmation, Master password stays on the extension-owned page with retry and cancellation, Same-origin explicit save/update binds destination revision and preserves notes and identity, Fill and save consume authorization once under the operation lock, Inline review and dismissal validate origin, tab and document, Closed-shadow tools follow theme and reposition with field and viewport; removal releases listeners (+7 more)

### Community 42 - "vaultUnlock.js"
Cohesion: 0.13
Nodes (14): Advanced control inventory, Scoped authentication and local erasure, Backups control inventory, Cache usage without duration control, Unified local and archived earlier versions, Executed validation, Four-area Settings revision, Historical General inventory (+6 more)

### Community 43 - "browser.mjs"
Cohesion: 0.13
Nodes (8): frameFor(), projectRoot, server, errors, root, server, shadowClick(), find()

### Community 44 - "popup.js"
Cohesion: 0.15
Nodes (14): Auto-lock vault slider, Set up biometric unlock action, Change master password action, Clear copied passwords slider, GitHub footer link, Settings category navigation: Appearance, Security, Backups & recovery, Advanced, Settings footer with version, GitHub link, and preference save status, Settings popup home screenshot (+6 more)

### Community 45 - "popup.js"
Cohesion: 0.29
Nodes (12): attachSettingsListeners(), initialiseSettings(), saving, scheduleSettingsSave(), setSaveStatus(), syncSettingsView(), updateRangeLabel(), applyTheme() (+4 more)

### Community 46 - "Implementation checklist: partial implementation, release not accepted"
Cohesion: 0.15
Nodes (8): Implemented anchored selector with two-account pagination/search and protected unlock/native fallback, SC and AF acceptance matrix; local SC01/SC02 and AF03/AF09 closed, remaining acceptance open, Implementation checklist: partial implementation, release not accepted, Public OAuth client received; real Google authorization, protocol review, physical hardware and lifecycle acceptance pending, Implemented autofill displayed-revision guard rejects missing or changed revision, Internal domain-separated ECDSA P-256 administrative authorization chains, Internal prototype lacks reviewed nonce policy, new format, enrollment, recovery, concurrent rotation and migration, Proposed bounded backup/archive parsing, stable snapshot selection and safe checkpoint-based retention

### Community 47 - "Checkpoint review interaction"
Cohesion: 0.15
Nodes (9): Behavior and presentation, Encryption and rotation, Evidence, Recovery checkpoints, Recovery integrity, Checkpoint review flow, Verification, Recovery checkpoints (+1 more)

### Community 49 - "Navegação e validação Settings"
Cohesion: 0.17
Nodes (6): Recovery-surface checks recorded in validation evidence, Dedicated recovery UI browser command, test:recovery-ui-browser, captures, errors, root

### Community 50 - "setStorage"
Cohesion: 0.32
Nodes (10): activate(), assertGeneration(), current(), generation(), onLock(), reconfigureTimeout(), revokeSession(), schedule() (+2 more)

### Community 51 - "Internal normal-mutation signing and atomic vault-checkpoint-outbox authorization/session checks"
Cohesion: 0.17
Nodes (6): Implemented read-only Google management and gated internal signed Drive integration, Drive production lifecycle, recovery, convergence, migration and release acceptance remain incomplete, Internal normal-mutation signing and atomic vault-checkpoint-outbox authorization/session checks, Account-vault-generation bound IndexedDB publication queue with bounded durable retries, Persisted resumable upload sessions, provider offset probes, one-MiB chunks and 16-MiB packet bound, Canonical signed encrypted-v2 revision wrapper bound to active writer, vault, epoch and exact authorization digest

### Community 52 - "ref_node_fs"
Cohesion: 0.23
Nodes (5): root, root, run, root, vector

### Community 53 - "Ferramentas de desenvolvimento"
Cohesion: 0.18
Nodes (9): Backups & recovery — export and restore dialogs, Delivered interaction, Executed checks, Visual evidence, Limites e aceitação restante, Problemas reproduzidos e corrigidos, Revisão funcional — Backups & recovery e Advanced, Validação (+1 more)

### Community 54 - "Confirmação de autofill"
Cohesion: 0.18
Nodes (10): Local Settings Sync and Data Management work item, Local workflow acceptance requirements, Historical approved four-area revision on main, Historical frontend cleanup follow-up, Historical approved hierarchical implementation scope, Authorization contract, Delivered behavior, Inline master-password change and management layout (+2 more)

### Community 55 - "Settings category links and labelled navigation"
Cohesion: 0.20
Nodes (11): Vault creation/unlock, biometric setup and inline fresh-identity master-password change forms, Backups, checkpoint cards and inline review settings area, Recovery checkpoints heading, Clear history and local/archive inventory, Compact in-section checkpoint comparison, Encrypted backup import and export controls, Cache clear, vault clear, local wipe and exclusive native operation dialog surfaces, Settings category links and labelled navigation, Checkpoint cards and inline review with separate archived copies (+3 more)

### Community 56 - "Ferramentas de desenvolvimento"
Cohesion: 0.20
Nodes (6): cancel(), captures, errors, idle(), root, ./modules/operationDialog.js

### Community 57 - "Ferramentas de desenvolvimento"
Cohesion: 0.20
Nodes (4): errors, layouts(), root, section()

### Community 59 - "Popup HTML semantic surfaces"
Cohesion: 0.22
Nodes (10): Cancel, Unlock and icon-only fingerprint share one action row, Dark master-password identity with inline biometric method, Dark main vault unlock with inline biometric method, Shared password and biometric method row, Accessible fingerprint-only shortcut beside password, Inline identity form with biometric shortcut beside current password, New-password confirmation with biometric revocation warning, Inline master-password identity, new-password and success forms (+2 more)

### Community 60 - "Historical six-category frontend review"
Cohesion: 0.20
Nodes (7): Historical accessible themes ranges and saving feedback, Historical six-category navigation, Historical six-category frontend review, Historical settings disclosures unlock and focus corrections, Historical independent Impeccable review evidence, Historical hTML category ownership and dedicated settings styles, Historical frontend regression evidence and manual limits

### Community 61 - "SETTINGS_NAVIGATION.md"
Cohesion: 0.29
Nodes (9): Compatible Settings fragments, Executed verification, Hierarchical Settings navigation, Navigation history, focus and scroll preservation, Implemented behavior, Manual review and limits, Preserved Settings behavior and security contracts, Shared Settings footer across navigation layouts (+1 more)

### Community 62 - "Recovery checkpoints behavior, protection and verification"
Cohesion: 0.20
Nodes (3): captures, errors, root

### Community 63 - "Ferramentas de desenvolvimento"
Cohesion: 0.22
Nodes (8): Explicit account selection section, PRF alternative beside the master password field, Cancel confirmation button, Compact extension-owned login confirmation with shared popup tokens, Editable username and explicit selection before an update, with expired/already-saved states, Explicit new-login save or selected password update, auth.js module bootstrap, Master password unlock form

### Community 64 - "check.mjs"
Cohesion: 0.22
Nodes (8): done, files(), graph, js, manifest, pkg, root, visit()

### Community 65 - "biometric.test.js"
Cohesion: 0.42
Nodes (7): assertion(), b64(), client(), der(), registration(), request(), sender

### Community 66 - "Quatro áreas das definições"
Cohesion: 0.25
Nodes (8): Vault unlock controller with bounded inline retry and WebAuthn cancellation, Compact comparison header and account rows, Recovery-surface presentation and unlock-controller refinement, Smaller cards and a shared contextual dimmed backdrop, Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Compact Unlock vault heading, current-password field and reveal control, Light tab bounded vault unlock

### Community 67 - "Análise de formulários"
Cohesion: 0.25
Nodes (8): 85 modules and four browser suites; Node evidence remains historical, Compact recovery presentation and consistent fingerprint entry points, Same dimmed and 2px-blurred extension context under unlock and recovery, Full restore confirms only restored total and removals, Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Compact Unlock vault heading, current-password field and reveal control, Dark popup bounded vault unlock

### Community 68 - "Guided Chrome Sync setup and device verification"
Cohesion: 0.29
Nodes (6): Device test, Evidence shown to the user, Guided Chrome Sync setup and device verification, Recovery and capacity corrections, User journey, Validation and manual acceptance

### Community 69 - "Timestamped local version backup cards"
Cohesion: 0.29
Nodes (7): Changed account labels Different fields: password and offers Restore details, Back to checkpoints remains part of the in-section view, Show matching entries checkbox includes matching count, Account rows offer a specific Recover entry action, Management inline checkpoint review in dark theme, Website or username search within the review, Review title/date and saved/deleted/different/newer counts

### Community 70 - "Popup HTML semantic surfaces"
Cohesion: 0.29
Nodes (6): Readable cache row layout correction, Reproduced cache status layout defect, Historical navigation and dialog recommendations, Recovery discovery and terminology concerns, Visual critique and accessibility limits, Breach-check cache management

### Community 71 - "Guided Chrome Sync setup, manual discovery and device test"
Cohesion: 0.29
Nodes (7): Advanced Google connection, Chrome Sync, breach cache and scoped local maintenance, Scoped entry clearing and local device erasure, Explicit legacy remote version review, Guided Chrome Sync setup, manual discovery and device test, Remote source unlock then entry-count comparison and confirmation, Configure Chrome Sync then separately enable automatic sending, Explicit matching-code device test and historical receipt status

### Community 72 - "Google configuration builder validates public key/ID and adds appData-only permissions to a separate copy"
Cohesion: 0.33
Nodes (5): Bounded appData listing, streaming download, account identification and typed transport errors, Management-only Chrome Identity connection with Drive permission-ID pinning and durable disconnect generation, Real Chrome Google connection and read-only app-folder inspection remain to be authorized by the user, Stable development extension identity and public Google OAuth client configuration, Google connection, app-folder inspection and disconnect controls state vault synchronization is unavailable

### Community 74 - "Ícone 16 pixels"
Cohesion: 0.33
Nodes (6): Copy edit and delete controls, Credential cards, Generator Tester Vault tabs, Unlocked vault screenshot, Settings navigation, Search add and lock controls

### Community 75 - "Ícone 32 pixels"
Cohesion: 0.33
Nodes (6): Cancel and Restore vault remain visible in a compact footer, Actual extension visible under a shared dimmed blurred backdrop, Short current-password and biometric preservation statement, Short checkpoint and Sync effects notice, Dark popup bounded whole-vault restore confirmation, Restore total and To remove counts only

### Community 76 - "Ícone 48 pixels"
Cohesion: 0.33
Nodes (6): Cancel and Restore vault remain visible in a compact footer, Actual extension visible under a shared dimmed blurred backdrop, Short current-password and biometric preservation statement, Short checkpoint and Sync effects notice, Light popup bounded whole-vault restore confirmation, Restore total and To remove counts only

### Community 77 - "Entrada do content script"
Cohesion: 0.33
Nodes (6): Cancel and Restore vault remain visible in a compact footer, Actual extension visible under a shared dimmed blurred backdrop, Short current-password and biometric preservation statement, Short checkpoint and Sync effects notice, Light tab bounded whole-vault restore confirmation, Restore total and To remove counts only

### Community 78 - "Documentação de Sync e dados"
Cohesion: 0.47
Nodes (4): legacyClipboard(), read(), serial, write()

### Community 79 - "Checkpoint review interaction"
Cohesion: 0.40
Nodes (5): Approved interaction, Captures, Checkpoint review interaction, State and privacy, Checkpoint review scenario coverage and remaining acceptance

### Community 80 - "Dark credential selector with many logins"
Cohesion: 0.40
Nodes (5): Dark credential selector with many logins, Previous and Next pagination showing 1–2 of 27 logins, Search logins field, Open SecurePass window action, Visible credentials manual-new-user and concurrent-user for http://127.0.0.1:43557

### Community 81 - "Documentação de Sync e dados"
Cohesion: 0.40
Nodes (5): Back to checkpoints remains part of the in-section view, Deleted account offers Recover entry; later accounts explicitly indicate removal by full restore, Popup inline checkpoint review in dark theme, Website or username search within the review, Review title/date and saved/deleted/different/newer counts

### Community 82 - "export dark 320 extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Back to checkpoints remains part of the in-section view, Deleted account offers Recover entry; later accounts explicitly indicate removal by full restore, Popup inline checkpoint review in light theme, Website or username search within the review, Review title/date and saved/deleted/different/newer counts

### Community 83 - "Dark management checkpoint list"
Cohesion: 0.40
Nodes (5): Recover an entry, Restore whole vault, Export and Remove actions, Dated checkpoint cards with saved entry counts, sequence and account differences, Recovery checkpoints heading, Clear history and three-state policy, Dark management checkpoint list, Four-section sidebar with Backups & recovery selected

### Community 84 - "Light management checkpoint list"
Cohesion: 0.40
Nodes (5): Recover an entry, Restore whole vault, Export and Remove actions, Dated checkpoint cards with saved entry counts, sequence and account differences, Recovery checkpoints heading, Clear history and three-state policy, Light management checkpoint list, Four-section sidebar with Backups & recovery selected

### Community 85 - "Dark popup checkpoint cards"
Cohesion: 0.40
Nodes (5): Entry recovery, whole-vault restore, Export and Remove fit wrapped action rows, Dated checkpoint cards with sequence, entry counts and recoverable-account examples, Version and GitHub footer with automatic-save status, Backups & recovery header, Back and Open in tab remain visible, Dark popup checkpoint cards

### Community 86 - "Light popup checkpoint cards"
Cohesion: 0.40
Nodes (5): Entry recovery, whole-vault restore, Export and Remove fit wrapped action rows, Dated checkpoint cards with sequence, entry counts and recoverable-account examples, Version and GitHub footer with automatic-save status, Backups & recovery header, Back and Open in tab remain visible, Light popup checkpoint cards

### Community 87 - "Individual entry recovery review dialog"
Cohesion: 0.40
Nodes (5): Cancel and Recover selected entry stay in the dialog footer, Explanation says only the selected entry changes and existing Sync applies, Individual entry recovery review dialog, Stable account selector and examples distinguish deleted entry from older password, Checkpoint date, saved entries, recoverable and older-detail counts

### Community 88 - "Whole-vault restore review dialog"
Cohesion: 0.40
Nodes (5): Cancel and Restore whole vault stay in the dialog footer, Review says current master password and biometric setup stay the same, Whole-vault restore review dialog, Checkpoint date, saved-entry, recovery, older-detail and removal counts, Current contents become a checkpoint and automatic Sync turns off

### Community 89 - "export dark 400 extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Website and Account identify the one entry to recover, Cancel and Recover entry remain in the footer, Actual extension visible under a shared dimmed blurred backdrop, Short one-entry and checkpoint/Sync effects, Dark popup bounded deleted-entry recovery confirmation

### Community 90 - "export error dark extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Website and Account identify the one entry to recover, Cancel and Recover entry remain in the footer, Actual extension visible under a shared dimmed blurred backdrop, Short one-entry and checkpoint/Sync effects, Light popup bounded deleted-entry recovery confirmation

### Community 91 - "export light 320 extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Website and Account identify the one entry to recover, Cancel and Recover entry remain in the footer, Actual extension visible under a shared dimmed blurred backdrop, Short one-entry and checkpoint/Sync effects, Light tab bounded deleted-entry recovery confirmation

### Community 92 - "export light 400 extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Lower-priority full-checkpoint area and Review full restore action, Checkpoint date and nonzero saved/deleted summary, Domain, account and Deleted entry row with Recover entry, Dark popup compact checkpoint comparison, Search website or username field

### Community 93 - "export management dark extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Lower-priority full-checkpoint area and Review full restore action, Checkpoint date and nonzero saved/deleted summary, Domain, account and Deleted entry row with Recover entry, Light tab compact checkpoint comparison, Search website or username field

### Community 94 - "restore dark 320 extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Single Cancel and Unlock row with compact spacing, Fingerprint-only shortcut beside password, Actual extension visible under a shared dimmed blurred backdrop, Compact Unlock vault heading, current-password field and reveal control, Dark popup bounded vault unlock with biometric alternative

### Community 95 - "restore dark 400 extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Inline Invalid master password or corrupted vault error with empty password field, Compact Unlock vault heading, current-password field and reveal control, Dark popup bounded vault unlock with inline error

### Community 96 - "restore error dark extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Inline Invalid master password or corrupted vault error with empty password field, Compact Unlock vault heading, current-password field and reveal control, Light popup bounded vault unlock with inline error

### Community 97 - "restore light 320 extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Inline Invalid master password or corrupted vault error with empty password field, Compact Unlock vault heading, current-password field and reveal control, Light tab bounded vault unlock with inline error

### Community 98 - "drive.js"
Cohesion: 0.70
Nodes (4): act(), attachDriveListeners(), messages, refreshGoogleView()

### Community 100 - "Dark anchored credential selector on narrow page"
Cohesion: 0.50
Nodes (4): Dark anchored credential selector on narrow page, Credential option fictional-user for http://127.0.0.1:43557, Open SecurePass window action, Key icon trigger beside masked password field

### Community 101 - "Checkpoint review design document"
Cohesion: 0.50
Nodes (4): One primary Review checkpoint button with secondary Export and Remove, Dated cards show sequence and aggregate entry differences without account examples, Backups & recovery sidebar selection and Recovery checkpoints heading remain visible, Dark management checkpoint cards with one Review action

### Community 102 - "Light management checkpoint cards with one Review action"
Cohesion: 0.50
Nodes (4): One primary Review checkpoint button with secondary Export and Remove, Dated cards show sequence and aggregate entry differences without account examples, Backups & recovery sidebar selection and Recovery checkpoints heading remain visible, Light management checkpoint cards with one Review action

### Community 103 - ".put"
Cohesion: 0.50
Nodes (4): Review checkpoint primary action with secondary Export and Remove, Dated checkpoint with sequence, recoverable-entry and later-entry counts, Backups header and Open in tab remain visible above checkpoint cards, Dark popup checkpoint card with one Review action

### Community 104 - "Operação de teste"
Cohesion: 0.50
Nodes (4): Review checkpoint primary action with secondary Export and Remove, Dated checkpoint with sequence, recoverable-entry and later-entry counts, Backups header and Open in tab remain visible above checkpoint cards, Light popup checkpoint card with one Review action

### Community 105 - "Separate whole-vault restore confirmation from inline review"
Cohesion: 0.50
Nodes (4): Cancel and Restore vault in the confirmation footer, Copy preserves current authentication and keeps current contents as a checkpoint while turning automatic Sync off, Separate whole-vault restore confirmation from inline review, Compact confirmation shows saved-entry count and highlighted removal count

### Community 106 - "Security settings area"
Cohesion: 0.50
Nodes (4): Set up biometric unlock card describing fingerprint, face, PIN or security key, Clear copied passwords after 30 seconds slider with best-effort copy-matching explanation, Security settings screenshot with password, clipboard, biometric controls and a toast, Visible toast states Legacy Sync mode updated and asks to unlock active vault again

### Community 107 - "sync-browser.mjs"
Cohesion: 0.50
Nodes (4): Password and fingerprint identity row, Fingerprint authentication affordance, Biometric identity confirmation capture, Dark compact identity dialog

### Community 108 - ".put"
Cohesion: 0.50
Nodes (4): Identity error and retry capture, Compact responsive error layout, Inline invalid password or corrupt vault error, Identity retry or cancellation controls

### Community 109 - "auth.js"
Cohesion: 0.50
Nodes (4): Password identity confirmation capture, Explicit identity confirmation actions, Current master-password identity form, Dimmed checkpoint review context

### Community 110 - "Local Settings Sync and Data Management work item"
Cohesion: 0.50
Nodes (4): Checkpoint date and nonzero saved/deleted summary, Domain, account and Deleted entry row with Recover entry, Light popup compact checkpoint comparison, Search website or username field

### Community 111 - "recoveryDesign-browser.mjs"
Cohesion: 0.50
Nodes (4): Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Compact Unlock vault heading, current-password field and reveal control, Light popup bounded vault unlock

### Community 112 - "Management inline checkpoint review in dark theme"
Cohesion: 0.50
Nodes (4): Settings navigation: Appearance selected, Security, Backups & recovery, Advanced, Reset preferences row says theme, generator and timeout defaults are restored and vault is kept, Dark appearance settings screenshot, Theme choices: System selected, Light, Dark

### Community 113 - "Device erasure confirmation modal"
Cohesion: 0.50
Nodes (4): Typed confirmation shows wrong with ERASE THIS DEVICE error, Device erasure confirmation modal, Visible local erasure scope text says remote copies remain, Verification dropdown shows erase without unlocking

### Community 114 - "Appearance popup with back navigation and Open in tab link"
Cohesion: 0.50
Nodes (4): Preferences save automatically notice, Appearance popup with back navigation and Open in tab link, Reset preferences copy lists theme, generator and timeout defaults and says vault is kept, System, Light, and Dark theme choices; System visibly selected

### Community 116 - "SecurePass light credential selector"
Cohesion: 0.67
Nodes (3): fictional-user credential option, Open SecurePass window action, SecurePass light credential selector

### Community 117 - "Vault management Advanced settings"
Cohesion: 0.67
Nodes (3): Vault management Advanced settings, Chrome Sync encrypted vault copies, Google Drive connection management

### Community 118 - "Narrow Advanced settings layout"
Cohesion: 0.67
Nodes (3): Narrow Advanced settings layout, Chrome Sync copy availability and manual restoration, Google Drive connected account status and actions

### Community 119 - "Popup inline checkpoint review in light theme"
Cohesion: 0.67
Nodes (3): Timestamped encrypted local-version backup cards with Restore and Export buttons, Legacy Sync mode update notice requesting active vault unlock, Backups and recovery settings screenshot

## Knowledge Gaps
- **422 isolated node(s):** `Settings navigation screenshot evidence`, `Preserved Settings behavior and security contracts`, `Navigation history, focus and scroll preservation`, `Compatible Settings fragments`, `One primary Review checkpoint button with secondary Export and Remove` (+417 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 905 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **51 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Current architecture with implemented local and legacy increment` connect `Current architecture with implemented local and legacy increment` to `Interface e revisão visual`, `Quatro áreas das definições`, `Serialized offscreen clipboard owner`, `SETTINGS_UX_IMPLEMENTATION.md`, `backupDialogs-browser.mjs`, `Original SD review with later local increment notice`, `popup.js`, `Inline master-password flow and independent management proportions`, `Internal normal-mutation signing and atomic vault-checkpoint-outbox authorization/session checks`, `Criptografia e armazenamento`, `Confirmação de autofill`, `Ferramentas de desenvolvimento`, `Ferramentas de desenvolvimento`, `Recovery checkpoints behavior, protection and verification`?**
  _High betweenness centrality (0.314) - this node is a cross-community bridge._
- **What connects `Settings navigation screenshot evidence`, `Preserved Settings behavior and security contracts`, `Navigation history, focus and scroll preservation` to the rest of the system?**
  _422 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `requests.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08512658227848101 - nodes in this community are weakly interconnected._
- **Why does `Checkpoint recovery with inline comparison and fresh scoped confirmation` connect `Recovery checkpoints behavior, protection and verification` to `Current architecture with implemented local and legacy increment`, `vaultHandlers.js`?**
  _High betweenness centrality (0.179) - this node is a cross-community bridge._
- **Should `Interface e revisão visual` be split into smaller, more focused modules?**
  _Cohesion score 0.03075531433740389 - nodes in this community are weakly interconnected._
- **Why does `Validation and release checklist` connect `session.js` to `Interface e revisão visual`, `SETTINGS_UX_IMPLEMENTATION.md`, `Guided Chrome Sync setup and device verification`, `Security model and open risks`, `Implemented extension-origin anchored account selector with two-account pagination and username search`, `backupDialogs-browser.mjs`, `Original SD review with later local increment notice`, `vaultUnlock.js`, `Checkpoint review interaction`, `Checkpoint review interaction and scoped action authorization`, `Ferramentas de desenvolvimento`, `Confirmação de autofill`, `Checkpoint review design document`, `Criptografia e armazenamento`, `Ferramentas de desenvolvimento`, `Historical six-category frontend review`, `SETTINGS_NAVIGATION.md`?**
  _High betweenness centrality (0.107) - this node is a cross-community bridge._
- **Should `signedProtocol.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08090117767537122 - nodes in this community are weakly interconnected._
## Incremental refresh audit
Code refreshed by `graphify update .`; changed documentation and five current captures semantically reconciled on 2026-11-06. Distinct IDs retained with supported `dedup=False` after default label deduplication attempted to lose ten legacy IDs; guarded export passed without force. Semantic host token usage is unavailable from the collaboration tool; zero extraction token fields are placeholders. Existing cache entries of unknown prompt vintage were not forcibly regenerated outside this task.
