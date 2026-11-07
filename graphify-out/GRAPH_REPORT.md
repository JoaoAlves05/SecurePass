# Graph Report - SecurePass  (2026-11-07)

## Corpus Check
- 261 files · ~137,255 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1980 nodes · 4633 edges · 161 communities (108 shown, 53 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 80 edges (avg confidence: 0.84)
- Token cost: host extraction usage unavailable; no separate semantic API used.

## Community Hubs (Navigation)
- cryptoVault.js
- signedProtocol.js
- Interface e revisão visual
- Recovery checkpoints behavior, protection and verification
- Original SD review with later local increment notice
- biometric/service.js
- ref_node_assert
- requests.js
- popup.js
- IMPLEMENTATION_CHECKLIST.md
- Current architecture with implemented local and legacy increment
- checkpointReview.js
- Documentação de Sync e dados
- Checkpoint review design document
- session.js
- popup.js
- Inline master-password flow and independent management proportions
- utilHandlers.js
- googleConfiguration.test.js
- README de apresentação em português
- Autofill na página
- vault.js
- logger.js
- Contextual on-page key contract
- checkpointReview.js
- requests.js
- Modelo de segurança
- Popup HTML semantic surfaces
- driveRuntime.js
- googleConnection.js
- driveRuntime.js
- setStorage
- Implementation checklist: partial implementation, release not accepted
- Checkpoint review interaction
- SETTINGS_UX_IMPLEMENTATION.md
- accountPrompts-browser.mjs
- REVIEW_BACKUP_ADVANCED.md
- threeWayMerge.js
- Guided Chrome Sync setup and receipt evidence contract
- selector.js
- Security model and open risks
- SETTINGS_UX_DESIGN.md
- syncSetup-browser.mjs
- Internal common-base three-way merge issue and acceptance scope
- vaultUnlock.js
- browser.mjs
- Account suggestions, inline tools and trusted-window confirmation contract
- requests.js
- googleConfiguration.test.js
- popup.js
- popup.js
- Implementation tracking with consolidated current and historical status
- Navegação e validação Settings
- utilHandlers.js
- logger.js
- Implemented extension-origin anchored account selector with two-account pagination and username search
- Ferramentas de desenvolvimento
- Confirmação de autofill
- Settings category links and labelled navigation
- Recovery checkpoints behavior, protection and verification
- Ferramentas de desenvolvimento
- Ferramentas de desenvolvimento
- Popup HTML semantic surfaces
- Historical six-category frontend review
- SETTINGS_NAVIGATION.md
- Ferramentas de desenvolvimento
- Purpose-bound inline master-password authorization
- Ferramentas de desenvolvimento
- playwright
- biometric.test.js
- Quatro áreas das definições
- Análise de formulários
- ref_node_fs
- Guided Chrome Sync setup and device verification
- Timestamped local version backup cards
- Popup HTML semantic surfaces
- ref_node_assert
- Guided Chrome Sync setup, manual discovery and device test
- Google configuration builder validates public key/ID and adds appData-only permissions to a separate copy
- Ícone 16 pixels
- Ícone 32 pixels
- Ícone 48 pixels
- Entrada do content script
- Documentação de Sync e dados
- masterPassword.test.js
- Dark credential selector with many logins
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
- Checkpoint review design document
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
- Three content checkpoints, preserving recovery and source-specific exports
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
3. `Current architecture with implemented local and legacy increment` - 56 edges
4. `Validation and release checklist` - 56 edges
5. `removeStorage()` - 54 edges
6. `setStorage()` - 51 edges
7. `withVaultOperation()` - 51 edges
8. `showToast()` - 46 edges
9. `Historical review of commit 5aed51c` - 44 edges
10. `Original SD review with later local increment notice` - 42 edges

## Surprising Connections (you probably didn't know these)
- `Key protection and trusted checkpoint implementation` --references--> `prepareSignedPublication()`  [INFERRED]
  docs/SIGNED_PROTOCOL.md → src/sync/signedPublication.js
- `Checkpoint summary and detail separation verified` --conceptually_related_to--> `renderCheckpoints()`  [INFERRED]
  docs/VALIDATION.md → popup/modules/checkpoints.js
- `Inline review and dismissal validate origin, tab and document` --references--> `inlineCandidate()`  [EXTRACTED]
  docs/ACCOUNT_PROMPTS.md → src/autofill/candidates.js
- `Submission capture precedes page clearing/navigation and does not prove login success` --references--> `proposeCandidate()`  [EXTRACTED]
  docs/ACCOUNT_PROMPTS.md → src/autofill/candidates.js
- `Review cancellation retains a proposal; dismissal/save/expiry/lock remove it` --references--> `reviewCandidate()`  [EXTRACTED]
  docs/ACCOUNT_PROMPTS.md → src/autofill/candidates.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Protected authentication and minimal document-bound anchored account selection** — docs_anchored_selector_account_selection, docs_anchored_selector_request_binding, docs_anchored_selector_visual_attestation, docs_anchored_selector_native_fallback, selector_selector_account_surface [EXTRACTED 1.00]
- **Whole-checkpoint restore authorization sequence** — docs_checkpoint_review_recent_authentication, docs_checkpoint_review_confirm_identity, docs_checkpoint_review_fresh_scoped_token, docs_checkpoint_review_secondary_restore [EXTRACTED 1.00]
- **Internal signed local mutation through atomic outbox to verified immutable publication** — docs_drive_transport_atomic_signed_commit, docs_signed_protocol_revision_wrapper, docs_drive_transport_durable_coordinator, docs_drive_transport_immutable_publication, docs_drive_transport_resumable_upload [EXTRACTED 1.00]

## Communities (161 total, 53 thin omitted)

### Community 0 - "cryptoVault.js"
Cohesion: 0.06
Nodes (122): DECODER, decryptBackupPayload(), deriveBackupKey(), ENCODER, encryptBackupPayload(), isEncryptedBackupEnvelope(), changeMasterPassword(), changeMasterPasswordAuthorized() (+114 more)

### Community 1 - "signedProtocol.js"
Cohesion: 0.06
Nodes (71): clearSecrets(), complete(), expired(), refresh(), requestId, run(), saveTargetChanged(), send() (+63 more)

### Community 2 - "Interface e revisão visual"
Cohesion: 0.03
Nodes (36): Implemented anchored selector with two-account pagination/search and protected unlock/native fallback, Atomic vault-checkpoint-Drive outbox commit with internal automatic signing; production remains gated, Atomic vault-checkpoint-Drive outbox commit with internal automatic signing; production remains gated, Atomic vault-checkpoint-Drive outbox commit with internal automatic signing; production remains gated, Atomic vault-checkpoint-Drive outbox commit with internal automatic signing; production remains gated, Internal P-256 administrative and encrypted-v2 revision prototype with pinned root/checkpoint; production review remains pending, Version 3 settings Sync data and compact login plan, AF01-AF12 acceptance matrix with AF03/AF09 closed; broad physical and accessibility acceptance remains open (+28 more)

### Community 3 - "Recovery checkpoints behavior, protection and verification"
Cohesion: 0.04
Nodes (49): Checkpoint recovery with inline comparison and fresh scoped confirmation, Inline checkpoint review module and displayed-comparison identity, Archived Sync copies stay separate and exports are source-specific, Unlocked checkpoint counts, differences and affected-account examples, Remove one checkpoint or verify current password to clear local history, Recovery checkpoints behavior, protection and verification, Per-entry recovery through inline review and explicit confirmation, Existing-vault external and selected-remote restores preserve active authentication (+41 more)

### Community 5 - "biometric/service.js"
Cohesion: 0.08
Nodes (39): attachGeneratorListeners(), avoidSimilar, copyGeneratedBtn, generateButton, generatedResult, generatorStatus, handleGenerate(), includeLower (+31 more)

### Community 6 - "ref_node_assert"
Cohesion: 0.14
Nodes (14): fake-indexeddb, auth(), saveRequest(), sender, alarms, areas, event(), failWhen() (+6 more)

### Community 7 - "requests.js"
Cohesion: 0.14
Nodes (38): dismissCandidate(), inlineCandidate(), listCandidates, proposeCandidate(), reviewCandidate(), reviewing, writes, CANDIDATE_PREFIX (+30 more)

### Community 9 - "IMPLEMENTATION_CHECKLIST.md"
Cohesion: 0.06
Nodes (28): Account suggestions and inline login tools, Integrity and capability boundaries, Surfaces and interaction, Validation, Why a save suggestion appears, Capacidades e vinculação, Evidência, Manifesto e limites (+20 more)

### Community 11 - "checkpointReview.js"
Cohesion: 0.17
Nodes (32): attachCheckpointListeners(), date(), deleteHistory(), handleCheckpointAction(), plural(), renderCheckpoints(), accessibleDestination(), attachDataListeners() (+24 more)

### Community 12 - "Documentação de Sync e dados"
Cohesion: 0.16
Nodes (27): action(), attachButton(), entry, beginFill(), createPanel(), element(), feedback(), initAutofill() (+19 more)

### Community 13 - "Checkpoint review design document"
Cohesion: 0.07
Nodes (30): Single checkpoint review entry, Inline checkpoint comparison, Confirm identity flow, Individual entry recovery, Checkpoint review design document, Authentication expiry during confirmation, Successful recovery refreshes review or returns to checkpoint list, Recovery review cleanup and navigation (+22 more)

### Community 14 - "session.js"
Cohesion: 0.08
Nodes (32): Older checkpoint protection migration, False source-level production-review predicate; no public enrollment, adoption or Drive write activation, Journey scope and unconfigured OAuth, Accessibility and website compatibility acceptance, Automated regression coverage, Backup dialog refinement evidence, Development validation commands, Recovery checkpoints implementation evidence (+24 more)

### Community 15 - "popup.js"
Cohesion: 0.23
Nodes (26): attachBiometricListeners(), syncBiometricView(), attachCandidateListeners(), refreshCandidates(), attachManagementListeners(), refreshManagement(), sendMessage(), attachSettingsNavigation() (+18 more)

### Community 16 - "Inline master-password flow and independent management proportions"
Cohesion: 0.06
Nodes (34): Approved inline identity/password/success and management proportions, Pre-save biometric revocation notice and optional setup again, Clear secrets and revoke the exact grant on leaving the inline flow, Inline master-password flow and independent management proportions, Two-minute single-use revision-bound password-change grant, Physical authenticator and actual toolbar sizing remain manual acceptance, Fresh identity confirmation replaces preliminary unlock and modal, Tab stylesheet separates desktop layout from compact popup presentation (+26 more)

### Community 17 - "utilHandlers.js"
Cohesion: 0.15
Nodes (22): copyInBackground(), ensureOffscreen(), cacheWrites, checkPassword(), clearHibpCache(), hibpCacheStatus(), inFlight, range() (+14 more)

### Community 18 - "googleConfiguration.test.js"
Cohesion: 0.10
Nodes (16): done, files(), graph, js, manifest, pkg, root, visit() (+8 more)

### Community 19 - "README de apresentação em português"
Cohesion: 0.07
Nodes (22): Local backup safety and repeatable recovery cleanup, Backups and Advanced functional review, Preenchimento confirmado por origem e documento, Backups cifrados com pré-visualização de importação, Desbloqueio WebAuthn com PRF, Limites de capacidade e importação, Desenvolvimento e verificações, Chrome122 e âmbito de compatibilidade (+14 more)

### Community 20 - "Autofill na página"
Cohesion: 0.08
Nodes (23): action, default_popup, default_title, background, service_worker, type, content_scripts, content_security_policy (+15 more)

### Community 21 - "vault.js"
Cohesion: 0.08
Nodes (22): biometricUnlockContainer, clearRevealTimer(), confirmMasterInput, createMasterSection, createVaultIconButton(), entryForm, entryModalTitle, entryNotesInput (+14 more)

### Community 22 - "logger.js"
Cohesion: 0.15
Nodes (18): ALARM_NAME, BIOMETRIC_SESSION_PASSPHRASE_KEY, CHUNK_SIZE, CLIPBOARD_ALARM_NAME, DB_STORE_NAME, DB_VERSION, META_KEY, PRF_EVAL_LABEL (+10 more)

### Community 23 - "Contextual on-page key contract"
Cohesion: 0.09
Nodes (23): Direct selector and original-field tool handoff, Native manual login creation form, Native secondary website tools disclosure, Source field and reserved native-tab request binding, Direct key opens up to two anchored account suggestions, Contextual on-page key contract, Executed contextual-key evidence and remaining manual acceptance, Pointer-transparent feedback preserves the next website action (+15 more)

### Community 24 - "checkpointReview.js"
Cohesion: 0.30
Nodes (21): account(), attachCheckpointReviewListeners(), changedFields(), checkFreshness(), clientId, closeReview(), date(), entryCount() (+13 more)

### Community 25 - "requests.js"
Cohesion: 0.24
Nodes (19): begin(), cancelAuthentication(), consume(), context(), expireCeremonies(), finishAuthentication(), finishRegistration(), origin() (+11 more)

### Community 26 - "Modelo de segurança"
Cohesion: 0.27
Nodes (17): Inline unlock errors and retry without dismissing the form, resolveUnlockSetup(), setUnlockResolver(), attachUIListeners(), backFromSettings(), closeModal(), closeSettingsPanel(), manageFocus() (+9 more)

### Community 27 - "Popup HTML semantic surfaces"
Cohesion: 0.14
Nodes (20): Version and repository footer, System light and dark theme controls, Auto-lock inactivity preference, Consistent fingerprint symbol for biometric entry points, Ownership-aware clipboard timeout explanation, Popup HTML semantic surfaces, Labelled credential editor dialog, Appearance settings area (+12 more)

### Community 28 - "driveRuntime.js"
Cohesion: 0.23
Nodes (16): bounded(), classify(), createDriveClient(), guard(), publish(), request(), uploadResumable(), createDriveTransport() (+8 more)

### Community 29 - "googleConnection.js"
Cohesion: 0.27
Nodes (14): driveHandlers, createDriveReader(), assertGeneration(), assertGoogleBinding(), authToken(), connectGoogle(), disconnectGoogle(), getBoundGoogleToken() (+6 more)

### Community 30 - "driveRuntime.js"
Cohesion: 0.20
Nodes (13): advanceAuthorization(), key(), loadAuthorization(), pinAuthorization(), read(), write(), createDriveRuntime(), run() (+5 more)

### Community 31 - "setStorage"
Cohesion: 0.24
Nodes (14): handleRuntimeError(), readSyncOutbox(), setStorage(), retryPendingSync(), activate(), assertGeneration(), current(), generation() (+6 more)

### Community 32 - "Implementation checklist: partial implementation, release not accepted"
Cohesion: 0.12
Nodes (13): Implemented anchored selector with two-account pagination/search and protected unlock/native fallback, SC and AF acceptance matrix; local SC01/SC02 and AF03/AF09 closed, remaining acceptance open, Consolidated delivered increments and remaining product/release gates, 2026-11-06 delivered OAuth inspection, signing, gated runtime, resumable uploads and anchored search, Implementation checklist: partial implementation, release not accepted, Public OAuth client received; real Google authorization, protocol review, physical hardware and lifecycle acceptance pending, Remaining implementation order after internal Drive and planner delivery, Implemented autofill displayed-revision guard rejects missing or changed revision (+5 more)

### Community 33 - "Checkpoint review interaction"
Cohesion: 0.11
Nodes (14): Approved interaction, Captures, Checkpoint review interaction, State and privacy, Checkpoint review scenario coverage and remaining acceptance, Behavior and presentation, Encryption and rotation, Evidence (+6 more)

### Community 34 - "SETTINGS_UX_IMPLEMENTATION.md"
Cohesion: 0.14
Nodes (7): Current UX delivery separates read-only account access, internal publication, planner and anchored login, Delivered behavior, Executed checks, Remaining release gates, Review artifacts, Scenario coverage boundary, Settings UX implementation and evidence

### Community 35 - "accountPrompts-browser.mjs"
Cohesion: 0.20
Nodes (16): Dedicated disposable account-prompt Chromium command, capture(), errors, nextPage(), openFill(), openSaveEntered(), openTools(), output (+8 more)

### Community 36 - "REVIEW_BACKUP_ADVANCED.md"
Cohesion: 0.11
Nodes (18): scripts, check, configure:google, package, test, test:account-prompts-browser, test:anchored-browser, test:backup-dialogs-browser (+10 more)

### Community 37 - "threeWayMerge.js"
Cohesion: 0.24
Nodes (15): canonical(), checkCurrent(), compare(), content(), discardThreeWayMerge(), equal(), fields, plans (+7 more)

### Community 38 - "Guided Chrome Sync setup and receipt evidence contract"
Cohesion: 0.12
Nodes (17): Guided Chrome Sync setup, bounded capacity and non-authorizing device diagnostic, Guided setup Node/security and Chromium evidence with emulated transport boundaries, Guided setup supersedes parts of historical capacity and selected-restore findings, Conservative two-complete-version capacity and local-only failure handling, Dark guided setup refusing insufficient two-version capacity, Enable is unavailable when the local vault cannot coexist with a subsequent complete copy, Narrow dark device-test receipt with preserved local cache controls, Receipt confirms the tested encrypted version while local maintenance remains available (+9 more)

### Community 39 - "selector.js"
Cohesion: 0.22
Nodes (16): Implemented anchored selector with two-account pagination/search and protected unlock/native fallback, Disposable anchored and ZIP journeys plus internal Drive integration evidence; full release remains open, Current login key UI has two anchored suggestions and native complete-list fallback; registration/change-password generator remains available., Delivered anchored search/pagination with protected unlock and native fallback, Selector is extension-origin with restricted message capabilities and source/document binding; iframe isolation is not independent Chrome permissions or native clickjacking assurance., Implemented anchored selector with two-account pagination/search and protected unlock/native fallback, Implemented anchored selector with two-account pagination/search and protected unlock/native fallback, clear() (+8 more)

### Community 41 - "SETTINGS_UX_DESIGN.md"
Cohesion: 0.17
Nodes (7): Delivery evidence, Information architecture, Interaction rules, Journey state machine, SC01–SC58 traceability, Screen sketches, Settings UX — journeys, screens and acceptance map

### Community 42 - "syncSetup-browser.mjs"
Cohesion: 0.12
Nodes (6): test:sync-setup-browser runs the disposable guided Chrome Sync scenario, contexts, directories, errors, output, root

### Community 43 - "Internal common-base three-way merge issue and acceptance scope"
Cohesion: 0.17
Nodes (12): Separate internal three-way planner with opaque revision-bound reviews, Full SC merge acceptance remains open after internal planner delivery, Three-way planner checklist records delivered internal planning and guarded review, Current integrated code delivery with separate pending protocol and real-world acceptance, Global completion issue remains open for administrative lifecycle, recovery, convergence, migration and independent gates, Drive integration issue: resumable uploads, automatic signing, gated worker and read-only OAuth management, Shared-base permutation evidence does not establish full distributed convergence, Internal common-base three-way merge issue and acceptance scope (+4 more)

### Community 44 - "vaultUnlock.js"
Cohesion: 0.13
Nodes (14): Advanced control inventory, Scoped authentication and local erasure, Backups control inventory, Cache usage without duration control, Unified local and archived earlier versions, Executed validation, Four-area Settings revision, Historical General inventory (+6 more)

### Community 45 - "browser.mjs"
Cohesion: 0.13
Nodes (8): frameFor(), projectRoot, server, errors, root, server, shadowClick(), find()

### Community 46 - "Account suggestions, inline tools and trusted-window confirmation contract"
Cohesion: 0.14
Nodes (14): Review cancellation retains a proposal; dismissal/save/expiry/lock remove it, Restricted five-minute proposals, eight-item bound, metadata-only listing and deduplication, Same-origin explicit save/update binds destination revision and preserves notes and identity, Fill and save consume authorization once under the operation lock, Inline review and dismissal validate origin, tab and document, Closed-shadow tools follow theme and reposition with field and viewport; removal releases listeners, Real SSO, toolbar, physical authenticators and screen readers remain manual checks, Public status, account and Sync reads wait for writes and erasure (+6 more)

### Community 47 - "requests.js"
Cohesion: 0.25
Nodes (12): handlers, ready, clearCandidates(), clearRequests(), cancelCeremonies(), revokeBiometric(), lockVault, onVaultLock (+4 more)

### Community 48 - "googleConfiguration.test.js"
Cohesion: 0.18
Nodes (11): Public Google client received and stable configured development copy generated; real authorization remains pending, Disposable Chromium anchored, configured-Google emulation and ZIP evidence; real Google remains unaccepted, googleManifest(), main(), root, runtimeFiles, base, config (+3 more)

### Community 49 - "popup.js"
Cohesion: 0.15
Nodes (14): Auto-lock vault slider, Set up biometric unlock action, Change master password action, Clear copied passwords slider, GitHub footer link, Settings category navigation: Appearance, Security, Backups & recovery, Advanced, Settings footer with version, GitHub link, and preference save status, Settings popup home screenshot (+6 more)

### Community 50 - "popup.js"
Cohesion: 0.29
Nodes (12): syncGeneratorControls(), attachSettingsListeners(), initialiseSettings(), saving, scheduleSettingsSave(), setSaveStatus(), syncSettingsView(), updateRangeLabel() (+4 more)

### Community 52 - "Navegação e validação Settings"
Cohesion: 0.17
Nodes (6): Recovery-surface checks recorded in validation evidence, Dedicated recovery UI browser command, test:recovery-ui-browser, captures, errors, root

### Community 53 - "utilHandlers.js"
Cohesion: 0.42
Nodes (12): biometricStatus(), code(), confirmDeviceTest(), deviceId(), deviceTestStatus(), digest(), inspectDeviceTest(), requireTestedVersion() (+4 more)

### Community 54 - "logger.js"
Cohesion: 0.22
Nodes (11): LOG_ENABLED, buffer, format(), isArrayBufferLike(), isPrimitive(), isSensitiveString(), logger, redactValue() (+3 more)

### Community 55 - "Implemented extension-origin anchored account selector with two-account pagination and username search"
Cohesion: 0.17
Nodes (8): Chromium selector evidence does not close visual-adversarial, physical accessibility or real-site acceptance, Implemented extension-origin anchored account selector with two-account pagination and username search, Protected auth-window handoff and native fallback for CSP blocking and manual creation, Trusted selection plus source focus, ancestor visibility and hit-testing checks, Account-vault-generation bound IndexedDB publication queue with bounded durable retries, Persisted resumable upload sessions, provider offset probes, one-MiB chunks and 16-MiB packet bound, Implemented field-key, protected unlock, anchored account choice and direct fill without submission, Minimal no-referrer account surface with origin, search, top pagination, account list and live status

### Community 56 - "Ferramentas de desenvolvimento"
Cohesion: 0.18
Nodes (9): Backups & recovery — export and restore dialogs, Delivered interaction, Executed checks, Visual evidence, Limites e aceitação restante, Problemas reproduzidos e corrigidos, Revisão funcional — Backups & recovery e Advanced, Validação (+1 more)

### Community 57 - "Confirmação de autofill"
Cohesion: 0.18
Nodes (10): Local Settings Sync and Data Management work item, Local workflow acceptance requirements, Historical approved four-area revision on main, Historical frontend cleanup follow-up, Historical approved hierarchical implementation scope, Authorization contract, Delivered behavior, Inline master-password change and management layout (+2 more)

### Community 58 - "Settings category links and labelled navigation"
Cohesion: 0.20
Nodes (11): Vault creation/unlock, biometric setup and inline fresh-identity master-password change forms, Backups, checkpoint cards and inline review settings area, Recovery checkpoints heading, Clear history and local/archive inventory, Compact in-section checkpoint comparison, Encrypted backup import and export controls, Cache clear, vault clear, local wipe and exclusive native operation dialog surfaces, Settings category links and labelled navigation, Checkpoint cards and inline review with separate archived copies (+3 more)

### Community 59 - "Recovery checkpoints behavior, protection and verification"
Cohesion: 0.18
Nodes (4): captures, errors, root, ./modules/operationDialog.js

### Community 60 - "Ferramentas de desenvolvimento"
Cohesion: 0.20
Nodes (4): errors, layouts(), root, section()

### Community 62 - "Popup HTML semantic surfaces"
Cohesion: 0.22
Nodes (10): Cancel, Unlock and icon-only fingerprint share one action row, Dark master-password identity with inline biometric method, Dark main vault unlock with inline biometric method, Shared password and biometric method row, Accessible fingerprint-only shortcut beside password, Inline identity form with biometric shortcut beside current password, New-password confirmation with biometric revocation warning, Inline master-password identity, new-password and success forms (+2 more)

### Community 63 - "Historical six-category frontend review"
Cohesion: 0.20
Nodes (7): Historical accessible themes ranges and saving feedback, Historical six-category navigation, Historical six-category frontend review, Historical settings disclosures unlock and focus corrections, Historical independent Impeccable review evidence, Historical hTML category ownership and dedicated settings styles, Historical frontend regression evidence and manual limits

### Community 64 - "SETTINGS_NAVIGATION.md"
Cohesion: 0.29
Nodes (9): Compatible Settings fragments, Executed verification, Hierarchical Settings navigation, Navigation history, focus and scroll preservation, Implemented behavior, Manual review and limits, Preserved Settings behavior and security contracts, Shared Settings footer across navigation layouts (+1 more)

### Community 65 - "Ferramentas de desenvolvimento"
Cohesion: 0.22
Nodes (5): cancel(), captures, errors, idle(), root

### Community 66 - "Purpose-bound inline master-password authorization"
Cohesion: 0.22
Nodes (6): Implemented read-only Google management and gated internal signed Drive integration, Independent management-tab layout with shared trusted pathname, Purpose-bound inline master-password authorization, Drive production lifecycle, recovery, convergence, migration and release acceptance remain incomplete, Internal normal-mutation signing and atomic vault-checkpoint-outbox authorization/session checks, Canonical signed encrypted-v2 revision wrapper bound to active writer, vault, epoch and exact authorization digest

### Community 67 - "Ferramentas de desenvolvimento"
Cohesion: 0.22
Nodes (8): Explicit account selection section, PRF alternative beside the master password field, Cancel confirmation button, Compact extension-owned login confirmation with shared popup tokens, Editable username and explicit selection before an update, with expired/already-saved states, Explicit new-login save or selected password update, auth.js module bootstrap, Master password unlock form

### Community 68 - "playwright"
Cohesion: 0.25
Nodes (8): devDependencies, fake-indexeddb@^6.2.4, playwright@1.56.1, name, private, type, version, playwright

### Community 69 - "biometric.test.js"
Cohesion: 0.42
Nodes (7): assertion(), b64(), client(), der(), registration(), request(), sender

### Community 70 - "Quatro áreas das definições"
Cohesion: 0.25
Nodes (8): Vault unlock controller with bounded inline retry and WebAuthn cancellation, Compact comparison header and account rows, Recovery-surface presentation and unlock-controller refinement, Smaller cards and a shared contextual dimmed backdrop, Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Compact Unlock vault heading, current-password field and reveal control, Light tab bounded vault unlock

### Community 71 - "Análise de formulários"
Cohesion: 0.25
Nodes (8): 85 modules and four browser suites; Node evidence remains historical, Compact recovery presentation and consistent fingerprint entry points, Same dimmed and 2px-blurred extension context under unlock and recovery, Full restore confirms only restored total and removals, Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Compact Unlock vault heading, current-password field and reveal control, Dark popup bounded vault unlock

### Community 72 - "ref_node_fs"
Cohesion: 0.25
Nodes (3): contexts, profiles, root

### Community 73 - "Guided Chrome Sync setup and device verification"
Cohesion: 0.29
Nodes (6): Device test, Evidence shown to the user, Guided Chrome Sync setup and device verification, Recovery and capacity corrections, User journey, Validation and manual acceptance

### Community 74 - "Timestamped local version backup cards"
Cohesion: 0.29
Nodes (7): Changed account labels Different fields: password and offers Restore details, Back to checkpoints remains part of the in-section view, Show matching entries checkbox includes matching count, Account rows offer a specific Recover entry action, Management inline checkpoint review in dark theme, Website or username search within the review, Review title/date and saved/deleted/different/newer counts

### Community 75 - "Popup HTML semantic surfaces"
Cohesion: 0.29
Nodes (6): Readable cache row layout correction, Reproduced cache status layout defect, Historical navigation and dialog recommendations, Recovery discovery and terminology concerns, Visual critique and accessibility limits, Breach-check cache management

### Community 77 - "Guided Chrome Sync setup, manual discovery and device test"
Cohesion: 0.29
Nodes (7): Advanced Google connection, Chrome Sync, breach cache and scoped local maintenance, Scoped entry clearing and local device erasure, Explicit legacy remote version review, Guided Chrome Sync setup, manual discovery and device test, Remote source unlock then entry-count comparison and confirmation, Configure Chrome Sync then separately enable automatic sending, Explicit matching-code device test and historical receipt status

### Community 78 - "Google configuration builder validates public key/ID and adds appData-only permissions to a separate copy"
Cohesion: 0.33
Nodes (5): Bounded appData listing, streaming download, account identification and typed transport errors, Management-only Chrome Identity connection with Drive permission-ID pinning and durable disconnect generation, Real Chrome Google connection and read-only app-folder inspection remain to be authorized by the user, Stable development extension identity and public Google OAuth client configuration, Google connection, app-folder inspection and disconnect controls state vault synchronization is unavailable

### Community 79 - "Ícone 16 pixels"
Cohesion: 0.33
Nodes (6): Copy edit and delete controls, Credential cards, Generator Tester Vault tabs, Unlocked vault screenshot, Settings navigation, Search add and lock controls

### Community 80 - "Ícone 32 pixels"
Cohesion: 0.33
Nodes (6): Cancel and Restore vault remain visible in a compact footer, Actual extension visible under a shared dimmed blurred backdrop, Short current-password and biometric preservation statement, Short checkpoint and Sync effects notice, Dark popup bounded whole-vault restore confirmation, Restore total and To remove counts only

### Community 81 - "Ícone 48 pixels"
Cohesion: 0.33
Nodes (6): Cancel and Restore vault remain visible in a compact footer, Actual extension visible under a shared dimmed blurred backdrop, Short current-password and biometric preservation statement, Short checkpoint and Sync effects notice, Light popup bounded whole-vault restore confirmation, Restore total and To remove counts only

### Community 82 - "Entrada do content script"
Cohesion: 0.33
Nodes (6): Cancel and Restore vault remain visible in a compact footer, Actual extension visible under a shared dimmed blurred backdrop, Short current-password and biometric preservation statement, Short checkpoint and Sync effects notice, Light tab bounded whole-vault restore confirmation, Restore total and To remove counts only

### Community 83 - "Documentação de Sync e dados"
Cohesion: 0.47
Nodes (4): legacyClipboard(), read(), serial, write()

### Community 84 - "masterPassword.test.js"
Cohesion: 0.40
Nodes (4): authorize(), call(), clientId, sender

### Community 85 - "Dark credential selector with many logins"
Cohesion: 0.40
Nodes (5): Dark credential selector with many logins, Previous and Next pagination showing 1–2 of 27 logins, Search logins field, Open SecurePass window action, Visible credentials manual-new-user and concurrent-user for http://127.0.0.1:43557

### Community 86 - "export dark 400 extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Website and Account identify the one entry to recover, Cancel and Recover entry remain in the footer, Actual extension visible under a shared dimmed blurred backdrop, Short one-entry and checkpoint/Sync effects, Dark popup bounded deleted-entry recovery confirmation

### Community 87 - "export error dark extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Website and Account identify the one entry to recover, Cancel and Recover entry remain in the footer, Actual extension visible under a shared dimmed blurred backdrop, Short one-entry and checkpoint/Sync effects, Light popup bounded deleted-entry recovery confirmation

### Community 88 - "export light 320 extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Website and Account identify the one entry to recover, Cancel and Recover entry remain in the footer, Actual extension visible under a shared dimmed blurred backdrop, Short one-entry and checkpoint/Sync effects, Light tab bounded deleted-entry recovery confirmation

### Community 89 - "export light 400 extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Lower-priority full-checkpoint area and Review full restore action, Checkpoint date and nonzero saved/deleted summary, Domain, account and Deleted entry row with Recover entry, Dark popup compact checkpoint comparison, Search website or username field

### Community 90 - "export management dark extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Lower-priority full-checkpoint area and Review full restore action, Checkpoint date and nonzero saved/deleted summary, Domain, account and Deleted entry row with Recover entry, Light tab compact checkpoint comparison, Search website or username field

### Community 91 - "restore dark 320 extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Single Cancel and Unlock row with compact spacing, Fingerprint-only shortcut beside password, Actual extension visible under a shared dimmed blurred backdrop, Compact Unlock vault heading, current-password field and reveal control, Dark popup bounded vault unlock with biometric alternative

### Community 92 - "restore dark 400 extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Inline Invalid master password or corrupted vault error with empty password field, Compact Unlock vault heading, current-password field and reveal control, Dark popup bounded vault unlock with inline error

### Community 93 - "restore error dark extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Inline Invalid master password or corrupted vault error with empty password field, Compact Unlock vault heading, current-password field and reveal control, Light popup bounded vault unlock with inline error

### Community 94 - "restore light 320 extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Inline Invalid master password or corrupted vault error with empty password field, Compact Unlock vault heading, current-password field and reveal control, Light tab bounded vault unlock with inline error

### Community 95 - "drive.js"
Cohesion: 0.70
Nodes (4): act(), attachDriveListeners(), messages, refreshGoogleView()

### Community 97 - "Dark anchored credential selector on narrow page"
Cohesion: 0.50
Nodes (4): Dark anchored credential selector on narrow page, Credential option fictional-user for http://127.0.0.1:43557, Open SecurePass window action, Key icon trigger beside masked password field

### Community 98 - "Checkpoint review design document"
Cohesion: 0.50
Nodes (4): One primary Review checkpoint button with secondary Export and Remove, Dated cards show sequence and aggregate entry differences without account examples, Backups & recovery sidebar selection and Recovery checkpoints heading remain visible, Dark management checkpoint cards with one Review action

### Community 99 - "Light management checkpoint cards with one Review action"
Cohesion: 0.50
Nodes (4): One primary Review checkpoint button with secondary Export and Remove, Dated cards show sequence and aggregate entry differences without account examples, Backups & recovery sidebar selection and Recovery checkpoints heading remain visible, Light management checkpoint cards with one Review action

### Community 100 - ".put"
Cohesion: 0.50
Nodes (4): Review checkpoint primary action with secondary Export and Remove, Dated checkpoint with sequence, recoverable-entry and later-entry counts, Backups header and Open in tab remain visible above checkpoint cards, Dark popup checkpoint card with one Review action

### Community 101 - "Operação de teste"
Cohesion: 0.50
Nodes (4): Review checkpoint primary action with secondary Export and Remove, Dated checkpoint with sequence, recoverable-entry and later-entry counts, Backups header and Open in tab remain visible above checkpoint cards, Light popup checkpoint card with one Review action

### Community 102 - "Checkpoint review design document"
Cohesion: 0.50
Nodes (4): Website and username identify the deleted entry to recover, Cancel and Recover entry without an account dropdown, Copy preserves other entries, current master password/biometrics and existing Sync mode, Short account-specific deleted-entry confirmation

### Community 103 - "Security settings area"
Cohesion: 0.50
Nodes (4): Set up biometric unlock card describing fingerprint, face, PIN or security key, Clear copied passwords after 30 seconds slider with best-effort copy-matching explanation, Security settings screenshot with password, clipboard, biometric controls and a toast, Visible toast states Legacy Sync mode updated and asks to unlock active vault again

### Community 104 - "sync-browser.mjs"
Cohesion: 0.50
Nodes (4): Password and fingerprint identity row, Fingerprint authentication affordance, Biometric identity confirmation capture, Dark compact identity dialog

### Community 105 - ".put"
Cohesion: 0.50
Nodes (4): Identity error and retry capture, Compact responsive error layout, Inline invalid password or corrupt vault error, Identity retry or cancellation controls

### Community 106 - "auth.js"
Cohesion: 0.50
Nodes (4): Password identity confirmation capture, Explicit identity confirmation actions, Current master-password identity form, Dimmed checkpoint review context

### Community 107 - "Local Settings Sync and Data Management work item"
Cohesion: 0.50
Nodes (4): Checkpoint date and nonzero saved/deleted summary, Domain, account and Deleted entry row with Recover entry, Light popup compact checkpoint comparison, Search website or username field

### Community 108 - "recoveryDesign-browser.mjs"
Cohesion: 0.50
Nodes (4): Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Compact Unlock vault heading, current-password field and reveal control, Light popup bounded vault unlock

### Community 109 - "Management inline checkpoint review in dark theme"
Cohesion: 0.50
Nodes (4): Settings navigation: Appearance selected, Security, Backups & recovery, Advanced, Reset preferences row says theme, generator and timeout defaults are restored and vault is kept, Dark appearance settings screenshot, Theme choices: System selected, Light, Dark

### Community 110 - "Device erasure confirmation modal"
Cohesion: 0.50
Nodes (4): Typed confirmation shows wrong with ERASE THIS DEVICE error, Device erasure confirmation modal, Visible local erasure scope text says remote copies remain, Verification dropdown shows erase without unlocking

### Community 111 - "Appearance popup with back navigation and Open in tab link"
Cohesion: 0.50
Nodes (4): Preferences save automatically notice, Appearance popup with back navigation and Open in tab link, Reset preferences copy lists theme, generator and timeout defaults and says vault is kept, System, Light, and Dark theme choices; System visibly selected

### Community 114 - "SecurePass light credential selector"
Cohesion: 0.67
Nodes (3): fictional-user credential option, Open SecurePass window action, SecurePass light credential selector

### Community 115 - "Vault management Advanced settings"
Cohesion: 0.67
Nodes (3): Vault management Advanced settings, Chrome Sync encrypted vault copies, Google Drive connection management

### Community 116 - "Narrow Advanced settings layout"
Cohesion: 0.67
Nodes (3): Narrow Advanced settings layout, Chrome Sync copy availability and manual restoration, Google Drive connected account status and actions

### Community 117 - "Popup inline checkpoint review in light theme"
Cohesion: 0.67
Nodes (3): Timestamped encrypted local-version backup cards with Restore and Export buttons, Legacy Sync mode update notice requesting active vault unlock, Backups and recovery settings screenshot

## Knowledge Gaps
- **424 isolated node(s):** `One primary Review checkpoint button with secondary Export and Remove`, `Dated cards show sequence and aggregate entry differences without account examples`, `Backups & recovery sidebar selection and Recovery checkpoints heading remain visible`, `Review checkpoint primary action with secondary Export and Remove`, `Dated checkpoint with sequence, recoverable-entry and later-entry counts` (+419 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 914 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **53 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Current architecture with implemented local and legacy increment` connect `Current architecture with implemented local and legacy increment` to `Serialized offscreen clipboard owner`, `Purpose-bound inline master-password authorization`, `Recovery checkpoints behavior, protection and verification`, `Original SD review with later local increment notice`, `SETTINGS_UX_IMPLEMENTATION.md`, `Quatro áreas das definições`, `Interface e revisão visual`, `popup.js`, `SETTINGS_UX_DESIGN.md`, `Internal common-base three-way merge issue and acceptance scope`, `Three content checkpoints, preserving recovery and source-specific exports`, `README de apresentação em português`, `Implemented extension-origin anchored account selector with two-account pagination and username search`, `Ferramentas de desenvolvimento`, `Confirmação de autofill`, `Ferramentas de desenvolvimento`?**
  _High betweenness centrality (0.306) - this node is a cross-community bridge._
- **What connects `One primary Review checkpoint button with secondary Export and Remove`, `Dated cards show sequence and aggregate entry differences without account examples`, `Backups & recovery sidebar selection and Recovery checkpoints heading remain visible` to the rest of the system?**
  _424 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cryptoVault.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06470588235294118 - nodes in this community are weakly interconnected._
- **Why does `Checkpoint recovery with inline comparison and fresh scoped confirmation` connect `Recovery checkpoints behavior, protection and verification` to `cryptoVault.js`, `Current architecture with implemented local and legacy increment`?**
  _High betweenness centrality (0.175) - this node is a cross-community bridge._
- **Should `signedProtocol.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06234567901234568 - nodes in this community are weakly interconnected._
- **Why does `Vault unlock controller with bounded inline retry and WebAuthn cancellation` connect `Quatro áreas das definições` to `Current architecture with implemented local and legacy increment`, `Modelo de segurança`?**
  _High betweenness centrality (0.104) - this node is a cross-community bridge._
- **Should `Interface e revisão visual` be split into smaller, more focused modules?**
  _Cohesion score 0.031235431235431235 - nodes in this community are weakly interconnected._
## Documentation reconciliation audit — 2026-11-07
Twelve documentation files reconciled with the delivered code and dated acceptance evidence. Validated complete staged extraction recovered after extraction-agent interruption; existing entity IDs preserved with dedup=False. Guarded export passed without forcing node loss. No runtime tests were repeated for this documentation-only revision.
