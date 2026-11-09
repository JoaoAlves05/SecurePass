# Graph Report - SecurePass  (2026-11-09)

## Corpus Check
- 323 files · ~170,564 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: .css 6, (none) 3)

## Summary
- 2408 nodes · 5848 edges · 195 communities (139 shown, 56 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 120 edges (avg confidence: 0.86)
- Token cost: host semantic usage unavailable; no separate semantic API used.

## Graph Freshness
- Built from commit: `2e1d7936`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- client.js
- vaultHandlers.js
- Interface e revisão visual
- Recovery checkpoints behavior, protection and verification
- Original SD review with later local increment notice
- biometric/service.js
- chrome.js
- requests.js
- popup.js
- Contextual on-page key
- Current architecture with implemented local and legacy increment
- checkpointReview.js
- Documentação de Sync e dados
- Checkpoint review design document
- session.js
- popup.js
- Inline master-password flow and independent management proportions
- utilHandlers.js
- withVaultOperation
- README de apresentação em português
- Autofill na página
- scripts
- logger.js
- Contextual on-page key contract
- checkpointReview.js
- biometric/service.js
- Modelo de segurança
- Popup HTML semantic surfaces
- googleConnection.js
- signedProtocol.js
- session.js
- recoveryArchive.js
- Implementation checklist: partial implementation, release not accepted
- Checkpoint review interaction
- SETTINGS_UX_IMPLEMENTATION.md
- accountPrompts-browser.mjs
- Drive-copy review scoped design record
- modules/driveReview.js
- Guided Chrome Sync setup and receipt evidence contract
- selector.js
- Security model and open risks
- SETTINGS_UX_DESIGN.md
- vault/driveReview.js
- Historical six-category frontend review
- vaultUnlock.js
- Internal authenticated Drive-history retrieval contract and evidence
- storage.js
- IMPLEMENTATION_CHECKLIST.md
- threeWayMerge.js
- popup.js
- Management inline checkpoint review in dark theme
- Implementation tracking with consolidated current and historical status
- biometric.test.js
- ref_node_assert
- Internal common-base three-way merge issue and acceptance scope
- Purpose-bound inline master-password authorization
- Ferramentas de desenvolvimento
- Confirmação de autofill
- Settings category links and labelled navigation
- syncSetup-browser.mjs
- driveRuntime.js
- Ferramentas de desenvolvimento
- Popup HTML semantic surfaces
- Encrypted vault-state v1 payload and local migration contract
- drive.js
- Checklist de implementação e aceitação
- Account suggestions, inline tools and trusted-window confirmation contract
- Ferramentas de desenvolvimento
- recoveryDesign-browser.mjs
- backupCrypto.js
- Recovery-surface presentation and unlock-controller refinement
- Compact recovery presentation and consistent fingerprint entry points
- modules/settings.js
- Guided Chrome Sync setup and device verification
- Saved version changed after review
- Popup HTML semantic surfaces
- Dark narrow saved-version export dialog: saved version 1 of 3
- Bounded recovery archive reader contract
- Google configuration builder validates public key/ID and adds appData-only permissions to a separate copy
- Ícone 16 pixels
- Ícone 32 pixels
- Ícone 48 pixels
- Entrada do content script
- Documentação de Sync e dados
- Light narrow saved-version export dialog
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
- Dark tab saved-version export dialog
- crypto.js
- Dark anchored credential selector on narrow page
- Saved-version batch export design record
- Light tab saved-version export dialog
- .put
- Operação de teste
- browser.mjs
- Security settings area
- sync-browser.mjs
- .put
- auth.js
- Light management checkpoint cards with one Review action
- Separate whole-vault restore confirmation from inline review
- Management inline checkpoint review in dark theme
- Device erasure confirmation modal
- Appearance popup with back navigation and Open in tab link
- Popup inline checkpoint review in dark theme
- VAULT_PAYLOAD.md
- SecurePass light credential selector
- Vault management Advanced settings
- Narrow Advanced settings layout
- Popup inline checkpoint review in light theme
- Proposed explicit discovery, stable vault/account/device identities and authenticated second-device enrollment
- Light popup compact checkpoint comparison
- Light popup bounded vault unlock
- driveReview-browser.mjs
- check.mjs
- Dark management checkpoint cards with one Review action
- cryptoVault.js
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
- Serialized offscreen clipboard owner
- Verified administrative delivery contract
- Narrow dark registration generator inside the viewport
- Light contextual registration generator with primary Generate and fill
- Light review of a new captured login
- Compact popup save suggestion with origin, username and two actions
- Dark biometric alternative beside the master-password input
- Dark review of a password update
- Durable device administration contract
- Guided Chrome Sync setup, manual discovery and device test
- SETTINGS_NAVIGATION.md
- driveTransport.js
- ref_node_fs
- Popup inline checkpoint review in light theme
- messages.js
- settings-browser.mjs
- createDriveReviewService
- setStorage
- accountPrompts.test.js
- Implemented extension-origin anchored account selector with two-account pagination and username search
- Popup inline checkpoint review in dark theme
- Dark management checkpoint list
- Light management checkpoint list
- Dark popup checkpoint cards
- Light popup checkpoint cards
- Individual entry recovery review dialog
- Whole-vault restore review dialog
- Short account-specific deleted-entry confirmation
- compareSyncContents

## God Nodes (most connected - your core abstractions)
1. `Version 3 settings Sync data and compact login plan` - 103 edges
2. `getStorage()` - 83 edges
3. `Validation and release checklist` - 68 edges
4. `Current architecture with implemented local and legacy increment` - 65 edges
5. `withVaultOperation()` - 62 edges
6. `removeStorage()` - 54 edges
7. `setStorage()` - 51 edges
8. `showToast()` - 50 edges
9. `Historical review of commit 5aed51c` - 44 edges
10. `Original SD review with later local increment notice` - 42 edges

## Surprising Connections (you probably didn't know these)
- `Key protection and trusted checkpoint implementation` --references--> `prepareSignedPublication()`  [INFERRED]
  docs/SIGNED_PROTOCOL.md → src/sync/signedPublication.js
- `Commit de merge autenticado — SC22–SC25` --references--> `resolveThreeWayPayload()`  [INFERRED]
  docs/issues/PERSISTED_MERGE.md → src/vault/threeWayMerge.js
- `Cifrado interno do cofre — payload versionado, 08/11/2026` --references--> `encryptEntries()`  [INFERRED]
  docs/VAULT_PAYLOAD.md → src/vault/crypto.js
- `Checkpoint summary and detail separation verified` --conceptually_related_to--> `renderCheckpoints()`  [INFERRED]
  docs/VALIDATION.md → popup/modules/checkpoints.js
- `Closed-shadow tools follow theme and reposition with field and viewport; removal releases listeners` --references--> `positionPanel()`  [EXTRACTED]
  docs/ACCOUNT_PROMPTS.md → content/modules/ui.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Protected metadata inspection to guarded local signed merge save** — architecture_protected_drive_review, architecture_review_capability_lifecycle, architecture_review_cancellation_commit_guard, architecture_review_metadata_ui, architecture_authenticated_merge_commit [EXTRACTED 1.00]
- **Bound immutable administrative bytes through verified receipt before content** — docs_administrative_delivery_bounded_canonical_packets, docs_administrative_delivery_durable_verified_receipts, docs_administrative_delivery_exact_restart_reuse, docs_administrative_delivery_stale_content_rebase [EXTRACTED 1.00]
- **Protected authentication and minimal document-bound anchored account selection** — docs_anchored_selector_account_selection, docs_anchored_selector_request_binding, docs_anchored_selector_visual_attestation, docs_anchored_selector_native_fallback, selector_selector_account_surface [EXTRACTED 1.00]
- **Whole-checkpoint restore authorization sequence** — docs_checkpoint_review_recent_authentication, docs_checkpoint_review_confirm_identity, docs_checkpoint_review_fresh_scoped_token, docs_checkpoint_review_secondary_restore [EXTRACTED 1.00]
- **Internal signed local mutation through atomic outbox to verified immutable publication** — docs_drive_transport_atomic_signed_commit, docs_signed_protocol_revision_wrapper, docs_drive_transport_durable_coordinator, docs_drive_transport_immutable_publication, docs_drive_transport_resumable_upload [EXTRACTED 1.00]
- **Selected signed ancestry and all-copy integrity within bounds guarded by final inventory/context checks** — docs_issues_authenticated_drive_history_selected_ancestry, docs_issues_authenticated_drive_history_duplicate_integrity, docs_issues_authenticated_drive_history_resource_limits, docs_issues_authenticated_drive_history_context_recheck [EXTRACTED 1.00]
- **Fixed authenticated context and selected history through atomic signed merge commit** — docs_issues_persisted_merge_context_authority, docs_issues_persisted_merge_history_preservation, docs_issues_persisted_merge_selected_parents, docs_issues_persisted_merge_atomic_retry [EXTRACTED 1.00]
- **Signed complete ancestry and plaintext identities guarded before causal merge review** — docs_issues_three_way_merge_authenticated_ancestor, docs_issues_three_way_merge_history_limits, docs_issues_three_way_merge_snapshot_identity, docs_issues_three_way_merge_live_context [EXTRACTED 1.00]
- **Authenticated deletion and explicit restoration preserved across encrypted payload lifecycle** — docs_vault_payload_tombstone_identity, docs_vault_payload_explicit_restoration, docs_vault_payload_rekey_recovery, docs_vault_payload_history_capacity [EXTRACTED 1.00]

## Communities (195 total, 56 thin omitted)

### Community 0 - "client.js"
Cohesion: 0.32
Nodes (12): abortable(), assert(), authenticateBiometric(), authorizeMasterPassword(), cancelMasterPassword(), clientId, enrollBiometric(), request() (+4 more)

### Community 1 - "vaultHandlers.js"
Cohesion: 0.16
Nodes (32): DECODER, decryptBackupPayload(), deriveBackupKey(), ENCODER, encryptBackupPayload(), isEncryptedBackupEnvelope(), recoveryStatus(), vaultHandlers (+24 more)

### Community 2 - "Interface e revisão visual"
Cohesion: 0.03
Nodes (39): Implemented anchored selector with two-account pagination/search and protected unlock/native fallback, Atomic vault-checkpoint-Drive outbox commit with internal automatic signing; production remains gated, Atomic vault-checkpoint-Drive outbox commit with internal automatic signing; production remains gated, Atomic vault-checkpoint-Drive outbox commit with internal automatic signing; production remains gated, Atomic vault-checkpoint-Drive outbox commit with internal automatic signing; production remains gated, Internal P-256 administrative and encrypted-v2 revision prototype with pinned root/checkpoint; production review remains pending, Version 3 settings Sync data and compact login plan, Guided individual-file export delivered within incomplete plan (+31 more)

### Community 3 - "Recovery checkpoints behavior, protection and verification"
Cohesion: 0.12
Nodes (18): Checkpoint recovery with inline comparison and fresh scoped confirmation, Inline checkpoint review module and displayed-comparison identity, Archived Sync copies stay separate and exports are source-specific, Unlocked checkpoint counts, differences and affected-account examples, Remove one checkpoint or verify current password to clear local history, Recovery checkpoints behavior, protection and verification, Per-entry recovery through inline review and explicit confirmation, Existing-vault external and selected-remote restores preserve active authentication (+10 more)

### Community 5 - "biometric/service.js"
Cohesion: 0.08
Nodes (40): attachGeneratorListeners(), avoidSimilar, copyGeneratedBtn, generateButton, generatedResult, generatorStatus, handleGenerate(), includeLower (+32 more)

### Community 6 - "chrome.js"
Cohesion: 0.14
Nodes (9): fake-indexeddb, rootRequest, alarms, areas, event(), failWhen(), fault, installChrome() (+1 more)

### Community 7 - "requests.js"
Cohesion: 0.13
Nodes (47): handlers, ready, clearCandidates(), dismissCandidate(), inlineCandidate(), listCandidates, proposeCandidate(), reviewCandidate() (+39 more)

### Community 9 - "Contextual on-page key"
Cohesion: 0.11
Nodes (15): Account suggestions and inline login tools, Integrity and capability boundaries, Surfaces and interaction, Validation, Why a save suggestion appears, Capacidades e vinculação, Evidência, Manifesto e limites (+7 more)

### Community 10 - "Current architecture with implemented local and legacy increment"
Cohesion: 0.05
Nodes (8): Bounded legacy recovery archive reader, Current architecture with implemented local and legacy increment, Implemented read-only Google management and gated internal signed Drive integration, Guided source and digest bound recovery export, Drive production lifecycle, recovery, convergence, migration and release acceptance remain incomplete, Implemented revision-checked settings, bound backup previews and local checkpoint recovery, Histórico e restauro local, Three retained local checkpoints share atomic master-password rotation

### Community 11 - "checkpointReview.js"
Cohesion: 0.14
Nodes (41): Single checkpoint review entry, Cancel delayed backup previews on lock — SC44, Reproduced and corrected — 2026-11-08, Checkpoint summary and detail separation verified, attachCheckpointListeners(), date(), deleteHistory(), handleCheckpointAction() (+33 more)

### Community 12 - "Documentação de Sync e dados"
Cohesion: 0.11
Nodes (38): clearSecrets(), complete(), expired(), refresh(), requestId, run(), saveTargetChanged(), send() (+30 more)

### Community 13 - "Checkpoint review design document"
Cohesion: 0.13
Nodes (15): Inline checkpoint comparison, Confirm identity flow, Individual entry recovery, Checkpoint review design document, Authentication expiry during confirmation, Successful recovery refreshes review or returns to checkpoint list, Recovery review cleanup and navigation, Website/username search, matching entries and fifty-row pagination (+7 more)

### Community 14 - "session.js"
Cohesion: 0.07
Nodes (35): Older checkpoint protection migration, False source-level production-review predicate; no public enrollment, adoption or Drive write activation, Journey scope and unconfigured OAuth, Accessibility and website compatibility acceptance, Automated regression coverage, Backup dialog refinement evidence, 280-test and 156-module backup preview lock evidence, Bounded recovery archive evidence (+27 more)

### Community 15 - "popup.js"
Cohesion: 0.10
Nodes (48): attachBiometricListeners(), syncBiometricView(), attachCandidateListeners(), refreshCandidates(), syncGeneratorControls(), attachMasterPasswordListeners(), sendMessage(), attachSettingsNavigation() (+40 more)

### Community 16 - "Inline master-password flow and independent management proportions"
Cohesion: 0.06
Nodes (34): Approved inline identity/password/success and management proportions, Pre-save biometric revocation notice and optional setup again, Clear secrets and revoke the exact grant on leaving the inline flow, Inline master-password flow and independent management proportions, Two-minute single-use revision-bound password-change grant, Physical authenticator and actual toolbar sizing remain manual acceptance, Fresh identity confirmation replaces preliminary unlock and modal, Tab stylesheet separates desktop layout from compact popup presentation (+26 more)

### Community 17 - "utilHandlers.js"
Cohesion: 0.18
Nodes (21): copyInBackground(), ensureOffscreen(), cacheWrites, checkPassword(), clearHibpCache(), hibpCacheStatus(), inFlight, range() (+13 more)

### Community 18 - "withVaultOperation"
Cohesion: 0.13
Nodes (55): changeMasterPassword(), changeMasterPasswordAuthorized(), clearVaultEntries(), initializeVault(), restoreRecovery(), unlockVault(), vaultStatus(), prepareMutationPublication() (+47 more)

### Community 19 - "README de apresentação em português"
Cohesion: 0.07
Nodes (22): Local backup safety and repeatable recovery cleanup, Backups and Advanced functional review, Preenchimento confirmado por origem e documento, Backups cifrados com pré-visualização de importação, Desbloqueio WebAuthn com PRF, Limites de capacidade e importação, Desenvolvimento e verificações, Chrome122 e âmbito de compatibilidade (+14 more)

### Community 20 - "Autofill na página"
Cohesion: 0.08
Nodes (23): action, default_popup, default_title, background, service_worker, type, content_scripts, content_security_policy (+15 more)

### Community 21 - "scripts"
Cohesion: 0.06
Nodes (32): devDependencies, fake-indexeddb@^6.2.4, playwright@1.56.1, name, private, scripts, check, configure:google (+24 more)

### Community 22 - "logger.js"
Cohesion: 0.22
Nodes (11): LOG_ENABLED, buffer, format(), isArrayBufferLike(), isPrimitive(), isSensitiveString(), logger, redactValue() (+3 more)

### Community 23 - "Contextual on-page key contract"
Cohesion: 0.09
Nodes (23): Direct selector and original-field tool handoff, Native manual login creation form, Native secondary website tools disclosure, Source field and reserved native-tab request binding, Direct key opens up to two anchored account suggestions, Contextual on-page key contract, Executed contextual-key evidence and remaining manual acceptance, Pointer-transparent feedback preserves the next website action (+15 more)

### Community 24 - "checkpointReview.js"
Cohesion: 0.31
Nodes (20): account(), attachCheckpointReviewListeners(), changedFields(), checkFreshness(), clientId, closeReview(), date(), entryCount() (+12 more)

### Community 25 - "biometric/service.js"
Cohesion: 0.16
Nodes (27): begin(), biometricStatus(), cancelAuthentication(), consume(), context(), finishAuthentication(), finishRegistration(), origin() (+19 more)

### Community 26 - "Modelo de segurança"
Cohesion: 0.29
Nodes (16): Inline unlock errors and retry without dismissing the form, resolveUnlockSetup(), setUnlockResolver(), attachUIListeners(), backFromSettings(), closeModal(), closeSettingsPanel(), manageFocus() (+8 more)

### Community 27 - "Popup HTML semantic surfaces"
Cohesion: 0.14
Nodes (20): Version and repository footer, System light and dark theme controls, Auto-lock inactivity preference, Consistent fingerprint symbol for biometric entry points, Ownership-aware clipboard timeout explanation, Popup HTML semantic surfaces, Labelled credential editor dialog, Appearance settings area (+12 more)

### Community 28 - "googleConnection.js"
Cohesion: 0.26
Nodes (15): driveHandlers, createDriveReader(), assertGeneration(), assertGoogleBinding(), authToken(), connectGoogle(), disconnectGoogle(), getBoundGoogleToken() (+7 more)

### Community 29 - "signedProtocol.js"
Cohesion: 0.07
Nodes (77): Durable device administration, 1. Escolher a identidade da extensão, 2. Criar/configurar o projeto Google, 3. Gerar uma cópia de desenvolvimento, Configurar Google Cloud para o SecurePass, Dados necessários para continuar a integração real, bufferToBase64(), administrationStatus() (+69 more)

### Community 30 - "session.js"
Cohesion: 0.26
Nodes (12): readSyncOutbox(), retryPendingSync(), activate(), assertGeneration(), current(), generation(), onLock(), reconfigureTimeout() (+4 more)

### Community 31 - "recoveryArchive.js"
Cohesion: 0.08
Nodes (29): Cancellation, errors and accessibility, Colors, Components, Do's and Don'ts, Elevation & Depth, Evidence and limits, Interaction and completion, Layout (+21 more)

### Community 32 - "Implementation checklist: partial implementation, release not accepted"
Cohesion: 0.11
Nodes (16): Implemented anchored selector with two-account pagination/search and protected unlock/native fallback, SC01/SC02/SC40 and AF03/AF09 closed within explicit bounds; 55 SC and 10 AF remain open, Preview-lock correction checked; full SC44 remains open, Consolidated delivered increments and remaining product/release gates, 2026-11-06 delivered OAuth inspection, signing, gated runtime, resumable uploads and anchored search, Implementation checklist: partial implementation, release not accepted, Guided batch delivered and SC40 scoped closure, Local tombstones and restore provenance checked; merged history persistence and conditional review delivered (+8 more)

### Community 33 - "Checkpoint review interaction"
Cohesion: 0.11
Nodes (14): Approved interaction, Captures, Checkpoint review interaction, State and privacy, Checkpoint review scenario coverage and remaining acceptance, Behavior and presentation, Encryption and rotation, Evidence (+6 more)

### Community 34 - "SETTINGS_UX_IMPLEMENTATION.md"
Cohesion: 0.14
Nodes (7): Current UX delivery separates read-only account access, internal publication, planner and anchored login, Delivered behavior, Executed checks, Remaining release gates, Review artifacts, Scenario coverage boundary, Settings UX implementation and evidence

### Community 35 - "accountPrompts-browser.mjs"
Cohesion: 0.18
Nodes (17): Historical disposable account-prompt Node, module and Chromium evidence, Dedicated disposable account-prompt Chromium command, capture(), errors, nextPage(), openFill(), openSaveEntered(), openTools() (+9 more)

### Community 36 - "Drive-copy review scoped design record"
Cohesion: 0.05
Nodes (42): Drive-copy review scoped design record, Explicit metadata-only whole-version review workflow, Existing Operate visual and responsive contract, Eight-row search with preserved explicit decisions, Local queued save and transient token privacy, Protected management review over read-only transport, Protected Drive review delivered with conditional enrollment, Protected Drive merge review issue and delivered contract (+34 more)

### Community 37 - "modules/driveReview.js"
Cohesion: 0.35
Nodes (14): attachDriveReviewListeners(), bulkCandidates(), cancel(), choices, choiceStatus(), clientId, controls(), matchingConflicts() (+6 more)

### Community 38 - "Guided Chrome Sync setup and receipt evidence contract"
Cohesion: 0.12
Nodes (17): Guided Chrome Sync setup, bounded capacity and non-authorizing device diagnostic, Guided setup Node/security and Chromium evidence with emulated transport boundaries, Guided setup supersedes parts of historical capacity and selected-restore findings, Conservative two-complete-version capacity and local-only failure handling, Dark guided setup refusing insufficient two-version capacity, Enable is unavailable when the local vault cannot coexist with a subsequent complete copy, Narrow dark device-test receipt with preserved local cache controls, Receipt confirms the tested encrypted version while local maintenance remains available (+9 more)

### Community 39 - "selector.js"
Cohesion: 0.22
Nodes (16): Implemented anchored selector with two-account pagination/search and protected unlock/native fallback, Disposable anchored and ZIP journeys plus internal Drive integration evidence; full release remains open, Current login key UI has two anchored suggestions and native complete-list fallback; registration/change-password generator remains available., Delivered anchored search/pagination with protected unlock and native fallback, Selector is extension-origin with restricted message capabilities and source/document binding; iframe isolation is not independent Chrome permissions or native clickjacking assurance., Implemented anchored selector with two-account pagination/search and protected unlock/native fallback, Implemented anchored selector with two-account pagination/search and protected unlock/native fallback, clear() (+8 more)

### Community 41 - "SETTINGS_UX_DESIGN.md"
Cohesion: 0.17
Nodes (7): Delivery evidence, Information architecture, Interaction rules, Journey state machine, SC01–SC58 traceability, Screen sketches, Settings UX — journeys, screens and acceptance map

### Community 42 - "vault/driveReview.js"
Cohesion: 0.14
Nodes (22): authenticatedPlans, checkCurrent(), commonBase(), visit(), encoder, MAX_HISTORY_BYTES, MAX_HISTORY_RECORDS, planAuthenticatedMerge() (+14 more)

### Community 43 - "Historical six-category frontend review"
Cohesion: 0.20
Nodes (7): Historical accessible themes ranges and saving feedback, Historical six-category navigation, Historical six-category frontend review, Historical settings disclosures unlock and focus corrections, Historical independent Impeccable review evidence, Historical hTML category ownership and dedicated settings styles, Historical frontend regression evidence and manual limits

### Community 44 - "vaultUnlock.js"
Cohesion: 0.13
Nodes (14): Advanced control inventory, Scoped authentication and local erasure, Backups control inventory, Cache usage without duration control, Unified local and archived earlier versions, Executed validation, Four-area Settings revision, Historical General inventory (+6 more)

### Community 45 - "Internal authenticated Drive-history retrieval contract and evidence"
Cohesion: 0.11
Nodes (9): Management-owned verified Drive-copy review, Metadata-only paginated conflict decisions, Bounded selected signed-history retrieval with inventory reenumeration, 08/11 internal Drive ancestry retrieval delivered; product integration open, Internal authenticated Drive-history retrieval contract and evidence, Shared 256-packet and 32-MiB bounds count duplicate and local packets, Internal authenticated ancestor and Drive history delivered without activation, 244-test continuation with actual bounded reader and injected provider (+1 more)

### Community 46 - "storage.js"
Cohesion: 0.11
Nodes (32): ALARM_NAME, BIOMETRIC_SESSION_PASSPHRASE_KEY, CHUNK_SIZE, CLIPBOARD_ALARM_NAME, DB_STORE_NAME, DB_VERSION, META_KEY, PRF_EVAL_LABEL (+24 more)

### Community 47 - "IMPLEMENTATION_CHECKLIST.md"
Cohesion: 0.08
Nodes (15): Verified administrative delivery, Drive transport implementation status, Verified administrative delivery — SC26, SC28, SC29, SC33, SC47, Recolha de história Drive autenticada — SC22–SC25, Durable device administration — SC03, SC16, SC26, SC47, Integração Drive e conclusão do plano — 06/11/2026, Commit de merge autenticado — SC22–SC25, Guided recovery export batches — SC40, SD07 (+7 more)

### Community 48 - "threeWayMerge.js"
Cohesion: 0.20
Nodes (20): authenticatedMergeContext(), applyAuthenticatedMerge(), assertThreeWayMergeCurrent(), canonical(), checkCurrent(), compare(), content(), describeThreeWayMerge() (+12 more)

### Community 49 - "popup.js"
Cohesion: 0.15
Nodes (14): Auto-lock vault slider, Set up biometric unlock action, Change master password action, Clear copied passwords slider, GitHub footer link, Settings category navigation: Appearance, Security, Backups & recovery, Advanced, Settings footer with version, GitHub link, and preference save status, Settings popup home screenshot (+6 more)

### Community 50 - "Management inline checkpoint review in dark theme"
Cohesion: 0.29
Nodes (7): Changed account labels Different fields: password and offers Restore details, Back to checkpoints remains part of the in-section view, Show matching entries checkbox includes matching count, Account rows offer a specific Recover entry action, Management inline checkpoint review in dark theme, Website or username search within the review, Review title/date and saved/deleted/different/newer counts

### Community 52 - "biometric.test.js"
Cohesion: 0.42
Nodes (7): assertion(), b64(), client(), der(), registration(), request(), sender

### Community 53 - "ref_node_assert"
Cohesion: 0.13
Nodes (5): packet, binding, packet, content, expected

### Community 54 - "Internal common-base three-way merge issue and acceptance scope"
Cohesion: 0.11
Nodes (15): Separate internal three-way planner with opaque revision-bound reviews, 08/11 internal authenticated ancestor delivery checked; product integration open, Full SC merge acceptance remains open after internal planner delivery, Three-way planner checklist records delivered internal planning and guarded review, Current integrated code delivery with separate pending protocol and real-world acceptance, Global completion issue remains open for administrative lifecycle, recovery, convergence, migration and independent gates, Drive integration issue: resumable uploads, automatic signing, gated worker and read-only OAuth management, Unique nearest ancestor from complete authenticated history (+7 more)

### Community 55 - "Purpose-bound inline master-password authorization"
Cohesion: 0.17
Nodes (7): Independent management-tab layout with shared trusted pathname, Purpose-bound inline master-password authorization, Public OAuth client received; real Google authorization, protocol review, physical hardware and lifecycle acceptance pending, Internal domain-separated ECDSA P-256 administrative authorization chains, Internal prototype lacks reviewed nonce policy, new format, enrollment, recovery, concurrent rotation and migration, Canonical signed encrypted-v2 revision wrapper bound to active writer, vault, epoch and exact authorization digest, Proposed bounded backup/archive parsing, stable snapshot selection and safe checkpoint-based retention

### Community 56 - "Ferramentas de desenvolvimento"
Cohesion: 0.18
Nodes (9): Backups & recovery — export and restore dialogs, Delivered interaction, Executed checks, Visual evidence, Limites e aceitação restante, Problemas reproduzidos e corrigidos, Revisão funcional — Backups & recovery e Advanced, Validação (+1 more)

### Community 57 - "Confirmação de autofill"
Cohesion: 0.18
Nodes (10): Local Settings Sync and Data Management work item, Local workflow acceptance requirements, Historical approved four-area revision on main, Historical frontend cleanup follow-up, Historical approved hierarchical implementation scope, Authorization contract, Delivered behavior, Inline master-password change and management layout (+2 more)

### Community 58 - "Settings category links and labelled navigation"
Cohesion: 0.20
Nodes (11): Vault creation/unlock, biometric setup and inline fresh-identity master-password change forms, Backups, checkpoint cards and inline review settings area, Recovery checkpoints heading, Clear history and local/archive inventory, Compact in-section checkpoint comparison, Encrypted backup import and export controls, Cache clear, vault clear, local wipe and exclusive native operation dialog surfaces, Settings category links and labelled navigation, Checkpoint cards and inline review with separate archived copies (+3 more)

### Community 59 - "syncSetup-browser.mjs"
Cohesion: 0.12
Nodes (6): test:sync-setup-browser runs the disposable guided Chrome Sync scenario, contexts, directories, errors, output, root

### Community 60 - "driveRuntime.js"
Cohesion: 0.21
Nodes (13): verifyAdministrationPublication(), createAdministrationRuntime(), run(), loadAuthorization(), createDriveRuntime(), run(), driveRuntime, createDriveTransport() (+5 more)

### Community 62 - "Popup HTML semantic surfaces"
Cohesion: 0.22
Nodes (10): Cancel, Unlock and icon-only fingerprint share one action row, Dark master-password identity with inline biometric method, Dark main vault unlock with inline biometric method, Shared password and biometric method row, Accessible fingerprint-only shortcut beside password, Inline identity form with biometric shortcut beside current password, New-password confirmation with biometric revocation warning, Inline master-password identity, new-password and success forms (+2 more)

### Community 63 - "Encrypted vault-state v1 payload and local migration contract"
Cohesion: 0.11
Nodes (8): Authenticated merge persistence delivered with conditional protected review routes, Authenticated merge commit scope and acceptance SC22-SC25, Persistent encrypted tombstones implementation scope SC22-SC25, 257-test atomic merge persistence and real Chromium rollback retry evidence, 251-test local tombstone persistence and signed-packet Chromium evidence, Encrypted vault-state v1 payload and local migration contract, Rotation and checkpoint re-protection preserve causal metadata, Deletion tombstones bind entry ID to deleting revision

### Community 64 - "drive.js"
Cohesion: 0.70
Nodes (4): act(), attachDriveListeners(), messages, refreshGoogleView()

### Community 65 - "Checklist de implementação e aceitação"
Cohesion: 0.29
Nodes (7): Cenários de aceitação, Checklist de implementação e aceitação, Dependências externas e condições de release, Entregáveis por secção, Próximos blocos de implementação, Revisão original e fecho de problemas, Trabalho desta execução

### Community 66 - "Account suggestions, inline tools and trusted-window confirmation contract"
Cohesion: 0.13
Nodes (15): Review cancellation retains a proposal; dismissal/save/expiry/lock remove it, Restricted five-minute proposals, eight-item bound, metadata-only listing and deduplication, Compact dark master-password confirmation, Master password stays on the extension-owned page with retry and cancellation, Same-origin explicit save/update binds destination revision and preserves notes and identity, Fill and save consume authorization once under the operation lock, Inline review and dismissal validate origin, tab and document, Closed-shadow tools follow theme and reposition with field and viewport; removal releases listeners (+7 more)

### Community 67 - "Ferramentas de desenvolvimento"
Cohesion: 0.22
Nodes (8): Explicit account selection section, PRF alternative beside the master password field, Cancel confirmation button, Compact extension-owned login confirmation with shared popup tokens, Editable username and explicit selection before an update, with expired/already-saved states, Explicit new-login save or selected password update, auth.js module bootstrap, Master password unlock form

### Community 68 - "recoveryDesign-browser.mjs"
Cohesion: 0.17
Nodes (6): Recovery-surface checks recorded in validation evidence, Dedicated recovery UI browser command, test:recovery-ui-browser, captures, errors, root

### Community 69 - "backupCrypto.js"
Cohesion: 0.10
Nodes (9): cancel(), captures, errors, idle(), root, captures, errors, root (+1 more)

### Community 70 - "Recovery-surface presentation and unlock-controller refinement"
Cohesion: 0.25
Nodes (8): Vault unlock controller with bounded inline retry and WebAuthn cancellation, Compact comparison header and account rows, Recovery-surface presentation and unlock-controller refinement, Smaller cards and a shared contextual dimmed backdrop, Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Compact Unlock vault heading, current-password field and reveal control, Light tab bounded vault unlock

### Community 71 - "Compact recovery presentation and consistent fingerprint entry points"
Cohesion: 0.25
Nodes (8): 85 modules and four browser suites; Node evidence remains historical, Compact recovery presentation and consistent fingerprint entry points, Same dimmed and 2px-blurred extension context under unlock and recovery, Full restore confirms only restored total and removals, Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Compact Unlock vault heading, current-password field and reveal control, Dark popup bounded vault unlock

### Community 72 - "modules/settings.js"
Cohesion: 0.35
Nodes (10): attachSettingsListeners(), initialiseSettings(), saving, scheduleSettingsSave(), setSaveStatus(), syncSettingsView(), updateRangeLabel(), applyTheme() (+2 more)

### Community 73 - "Guided Chrome Sync setup and device verification"
Cohesion: 0.29
Nodes (6): Device test, Evidence shown to the user, Guided Chrome Sync setup and device verification, Recovery and capacity corrections, User journey, Validation and manual acceptance

### Community 74 - "Saved version changed after review"
Cohesion: 0.50
Nodes (4): Saved version 1 of 3, Saved version changed after review, Cancel and Download version controls, Reviewed saved version identity

### Community 75 - "Popup HTML semantic surfaces"
Cohesion: 0.29
Nodes (6): Readable cache row layout correction, Reproduced cache status layout defect, Historical navigation and dialog recommendations, Recovery discovery and terminology concerns, Visual critique and accessibility limits, Breach-check cache management

### Community 76 - "Dark narrow saved-version export dialog: saved version 1 of 3"
Cohesion: 0.50
Nodes (4): Cancel action stops the batch, Download version action: 0 download requests sent; download this version next, Dark narrow saved-version export dialog: saved version 1 of 3, Version metadata: This device; 949a754c; 11/8/2026, 7:47:16 PM; 1 KiB

### Community 77 - "Bounded recovery archive reader contract"
Cohesion: 0.15
Nodes (8): Recovery archive increment delivered, Bounded archive scanning requirements, Envelope isolation and restore requirements, Large recovery archive issue SD07 SC37, Archive reproducibility and evidence, Archive resource limits, Bounded recovery archive reader contract, Separate guided per-file export contract

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

### Community 84 - "Light narrow saved-version export dialog"
Cohesion: 0.50
Nodes (4): Cancel action stops the batch, Download version action for saved version 1 of 3; 0 download requests sent, Light narrow saved-version export dialog, Metadata: This device; version 949a754c; saved 11/8/2026, 7:47:16 PM; file size 1 KiB

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

### Community 95 - "Dark tab saved-version export dialog"
Cohesion: 0.50
Nodes (4): Per-version confirmation: Download version or Cancel to stop the batch, Dark tab saved-version export dialog, Saved version 1 of 3; 0 download requests sent, This device: version 949a754c, saved 11/8/2026 7:47:16 PM, file size 1 KiB

### Community 96 - "crypto.js"
Cohesion: 0.22
Nodes (25): rotateMasterPassword(), validateVaultEntries(), aesKey(), createRecord(), dataContext(), decoder, decryptPayloadWithKey(), encodeKey() (+17 more)

### Community 97 - "Dark anchored credential selector on narrow page"
Cohesion: 0.50
Nodes (4): Dark anchored credential selector on narrow page, Credential option fictional-user for http://127.0.0.1:43557, Open SecurePass window action, Key icon trigger beside masked password field

### Community 98 - "Saved-version batch export design record"
Cohesion: 0.15
Nodes (7): Drive copy review: design record, Evidence and limits, Interaction and privacy, Scope and incumbent design, Revisão Drive protegida na gestão — 08/11/2026, Saved-version batch export design record, Scoped visual ship and disposable browser evidence

### Community 99 - "Light tab saved-version export dialog"
Cohesion: 0.50
Nodes (4): Saved version 1 of 3; 0 download requests sent, Download version confirms the current file; Cancel stops the batch, Light tab saved-version export dialog, This device; version 949a754c; saved 11/8/2026, 7:47:16 PM; 1 KiB

### Community 100 - ".put"
Cohesion: 0.50
Nodes (4): Review checkpoint primary action with secondary Export and Remove, Dated checkpoint with sequence, recoverable-entry and later-entry counts, Backups header and Open in tab remain visible above checkpoint cards, Dark popup checkpoint card with one Review action

### Community 101 - "Operação de teste"
Cohesion: 0.50
Nodes (4): Review checkpoint primary action with secondary Export and Remove, Dated checkpoint with sequence, recoverable-entry and later-entry counts, Backups header and Open in tab remain visible above checkpoint cards, Light popup checkpoint card with one Review action

### Community 102 - "browser.mjs"
Cohesion: 0.13
Nodes (8): frameFor(), projectRoot, server, errors, root, server, shadowClick(), find()

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

### Community 107 - "Light management checkpoint cards with one Review action"
Cohesion: 0.50
Nodes (4): One primary Review checkpoint button with secondary Export and Remove, Dated cards show sequence and aggregate entry differences without account examples, Backups & recovery sidebar selection and Recovery checkpoints heading remain visible, Light management checkpoint cards with one Review action

### Community 108 - "Separate whole-vault restore confirmation from inline review"
Cohesion: 0.50
Nodes (4): Cancel and Restore vault in the confirmation footer, Copy preserves current authentication and keeps current contents as a checkpoint while turning automatic Sync off, Separate whole-vault restore confirmation from inline review, Compact confirmation shows saved-entry count and highlighted removal count

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

### Community 119 - "Light popup compact checkpoint comparison"
Cohesion: 0.50
Nodes (4): Checkpoint date and nonzero saved/deleted summary, Domain, account and Deleted entry row with Recover entry, Light popup compact checkpoint comparison, Search website or username field

### Community 120 - "Light popup bounded vault unlock"
Cohesion: 0.50
Nodes (4): Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Compact Unlock vault heading, current-password field and reveal control, Light popup bounded vault unlock

### Community 121 - "driveReview-browser.mjs"
Cohesion: 0.11
Nodes (14): done, files(), graph, js, manifest, pkg, root, visit() (+6 more)

### Community 123 - "check.mjs"
Cohesion: 0.15
Nodes (13): Public Google client received and stable configured development copy generated; real authorization remains pending, Disposable Chromium anchored, configured-Google emulation and ZIP evidence; real Google remains unaccepted, googleManifest(), main(), root, result, { version }, runtimeFiles (+5 more)

### Community 124 - "Dark management checkpoint cards with one Review action"
Cohesion: 0.50
Nodes (4): One primary Review checkpoint button with secondary Export and Remove, Dated cards show sequence and aggregate entry differences without account examples, Backups & recovery sidebar selection and Recovery checkpoints heading remain visible, Dark management checkpoint cards with one Review action

### Community 125 - "cryptoVault.js"
Cohesion: 0.24
Nodes (15): deleteCredential(), importVaultData(), mutate(), normalize(), overwriteVaultEntries(), storeCredential(), updateCredential(), BACKUP_VERSION (+7 more)

### Community 163 - "Verified administrative delivery contract"
Cohesion: 0.24
Nodes (3): Verified administrative delivery contract, Administrative delivery SC26 SC28 SC29 SC33 SC47 issue, 295-test 165-module administrative delivery evidence

### Community 171 - "Durable device administration contract"
Cohesion: 0.29
Nodes (3): Durable device administration contract, Device administration SC03 SC16 SC26 SC47 implementation issue, 288-test 160-module internal administration evidence

### Community 172 - "Guided Chrome Sync setup, manual discovery and device test"
Cohesion: 0.29
Nodes (7): Advanced Google connection, Chrome Sync, breach cache and scoped local maintenance, Scoped entry clearing and local device erasure, Explicit legacy remote version review, Guided Chrome Sync setup, manual discovery and device test, Remote source unlock then entry-count comparison and confirmation, Configure Chrome Sync then separately enable automatic sending, Explicit matching-code device test and historical receipt status

### Community 174 - "SETTINGS_NAVIGATION.md"
Cohesion: 0.29
Nodes (9): Compatible Settings fragments, Executed verification, Hierarchical Settings navigation, Navigation history, focus and scroll preservation, Implemented behavior, Manual review and limits, Preserved Settings behavior and security contracts, Shared Settings footer across navigation layouts (+1 more)

### Community 175 - "driveTransport.js"
Cohesion: 0.31
Nodes (13): bounded(), classify(), createDriveClient(), guard(), publish(), request(), uploadResumable(), DriveError (+5 more)

### Community 176 - "ref_node_fs"
Cohesion: 0.10
Nodes (14): playwright, root, root, root, root, root, root, root (+6 more)

### Community 177 - "Popup inline checkpoint review in light theme"
Cohesion: 0.40
Nodes (5): Back to checkpoints remains part of the in-section view, Deleted account offers Recover entry; later accounts explicitly indicate removal by full restore, Popup inline checkpoint review in light theme, Website or username search within the review, Review title/date and saved/deleted/different/newer counts

### Community 178 - "messages.js"
Cohesion: 0.17
Nodes (7): AUTH, CONTENT, SELECTOR, authorize(), call(), clientId, sender

### Community 179 - "settings-browser.mjs"
Cohesion: 0.20
Nodes (4): errors, layouts(), root, section()

### Community 180 - "createDriveReviewService"
Cohesion: 0.40
Nodes (13): createDriveReviewService(), clear(), commit(), context(), discard(), guard(), inspect(), cyclic() (+5 more)

### Community 181 - "setStorage"
Cohesion: 0.47
Nodes (11): code(), confirmDeviceTest(), deviceId(), deviceTestStatus(), digest(), inspectDeviceTest(), requireTestedVersion(), startDeviceTest() (+3 more)

### Community 182 - "accountPrompts.test.js"
Cohesion: 0.33
Nodes (4): auth(), payload(), saveRequest(), sender

### Community 185 - "Implemented extension-origin anchored account selector with two-account pagination and username search"
Cohesion: 0.14
Nodes (9): Chromium selector evidence does not close visual-adversarial, physical accessibility or real-site acceptance, Implemented extension-origin anchored account selector with two-account pagination and username search, Protected auth-window handoff and native fallback for CSP blocking and manual creation, Trusted selection plus source focus, ancestor visibility and hit-testing checks, Internal normal-mutation signing and atomic vault-checkpoint-outbox authorization/session checks, Account-vault-generation bound IndexedDB publication queue with bounded durable retries, Persisted resumable upload sessions, provider offset probes, one-MiB chunks and 16-MiB packet bound, Implemented field-key, protected unlock, anchored account choice and direct fill without submission (+1 more)

### Community 186 - "Popup inline checkpoint review in dark theme"
Cohesion: 0.40
Nodes (5): Back to checkpoints remains part of the in-section view, Deleted account offers Recover entry; later accounts explicitly indicate removal by full restore, Popup inline checkpoint review in dark theme, Website or username search within the review, Review title/date and saved/deleted/different/newer counts

### Community 187 - "Dark management checkpoint list"
Cohesion: 0.40
Nodes (5): Recover an entry, Restore whole vault, Export and Remove actions, Dated checkpoint cards with saved entry counts, sequence and account differences, Recovery checkpoints heading, Clear history and three-state policy, Dark management checkpoint list, Four-section sidebar with Backups & recovery selected

### Community 188 - "Light management checkpoint list"
Cohesion: 0.40
Nodes (5): Recover an entry, Restore whole vault, Export and Remove actions, Dated checkpoint cards with saved entry counts, sequence and account differences, Recovery checkpoints heading, Clear history and three-state policy, Light management checkpoint list, Four-section sidebar with Backups & recovery selected

### Community 189 - "Dark popup checkpoint cards"
Cohesion: 0.40
Nodes (5): Entry recovery, whole-vault restore, Export and Remove fit wrapped action rows, Dated checkpoint cards with sequence, entry counts and recoverable-account examples, Version and GitHub footer with automatic-save status, Backups & recovery header, Back and Open in tab remain visible, Dark popup checkpoint cards

### Community 190 - "Light popup checkpoint cards"
Cohesion: 0.40
Nodes (5): Entry recovery, whole-vault restore, Export and Remove fit wrapped action rows, Dated checkpoint cards with sequence, entry counts and recoverable-account examples, Version and GitHub footer with automatic-save status, Backups & recovery header, Back and Open in tab remain visible, Light popup checkpoint cards

### Community 191 - "Individual entry recovery review dialog"
Cohesion: 0.40
Nodes (5): Cancel and Recover selected entry stay in the dialog footer, Explanation says only the selected entry changes and existing Sync applies, Individual entry recovery review dialog, Stable account selector and examples distinguish deleted entry from older password, Checkpoint date, saved entries, recoverable and older-detail counts

### Community 192 - "Whole-vault restore review dialog"
Cohesion: 0.40
Nodes (5): Cancel and Restore whole vault stay in the dialog footer, Review says current master password and biometric setup stay the same, Whole-vault restore review dialog, Checkpoint date, saved-entry, recovery, older-detail and removal counts, Current contents become a checkpoint and automatic Sync turns off

### Community 193 - "Short account-specific deleted-entry confirmation"
Cohesion: 0.50
Nodes (4): Website and username identify the deleted entry to recover, Cancel and Recover entry without an account dropdown, Copy preserves other entries, current master password/biometrics and existing Sync mode, Short account-specific deleted-entry confirmation

### Community 194 - "compareSyncContents"
Cohesion: 1.00
Nodes (3): compareSyncContents(), equal(), planSyncMerge()

## Knowledge Gaps
- **485 isolated node(s):** `Review checkpoint primary action with secondary Export and Remove`, `Dated checkpoint with sequence, recoverable-entry and later-entry counts`, `Backups header and Open in tab remain visible above checkpoint cards`, `Review checkpoint primary action with secondary Export and Remove`, `Dated checkpoint with sequence, recoverable-entry and later-entry counts` (+480 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1082 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **56 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Current architecture with implemented local and legacy increment` connect `Current architecture with implemented local and legacy increment` to `Interface e revisão visual`, `Recovery checkpoints behavior, protection and verification`, `Original SD review with later local increment notice`, `popup.js`, `README de apresentação em português`, `Serialized offscreen clipboard owner`, `Verified administrative delivery contract`, `SETTINGS_UX_IMPLEMENTATION.md`, `SETTINGS_UX_DESIGN.md`, `Durable device administration contract`, `Internal authenticated Drive-history retrieval contract and evidence`, `Internal common-base three-way merge issue and acceptance scope`, `Purpose-bound inline master-password authorization`, `Ferramentas de desenvolvimento`, `Implemented extension-origin anchored account selector with two-account pagination and username search`, `Confirmação de autofill`, `Ferramentas de desenvolvimento`, `Encrypted vault-state v1 payload and local migration contract`, `Recovery-surface presentation and unlock-controller refinement`?**
  _High betweenness centrality (0.234) - this node is a cross-community bridge._
- **What connects `Review checkpoint primary action with secondary Export and Remove`, `Dated checkpoint with sequence, recoverable-entry and later-entry counts`, `Backups header and Open in tab remain visible above checkpoint cards` to the rest of the system?**
  _485 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Interface e revisão visual` be split into smaller, more focused modules?**
  _Cohesion score 0.02981366459627329 - nodes in this community are weakly interconnected._
- **Why does `Validation and release checklist` connect `session.js` to `Interface e revisão visual`, `Original SD review with later local increment notice`, `Checkpoint review design document`, `README de apresentação em português`, `Checkpoint review interaction`, `SETTINGS_UX_IMPLEMENTATION.md`, `Verified administrative delivery contract`, `Drive-copy review scoped design record`, `Security model and open risks`, `SETTINGS_UX_DESIGN.md`, `Historical six-category frontend review`, `vaultUnlock.js`, `Durable device administration contract`, `SETTINGS_NAVIGATION.md`, `Internal authenticated Drive-history retrieval contract and evidence`, `Implementation tracking with consolidated current and historical status`, `Internal common-base three-way merge issue and acceptance scope`, `Ferramentas de desenvolvimento`, `Confirmação de autofill`, `Ferramentas de desenvolvimento`, `Encrypted vault-state v1 payload and local migration contract`, `Guided Chrome Sync setup and device verification`, `Bounded recovery archive reader contract`?**
  _High betweenness centrality (0.157) - this node is a cross-community bridge._
- **Should `Recovery checkpoints behavior, protection and verification` be split into smaller, more focused modules?**
  _Cohesion score 0.12418300653594772 - nodes in this community are weakly interconnected._
- **Why does `Checkpoint recovery with inline comparison and fresh scoped confirmation` connect `Recovery checkpoints behavior, protection and verification` to `vaultHandlers.js`, `Current architecture with implemented local and legacy increment`?**
  _High betweenness centrality (0.107) - this node is a cross-community bridge._
- **Should `Original SD review with later local increment notice` be split into smaller, more focused modules?**
  _Cohesion score 0.08865248226950355 - nodes in this community are weakly interconnected._