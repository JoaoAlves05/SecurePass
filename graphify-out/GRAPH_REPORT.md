# Graph Report - SecurePass  (2026-11-09)

## Corpus Check
- 355 files · ~192,718 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: .css 6, (none) 3)

## Summary
- 2663 nodes · 6809 edges · 189 communities (134 shown, 55 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 139 edges (avg confidence: 0.86)
- Token cost: host semantic usage unavailable; no separate semantic API used.

## Graph Freshness
- Built from commit: `abe13552`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- client.js
- vaultHandlers.js
- Interface e revisão visual
- Recovery checkpoints behavior, protection and verification
- Original SD review with later local increment notice
- biometric/service.js
- ref_node_assert
- Recovery and historical key material contract
- popup.js
- Contextual on-page key
- Current architecture with implemented local and legacy increment
- checkpointReview.js
- Documentação de Sync e dados
- Checkpoint review design document
- session.js
- popup.js
- Inline master-password flow and independent management proportions
- threeWayMerge.js
- biometric/service.js
- README de apresentação em português
- Autofill na página
- scripts
- logger.js
- Contextual on-page key contract
- checkpointReview.js
- authorizationGraph.js
- Modelo de segurança
- Popup HTML semantic surfaces
- vault/driveReview.js
- signedProtocol.js
- vault.js
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
- cryptoVault.js
- recoveryKit.js
- vaultUnlock.js
- Internal authenticated Drive-history retrieval contract and evidence
- storage.js
- IMPLEMENTATION_CHECKLIST.md
- crypto.js
- popup.js
- Management inline checkpoint review in dark theme
- Implementation tracking with consolidated current and historical status
- biometric.test.js
- getStorage
- Internal common-base three-way merge issue and acceptance scope
- Internal domain-separated ECDSA P-256 administrative authorization chains
- Revisão funcional — Backups & recovery e Advanced
- Confirmação de autofill
- Settings category links and labelled navigation
- signingKeyProtection.js
- revisionProtocol2.js
- Ferramentas de desenvolvimento
- Popup HTML semantic surfaces
- Encrypted vault-state v1 payload and local migration contract
- createDriveReviewService
- Checklist de implementação e aceitação
- Account suggestions, inline tools and trusted-window confirmation contract
- Vault-v3 and protocol-v2 implemented foundation contract
- Protocol-v2 local transactions
- utilHandlers.js
- Recovery-surface presentation and unlock-controller refinement
- Compact recovery presentation and consistent fingerprint entry points
- Administrative protocol-v2 delivery contract
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
- syncService.js
- Dark anchored credential selector on narrow page
- Saved-version batch export design record
- Light tab saved-version export dialog
- .put
- Operação de teste
- Management-owned verified Drive-copy review
- Security settings area
- sync-browser.mjs
- .put
- auth.js
- browser.mjs
- administrationDelivery2.test.js
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
- Guided Chrome Sync setup, manual discovery and device test
- Protocol-v2 local transaction contract
- backupDialogs-browser.mjs
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
- Saved-version batch export: design record
- checkpoints-browser.mjs
- Authenticated merge commit scope and acceptance SC22-SC25
- setStorage
- Vault-v3 and protocol-v2 foundations
- Durable device administration contract
- Purpose-bound inline master-password authorization
- Three content checkpoints, preserving recovery and source-specific exports
- Popup inline checkpoint review in dark theme
- Popup inline checkpoint review in light theme
- ADMINISTRATIVE_V2_DELIVERY.md
- auth/auth.html
- Internal technical contract: rotation and recovery foundations
- Implemented extension-origin anchored account selector with two-account pagination and username search
- session.js
- sync-browser.mjs
- drive.js
- Recovery and historical key material

## God Nodes (most connected - your core abstractions)
1. `Version 3 settings Sync data and compact login plan` - 107 edges
2. `getStorage()` - 83 edges
3. `Validation and release checklist` - 72 edges
4. `Current architecture with implemented local and legacy increment` - 69 edges
5. `withVaultOperation()` - 62 edges
6. `removeStorage()` - 54 edges
7. `setStorage()` - 51 edges
8. `showToast()` - 50 edges
9. `Historical review of commit 5aed51c` - 44 edges
10. `Original SD review with later local increment notice` - 42 edges

## Surprising Connections (you probably didn't know these)
- `Checkpoint summary and detail separation verified` --conceptually_related_to--> `renderCheckpoints()`  [INFERRED]
  docs/VALIDATION.md → popup/modules/checkpoints.js
- `Integration boundaries` --references--> `loadAuthorization()`  [INFERRED]
  docs/PROTOCOL_V2_TRANSACTIONS.md → src/sync/authorizationStore.js
- `Commit de merge autenticado — SC22–SC25` --references--> `resolveThreeWayPayload()`  [INFERRED]
  docs/issues/PERSISTED_MERGE.md → src/vault/threeWayMerge.js
- `Cifrado interno do cofre — payload versionado, 08/11/2026` --references--> `encryptEntries()`  [INFERRED]
  docs/VAULT_PAYLOAD.md → src/vault/crypto.js
- `Concrete implementation choices` --references--> `protectionDigest()`  [INFERRED]
  docs/PROTOCOL_V2_REVIEW.md → src/sync/revisionProtocol2.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Protected metadata inspection to guarded local signed merge save** — architecture_protected_drive_review, architecture_review_capability_lifecycle, architecture_review_cancellation_commit_guard, architecture_review_metadata_ui, architecture_authenticated_merge_commit [EXTRACTED 1.00]
- **Bound immutable administrative bytes through verified receipt before content** — docs_administrative_delivery_bounded_canonical_packets, docs_administrative_delivery_durable_verified_receipts, docs_administrative_delivery_exact_restart_reuse, docs_administrative_delivery_stale_content_rebase [EXTRACTED 1.00]
- **Immutable material and exact DAG ancestry survive full-snapshot guarded delivery retry** — docs_administrative_v2_delivery_immutable_operation_material, docs_administrative_v2_delivery_exact_dag_ancestor_subset, docs_administrative_v2_delivery_full_snapshot_guard, docs_administrative_v2_delivery_restart_accepted_reuse [EXTRACTED 1.00]
- **Protected authentication and minimal document-bound anchored account selection** — docs_anchored_selector_account_selection, docs_anchored_selector_request_binding, docs_anchored_selector_visual_attestation, docs_anchored_selector_native_fallback, selector_selector_account_surface [EXTRACTED 1.00]
- **Whole-checkpoint restore authorization sequence** — docs_checkpoint_review_recent_authentication, docs_checkpoint_review_confirm_identity, docs_checkpoint_review_fresh_scoped_token, docs_checkpoint_review_secondary_restore [EXTRACTED 1.00]
- **Internal signed local mutation through atomic outbox to verified immutable publication** — docs_drive_transport_atomic_signed_commit, docs_signed_protocol_revision_wrapper, docs_drive_transport_durable_coordinator, docs_drive_transport_immutable_publication, docs_drive_transport_resumable_upload [EXTRACTED 1.00]
- **Selected signed ancestry and all-copy integrity within bounds guarded by final inventory/context checks** — docs_issues_authenticated_drive_history_selected_ancestry, docs_issues_authenticated_drive_history_duplicate_integrity, docs_issues_authenticated_drive_history_resource_limits, docs_issues_authenticated_drive_history_context_recheck [EXTRACTED 1.00]
- **Fixed authenticated context and selected history through atomic signed merge commit** — docs_issues_persisted_merge_context_authority, docs_issues_persisted_merge_history_preservation, docs_issues_persisted_merge_selected_parents, docs_issues_persisted_merge_atomic_retry [EXTRACTED 1.00]
- **Signed complete ancestry and plaintext identities guarded before causal merge review** — docs_issues_three_way_merge_authenticated_ancestor, docs_issues_three_way_merge_history_limits, docs_issues_three_way_merge_snapshot_identity, docs_issues_three_way_merge_live_context [EXTRACTED 1.00]
- **Opaque verified authority anchors protection and recursive retired history** — docs_protocol_v2_foundations_opaque_authorization_graph, docs_protocol_v2_foundations_signed_master_protection, docs_protocol_v2_foundations_recursive_payload_digest, docs_protocol_v2_foundations_anchored_retired_history [EXTRACTED 1.00]
- **Atomic verified authority change preserves anchored original history and content descendant** — docs_protocol_v2_transactions_atomic_compare_and_write, docs_protocol_v2_transactions_original_signed_history, docs_protocol_v2_transactions_authority_content_successor, docs_protocol_v2_transactions_preserved_self_revocation [EXTRACTED 1.00]
- **Secret-protected roles and bound root material opened under live authority** — docs_recovery_key_material_secret_protected_roles, docs_recovery_key_material_public_root_rewrap, docs_recovery_key_material_verified_live_opening, docs_recovery_key_material_historical_roots [EXTRACTED 1.00]
- **Authenticated deletion and explicit restoration preserved across encrypted payload lifecycle** — docs_vault_payload_tombstone_identity, docs_vault_payload_explicit_restoration, docs_vault_payload_rekey_recovery, docs_vault_payload_history_capacity [EXTRACTED 1.00]

## Communities (189 total, 55 thin omitted)

### Community 0 - "client.js"
Cohesion: 0.28
Nodes (16): attachBiometricListeners(), syncBiometricView(), attachMasterPasswordListeners(), refreshState(), abortable(), assert(), authenticateBiometric(), authorizeMasterPassword() (+8 more)

### Community 1 - "vaultHandlers.js"
Cohesion: 0.12
Nodes (43): DECODER, decryptBackupPayload(), deriveBackupKey(), ENCODER, encryptBackupPayload(), isEncryptedBackupEnvelope(), recoveryStatus(), vaultHandlers (+35 more)

### Community 2 - "Interface e revisão visual"
Cohesion: 0.03
Nodes (38): Implemented anchored selector with two-account pagination/search and protected unlock/native fallback, Atomic vault-checkpoint-Drive outbox commit with internal automatic signing; production remains gated, Atomic vault-checkpoint-Drive outbox commit with internal automatic signing; production remains gated, Atomic vault-checkpoint-Drive outbox commit with internal automatic signing; production remains gated, Atomic vault-checkpoint-Drive outbox commit with internal automatic signing; production remains gated, Version 3 settings Sync data and compact login plan, Guided individual-file export delivered within incomplete plan, 08/11 local encrypted tombstones delivered separately from full convergence (+30 more)

### Community 3 - "Recovery checkpoints behavior, protection and verification"
Cohesion: 0.04
Nodes (48): Checkpoint recovery with inline comparison and fresh scoped confirmation, Inline checkpoint review module and displayed-comparison identity, Archived Sync copies stay separate and exports are source-specific, Unlocked checkpoint counts, differences and affected-account examples, Remove one checkpoint or verify current password to clear local history, Recovery checkpoints behavior, protection and verification, Per-entry recovery through inline review and explicit confirmation, Existing-vault external and selected-remote restores preserve active authentication (+40 more)

### Community 5 - "biometric/service.js"
Cohesion: 0.13
Nodes (19): attachTesterListeners(), copyTestPasswordBtn, crackTimeEl, entropyEl, hibpButton, hibpStatus, mapScoreToColor(), passwordInput (+11 more)

### Community 6 - "ref_node_assert"
Cohesion: 0.07
Nodes (24): fake-indexeddb, AUTH, CONTENT, SELECTOR, auth(), payload(), saveRequest(), sender (+16 more)

### Community 7 - "Recovery and historical key material contract"
Cohesion: 0.32
Nodes (3): Recovery and historical key material implementation issue, Recovery and historical key material contract, 331-test 179-module recovery material evidence

### Community 9 - "Contextual on-page key"
Cohesion: 0.11
Nodes (15): Account suggestions and inline login tools, Integrity and capability boundaries, Surfaces and interaction, Validation, Why a save suggestion appears, Capacidades e vinculação, Evidência, Manifesto e limites (+7 more)

### Community 10 - "Current architecture with implemented local and legacy increment"
Cohesion: 0.05
Nodes (4): Bounded legacy recovery archive reader, Current architecture with implemented local and legacy increment, Guided source and digest bound recovery export, Implemented revision-checked settings, bound backup previews and local checkpoint recovery

### Community 11 - "checkpointReview.js"
Cohesion: 0.15
Nodes (38): Cancel delayed backup previews on lock — SC44, Reproduced and corrected — 2026-11-08, attachCheckpointListeners(), date(), deleteHistory(), handleCheckpointAction(), plural(), renderCheckpoints() (+30 more)

### Community 12 - "Documentação de Sync e dados"
Cohesion: 0.11
Nodes (38): clearSecrets(), complete(), expired(), refresh(), requestId, run(), saveTargetChanged(), send() (+30 more)

### Community 13 - "Checkpoint review design document"
Cohesion: 0.06
Nodes (33): Single checkpoint review entry, Inline checkpoint comparison, Confirm identity flow, Individual entry recovery, Checkpoint review design document, Authentication expiry during confirmation, Successful recovery refreshes review or returns to checkpoint list, Recovery review cleanup and navigation (+25 more)

### Community 14 - "session.js"
Cohesion: 0.07
Nodes (33): Older checkpoint protection migration, Journey scope and unconfigured OAuth, Accessibility and website compatibility acceptance, Automated regression coverage, Backup dialog refinement evidence, 280-test and 156-module backup preview lock evidence, Bounded recovery archive evidence, Development validation commands (+25 more)

### Community 15 - "popup.js"
Cohesion: 0.10
Nodes (32): attachCandidateListeners(), refreshCandidates(), avoidSimilar, copyGeneratedBtn, generateButton, generatedResult, generatorStatus, includeLower (+24 more)

### Community 16 - "Inline master-password flow and independent management proportions"
Cohesion: 0.06
Nodes (34): Approved inline identity/password/success and management proportions, Pre-save biometric revocation notice and optional setup again, Clear secrets and revoke the exact grant on leaving the inline flow, Inline master-password flow and independent management proportions, Two-minute single-use revision-bound password-change grant, Physical authenticator and actual toolbar sizing remain manual acceptance, Fresh identity confirmation replaces preliminary unlock and modal, Tab stylesheet separates desktop layout from compact popup presentation (+26 more)

### Community 17 - "threeWayMerge.js"
Cohesion: 0.14
Nodes (25): authenticatedMergeContext(), authenticatedPlans, checkCurrent(), commonBase(), visit(), encoder, planAuthenticatedMerge(), validId() (+17 more)

### Community 18 - "biometric/service.js"
Cohesion: 0.17
Nodes (23): begin(), biometricStatus(), cancelAuthentication(), consume(), context(), finishAuthentication(), finishRegistration(), origin() (+15 more)

### Community 19 - "README de apresentação em português"
Cohesion: 0.07
Nodes (22): Local backup safety and repeatable recovery cleanup, Backups and Advanced functional review, Preenchimento confirmado por origem e documento, Backups cifrados com pré-visualização de importação, Desbloqueio WebAuthn com PRF, Limites de capacidade e importação, Desenvolvimento e verificações, Chrome122 e âmbito de compatibilidade (+14 more)

### Community 20 - "Autofill na página"
Cohesion: 0.08
Nodes (23): action, default_popup, default_title, background, service_worker, type, content_scripts, content_security_policy (+15 more)

### Community 21 - "scripts"
Cohesion: 0.04
Nodes (41): Recovery-surface checks recorded in validation evidence, devDependencies, fake-indexeddb@^6.2.4, playwright@1.56.1, name, private, Dedicated recovery UI browser command, scripts (+33 more)

### Community 22 - "logger.js"
Cohesion: 0.22
Nodes (11): LOG_ENABLED, buffer, format(), isArrayBufferLike(), isPrimitive(), isSensitiveString(), logger, redactValue() (+3 more)

### Community 23 - "Contextual on-page key contract"
Cohesion: 0.09
Nodes (23): Direct selector and original-field tool handoff, Native manual login creation form, Native secondary website tools disclosure, Source field and reserved native-tab request binding, Direct key opens up to two anchored account suggestions, Contextual on-page key contract, Executed contextual-key evidence and remaining manual acceptance, Pointer-transparent feedback preserves the next website action (+15 more)

### Community 24 - "checkpointReview.js"
Cohesion: 0.31
Nodes (20): account(), attachCheckpointReviewListeners(), changedFields(), checkFreshness(), clientId, closeReview(), date(), entryCount() (+12 more)

### Community 25 - "authorizationGraph.js"
Cohesion: 0.13
Nodes (24): authorityDigest(), canonicalAuthorityPayload(), checkSignature(), createAuthorityState(), encoded(), encoder, fields(), graphs (+16 more)

### Community 26 - "Modelo de segurança"
Cohesion: 0.29
Nodes (16): Inline unlock errors and retry without dismissing the form, resolveUnlockSetup(), setUnlockResolver(), attachUIListeners(), backFromSettings(), closeModal(), closeSettingsPanel(), manageFocus() (+8 more)

### Community 27 - "Popup HTML semantic surfaces"
Cohesion: 0.14
Nodes (20): Version and repository footer, System light and dark theme controls, Auto-lock inactivity preference, Consistent fingerprint symbol for biometric entry points, Ownership-aware clipboard timeout explanation, Popup HTML semantic surfaces, Labelled credential editor dialog, Appearance settings area (+12 more)

### Community 28 - "vault/driveReview.js"
Cohesion: 0.08
Nodes (50): driveHandlers, createAdministrationDeliveryStore(), access(), enabled(), createAdministrationPublication(), createAdministrationRuntime(), run(), createDriveRuntime() (+42 more)

### Community 29 - "signedProtocol.js"
Cohesion: 0.10
Nodes (44): Durable device administration, 1. Escolher a identidade da extensão, 2. Criar/configurar o projeto Google, 3. Gerar uma cópia de desenvolvimento, Configurar Google Cloud para o SecurePass, Dados necessários para continuar a integração real, administrationStatus(), append() (+36 more)

### Community 30 - "vault.js"
Cohesion: 0.11
Nodes (44): attachGeneratorListeners(), handleGenerate(), saveGeneratedToVault(), sendMessage(), saveTestedToVault(), showToast(), detectActiveOrigin(), openEntryModal() (+36 more)

### Community 31 - "recoveryArchive.js"
Cohesion: 0.16
Nodes (14): abort(), decoder, digest(), FileCursor, invalid(), MAX_RECOVERY_ARCHIVE_BYTES, MAX_RECOVERY_SNAPSHOTS, parse() (+6 more)

### Community 32 - "Implementation checklist: partial implementation, release not accepted"
Cohesion: 0.12
Nodes (15): Implemented anchored selector with two-account pagination/search and protected unlock/native fallback, SC01/SC02/SC40 and AF03/AF09 closed within explicit bounds; 55 SC and 10 AF remain open, Preview-lock correction checked; full SC44 remains open, Consolidated delivered increments and remaining product/release gates, 2026-11-06 delivered OAuth inspection, signing, gated runtime, resumable uploads and anchored search, Implementation checklist: partial implementation, release not accepted, Guided batch delivered and SC40 scoped closure, Remaining implementation order after internal Drive and planner delivery (+7 more)

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
Cohesion: 0.06
Nodes (23): Guided Chrome Sync setup, bounded capacity and non-authorizing device diagnostic, Guided setup Node/security and Chromium evidence with emulated transport boundaries, test:sync-setup-browser runs the disposable guided Chrome Sync scenario, Guided setup supersedes parts of historical capacity and selected-restore findings, Conservative two-complete-version capacity and local-only failure handling, Dark guided setup refusing insufficient two-version capacity, Enable is unavailable when the local vault cannot coexist with a subsequent complete copy, Narrow dark device-test receipt with preserved local cache controls (+15 more)

### Community 39 - "selector.js"
Cohesion: 0.22
Nodes (16): Implemented anchored selector with two-account pagination/search and protected unlock/native fallback, Disposable anchored and ZIP journeys plus internal Drive integration evidence; full release remains open, Current login key UI has two anchored suggestions and native complete-list fallback; registration/change-password generator remains available., Delivered anchored search/pagination with protected unlock and native fallback, Selector is extension-origin with restricted message capabilities and source/document binding; iframe isolation is not independent Chrome permissions or native clickjacking assurance., Implemented anchored selector with two-account pagination/search and protected unlock/native fallback, Implemented anchored selector with two-account pagination/search and protected unlock/native fallback, clear() (+8 more)

### Community 41 - "SETTINGS_UX_DESIGN.md"
Cohesion: 0.17
Nodes (7): Delivery evidence, Information architecture, Interaction rules, Journey state machine, SC01–SC58 traceability, Screen sketches, Settings UX — journeys, screens and acceptance map

### Community 42 - "cryptoVault.js"
Cohesion: 0.23
Nodes (20): changeMasterPassword(), changeMasterPasswordAuthorized(), clearVaultEntries(), deleteCredential(), importVaultData(), keepAlive(), listCredentials(), lockVault (+12 more)

### Community 43 - "recoveryKit.js"
Cohesion: 0.17
Nodes (42): canonicalAdministrationGraph(), canonicalAdministrationMaterial(), createAdministrationPublication2(), encoder, normalize(), requireAuthorityState(), canonicalKeyHistory(), context() (+34 more)

### Community 44 - "vaultUnlock.js"
Cohesion: 0.10
Nodes (23): Advanced control inventory, Scoped authentication and local erasure, Backups control inventory, Cache usage without duration control, Unified local and archived earlier versions, Executed validation, Four-area Settings revision, Historical General inventory (+15 more)

### Community 45 - "Internal authenticated Drive-history retrieval contract and evidence"
Cohesion: 0.20
Nodes (6): Bounded selected signed-history retrieval with inventory reenumeration, 08/11 internal Drive ancestry retrieval delivered; product integration open, Internal authenticated Drive-history retrieval contract and evidence, Shared 256-packet and 32-MiB bounds count duplicate and local packets, Internal authenticated ancestor and Drive history delivered without activation, 244-test continuation with actual bounded reader and injected provider

### Community 46 - "storage.js"
Cohesion: 0.08
Nodes (40): playwright, ALARM_NAME, BIOMETRIC_SESSION_PASSPHRASE_KEY, CHUNK_SIZE, CLIPBOARD_ALARM_NAME, DB_STORE_NAME, DB_VERSION, META_KEY (+32 more)

### Community 47 - "IMPLEMENTATION_CHECKLIST.md"
Cohesion: 0.08
Nodes (15): Verified administrative delivery, Verified administrative delivery — SC26, SC28, SC29, SC33, SC47, Recolha de história Drive autenticada — SC22–SC25, Durable device administration — SC03, SC16, SC26, SC47, Integração Drive e conclusão do plano — 06/11/2026, Commit de merge autenticado — SC22–SC25, Protocol foundations for rotation and recovery — SC14–SC27, SC47, SC55, Guided recovery export batches — SC40, SD07 (+7 more)

### Community 48 - "crypto.js"
Cohesion: 0.23
Nodes (25): validateVaultEntries(), aesKey(), createRecord(), dataContext(), decoder, decryptPayloadWithKey(), encoder, encryptEntries() (+17 more)

### Community 49 - "popup.js"
Cohesion: 0.15
Nodes (14): Auto-lock vault slider, Set up biometric unlock action, Change master password action, Clear copied passwords slider, GitHub footer link, Settings category navigation: Appearance, Security, Backups & recovery, Advanced, Settings footer with version, GitHub link, and preference save status, Settings popup home screenshot (+6 more)

### Community 50 - "Management inline checkpoint review in dark theme"
Cohesion: 0.29
Nodes (7): Changed account labels Different fields: password and offers Restore details, Back to checkpoints remains part of the in-section view, Show matching entries checkbox includes matching count, Account rows offer a specific Recover entry action, Management inline checkpoint review in dark theme, Website or username search within the review, Review title/date and saved/deleted/different/newer counts

### Community 52 - "biometric.test.js"
Cohesion: 0.42
Nodes (7): assertion(), b64(), client(), der(), registration(), request(), sender

### Community 53 - "getStorage"
Cohesion: 0.12
Nodes (50): handlers, ready, clearCandidates(), dismissCandidate(), inlineCandidate(), listCandidates, proposeCandidate(), reviewCandidate() (+42 more)

### Community 54 - "Internal common-base three-way merge issue and acceptance scope"
Cohesion: 0.11
Nodes (15): Separate internal three-way planner with opaque revision-bound reviews, 08/11 internal authenticated ancestor delivery checked; product integration open, Full SC merge acceptance remains open after internal planner delivery, Three-way planner checklist records delivered internal planning and guarded review, Current integrated code delivery with separate pending protocol and real-world acceptance, Global completion issue remains open for administrative lifecycle, recovery, convergence, migration and independent gates, Drive integration issue: resumable uploads, automatic signing, gated worker and read-only OAuth management, Unique nearest ancestor from complete authenticated history (+7 more)

### Community 55 - "Internal domain-separated ECDSA P-256 administrative authorization chains"
Cohesion: 0.33
Nodes (4): Public OAuth client received; real Google authorization, protocol review, physical hardware and lifecycle acceptance pending, Internal domain-separated ECDSA P-256 administrative authorization chains, V1 prototype review gates remain open; isolated next-format foundations are separate, Proposed bounded backup/archive parsing, stable snapshot selection and safe checkpoint-based retention

### Community 56 - "Revisão funcional — Backups & recovery e Advanced"
Cohesion: 0.18
Nodes (9): Backups & recovery — export and restore dialogs, Delivered interaction, Executed checks, Visual evidence, Limites e aceitação restante, Problemas reproduzidos e corrigidos, Revisão funcional — Backups & recovery e Advanced, Validação (+1 more)

### Community 57 - "Confirmação de autofill"
Cohesion: 0.10
Nodes (17): Local Settings Sync and Data Management work item, Local workflow acceptance requirements, Historical approved four-area revision on main, Historical frontend cleanup follow-up, Historical approved hierarchical implementation scope, Authorization contract, Delivered behavior, Inline master-password change and management layout (+9 more)

### Community 58 - "Settings category links and labelled navigation"
Cohesion: 0.20
Nodes (11): Vault creation/unlock, biometric setup and inline fresh-identity master-password change forms, Backups, checkpoint cards and inline review settings area, Recovery checkpoints heading, Clear history and local/archive inventory, Compact in-section checkpoint comparison, Encrypted backup import and export controls, Cache clear, vault clear, local wipe and exclusive native operation dialog surfaces, Settings category links and labelled navigation, Checkpoint cards and inline review with separate archived copies (+3 more)

### Community 59 - "signingKeyProtection.js"
Cohesion: 0.13
Nodes (34): base64url(), base64ToBuffer(), bufferToBase64(), MAX_ADMINISTRATION_BYTES, unlockAdministrationPublication2(), verifyAdministrationPublication2(), encoder, fields() (+26 more)

### Community 60 - "revisionProtocol2.js"
Cohesion: 0.15
Nodes (27): append(), materialFor(), packetFor(), prepareBootstrap2(), prepareDeviceChange2(), verifyAdministration2(), authorityState(), anchorReferences() (+19 more)

### Community 62 - "Popup HTML semantic surfaces"
Cohesion: 0.22
Nodes (10): Cancel, Unlock and icon-only fingerprint share one action row, Dark master-password identity with inline biometric method, Dark main vault unlock with inline biometric method, Shared password and biometric method row, Accessible fingerprint-only shortcut beside password, Inline identity form with biometric shortcut beside current password, New-password confirmation with biometric revocation warning, Inline master-password identity, new-password and success forms (+2 more)

### Community 63 - "Encrypted vault-state v1 payload and local migration contract"
Cohesion: 0.18
Nodes (6): Local tombstones and restore provenance checked; merged history persistence and conditional review delivered, Persistent encrypted tombstones implementation scope SC22-SC25, 251-test local tombstone persistence and signed-packet Chromium evidence, Encrypted vault-state v1 payload and local migration contract, Rotation and checkpoint re-protection preserve causal metadata, Deletion tombstones bind entry ID to deleting revision

### Community 64 - "createDriveReviewService"
Cohesion: 0.10
Nodes (29): planDriveMerge(), guard(), inventory(), snapshot(), verify(), visit(), validId(), createDriveReviewService() (+21 more)

### Community 65 - "Checklist de implementação e aceitação"
Cohesion: 0.29
Nodes (7): Cenários de aceitação, Checklist de implementação e aceitação, Dependências externas e condições de release, Entregáveis por secção, Próximos blocos de implementação, Revisão original e fecho de problemas, Trabalho desta execução

### Community 66 - "Account suggestions, inline tools and trusted-window confirmation contract"
Cohesion: 0.07
Nodes (27): Review cancellation retains a proposal; dismissal/save/expiry/lock remove it, Restricted five-minute proposals, eight-item bound, metadata-only listing and deduplication, Narrow dark registration generator inside the viewport, Primary generation and secondary disclosures fit a 320px viewport, Light contextual registration generator with primary Generate and fill, Password options and Other options are collapsed beneath generation, Light review of a new captured login, Username correction and explicit new-login target precede final save (+19 more)

### Community 67 - "Vault-v3 and protocol-v2 implemented foundation contract"
Cohesion: 0.21
Nodes (5): Protocol foundations issue SC14–SC27 SC47 SC55, Vault-v3 and protocol-v2 implemented foundation contract, Internal technical contract before next-format implementation, Internal P-256 administrative and encrypted-v2 revision prototype with pinned root/checkpoint; production review remains pending, 318-test 174-module foundational crypto and compatibility evidence

### Community 68 - "Protocol-v2 local transactions"
Cohesion: 0.25
Nodes (6): Protocol-v2 local transactions, Durable authority and original signed content, Evidence, Integration boundaries, Mutation and administrative boundaries, Protocol-v2 local transactions

### Community 69 - "utilHandlers.js"
Cohesion: 0.17
Nodes (21): copyInBackground(), ensureOffscreen(), cacheWrites, checkPassword(), clearHibpCache(), hibpCacheStatus(), inFlight, range() (+13 more)

### Community 70 - "Recovery-surface presentation and unlock-controller refinement"
Cohesion: 0.25
Nodes (8): Vault unlock controller with bounded inline retry and WebAuthn cancellation, Compact comparison header and account rows, Recovery-surface presentation and unlock-controller refinement, Smaller cards and a shared contextual dimmed backdrop, Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Compact Unlock vault heading, current-password field and reveal control, Light tab bounded vault unlock

### Community 71 - "Compact recovery presentation and consistent fingerprint entry points"
Cohesion: 0.25
Nodes (8): 85 modules and four browser suites; Node evidence remains historical, Compact recovery presentation and consistent fingerprint entry points, Same dimmed and 2px-blurred extension context under unlock and recovery, Full restore confirms only restored total and removals, Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Compact Unlock vault heading, current-password field and reveal control, Dark popup bounded vault unlock

### Community 72 - "Administrative protocol-v2 delivery contract"
Cohesion: 0.35
Nodes (3): Administrative protocol-v2 delivery contract, Administrative-v2 delivery implementation issue, 354-test 188-module administrative-v2 delivery evidence

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

### Community 96 - "syncService.js"
Cohesion: 0.14
Nodes (47): initializeVault(), restoreRecovery(), vaultStatus(), loadSettings(), acknowledgeSync(), clearStorage(), deleteIndexedDb(), readLegacySyncRecord() (+39 more)

### Community 97 - "Dark anchored credential selector on narrow page"
Cohesion: 0.50
Nodes (4): Dark anchored credential selector on narrow page, Credential option fictional-user for http://127.0.0.1:43557, Open SecurePass window action, Key icon trigger beside masked password field

### Community 98 - "Saved-version batch export design record"
Cohesion: 0.12
Nodes (8): Drive copy review: design record, Evidence and limits, Interaction and privacy, Scope and incumbent design, Drive transport implementation status, Revisão Drive protegida na gestão — 08/11/2026, Saved-version batch export design record, Scoped visual ship and disposable browser evidence

### Community 99 - "Light tab saved-version export dialog"
Cohesion: 0.50
Nodes (4): Saved version 1 of 3; 0 download requests sent, Download version confirms the current file; Cancel stops the batch, Light tab saved-version export dialog, This device; version 949a754c; saved 11/8/2026, 7:47:16 PM; 1 KiB

### Community 100 - ".put"
Cohesion: 0.50
Nodes (4): Review checkpoint primary action with secondary Export and Remove, Dated checkpoint with sequence, recoverable-entry and later-entry counts, Backups header and Open in tab remain visible above checkpoint cards, Dark popup checkpoint card with one Review action

### Community 101 - "Operação de teste"
Cohesion: 0.50
Nodes (4): Review checkpoint primary action with secondary Export and Remove, Dated checkpoint with sequence, recoverable-entry and later-entry counts, Backups header and Open in tab remain visible above checkpoint cards, Light popup checkpoint card with one Review action

### Community 102 - "Management-owned verified Drive-copy review"
Cohesion: 0.25
Nodes (3): Management-owned verified Drive-copy review, Metadata-only paginated conflict decisions, Encrypted deterministic conflict-copy provenance alongside restore history

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

### Community 107 - "browser.mjs"
Cohesion: 0.13
Nodes (8): frameFor(), projectRoot, server, errors, root, server, shadowClick(), find()

### Community 108 - "administrationDelivery2.test.js"
Cohesion: 0.07
Nodes (16): Public Google client received and stable configured development copy generated; real authorization remains pending, Disposable Chromium anchored, configured-Google emulation and ZIP evidence; real Google remains unaccepted, googleManifest(), main(), root, runtimeFiles, context, base (+8 more)

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
Cohesion: 0.09
Nodes (15): done, files(), graph, js, manifest, pkg, root, visit() (+7 more)

### Community 123 - "Guided Chrome Sync setup, manual discovery and device test"
Cohesion: 0.29
Nodes (7): Advanced Google connection, Chrome Sync, breach cache and scoped local maintenance, Scoped entry clearing and local device erasure, Explicit legacy remote version review, Guided Chrome Sync setup, manual discovery and device test, Remote source unlock then entry-count comparison and confirmation, Configure Chrome Sync then separately enable automatic sending, Explicit matching-code device test and historical receipt status

### Community 124 - "Protocol-v2 local transaction contract"
Cohesion: 0.35
Nodes (3): Protocol-v2 local transaction implementation issue, Protocol-v2 local transaction contract, 343-test 184-module local protocol-v2 evidence

### Community 125 - "backupDialogs-browser.mjs"
Cohesion: 0.20
Nodes (6): cancel(), captures, errors, idle(), root, ./modules/operationDialog.js

### Community 163 - "Verified administrative delivery contract"
Cohesion: 0.30
Nodes (3): Verified administrative delivery contract, Administrative delivery SC26 SC28 SC29 SC33 SC47 issue, 295-test 165-module administrative delivery evidence

### Community 165 - "Saved-version batch export: design record"
Cohesion: 0.14
Nodes (14): Cancellation, errors and accessibility, Colors, Components, Do's and Don'ts, Elevation & Depth, Evidence and limits, Interaction and completion, Layout (+6 more)

### Community 166 - "checkpoints-browser.mjs"
Cohesion: 0.18
Nodes (4): captures, errors, root, seedReviewFixture()

### Community 167 - "Authenticated merge commit scope and acceptance SC22-SC25"
Cohesion: 0.25
Nodes (3): Authenticated merge persistence delivered with conditional protected review routes, Authenticated merge commit scope and acceptance SC22-SC25, 257-test atomic merge persistence and real Chromium rollback retry evidence

### Community 168 - "setStorage"
Cohesion: 0.22
Nodes (20): code(), confirmDeviceTest(), deviceId(), deviceTestStatus(), digest(), inspectDeviceTest(), requireTestedVersion(), startDeviceTest() (+12 more)

### Community 169 - "Vault-v3 and protocol-v2 foundations"
Cohesion: 0.40
Nodes (5): Administrative graph, Content signatures and historical identity, Encrypted records and writer keys, Evidence, Vault-v3 and protocol-v2 foundations

### Community 171 - "Durable device administration contract"
Cohesion: 0.29
Nodes (3): Durable device administration contract, Device administration SC03 SC16 SC26 SC47 implementation issue, 288-test 160-module internal administration evidence

### Community 172 - "Purpose-bound inline master-password authorization"
Cohesion: 0.17
Nodes (8): Implemented read-only Google management and gated internal signed Drive integration, Independent management-tab layout with shared trusted pathname, Purpose-bound inline master-password authorization, Drive production lifecycle, recovery, convergence, migration and release acceptance remain incomplete, Internal normal-mutation signing and atomic vault-checkpoint-outbox authorization/session checks, False source-level production-review predicate; no public enrollment, adoption or Drive write activation, Canonical signed encrypted-v2 revision wrapper bound to active writer, vault, epoch and exact authorization digest, Emulated Google connection, resumable upload, signed CRUD and atomic restore-suspension regressions

### Community 175 - "Popup inline checkpoint review in dark theme"
Cohesion: 0.40
Nodes (5): Back to checkpoints remains part of the in-section view, Deleted account offers Recover entry; later accounts explicitly indicate removal by full restore, Popup inline checkpoint review in dark theme, Website or username search within the review, Review title/date and saved/deleted/different/newer counts

### Community 177 - "Popup inline checkpoint review in light theme"
Cohesion: 0.40
Nodes (5): Back to checkpoints remains part of the in-section view, Deleted account offers Recover entry; later accounts explicitly indicate removal by full restore, Popup inline checkpoint review in light theme, Website or username search within the review, Review title/date and saved/deleted/different/newer counts

### Community 180 - "auth/auth.html"
Cohesion: 0.22
Nodes (8): Explicit account selection section, PRF alternative beside the master password field, Cancel confirmation button, Compact extension-owned login confirmation with shared popup tokens, Editable username and explicit selection before an update, with expired/already-saved states, Explicit new-login save or selected password update, auth.js module bootstrap, Master password unlock form

### Community 181 - "Internal technical contract: rotation and recovery foundations"
Cohesion: 0.25
Nodes (8): Canonical representation and limits, Checkpoints, capacity and compatibility, Concrete implementation choices, Content encryption and nonce domains, Internal technical contract: rotation and recovery foundations, Required security boundaries, Rotation and recovery application requirements, Verification still required

### Community 185 - "Implemented extension-origin anchored account selector with two-account pagination and username search"
Cohesion: 0.17
Nodes (8): Chromium selector evidence does not close visual-adversarial, physical accessibility or real-site acceptance, Implemented extension-origin anchored account selector with two-account pagination and username search, Protected auth-window handoff and native fallback for CSP blocking and manual creation, Trusted selection plus source focus, ancestor visibility and hit-testing checks, Account-vault-generation bound IndexedDB publication queue with bounded durable retries, Persisted resumable upload sessions, provider offset probes, one-MiB chunks and 16-MiB packet bound, Implemented field-key, protected unlock, anchored account choice and direct fill without submission, Minimal no-referrer account surface with origin, search, top pagination, account list and live status

### Community 187 - "session.js"
Cohesion: 0.19
Nodes (16): advanceAuthorization(), key(), loadAuthorization(), pinAuthorization(), read(), write(), guardSession(), installLocalWriter() (+8 more)

### Community 188 - "sync-browser.mjs"
Cohesion: 0.25
Nodes (3): contexts, profiles, root

### Community 191 - "drive.js"
Cohesion: 0.70
Nodes (4): act(), attachDriveListeners(), messages, refreshGoogleView()

### Community 192 - "Recovery and historical key material"
Cohesion: 0.50
Nodes (4): Evidence and remaining integration, Historical content roots, Printed code and separate key roles, Recovery and historical key material

## Knowledge Gaps
- **484 isolated node(s):** `Review checkpoint primary action with secondary Export and Remove`, `Dated checkpoint with sequence, recoverable-entry and later-entry counts`, `Backups header and Open in tab remain visible above checkpoint cards`, `Review checkpoint primary action with secondary Export and Remove`, `Dated checkpoint with sequence, recoverable-entry and later-entry counts` (+479 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1139 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **55 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Current architecture with implemented local and legacy increment` connect `Current architecture with implemented local and legacy increment` to `Interface e revisão visual`, `Recovery checkpoints behavior, protection and verification`, `Original SD review with later local increment notice`, `Recovery and historical key material contract`, `popup.js`, `README de apresentação em português`, `Serialized offscreen clipboard owner`, `SETTINGS_UX_IMPLEMENTATION.md`, `SETTINGS_UX_DESIGN.md`, `Administrative-v2 canonical material wire and verified runtime delivery`, `Durable device administration contract`, `Purpose-bound inline master-password authorization`, `Three content checkpoints, preserving recovery and source-specific exports`, `Internal common-base three-way merge issue and acceptance scope`, `Revisão funcional — Backups & recovery e Advanced`, `Confirmação de autofill`, `Implemented extension-origin anchored account selector with two-account pagination and username search`, `Ferramentas de desenvolvimento`, `Encrypted vault-state v1 payload and local migration contract`, `Vault-v3 and protocol-v2 implemented foundation contract`, `Recovery-surface presentation and unlock-controller refinement`, `Management-owned verified Drive-copy review`, `Protocol-v2 local transaction contract`?**
  _High betweenness centrality (0.266) - this node is a cross-community bridge._
- **What connects `Review checkpoint primary action with secondary Export and Remove`, `Dated checkpoint with sequence, recoverable-entry and later-entry counts`, `Backups header and Open in tab remain visible above checkpoint cards` to the rest of the system?**
  _484 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `vaultHandlers.js` be split into smaller, more focused modules?**
  _Cohesion score 0.12414965986394558 - nodes in this community are weakly interconnected._
- **Why does `Recovery-surface presentation and unlock-controller refinement` connect `Recovery-surface presentation and unlock-controller refinement` to `export management dark extension dialog screenshot`, `Compact recovery presentation and consistent fingerprint entry points`, `Light popup bounded vault unlock`, `Ícone 32 pixels`, `Ícone 48 pixels`, `Entrada do content script`, `Light popup compact checkpoint comparison`, `scripts`, `export dark 400 extension dialog screenshot`, `export error dark extension dialog screenshot`, `export light 320 extension dialog screenshot`, `export light 400 extension dialog screenshot`, `Modelo de segurança`, `restore dark 320 extension dialog screenshot`, `restore dark 400 extension dialog screenshot`, `restore error dark extension dialog screenshot`, `restore light 320 extension dialog screenshot`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Should `Interface e revisão visual` be split into smaller, more focused modules?**
  _Cohesion score 0.030227743271221533 - nodes in this community are weakly interconnected._
- **Why does `Vault unlock controller with bounded inline retry and WebAuthn cancellation` connect `Recovery-surface presentation and unlock-controller refinement` to `Current architecture with implemented local and legacy increment`, `Modelo de segurança`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Should `Recovery checkpoints behavior, protection and verification` be split into smaller, more focused modules?**
  _Cohesion score 0.04343971631205674 - nodes in this community are weakly interconnected._