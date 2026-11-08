# Graph Report - SecurePass  (2026-11-08)

## Corpus Check
- 275 files · ~147,623 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: .css 6, (none) 3)

## Summary
- 2082 nodes · 4956 edges · 170 communities (116 shown, 54 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 84 edges (avg confidence: 0.84)
- Token cost: host extraction usage unavailable; no separate semantic API used.

## Graph Freshness
- Built from commit: `618cde23`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cryptoVault.js
- signedProtocol.js
- Interface e revisão visual
- Recovery checkpoints behavior, protection and verification
- biometric/service.js
- ref_node_assert
- requests.js
- popup.js
- Contextual on-page key
- Current architecture with implemented local and legacy increment
- checkpointReview.js
- Documentação de Sync e dados
- Checkpoint review design document
- session.js
- vault.js
- Inline master-password flow and independent management proportions
- googleConnection.js
- ref_node_fs
- README de apresentação em português
- Autofill na página
- scripts
- logger.js
- Contextual on-page key contract
- checkpointReview.js
- syncSetup-browser.mjs
- Modelo de segurança
- Popup HTML semantic surfaces
- driveTransport.js
- browser.mjs
- recoveryDesign-browser.mjs
- checkpoints-browser.mjs
- Implementation checklist: partial implementation, release not accepted
- Checkpoint review interaction
- SETTINGS_UX_IMPLEMENTATION.md
- accountPrompts-browser.mjs
- driveRuntime.js
- SETTINGS_NAVIGATION.md
- Guided Chrome Sync setup and receipt evidence contract
- selector.js
- Security model and open risks
- SETTINGS_UX_DESIGN.md
- playwright
- Three-way planner checklist records delivered internal planning and guarded review
- vaultUnlock.js
- Internal authenticated Drive-history retrieval contract and evidence
- Account suggestions, inline tools and trusted-window confirmation contract
- IMPLEMENTATION_CHECKLIST.md
- Encrypted vault-state v1 payload and local migration contract
- popup.js
- Management inline checkpoint review in dark theme
- Implementation tracking with consolidated current and historical status
- masterPassword.test.js
- Implemented extension-origin anchored account selector with two-account pagination and username search
- storage.js
- Purpose-bound inline master-password authorization
- Ferramentas de desenvolvimento
- Confirmação de autofill
- Settings category links and labelled navigation
- popup.js
- Ferramentas de desenvolvimento
- Ferramentas de desenvolvimento
- Popup HTML semantic surfaces
- Checklist de implementação e aceitação
- Original SD review with later local increment notice
- Ferramentas de desenvolvimento
- Account suggestions and inline login tools
- Ferramentas de desenvolvimento
- Light management checkpoint cards with one Review action
- biometric.test.js
- Quatro áreas das definições
- Análise de formulários
- modules/settings.js
- Guided Chrome Sync setup and device verification
- Popup inline checkpoint review in dark theme
- Popup HTML semantic surfaces
- configureGoogle.mjs
- Guided Chrome Sync setup, manual discovery and device test
- Google configuration builder validates public key/ID and adds appData-only permissions to a separate copy
- Ícone 16 pixels
- Ícone 32 pixels
- Ícone 48 pixels
- Entrada do content script
- Documentação de Sync e dados
- Popup inline checkpoint review in light theme
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
- Historical six-category frontend review
- Dark anchored credential selector on narrow page
- Checkpoint review interaction
- Dark management checkpoint list
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
- Light management checkpoint list
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
- Serialized offscreen clipboard owner
- Short account-specific deleted-entry confirmation
- Dark popup checkpoint cards
- Light popup checkpoint cards
- Individual entry recovery review dialog
- Whole-vault restore review dialog
- Dark management checkpoint cards with one Review action

## God Nodes (most connected - your core abstractions)
1. `Version 3 settings Sync data and compact login plan` - 100 edges
2. `getStorage()` - 78 edges
3. `Validation and release checklist` - 61 edges
4. `Current architecture with implemented local and legacy increment` - 60 edges
5. `removeStorage()` - 54 edges
6. `withVaultOperation()` - 53 edges
7. `setStorage()` - 51 edges
8. `showToast()` - 46 edges
9. `Historical review of commit 5aed51c` - 44 edges
10. `Original SD review with later local increment notice` - 42 edges

## Surprising Connections (you probably didn't know these)
- `Key protection and trusted checkpoint implementation` --references--> `prepareSignedPublication()`  [INFERRED]
  docs/SIGNED_PROTOCOL.md → src/sync/signedPublication.js
- `Cifrado interno do cofre — payload versionado, 08/11/2026` --references--> `encryptEntries()`  [INFERRED]
  docs/VAULT_PAYLOAD.md → src/vault/crypto.js
- `Exact-content adoption of older-format copies before remote ancestor retirement` --references--> `legacyRevision()`  [EXTRACTED]
  docs/CHROME_SYNC_SETUP.md → src/vault/sync.js
- `Conservative two-complete-version capacity and local-only failure handling` --references--> `publicationCapacity()`  [EXTRACTED]
  docs/CHROME_SYNC_SETUP.md → src/vault/sync.js
- `Read-only browser preparation and copy/capacity checks before explicit activation` --references--> `checkSyncSetup()`  [EXTRACTED]
  docs/CHROME_SYNC_SETUP.md → src/vault/syncService.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Protected authentication and minimal document-bound anchored account selection** — docs_anchored_selector_account_selection, docs_anchored_selector_request_binding, docs_anchored_selector_visual_attestation, docs_anchored_selector_native_fallback, selector_selector_account_surface [EXTRACTED 1.00]
- **Whole-checkpoint restore authorization sequence** — docs_checkpoint_review_recent_authentication, docs_checkpoint_review_confirm_identity, docs_checkpoint_review_fresh_scoped_token, docs_checkpoint_review_secondary_restore [EXTRACTED 1.00]
- **Internal signed local mutation through atomic outbox to verified immutable publication** — docs_drive_transport_atomic_signed_commit, docs_signed_protocol_revision_wrapper, docs_drive_transport_durable_coordinator, docs_drive_transport_immutable_publication, docs_drive_transport_resumable_upload [EXTRACTED 1.00]
- **Selected signed ancestry and all-copy integrity within bounds guarded by final inventory/context checks** — docs_issues_authenticated_drive_history_selected_ancestry, docs_issues_authenticated_drive_history_duplicate_integrity, docs_issues_authenticated_drive_history_resource_limits, docs_issues_authenticated_drive_history_context_recheck [EXTRACTED 1.00]
- **Fixed authenticated context and selected history through atomic signed merge commit** — docs_issues_persisted_merge_context_authority, docs_issues_persisted_merge_history_preservation, docs_issues_persisted_merge_selected_parents, docs_issues_persisted_merge_atomic_retry [EXTRACTED 1.00]
- **Signed complete ancestry and plaintext identities guarded before causal merge review** — docs_issues_three_way_merge_authenticated_ancestor, docs_issues_three_way_merge_history_limits, docs_issues_three_way_merge_snapshot_identity, docs_issues_three_way_merge_live_context [EXTRACTED 1.00]
- **Authenticated deletion and explicit restoration preserved across encrypted payload lifecycle** — docs_vault_payload_tombstone_identity, docs_vault_payload_explicit_restoration, docs_vault_payload_rekey_recovery, docs_vault_payload_history_capacity [EXTRACTED 1.00]

## Communities (170 total, 54 thin omitted)

### Community 0 - "cryptoVault.js"
Cohesion: 0.05
Nodes (144): DECODER, decryptBackupPayload(), deriveBackupKey(), ENCODER, encryptBackupPayload(), isEncryptedBackupEnvelope(), changeMasterPassword(), changeMasterPasswordAuthorized() (+136 more)

### Community 1 - "signedProtocol.js"
Cohesion: 0.06
Nodes (65): 1. Escolher a identidade da extensão, 2. Criar/configurar o projeto Google, 3. Gerar uma cópia de desenvolvimento, Configurar Google Cloud para o SecurePass, Dados necessários para continuar a integração real, Commit de merge autenticado — SC22–SC25, authorizationPayload(), authTuple() (+57 more)

### Community 2 - "Interface e revisão visual"
Cohesion: 0.03
Nodes (38): Implemented anchored selector with two-account pagination/search and protected unlock/native fallback, Atomic vault-checkpoint-Drive outbox commit with internal automatic signing; production remains gated, Atomic vault-checkpoint-Drive outbox commit with internal automatic signing; production remains gated, Atomic vault-checkpoint-Drive outbox commit with internal automatic signing; production remains gated, Atomic vault-checkpoint-Drive outbox commit with internal automatic signing; production remains gated, Internal P-256 administrative and encrypted-v2 revision prototype with pinned root/checkpoint; production review remains pending, Version 3 settings Sync data and compact login plan, 08/11 local encrypted tombstones delivered separately from full convergence (+30 more)

### Community 3 - "Recovery checkpoints behavior, protection and verification"
Cohesion: 0.12
Nodes (19): Checkpoint recovery with inline comparison and fresh scoped confirmation, Inline checkpoint review module and displayed-comparison identity, Archived Sync copies stay separate and exports are source-specific, Unlocked checkpoint counts, differences and affected-account examples, Remove one checkpoint or verify current password to clear local history, Recovery checkpoints behavior, protection and verification, Per-entry recovery through inline review and explicit confirmation, Existing-vault external and selected-remote restores preserve active authentication (+11 more)

### Community 5 - "biometric/service.js"
Cohesion: 0.07
Nodes (41): attachGeneratorListeners(), avoidSimilar, copyGeneratedBtn, generateButton, generatedResult, generatorStatus, handleGenerate(), includeLower (+33 more)

### Community 6 - "ref_node_assert"
Cohesion: 0.13
Nodes (15): fake-indexeddb, auth(), payload(), saveRequest(), sender, alarms, areas, event() (+7 more)

### Community 7 - "requests.js"
Cohesion: 0.05
Nodes (120): handlers, ready, clearCandidates(), dismissCandidate(), inlineCandidate(), listCandidates, proposeCandidate(), reviewCandidate() (+112 more)

### Community 9 - "Contextual on-page key"
Cohesion: 0.15
Nodes (10): Capacidades e vinculação, Evidência, Manifesto e limites, Seletor de login junto ao campo — implementação de 05/11/2026, Contextual on-page key, Executed evidence and manual acceptance, Feedback and concurrent prompts, Login and authentication (+2 more)

### Community 11 - "checkpointReview.js"
Cohesion: 0.16
Nodes (38): Single checkpoint review entry, Checkpoint summary and detail separation verified, attachCheckpointListeners(), date(), deleteHistory(), handleCheckpointAction(), plural(), renderCheckpoints() (+30 more)

### Community 12 - "Documentação de Sync e dados"
Cohesion: 0.11
Nodes (38): clearSecrets(), complete(), expired(), refresh(), requestId, run(), saveTargetChanged(), send() (+30 more)

### Community 13 - "Checkpoint review design document"
Cohesion: 0.14
Nodes (14): Inline checkpoint comparison, Confirm identity flow, Individual entry recovery, Checkpoint review design document, Authentication expiry during confirmation, Successful recovery refreshes review or returns to checkpoint list, Recovery review cleanup and navigation, Website/username search, matching entries and fifty-row pagination (+6 more)

### Community 14 - "session.js"
Cohesion: 0.08
Nodes (32): Older checkpoint protection migration, False source-level production-review predicate; no public enrollment, adoption or Drive write activation, Journey scope and unconfigured OAuth, Accessibility and website compatibility acceptance, Automated regression coverage, Backup dialog refinement evidence, Development validation commands, Recovery checkpoints implementation evidence (+24 more)

### Community 15 - "vault.js"
Cohesion: 0.10
Nodes (36): initToast(), biometricUnlockContainer, clearRevealTimer(), confirmMasterInput, createMasterSection, createVaultIconButton(), deleteCredential(), entryForm (+28 more)

### Community 16 - "Inline master-password flow and independent management proportions"
Cohesion: 0.06
Nodes (34): Approved inline identity/password/success and management proportions, Pre-save biometric revocation notice and optional setup again, Clear secrets and revoke the exact grant on leaving the inline flow, Inline master-password flow and independent management proportions, Two-minute single-use revision-bound password-change grant, Physical authenticator and actual toolbar sizing remain manual acceptance, Fresh identity confirmation replaces preliminary unlock and modal, Tab stylesheet separates desktop layout from compact popup presentation (+26 more)

### Community 17 - "googleConnection.js"
Cohesion: 0.27
Nodes (14): driveHandlers, createDriveReader(), assertGeneration(), assertGoogleBinding(), authToken(), connectGoogle(), disconnectGoogle(), getBoundGoogleToken() (+6 more)

### Community 18 - "ref_node_fs"
Cohesion: 0.11
Nodes (8): root, root, run, root, vector, contexts, profiles, root

### Community 19 - "README de apresentação em português"
Cohesion: 0.07
Nodes (22): Local backup safety and repeatable recovery cleanup, Backups and Advanced functional review, Preenchimento confirmado por origem e documento, Backups cifrados com pré-visualização de importação, Desbloqueio WebAuthn com PRF, Limites de capacidade e importação, Desenvolvimento e verificações, Chrome122 e âmbito de compatibilidade (+14 more)

### Community 20 - "Autofill na página"
Cohesion: 0.08
Nodes (23): action, default_popup, default_title, background, service_worker, type, content_scripts, content_security_policy (+15 more)

### Community 21 - "scripts"
Cohesion: 0.11
Nodes (19): scripts, check, configure:google, package, test, test:account-prompts-browser, test:anchored-browser, test:backup-dialogs-browser (+11 more)

### Community 22 - "logger.js"
Cohesion: 0.22
Nodes (11): LOG_ENABLED, buffer, format(), isArrayBufferLike(), isPrimitive(), isSensitiveString(), logger, redactValue() (+3 more)

### Community 23 - "Contextual on-page key contract"
Cohesion: 0.09
Nodes (23): Direct selector and original-field tool handoff, Native manual login creation form, Native secondary website tools disclosure, Source field and reserved native-tab request binding, Direct key opens up to two anchored account suggestions, Contextual on-page key contract, Executed contextual-key evidence and remaining manual acceptance, Pointer-transparent feedback preserves the next website action (+15 more)

### Community 24 - "checkpointReview.js"
Cohesion: 0.31
Nodes (20): account(), attachCheckpointReviewListeners(), changedFields(), checkFreshness(), clientId, closeReview(), date(), entryCount() (+12 more)

### Community 25 - "syncSetup-browser.mjs"
Cohesion: 0.12
Nodes (6): test:sync-setup-browser runs the disposable guided Chrome Sync scenario, contexts, directories, errors, output, root

### Community 26 - "Modelo de segurança"
Cohesion: 0.29
Nodes (16): Inline unlock errors and retry without dismissing the form, resolveUnlockSetup(), setUnlockResolver(), attachUIListeners(), backFromSettings(), closeModal(), closeSettingsPanel(), manageFocus() (+8 more)

### Community 27 - "Popup HTML semantic surfaces"
Cohesion: 0.14
Nodes (20): Version and repository footer, System light and dark theme controls, Auto-lock inactivity preference, Consistent fingerprint symbol for biometric entry points, Ownership-aware clipboard timeout explanation, Popup HTML semantic surfaces, Labelled credential editor dialog, Appearance settings area (+12 more)

### Community 28 - "driveTransport.js"
Cohesion: 0.15
Nodes (20): bounded(), classify(), createDriveClient(), guard(), publish(), request(), uploadResumable(), createDriveTransport() (+12 more)

### Community 29 - "browser.mjs"
Cohesion: 0.13
Nodes (8): frameFor(), projectRoot, server, errors, root, server, shadowClick(), find()

### Community 30 - "recoveryDesign-browser.mjs"
Cohesion: 0.17
Nodes (6): Recovery-surface checks recorded in validation evidence, Dedicated recovery UI browser command, test:recovery-ui-browser, captures, errors, root

### Community 31 - "checkpoints-browser.mjs"
Cohesion: 0.20
Nodes (3): captures, errors, root

### Community 32 - "Implementation checklist: partial implementation, release not accepted"
Cohesion: 0.13
Nodes (16): Implemented anchored selector with two-account pagination/search and protected unlock/native fallback, SC and AF acceptance matrix; local SC01/SC02 and AF03/AF09 closed, remaining acceptance open, 08/11 internal authenticated ancestor delivery checked; product integration open, Consolidated delivered increments and remaining product/release gates, 2026-11-06 delivered OAuth inspection, signing, gated runtime, resumable uploads and anchored search, Implementation checklist: partial implementation, release not accepted, 08/11 internal Drive ancestry retrieval delivered; product integration open, Local tombstones and restore provenance checked; merged-result history open (+8 more)

### Community 33 - "Checkpoint review interaction"
Cohesion: 0.15
Nodes (9): Behavior and presentation, Encryption and rotation, Evidence, Recovery checkpoints, Recovery integrity, Checkpoint review flow, Verification, Recovery checkpoints (+1 more)

### Community 34 - "SETTINGS_UX_IMPLEMENTATION.md"
Cohesion: 0.14
Nodes (7): Current UX delivery separates read-only account access, internal publication, planner and anchored login, Delivered behavior, Executed checks, Remaining release gates, Review artifacts, Scenario coverage boundary, Settings UX implementation and evidence

### Community 35 - "accountPrompts-browser.mjs"
Cohesion: 0.18
Nodes (17): Historical disposable account-prompt Node, module and Chromium evidence, Dedicated disposable account-prompt Chromium command, capture(), errors, nextPage(), openFill(), openSaveEntered(), openTools() (+9 more)

### Community 36 - "driveRuntime.js"
Cohesion: 0.22
Nodes (11): loadAuthorization(), createDriveRuntime(), run(), driveRuntime, guardSession(), installLocalWriter(), prepareMutationPublication(), createPublicationCoordinator() (+3 more)

### Community 37 - "SETTINGS_NAVIGATION.md"
Cohesion: 0.29
Nodes (9): Compatible Settings fragments, Executed verification, Hierarchical Settings navigation, Navigation history, focus and scroll preservation, Implemented behavior, Manual review and limits, Preserved Settings behavior and security contracts, Shared Settings footer across navigation layouts (+1 more)

### Community 38 - "Guided Chrome Sync setup and receipt evidence contract"
Cohesion: 0.12
Nodes (17): Guided Chrome Sync setup, bounded capacity and non-authorizing device diagnostic, Guided setup Node/security and Chromium evidence with emulated transport boundaries, Guided setup supersedes parts of historical capacity and selected-restore findings, Conservative two-complete-version capacity and local-only failure handling, Dark guided setup refusing insufficient two-version capacity, Enable is unavailable when the local vault cannot coexist with a subsequent complete copy, Narrow dark device-test receipt with preserved local cache controls, Receipt confirms the tested encrypted version while local maintenance remains available (+9 more)

### Community 39 - "selector.js"
Cohesion: 0.22
Nodes (16): Implemented anchored selector with two-account pagination/search and protected unlock/native fallback, Disposable anchored and ZIP journeys plus internal Drive integration evidence; full release remains open, Current login key UI has two anchored suggestions and native complete-list fallback; registration/change-password generator remains available., Delivered anchored search/pagination with protected unlock and native fallback, Selector is extension-origin with restricted message capabilities and source/document binding; iframe isolation is not independent Chrome permissions or native clickjacking assurance., Implemented anchored selector with two-account pagination/search and protected unlock/native fallback, Implemented anchored selector with two-account pagination/search and protected unlock/native fallback, clear() (+8 more)

### Community 41 - "SETTINGS_UX_DESIGN.md"
Cohesion: 0.17
Nodes (7): Delivery evidence, Information architecture, Interaction rules, Journey state machine, SC01–SC58 traceability, Screen sketches, Settings UX — journeys, screens and acceptance map

### Community 42 - "playwright"
Cohesion: 0.25
Nodes (8): devDependencies, fake-indexeddb@^6.2.4, playwright@1.56.1, name, private, type, version, playwright

### Community 43 - "Three-way planner checklist records delivered internal planning and guarded review"
Cohesion: 0.15
Nodes (10): Separate internal three-way planner with opaque revision-bound reviews, Full SC merge acceptance remains open after internal planner delivery, Three-way planner checklist records delivered internal planning and guarded review, Unique nearest ancestor from complete authenticated history, Shared-base permutation evidence does not establish full distributed convergence, Internal common-base three-way merge issue and acceptance scope, Focused Node and Chromium evidence for the internal three-way planner, Implemented internal common-base three-way snapshot planner (+2 more)

### Community 44 - "vaultUnlock.js"
Cohesion: 0.13
Nodes (14): Advanced control inventory, Scoped authentication and local erasure, Backups control inventory, Cache usage without duration control, Unified local and archived earlier versions, Executed validation, Four-area Settings revision, Historical General inventory (+6 more)

### Community 45 - "Internal authenticated Drive-history retrieval contract and evidence"
Cohesion: 0.20
Nodes (5): Bounded selected signed-history retrieval with inventory reenumeration, Internal authenticated Drive-history retrieval contract and evidence, Shared 256-packet and 32-MiB bounds count duplicate and local packets, Internal authenticated ancestor and Drive history delivered without activation, 244-test continuation with actual bounded reader and injected provider

### Community 46 - "Account suggestions, inline tools and trusted-window confirmation contract"
Cohesion: 0.13
Nodes (15): Review cancellation retains a proposal; dismissal/save/expiry/lock remove it, Restricted five-minute proposals, eight-item bound, metadata-only listing and deduplication, Compact dark master-password confirmation, Master password stays on the extension-owned page with retry and cancellation, Same-origin explicit save/update binds destination revision and preserves notes and identity, Fill and save consume authorization once under the operation lock, Inline review and dismissal validate origin, tab and document, Closed-shadow tools follow theme and reposition with field and viewport; removal releases listeners (+7 more)

### Community 47 - "IMPLEMENTATION_CHECKLIST.md"
Cohesion: 0.13
Nodes (9): Drive transport implementation status, Recolha de história Drive autenticada — SC22–SC25, Integração Drive e conclusão do plano — 06/11/2026, Tombstones cifrados persistentes — SC22–SC25, Implementação do plano Sync/Data v3, Merge de três vias — SC22–SC25, SC34–SC35, Key protection and trusted checkpoint implementation, Signed authorization prototype — specification and review gate (+1 more)

### Community 48 - "Encrypted vault-state v1 payload and local migration contract"
Cohesion: 0.10
Nodes (9): Authenticated merge commit delivered internally; protected product routes remain open, Authenticated merge commit scope and acceptance SC22-SC25, Persistent encrypted tombstones implementation scope SC22-SC25, 257-test atomic merge persistence and real Chromium rollback retry evidence, 251-test local tombstone persistence and signed-packet Chromium evidence, Encrypted deterministic conflict-copy provenance alongside restore history, Encrypted vault-state v1 payload and local migration contract, Rotation and checkpoint re-protection preserve causal metadata (+1 more)

### Community 49 - "popup.js"
Cohesion: 0.15
Nodes (14): Auto-lock vault slider, Set up biometric unlock action, Change master password action, Clear copied passwords slider, GitHub footer link, Settings category navigation: Appearance, Security, Backups & recovery, Advanced, Settings footer with version, GitHub link, and preference save status, Settings popup home screenshot (+6 more)

### Community 50 - "Management inline checkpoint review in dark theme"
Cohesion: 0.29
Nodes (7): Changed account labels Different fields: password and offers Restore details, Back to checkpoints remains part of the in-section view, Show matching entries checkbox includes matching count, Account rows offer a specific Recover entry action, Management inline checkpoint review in dark theme, Website or username search within the review, Review title/date and saved/deleted/different/newer counts

### Community 52 - "masterPassword.test.js"
Cohesion: 0.40
Nodes (4): authorize(), call(), clientId, sender

### Community 53 - "Implemented extension-origin anchored account selector with two-account pagination and username search"
Cohesion: 0.17
Nodes (8): Chromium selector evidence does not close visual-adversarial, physical accessibility or real-site acceptance, Implemented extension-origin anchored account selector with two-account pagination and username search, Protected auth-window handoff and native fallback for CSP blocking and manual creation, Trusted selection plus source focus, ancestor visibility and hit-testing checks, Account-vault-generation bound IndexedDB publication queue with bounded durable retries, Persisted resumable upload sessions, provider offset probes, one-MiB chunks and 16-MiB packet bound, Implemented field-key, protected unlock, anchored account choice and direct fill without submission, Minimal no-referrer account surface with origin, search, top pagination, account list and live status

### Community 54 - "storage.js"
Cohesion: 0.11
Nodes (29): ALARM_NAME, BIOMETRIC_SESSION_PASSPHRASE_KEY, CHUNK_SIZE, CLIPBOARD_ALARM_NAME, DB_STORE_NAME, DB_VERSION, META_KEY, PRF_EVAL_LABEL (+21 more)

### Community 55 - "Purpose-bound inline master-password authorization"
Cohesion: 0.13
Nodes (10): Implemented read-only Google management and gated internal signed Drive integration, Independent management-tab layout with shared trusted pathname, Purpose-bound inline master-password authorization, Drive production lifecycle, recovery, convergence, migration and release acceptance remain incomplete, Internal normal-mutation signing and atomic vault-checkpoint-outbox authorization/session checks, Public OAuth client received; real Google authorization, protocol review, physical hardware and lifecycle acceptance pending, Internal domain-separated ECDSA P-256 administrative authorization chains, Internal prototype lacks reviewed nonce policy, new format, enrollment, recovery, concurrent rotation and migration (+2 more)

### Community 56 - "Ferramentas de desenvolvimento"
Cohesion: 0.18
Nodes (9): Backups & recovery — export and restore dialogs, Delivered interaction, Executed checks, Visual evidence, Limites e aceitação restante, Problemas reproduzidos e corrigidos, Revisão funcional — Backups & recovery e Advanced, Validação (+1 more)

### Community 57 - "Confirmação de autofill"
Cohesion: 0.18
Nodes (10): Local Settings Sync and Data Management work item, Local workflow acceptance requirements, Historical approved four-area revision on main, Historical frontend cleanup follow-up, Historical approved hierarchical implementation scope, Authorization contract, Delivered behavior, Inline master-password change and management layout (+2 more)

### Community 58 - "Settings category links and labelled navigation"
Cohesion: 0.20
Nodes (11): Vault creation/unlock, biometric setup and inline fresh-identity master-password change forms, Backups, checkpoint cards and inline review settings area, Recovery checkpoints heading, Clear history and local/archive inventory, Compact in-section checkpoint comparison, Encrypted backup import and export controls, Cache clear, vault clear, local wipe and exclusive native operation dialog surfaces, Settings category links and labelled navigation, Checkpoint cards and inline review with separate archived copies (+3 more)

### Community 59 - "popup.js"
Cohesion: 0.21
Nodes (21): attachBiometricListeners(), syncBiometricView(), attachCandidateListeners(), refreshCandidates(), attachMasterPasswordListeners(), sendMessage(), attachSettingsNavigation(), LEGACY_SECTIONS (+13 more)

### Community 60 - "Ferramentas de desenvolvimento"
Cohesion: 0.20
Nodes (4): errors, layouts(), root, section()

### Community 62 - "Popup HTML semantic surfaces"
Cohesion: 0.22
Nodes (10): Cancel, Unlock and icon-only fingerprint share one action row, Dark master-password identity with inline biometric method, Dark main vault unlock with inline biometric method, Shared password and biometric method row, Accessible fingerprint-only shortcut beside password, Inline identity form with biometric shortcut beside current password, New-password confirmation with biometric revocation warning, Inline master-password identity, new-password and success forms (+2 more)

### Community 63 - "Checklist de implementação e aceitação"
Cohesion: 0.29
Nodes (7): Cenários de aceitação, Checklist de implementação e aceitação, Dependências externas e condições de release, Entregáveis por secção, Próximos blocos de implementação, Revisão original e fecho de problemas, Trabalho desta execução

### Community 65 - "Ferramentas de desenvolvimento"
Cohesion: 0.20
Nodes (6): cancel(), captures, errors, idle(), root, ./modules/operationDialog.js

### Community 66 - "Account suggestions and inline login tools"
Cohesion: 0.40
Nodes (5): Account suggestions and inline login tools, Integrity and capability boundaries, Surfaces and interaction, Validation, Why a save suggestion appears

### Community 67 - "Ferramentas de desenvolvimento"
Cohesion: 0.22
Nodes (8): Explicit account selection section, PRF alternative beside the master password field, Cancel confirmation button, Compact extension-owned login confirmation with shared popup tokens, Editable username and explicit selection before an update, with expired/already-saved states, Explicit new-login save or selected password update, auth.js module bootstrap, Master password unlock form

### Community 68 - "Light management checkpoint cards with one Review action"
Cohesion: 0.50
Nodes (4): One primary Review checkpoint button with secondary Export and Remove, Dated cards show sequence and aggregate entry differences without account examples, Backups & recovery sidebar selection and Recovery checkpoints heading remain visible, Light management checkpoint cards with one Review action

### Community 69 - "biometric.test.js"
Cohesion: 0.42
Nodes (7): assertion(), b64(), client(), der(), registration(), request(), sender

### Community 70 - "Quatro áreas das definições"
Cohesion: 0.25
Nodes (8): Vault unlock controller with bounded inline retry and WebAuthn cancellation, Compact comparison header and account rows, Recovery-surface presentation and unlock-controller refinement, Smaller cards and a shared contextual dimmed backdrop, Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Compact Unlock vault heading, current-password field and reveal control, Light tab bounded vault unlock

### Community 71 - "Análise de formulários"
Cohesion: 0.25
Nodes (8): 85 modules and four browser suites; Node evidence remains historical, Compact recovery presentation and consistent fingerprint entry points, Same dimmed and 2px-blurred extension context under unlock and recovery, Full restore confirms only restored total and removals, Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Compact Unlock vault heading, current-password field and reveal control, Dark popup bounded vault unlock

### Community 72 - "modules/settings.js"
Cohesion: 0.32
Nodes (11): attachSettingsListeners(), initialiseSettings(), saving, scheduleSettingsSave(), setSaveStatus(), syncSettingsView(), updateRangeLabel(), applyTheme() (+3 more)

### Community 73 - "Guided Chrome Sync setup and device verification"
Cohesion: 0.29
Nodes (6): Device test, Evidence shown to the user, Guided Chrome Sync setup and device verification, Recovery and capacity corrections, User journey, Validation and manual acceptance

### Community 74 - "Popup inline checkpoint review in dark theme"
Cohesion: 0.40
Nodes (5): Back to checkpoints remains part of the in-section view, Deleted account offers Recover entry; later accounts explicitly indicate removal by full restore, Popup inline checkpoint review in dark theme, Website or username search within the review, Review title/date and saved/deleted/different/newer counts

### Community 75 - "Popup HTML semantic surfaces"
Cohesion: 0.29
Nodes (6): Readable cache row layout correction, Reproduced cache status layout defect, Historical navigation and dialog recommendations, Recovery discovery and terminology concerns, Visual critique and accessibility limits, Breach-check cache management

### Community 76 - "configureGoogle.mjs"
Cohesion: 0.08
Nodes (21): Public Google client received and stable configured development copy generated; real authorization remains pending, Disposable Chromium anchored, configured-Google emulation and ZIP evidence; real Google remains unaccepted, done, files(), graph, js, manifest, pkg (+13 more)

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

### Community 84 - "Popup inline checkpoint review in light theme"
Cohesion: 0.40
Nodes (5): Back to checkpoints remains part of the in-section view, Deleted account offers Recover entry; later accounts explicitly indicate removal by full restore, Popup inline checkpoint review in light theme, Website or username search within the review, Review title/date and saved/deleted/different/newer counts

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

### Community 96 - "Historical six-category frontend review"
Cohesion: 0.20
Nodes (7): Historical accessible themes ranges and saving feedback, Historical six-category navigation, Historical six-category frontend review, Historical settings disclosures unlock and focus corrections, Historical independent Impeccable review evidence, Historical hTML category ownership and dedicated settings styles, Historical frontend regression evidence and manual limits

### Community 97 - "Dark anchored credential selector on narrow page"
Cohesion: 0.50
Nodes (4): Dark anchored credential selector on narrow page, Credential option fictional-user for http://127.0.0.1:43557, Open SecurePass window action, Key icon trigger beside masked password field

### Community 98 - "Checkpoint review interaction"
Cohesion: 0.40
Nodes (5): Approved interaction, Captures, Checkpoint review interaction, State and privacy, Checkpoint review scenario coverage and remaining acceptance

### Community 99 - "Dark management checkpoint list"
Cohesion: 0.40
Nodes (5): Recover an entry, Restore whole vault, Export and Remove actions, Dated checkpoint cards with saved entry counts, sequence and account differences, Recovery checkpoints heading, Clear history and three-state policy, Dark management checkpoint list, Four-section sidebar with Backups & recovery selected

### Community 100 - ".put"
Cohesion: 0.50
Nodes (4): Review checkpoint primary action with secondary Export and Remove, Dated checkpoint with sequence, recoverable-entry and later-entry counts, Backups header and Open in tab remain visible above checkpoint cards, Dark popup checkpoint card with one Review action

### Community 101 - "Operação de teste"
Cohesion: 0.50
Nodes (4): Review checkpoint primary action with secondary Export and Remove, Dated checkpoint with sequence, recoverable-entry and later-entry counts, Backups header and Open in tab remain visible above checkpoint cards, Light popup checkpoint card with one Review action

### Community 102 - "Separate whole-vault restore confirmation from inline review"
Cohesion: 0.50
Nodes (4): Cancel and Restore vault in the confirmation footer, Copy preserves current authentication and keeps current contents as a checkpoint while turning automatic Sync off, Separate whole-vault restore confirmation from inline review, Compact confirmation shows saved-entry count and highlighted removal count

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

### Community 124 - "Light management checkpoint list"
Cohesion: 0.40
Nodes (5): Recover an entry, Restore whole vault, Export and Remove actions, Dated checkpoint cards with saved entry counts, sequence and account differences, Recovery checkpoints heading, Clear history and three-state policy, Light management checkpoint list, Four-section sidebar with Backups & recovery selected

### Community 163 - "Short account-specific deleted-entry confirmation"
Cohesion: 0.50
Nodes (4): Website and username identify the deleted entry to recover, Cancel and Recover entry without an account dropdown, Copy preserves other entries, current master password/biometrics and existing Sync mode, Short account-specific deleted-entry confirmation

### Community 165 - "Dark popup checkpoint cards"
Cohesion: 0.40
Nodes (5): Entry recovery, whole-vault restore, Export and Remove fit wrapped action rows, Dated checkpoint cards with sequence, entry counts and recoverable-account examples, Version and GitHub footer with automatic-save status, Backups & recovery header, Back and Open in tab remain visible, Dark popup checkpoint cards

### Community 166 - "Light popup checkpoint cards"
Cohesion: 0.40
Nodes (5): Entry recovery, whole-vault restore, Export and Remove fit wrapped action rows, Dated checkpoint cards with sequence, entry counts and recoverable-account examples, Version and GitHub footer with automatic-save status, Backups & recovery header, Back and Open in tab remain visible, Light popup checkpoint cards

### Community 167 - "Individual entry recovery review dialog"
Cohesion: 0.40
Nodes (5): Cancel and Recover selected entry stay in the dialog footer, Explanation says only the selected entry changes and existing Sync applies, Individual entry recovery review dialog, Stable account selector and examples distinguish deleted entry from older password, Checkpoint date, saved entries, recoverable and older-detail counts

### Community 168 - "Whole-vault restore review dialog"
Cohesion: 0.40
Nodes (5): Cancel and Restore whole vault stay in the dialog footer, Review says current master password and biometric setup stay the same, Whole-vault restore review dialog, Checkpoint date, saved-entry, recovery, older-detail and removal counts, Current contents become a checkpoint and automatic Sync turns off

### Community 169 - "Dark management checkpoint cards with one Review action"
Cohesion: 0.50
Nodes (4): One primary Review checkpoint button with secondary Export and Remove, Dated cards show sequence and aggregate entry differences without account examples, Backups & recovery sidebar selection and Recovery checkpoints heading remain visible, Dark management checkpoint cards with one Review action

## Knowledge Gaps
- **429 isolated node(s):** `Review checkpoint primary action with secondary Export and Remove`, `Dated checkpoint with sequence, recoverable-entry and later-entry counts`, `Backups header and Open in tab remain visible above checkpoint cards`, `Review checkpoint primary action with secondary Export and Remove`, `Dated checkpoint with sequence, recoverable-entry and later-entry counts` (+424 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 946 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **54 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Current architecture with implemented local and legacy increment` connect `Current architecture with implemented local and legacy increment` to `Original SD review with later local increment notice`, `Serialized offscreen clipboard owner`, `Recovery checkpoints behavior, protection and verification`, `SETTINGS_UX_IMPLEMENTATION.md`, `Interface e revisão visual`, `Quatro áreas das definições`, `popup.js`, `SETTINGS_UX_DESIGN.md`, `Three-way planner checklist records delivered internal planning and guarded review`, `Internal authenticated Drive-history retrieval contract and evidence`, `Encrypted vault-state v1 payload and local migration contract`, `Three content checkpoints, preserving recovery and source-specific exports`, `README de apresentação em português`, `Implemented extension-origin anchored account selector with two-account pagination and username search`, `Purpose-bound inline master-password authorization`, `Ferramentas de desenvolvimento`, `Confirmação de autofill`, `Ferramentas de desenvolvimento`?**
  _High betweenness centrality (0.309) - this node is a cross-community bridge._
- **What connects `Review checkpoint primary action with secondary Export and Remove`, `Dated checkpoint with sequence, recoverable-entry and later-entry counts`, `Backups header and Open in tab remain visible above checkpoint cards` to the rest of the system?**
  _429 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cryptoVault.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05479559748427673 - nodes in this community are weakly interconnected._
- **Why does `Validation and release checklist` connect `session.js` to `Interface e revisão visual`, `Original SD review with later local increment notice`, `Checkpoint review design document`, `README de apresentação em português`, `Implementation checklist: partial implementation, release not accepted`, `Checkpoint review interaction`, `SETTINGS_UX_IMPLEMENTATION.md`, `SETTINGS_NAVIGATION.md`, `Security model and open risks`, `SETTINGS_UX_DESIGN.md`, `Three-way planner checklist records delivered internal planning and guarded review`, `vaultUnlock.js`, `Internal authenticated Drive-history retrieval contract and evidence`, `Encrypted vault-state v1 payload and local migration contract`, `Implementation tracking with consolidated current and historical status`, `Ferramentas de desenvolvimento`, `Confirmação de autofill`, `Ferramentas de desenvolvimento`, `Original SD review with later local increment notice`, `Guided Chrome Sync setup and device verification`, `Historical six-category frontend review`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **Should `signedProtocol.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06151742993848257 - nodes in this community are weakly interconnected._
- **Why does `Checkpoint recovery with inline comparison and fresh scoped confirmation` connect `Recovery checkpoints behavior, protection and verification` to `cryptoVault.js`, `Current architecture with implemented local and legacy increment`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **Should `Interface e revisão visual` be split into smaller, more focused modules?**
  _Cohesion score 0.02981366459627329 - nodes in this community are weakly interconnected._